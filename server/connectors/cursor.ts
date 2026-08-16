import * as chokidar from 'chokidar';
import * as path from 'path';
import * as fs from 'fs/promises';
import { AgentConnector, AgentConfig } from './base.js';
import { db } from '../db/index.js';
import { sessions, workspaces } from '../db/schema.js';
import * as crypto from 'crypto';
import { ModelRegistry } from '../services/model-registry.js';
import { WorkspaceService } from '../services/workspace-service.js';

export class CursorConnector extends AgentConnector {
  private watcher: chokidar.FSWatcher | null = null;
  private defaultWorkspaceId: string | null = null;

  constructor(id: string, name: string, config: AgentConfig) {
    super(id, name, config);
  }

  public async startWatching(): Promise<void> {
    if (this.isWatching) return;
    await this.ensureDefaultWorkspace();

    const logPath = this.config.logPath || '~/.cursor/logs';
    const resolvedPath = logPath.startsWith('~') 
      ? logPath.replace('~', process.env.HOME || '') 
      : logPath;

    try {
      await fs.mkdir(resolvedPath, { recursive: true });
    } catch (e) {}

    console.log(`[CursorConnector] Started watching: ${resolvedPath}`);
    this.watcher = chokidar.watch(resolvedPath, {
      persistent: true,
      ignoreInitial: false,
      depth: 3
    });

    this.watcher.on('add', (filepath: string) => this.handleFileChange(filepath));
    this.watcher.on('change', (filepath: string) => this.handleFileChange(filepath));
    this.watcher.on('error', (err: unknown) => console.error('[CursorConnector] Watcher error:', err));

    this.isWatching = true;
  }

  public async stopWatching(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
    this.isWatching = false;
    console.log('[CursorConnector] Stopped watching');
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
    const logPath = this.config.logPath || '~/.cursor/logs';
    const resolvedPath = logPath.startsWith('~') 
      ? logPath.replace('~', process.env.HOME || '') 
      : logPath;

    try {
      const entries = await fs.readdir(resolvedPath, { withFileTypes: true }).catch(() => []);
      for (const entry of entries) {
        if (entry.isFile() && (entry.name.endsWith('.json') || entry.name.endsWith('.jsonl') || entry.name.endsWith('.log'))) {
          await this.handleFileChange(path.join(resolvedPath, entry.name));
          scanned++;
        }
      }
    } catch (err) {}
    return scanned;
  }

  public async handleFileChange(filepath: string) {
    if (!filepath.endsWith('.json') && !filepath.endsWith('.jsonl') && !filepath.endsWith('.log')) return;
    if (!this.defaultWorkspaceId) await this.ensureDefaultWorkspace();

    try {
      const content = await fs.readFile(filepath, 'utf8');
      const lines = content.split('\n').filter(Boolean);
      
      for (let i = 0; i < lines.length; i++) {
        try {
          const item = JSON.parse(lines[i]);
          const sessionId = item.id || `cursor-${path.basename(filepath, path.extname(filepath))}-${i}`;
          
          const rawCwd = item.workspace || item.workspaceUri || item.rootPath || item.folder || item.cwd;
          const sessionWorkspaceId = await WorkspaceService.resolveOrCreateWorkspace({
            dirPath: rawCwd,
            workspaceName: rawCwd ? path.basename(rawCwd) : undefined
          });

          const rawModel = item.model || item.model_name || this.config.model || 'claude-3-5-sonnet';
          const resolvedModel = ModelRegistry.resolve(rawModel);
          
          const inputTokens = Number(item.input_tokens || item.prompt_tokens || 80);
          const outputTokens = Number(item.output_tokens || item.completion_tokens || 350);
          const thinkingTokens = Number(item.thinking_tokens || 0);
          
          const estimatedCost = ModelRegistry.calculateCost(
            resolvedModel.id, 
            inputTokens, 
            outputTokens, 
            thinkingTokens,
            this.config.inputPrice,
            this.config.outputPrice
          );

          const effortLevel = thinkingTokens > 0 || resolvedModel.supportsThinking ? 'High' : 'Medium';
          const summary = item.prompt || item.message || 'Cursor Prompt Trace';
          const startedAt = item.timestamp || item.created_at || new Date().toISOString();

          await db.insert(sessions).values({
            id: sessionId,
            agentId: this.id,
            workspaceId: sessionWorkspaceId,
            model: resolvedModel.id,
            startedAt,
            endedAt: startedAt,
            durationMs: Number(item.durationMs || 1800),
            inputTokens,
            outputTokens,
            totalTokens: inputTokens + outputTokens,
            estimatedCost,
            status: 'completed',
            summary: String(summary).substring(0, 100),
            toolCalls: Number(item.tool_calls?.length || 0),
            metadata: {
              modelName: resolvedModel.name,
              provider: resolvedModel.provider,
              effortLevel,
              thinkingTokens
            }
          }).onConflictDoNothing();
        } catch (e) {}
      }
    } catch (err) {}
  }
}
