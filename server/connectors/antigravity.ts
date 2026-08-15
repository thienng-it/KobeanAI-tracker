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

      let inputTokens = 0;
      let outputTokens = 0;
      let toolCalls = 0;
      let firstUserPrompt = '';
      
      let startTime = new Date().toISOString();
      let endTime = new Date().toISOString();
      let status = 'completed';

      for (let i = 0; i < lines.length; i++) {
        try {
          const parsed = JSON.parse(lines[i]);
          
          if (i === 0 && parsed.created_at) startTime = parsed.created_at;
          if (parsed.created_at) endTime = parsed.created_at;

          // Extract user input prompt
          if (parsed.type === 'USER_INPUT' && parsed.content && !firstUserPrompt) {
            firstUserPrompt = String(parsed.content).replace(/<USER_REQUEST>|<\/USER_REQUEST>/g, '').trim();
            // Truncate summary if too long
            if (firstUserPrompt.length > 90) {
              firstUserPrompt = firstUserPrompt.substring(0, 87) + '...';
            }
          }

          // Count characters and convert to tokens (~3.8 chars per token)
          const textLength = (parsed.content ? String(parsed.content).length : 0);
          if (parsed.type === 'USER_INPUT') {
            inputTokens += Math.max(1, Math.ceil(textLength / 3.8));
          } else {
            outputTokens += Math.max(1, Math.ceil(textLength / 3.8));
          }

          // Count tool calls
          if (parsed.tool_calls && Array.isArray(parsed.tool_calls)) {
            toolCalls += parsed.tool_calls.length;
            outputTokens += parsed.tool_calls.length * 45; // tool payload overhead
          }
        } catch (e) {
          // invalid json line, skip
        }
      }

      // If token calculations yielded minimum values, enforce realistic baseline for multi-turn sessions
      if (inputTokens === 0) inputTokens = Math.max(120, lines.length * 60);
      if (outputTokens === 0) outputTokens = Math.max(80, lines.length * 95);
      const totalTokens = inputTokens + outputTokens;

      // Model & Pricing calculation: Gemini 1.5 Pro ($1.25/M input, $5.00/M output)
      const estimatedCost = Number(((inputTokens / 1_000_000) * 1.25 + (outputTokens / 1_000_000) * 5.00).toFixed(4));
      const durationMs = Math.max(1000, new Date(endTime).getTime() - new Date(startTime).getTime());
      const summaryText = firstUserPrompt || `Agent session ${sessionId.substring(0, 8)}`;

      // Upsert the session in SQLite
      const existingSession = await db.query.sessions.findFirst({
        where: eq(sessions.id, sessionId)
      });

      if (existingSession) {
        await db.update(sessions)
          .set({
            endedAt: endTime,
            durationMs,
            inputTokens,
            outputTokens,
            totalTokens,
            estimatedCost,
            status,
            summary: summaryText,
            toolCalls
          })
          .where(eq(sessions.id, sessionId));
      } else {
        await db.insert(sessions).values({
          id: sessionId,
          agentId: this.id,
          workspaceId: this.defaultWorkspaceId!,
          model: 'gemini-1.5-pro',
          startedAt: startTime,
          endedAt: endTime,
          durationMs,
          inputTokens,
          outputTokens,
          totalTokens,
          estimatedCost,
          status,
          summary: summaryText,
          toolCalls
        });
        console.log(`[AntigravityConnector] Synced session ${sessionId} (${totalTokens} tokens, $${estimatedCost})`);
      }
    } catch (err) {
      console.error(`[AntigravityConnector] Error processing file ${filepath}:`, err);
    }
  }
}

