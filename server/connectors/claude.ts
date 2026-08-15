import * as chokidar from 'chokidar';
import * as path from 'path';
import * as fs from 'fs/promises';
import { AgentConnector, AgentConfig } from './base.js';
import { db } from '../db/index.js';
import { sessions, workspaces, tags, sessionTags } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import * as crypto from 'crypto';
import { ModelRegistry } from '../services/model-registry.js';

export class ClaudeConnector extends AgentConnector {
  private watcher: chokidar.FSWatcher | null = null;
  private defaultWorkspaceId: string | null = null;

  constructor(id: string, name: string, config: AgentConfig) {
    super(id, name, config);
  }

  public async startWatching(): Promise<void> {
    if (this.isWatching) return;
    await this.ensureDefaultWorkspace();

    const logPath = this.config.logPath || '~/.claude';
    const resolvedPath = logPath.startsWith('~') 
      ? logPath.replace('~', process.env.HOME || '') 
      : logPath;

    try {
      await fs.mkdir(resolvedPath, { recursive: true });
    } catch (e) {}

    console.log(`[ClaudeConnector] Started watching: ${resolvedPath}`);
    this.watcher = chokidar.watch(resolvedPath, {
      persistent: true,
      ignoreInitial: false,
      depth: 3
    });

    this.watcher.on('add', (filepath: string) => this.handleFileChange(filepath));
    this.watcher.on('change', (filepath: string) => this.handleFileChange(filepath));
    this.watcher.on('error', (err: unknown) => console.error('[ClaudeConnector] Watcher error:', err));

    this.isWatching = true;
  }

  public async stopWatching(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
    this.isWatching = false;
    console.log('[ClaudeConnector] Stopped watching');
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
    const historyFile = path.join(process.env.HOME || '', '.claude', 'history.jsonl');
    try {
      await fs.access(historyFile);
      await this.handleFileChange(historyFile);
      scanned++;
    } catch (e) {}
    return scanned;
  }

  public async handleFileChange(filepath: string) {
    // Only parse explicit history.jsonl or transcript files
    if (!filepath.endsWith('history.jsonl') && !filepath.endsWith('transcript.jsonl')) return;
    if (!this.defaultWorkspaceId) await this.ensureDefaultWorkspace();

    try {
      const content = await fs.readFile(filepath, 'utf8');
      const lines = content.split('\n').filter(Boolean);
      
      for (let i = 0; i < lines.length; i++) {
        try {
          const item = JSON.parse(lines[i]);
          
          // Strict validation: Require actual prompt text
          const rawPrompt = item.display || item.prompt || item.content;
          if (!rawPrompt || typeof rawPrompt !== 'string' || rawPrompt.trim().length === 0) {
            continue; // Skip non-prompt entries
          }

          const sessionId = item.sessionId ? `claude-${item.sessionId}-${i}` : `claude-${path.basename(filepath, '.jsonl')}-${i}`;
          const promptText = rawPrompt.trim();
          
          // Detect model from prompt or item
          let rawModel = item.model || item.model_name || this.config.model || 'claude-3-7-sonnet';
          const promptLower = promptText.toLowerCase();
          if (promptLower.includes('opus')) rawModel = 'claude-3-opus';
          else if (promptLower.includes('haiku')) rawModel = 'claude-3-5-haiku';
          else if (promptLower.includes('3.5')) rawModel = 'claude-3-5-sonnet';
          else if (promptLower.includes('3.7')) rawModel = 'claude-3-7-sonnet';

          const resolvedModel = ModelRegistry.resolve(rawModel);
          const inputTokens = Math.max(15, Math.ceil(promptText.length / 3.8));
          const outputTokens = Math.max(50, Math.ceil((item.response?.length || 200) / 3.8));
          const thinkingTokens = item.thinking_tokens || 0;
          
          const estimatedCost = ModelRegistry.calculateCost(
            resolvedModel.id, 
            inputTokens, 
            outputTokens, 
            thinkingTokens,
            this.config.inputPrice,
            this.config.outputPrice
          );

          const effortLevel = thinkingTokens > 0 || resolvedModel.supportsThinking ? 'High' : 'Medium';
          const startedAt = item.timestamp ? new Date(item.timestamp).toISOString() : (item.created_at || new Date().toISOString());

          await db.insert(sessions).values({
            id: sessionId,
            agentId: this.id,
            workspaceId: this.defaultWorkspaceId!,
            model: resolvedModel.id,
            startedAt,
            endedAt: startedAt,
            durationMs: 2500,
            inputTokens,
            outputTokens,
            totalTokens: inputTokens + outputTokens,
            estimatedCost,
            status: 'completed',
            summary: promptText.length > 95 ? promptText.substring(0, 92) + '...' : promptText,
            toolCalls: 0,
            metadata: {
              modelName: resolvedModel.name,
              provider: resolvedModel.provider,
              effortLevel,
              thinkingTokens
            }
          }).onConflictDoNothing();
        } catch (e) {}
      }
    } catch (err) {
      console.error(`[ClaudeConnector] Error processing file ${filepath}:`, err);
    }
  }
}
