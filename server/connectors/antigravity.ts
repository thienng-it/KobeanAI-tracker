import * as chokidar from 'chokidar';
import * as path from 'path';
import * as fs from 'fs/promises';
import { AgentConnector, AgentConfig } from './base.js';
import { db } from '../db/index.js';
import { sessions, workspaces } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import * as crypto from 'crypto';

export class AntigravityConnector extends AgentConnector {
  private watcher: chokidar.FSWatcher | null = null;
  private defaultWorkspaceId: string | null = null;

  constructor(id: string, name: string, config: AgentConfig) {
    super(id, name, config);
  }

  public async startWatching(): Promise<void> {
    if (this.isWatching) return;
    if (!this.config.logPath) {
      console.error(`[AntigravityConnector] No log path configured for agent ${this.id}`);
      return;
    }

    // Get or create a default workspace
    await this.ensureDefaultWorkspace();

    const resolvedPath = this.config.logPath.startsWith('~/') 
      ? this.config.logPath.replace('~', process.env.HOME || '') 
      : this.config.logPath;

    const watchPattern = resolvedPath;
    
    this.watcher = chokidar.watch(watchPattern, {
      persistent: true,
      ignoreInitial: false, // Process existing files on boot
      awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100
      }
    });

    this.watcher
      .on('add', (filepath) => this.handleFileChange(filepath))
      .on('change', (filepath) => this.handleFileChange(filepath))
      .on('error', (error) => console.error(`[AntigravityConnector] Watcher error:`, error));

    this.isWatching = true;
    console.log(`[AntigravityConnector] Started watching: ${watchPattern}`);
  }

  public async stopWatching(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
    this.isWatching = false;
    console.log(`[AntigravityConnector] Stopped watching`);
  }

  private async ensureDefaultWorkspace() {
    const allWorkspaces = await db.query.workspaces.findMany();
    if (allWorkspaces.length > 0) {
      this.defaultWorkspaceId = allWorkspaces[0].id;
    } else {
      const newId = crypto.randomUUID();
      await db.insert(workspaces).values({
        id: newId,
        name: 'Default Workspace',
        path: process.cwd()
      });
      this.defaultWorkspaceId = newId;
    }
  }

  public async scanHistory(): Promise<number> {
    await this.ensureDefaultWorkspace();
    let scanned = 0;
    const resolvedPath = (this.config.logPath || '~/.gemini/antigravity-ide/brain').startsWith('~/') 
      ? (this.config.logPath || '~/.gemini/antigravity-ide/brain').replace('~', process.env.HOME || '') 
      : (this.config.logPath || '~/.gemini/antigravity-ide/brain');

    try {
      const brainDir = resolvedPath.includes('.system_generated')
        ? resolvedPath.split('/.system_generated')[0].replace('**', '')
        : resolvedPath.replace('/**', '').replace('/*', '');

      const entries = await fs.readdir(brainDir, { withFileTypes: true }).catch(() => []);
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const logPath = path.join(brainDir, entry.name, '.system_generated', 'logs', 'transcript.jsonl');
          try {
            await fs.access(logPath);
            await this.handleFileChange(logPath);
            scanned++;
          } catch (e) {
            // file doesn't exist in this folder, skip
          }
        }
      }
    } catch (err) {
      console.error('[AntigravityConnector] scanHistory error:', err);
    }
    return scanned;
  }

  public async handleFileChange(filepath: string) {
    if (!filepath.endsWith('transcript.jsonl') && !filepath.endsWith('transcript_full.jsonl')) return;
    if (!this.defaultWorkspaceId) {
      await this.ensureDefaultWorkspace();
    }

    try {
      // Extract conversation ID from the path: brain/<conversation-id>/.system_generated/...
      const match = filepath.match(/brain\/([^\/]+)\/\.system_generated/);
      if (!match) return;
      
      const sessionId = match[1];

      // Read and parse the file
      const content = await fs.readFile(filepath, 'utf8');
      const lines = content.split('\n').filter(Boolean);
      if (lines.length === 0) return;

      interface TurnData {
        index: number;
        startedAt: string;
        endedAt: string;
        summary: string;
        inputTokens: number;
        outputTokens: number;
        toolCalls: number;
        extractedTags: string[];
      }

      const turns: TurnData[] = [];
      let currentTurn: TurnData | null = null;

      for (let i = 0; i < lines.length; i++) {
        try {
          const step = JSON.parse(lines[i]);
          const stepTime = step.created_at || new Date().toISOString();

          if (step.type === 'USER_INPUT') {
            if (currentTurn) turns.push(currentTurn);

            let rawPrompt = String(step.content || '').replace(/<USER_REQUEST>|<\/USER_REQUEST>/g, '').trim();
            if (rawPrompt.includes('<ADDITIONAL_METADATA>')) rawPrompt = rawPrompt.split('<ADDITIONAL_METADATA>')[0].trim();
            if (rawPrompt.includes('{{ CHECKPOINT')) rawPrompt = rawPrompt.split('{{ CHECKPOINT')[0].trim();
            if (!rawPrompt) rawPrompt = 'User request';

            // Extract tags like [repo:org/name] or [issue-123]
            const tagMatches = rawPrompt.match(/\[([^\]]+)\]/g) || [];
            const tagsList = tagMatches.map(t => t.replace(/[\[\]]/g, '').trim()).filter(Boolean);

            currentTurn = {
              index: turns.length + 1,
              startedAt: stepTime,
              endedAt: stepTime,
              summary: rawPrompt.length > 95 ? rawPrompt.substring(0, 92) + '...' : rawPrompt,
              inputTokens: Math.max(10, Math.ceil(rawPrompt.length / 3.8)),
              outputTokens: 0,
              toolCalls: 0,
              extractedTags: tagsList
            };
          } else if (currentTurn) {
            currentTurn.endedAt = stepTime;
            const textLen = step.content ? String(step.content).length : 0;
            currentTurn.outputTokens += Math.max(1, Math.ceil(textLen / 3.8));

            if (step.tool_calls && Array.isArray(step.tool_calls)) {
              currentTurn.toolCalls += step.tool_calls.length;
              currentTurn.outputTokens += step.tool_calls.length * 45;
            }
          }
        } catch (e) {
          // ignore invalid json line
        }
      }

      if (currentTurn) turns.push(currentTurn);
      if (turns.length === 0) return;

      // Model & Pricing calculation: Gemini 3.7 Flash ($0.15/M input, $0.60/M output default or user configured)
      const modelName = this.config.model || 'gemini-3.7-flash';
      const inputRate = Number(this.config.inputPrice ?? 0.15);
      const outputRate = Number(this.config.outputPrice ?? 0.60);

      // Upsert each turn into the SQLite sessions table
      for (const turn of turns) {
        const turnSessionId = turns.length === 1 ? sessionId : `${sessionId}-turn-${turn.index}`;
        const totalTokens = turn.inputTokens + turn.outputTokens;
        const estimatedCost = Number(((turn.inputTokens / 1_000_000) * inputRate + (turn.outputTokens / 1_000_000) * outputRate).toFixed(5));
        const durationMs = Math.max(1000, new Date(turn.endedAt).getTime() - new Date(turn.startedAt).getTime());

        const existing = await db.query.sessions.findFirst({
          where: eq(sessions.id, turnSessionId)
        });

        if (existing) {
          await db.update(sessions).set({
            endedAt: turn.endedAt,
            model: modelName,
            durationMs,
            inputTokens: turn.inputTokens,
            outputTokens: turn.outputTokens,
            totalTokens,
            estimatedCost,
            summary: turn.summary,
            toolCalls: turn.toolCalls,
            status: 'completed'
          }).where(eq(sessions.id, turnSessionId));
        } else {
          await db.insert(sessions).values({
            id: turnSessionId,
            agentId: this.id,
            workspaceId: this.defaultWorkspaceId!,
            model: modelName,
            startedAt: turn.startedAt,
            endedAt: turn.endedAt,
            durationMs,
            inputTokens: turn.inputTokens,
            outputTokens: turn.outputTokens,
            totalTokens,
            estimatedCost,
            status: 'completed',
            summary: turn.summary,
            toolCalls: turn.toolCalls
          }).onConflictDoNothing();
        }
      }
    } catch (err) {
      console.error(`[AntigravityConnector] Error processing file ${filepath}:`, err);
    }
  }
}

