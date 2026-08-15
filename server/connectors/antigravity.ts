import * as chokidar from 'chokidar';
import * as path from 'path';
import * as fs from 'fs/promises';
import { AgentConnector, AgentConfig } from './base.js';
import { db } from '../db/index.js';
import { sessions, workspaces, tags, sessionTags } from '../db/schema.js';
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

    // Resolve ~ if present
    const resolvedPath = this.config.logPath.startsWith('~') 
      ? this.config.logPath.replace('~', process.env.HOME || '') 
      : this.config.logPath;

    console.log(`[AntigravityConnector] Started watching: ${resolvedPath}`);
    this.watcher = chokidar.watch(resolvedPath, {
      persistent: true,
      ignoreInitial: false, // Ingest existing logs on startup
      depth: 5
    });

    this.watcher.on('add', (filepath: string) => this.handleFileChange(filepath));
    this.watcher.on('change', (filepath: string) => this.handleFileChange(filepath));
    this.watcher.on('error', (err: unknown) => console.error('[AntigravityConnector] Watcher error:', err));

    this.isWatching = true;
  }

  public async stopWatching(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
    this.isWatching = false;
    console.log('[AntigravityConnector] Stopped watching');
  }

  private async ensureDefaultWorkspace() {
    const existing = await db.query.workspaces.findFirst();
    if (existing) {
      this.defaultWorkspaceId = existing.id;
    } else {
      const id = crypto.randomUUID();
      await db.insert(workspaces).values({
        id,
        name: 'Default Workspace',
        path: process.cwd()
      });
      this.defaultWorkspaceId = id;
    }
  }

  public async scanHistory(): Promise<number> {
    let scanned = 0;
    const resolvedPath = (this.config.logPath || '~/.gemini/antigravity-ide/brain').startsWith('~') 
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
        thinkingChars: number;
        thinkingSteps: number;
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

            // Extract explicit bracketed tags like [repo:org/name]
            const tagMatches = rawPrompt.match(/\[([^\]]+)\]/g) || [];
            const tagsList = tagMatches.map(t => t.replace(/[\[\]]/g, '').trim()).filter(Boolean);

            // If no explicit tags, classify intent automatically
            if (tagsList.length === 0) {
              const lower = rawPrompt.toLowerCase();
              if (/\b(fix|bug|issue|error|fail|broken|crash|wrong|duplicate|duplicated|inverted)\b/.test(lower)) {
                tagsList.push('Fix');
              } else if (/\b(refactor|clean|cleanup|dedup|reorganize|structure)\b/.test(lower)) {
                tagsList.push('Refactor');
              } else if (/\b(implement|feature|add|create|build|support|new|enhance|toolbar|picker)\b/.test(lower)) {
                tagsList.push('Implement');
              } else if (/\b(ui|ux|theme|dark|light|style|color|css|layout|motion|button|contrast)\b/.test(lower)) {
                tagsList.push('UI/UX');
              } else if (/\b(doc|docs|documentation|guide|readme|help|explain|how to)\b/.test(lower)) {
                tagsList.push('Docs');
              } else if (/\b(test|validate|verify|check|audit|benchmark|correct|static)\b/.test(lower)) {
                tagsList.push('Validate');
              } else if (/\b(config|rule|skill|agent|model|token|price|env|key|codegraph)\b/.test(lower)) {
                tagsList.push('Config');
              } else {
                tagsList.push('Unknown');
              }
            }

            currentTurn = {
              index: turns.length + 1,
              startedAt: stepTime,
              endedAt: stepTime,
              summary: rawPrompt.length > 95 ? rawPrompt.substring(0, 92) + '...' : rawPrompt,
              inputTokens: Math.max(10, Math.ceil(rawPrompt.length / 3.8)),
              outputTokens: 0,
              thinkingChars: 0,
              thinkingSteps: 0,
              toolCalls: 0,
              extractedTags: tagsList
            };
          } else if (currentTurn) {
            currentTurn.endedAt = stepTime;
            const textLen = step.content ? String(step.content).length : 0;
            currentTurn.outputTokens += Math.max(1, Math.ceil(textLen / 3.8));

            if (step.thinking) {
              const thinkLen = String(step.thinking).length;
              currentTurn.thinkingChars += thinkLen;
              currentTurn.thinkingSteps += 1;
              // Add thinking token calculation
              currentTurn.outputTokens += Math.max(1, Math.ceil(thinkLen / 3.8));
            }

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
      // If splitting into multiple turns, remove any legacy un-split parent record
      if (turns.length > 1) {
        await db.delete(sessions).where(eq(sessions.id, sessionId)).catch(() => {});
      }

      for (const turn of turns) {
        const turnSessionId = turns.length === 1 ? sessionId : `${sessionId}-turn-${turn.index}`;
        const totalTokens = turn.inputTokens + turn.outputTokens;
        const estimatedCost = Number(((turn.inputTokens / 1_000_000) * inputRate + (turn.outputTokens / 1_000_000) * outputRate).toFixed(5));
        const durationMs = Math.max(1000, new Date(turn.endedAt).getTime() - new Date(turn.startedAt).getTime());

        // Gemini 3.7 Thinking mode effort level calculation from real telemetry
        const effortLevel = 'High'; // Gemini 3.7 Flash Thinking mode is configured at High Effort (1.00)
        const metadata = {
          effortLevel,
          effortScore: 1.0,
          thinkingMode: true,
          thinkingChars: turn.thinkingChars,
          thinkingSteps: turn.thinkingSteps,
          thinkingTokens: Math.ceil(turn.thinkingChars / 3.8)
        };

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
            metadata,
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
            metadata,
            status: 'completed',
            summary: turn.summary,
            toolCalls: turn.toolCalls
          }).onConflictDoNothing();
        }

        // Link extracted intent tags in database
        for (const tagName of turn.extractedTags) {
          const tagRaw = `[${tagName}]`;
          let tagRecord = await db.query.tags.findFirst({
            where: eq(tags.raw, tagRaw)
          });
          if (!tagRecord) {
            const newTagId = `tag-${tagName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            let color = '#6b7280';
            if (tagName === 'Fix') color = '#ef4444';
            else if (tagName === 'Refactor') color = '#8b5cf6';
            else if (tagName === 'Implement') color = '#10b981';
            else if (tagName === 'UI/UX') color = '#3b82f6';
            else if (tagName === 'Docs') color = '#06b6d4';
            else if (tagName === 'Validate') color = '#f59e0b';
            else if (tagName === 'Config') color = '#ec4899';
            else if (tagName === 'Unknown') color = '#64748b';

            await db.insert(tags).values({
              id: newTagId,
              raw: tagRaw,
              prefix: 'intent',
              identifier: tagName.toLowerCase(),
              action: tagName,
              color
            }).onConflictDoNothing();
            tagRecord = await db.query.tags.findFirst({ where: eq(tags.raw, tagRaw) });
          }

          if (tagRecord) {
            await db.insert(sessionTags).values({
              sessionId: turnSessionId,
              tagId: tagRecord.id
            }).onConflictDoNothing();
          }
        }
      }
    } catch (err) {
      console.error(`[AntigravityConnector] Error processing file ${filepath}:`, err);
    }
  }
}
