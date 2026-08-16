import * as chokidar from 'chokidar';
import * as path from 'path';
import * as fs from 'fs/promises';
import { AgentConnector, AgentConfig } from './base.js';
import { db } from '../db/index.js';
import { sessions, workspaces, tags, sessionTags } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import * as crypto from 'crypto';
import { ModelRegistry } from '../services/model-registry.js';
import { TagService } from '../services/tag-service.js';
import { WorkspaceService } from '../services/workspace-service.js';

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

    this.watcher = chokidar.watch(resolvedPath, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: false,
      depth: 3
    });

    this.watcher.on('add', (filepath) => this.processLogFile(filepath));
    this.watcher.on('change', (filepath) => this.processLogFile(filepath));
    this.isWatching = true;
    console.log(`[ClaudeConnector] Watching for Claude logs in ${resolvedPath}`);
  }

  public async stopWatching(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
    this.isWatching = false;
  }

  public async syncLatest(): Promise<number> {
    await this.ensureDefaultWorkspace();
    const logPath = this.config.logPath || '~/.claude';
    const resolvedPath = logPath.startsWith('~') 
      ? logPath.replace('~', process.env.HOME || '') 
      : logPath;

    try {
      const entries = await fs.readdir(resolvedPath, { withFileTypes: true });
      let syncedCount = 0;
      for (const entry of entries) {
        if (entry.isFile() && (entry.name.endsWith('.json') || entry.name.endsWith('.jsonl'))) {
          await this.processLogFile(path.join(resolvedPath, entry.name));
          syncedCount++;
        }
      }
      return syncedCount;
    } catch (err) {
      return 0;
    }
  }

  private async ensureDefaultWorkspace(): Promise<void> {
    const ws = await db.query.workspaces.findFirst();
    if (ws) {
      this.defaultWorkspaceId = ws.id;
    } else {
      const defaultId = 'default-workspace';
      await db.insert(workspaces).values({
        id: defaultId,
        name: 'Default Workspace',
        path: process.cwd(),
        description: 'Auto-created workspace'
      }).onConflictDoNothing();
      this.defaultWorkspaceId = defaultId;
    }
  }

  private async processLogFile(filepath: string): Promise<void> {
    try {
      const content = await fs.readFile(filepath, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim().length > 0);

      for (let i = 0; i < lines.length; i++) {
        try {
          const item = JSON.parse(lines[i]);
          const rawPrompt = item.display || item.prompt || item.content;
          if (!rawPrompt || typeof rawPrompt !== 'string' || rawPrompt.trim().length === 0) {
            continue; // Skip non-prompt entries
          }

          const sessionId = item.sessionId ? `claude-${item.sessionId}-${i}` : `claude-${path.basename(filepath, '.jsonl')}-${i}`;
          const promptText = rawPrompt.trim();

          const rawCwd = item.cwd || item.working_dir || item.workspace || item.projectPath;
          const sessionWorkspaceId = await WorkspaceService.resolveOrCreateWorkspace({
            dirPath: rawCwd,
            workspaceName: rawCwd ? path.basename(rawCwd) : undefined
          });
          
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
            workspaceId: sessionWorkspaceId,
            model: resolvedModel.id,
            startedAt,
            endedAt: startedAt,
            durationMs: 2500,
            inputTokens,
            outputTokens,
            totalTokens: inputTokens + outputTokens,
            estimatedCost,
            status: 'completed',
            summary: promptText,
            toolCalls: 0,
            metadata: {
              modelName: resolvedModel.name,
              provider: resolvedModel.provider,
              effortLevel,
              thinkingTokens,
              fullPrompt: promptText
            }
          }).onConflictDoNothing();

          // Extract and link canonical tags
          const tagsList = TagService.extractCanonicalTags(promptText);
          for (const tagName of tagsList) {
            const tagRaw = `[${tagName}]`;
            let tagRecord = await db.query.tags.findFirst({ where: eq(tags.raw, tagRaw) });
            if (!tagRecord) {
              const newTagId = `tag-${tagName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
              const color = TagService.getTagColor(tagName);
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
                sessionId,
                tagId: tagRecord.id
              }).onConflictDoNothing();
            }
          }
        } catch (e) {}
      }
    } catch (err) {
      console.error(`[ClaudeConnector] Error processing file ${filepath}:`, err);
    }
  }
}
