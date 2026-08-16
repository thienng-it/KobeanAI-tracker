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
        detectedModel: string;
        effortLevel: string;
        extractedTags: string[];
      }

      const turns: TurnData[] = [];
      let currentTurn: TurnData | null = null;
      let activeSessionModel = this.config.model || 'gemini-3.7-flash';

      let detectedWorkspacePath: string | null = null;
      let detectedCorpusName: string | null = null;

      for (let i = 0; i < lines.length; i++) {
        try {
          const step = JSON.parse(lines[i]);
          const stepTime = step.created_at || new Date().toISOString();

          // Check if step explicitly states a model (e.g. step.model or in system content)
          if (step.model || step.model_name) {
            activeSessionModel = step.model || step.model_name;
          }

          const fullContent = String(step.content || '');

          // Heuristic 1: Extract workspace URI -> CorpusName mapping from system context
          const userInfMatch = fullContent.match(/format \[URI\] -> \[CorpusName\]:\s*([^\r\n]+)\s*->\s*([^\r\n]+)/i);
          if (userInfMatch) {
            const resolved = WorkspaceService.findRepoRoot(userInfMatch[1]);
            if (resolved) {
              detectedWorkspacePath = resolved.rootPath;
              detectedCorpusName = resolved.repoName;
            }
          }

          // Heuristic 2: Extract from user rules headers (e.g. <RULE[/Users/.../GEMINI.md]>)
          if (!detectedWorkspacePath) {
            const ruleMatch = fullContent.match(/<RULE\[([a-zA-Z0-9_\-./~]+)\/(?:GEMINI|AGENT|AGENTS|RULES|CLAUDE|CURSOR)\.md\]>/i);
            if (ruleMatch) {
              const resolved = WorkspaceService.findRepoRoot(ruleMatch[1]);
              if (resolved) {
                detectedWorkspacePath = resolved.rootPath;
                detectedCorpusName = resolved.repoName;
              }
            }
          }

          // Heuristic 3: Check tool call arguments (Cwd, SearchPath, TargetFile, AbsolutePath)
          if (step.tool_calls && Array.isArray(step.tool_calls)) {
            for (const tc of step.tool_calls) {
              const args = tc.args || tc.arguments || tc.parameters || {};
              for (const key of ['Cwd', 'cwd', 'TargetFile', 'SearchPath', 'AbsolutePath', 'DirectoryPath']) {
                if (args[key] && typeof args[key] === 'string') {
                  const resolved = WorkspaceService.findRepoRoot(args[key]);
                  if (resolved) {
                    detectedWorkspacePath = resolved.rootPath;
                    detectedCorpusName = resolved.repoName;
                    break;
                  }
                }
              }
              if (detectedWorkspacePath) break;
            }
          }

          if (step.type === 'USER_INPUT') {
            if (currentTurn) turns.push(currentTurn);

            let rawPrompt = fullContent.replace(/<USER_REQUEST>|<\/USER_REQUEST>/g, '').trim();
            if (rawPrompt.includes('<ADDITIONAL_METADATA>')) rawPrompt = rawPrompt.split('<ADDITIONAL_METADATA>')[0].trim();
            if (rawPrompt.includes('{{ CHECKPOINT')) rawPrompt = rawPrompt.split('{{ CHECKPOINT')[0].trim();
            if (!rawPrompt) rawPrompt = 'User request';

            // Detect active model from IDE settings change injections
            const settingsMatch = fullContent.match(/<USER_SETTINGS_CHANGE>[\s\S]*?from (.*?) to (.*?)\. No need to comment/i);
            if (settingsMatch) {
              activeSessionModel = settingsMatch[2].trim();
            }

            // Resolve model from agent configuration or explicit directive tag like [model:gemini-3.1-pro]
            let turnModel = activeSessionModel || this.config.model || 'gemini-3.7-flash';
            const modelTagMatch = rawPrompt.match(/\[model:([^\]]+)\]/i);
            if (modelTagMatch) {
              turnModel = modelTagMatch[1].trim();
            }

            // Extract canonical intent tags using TagService (filters compiler noise and normalizes)
            const tagsList = TagService.extractCanonicalTags(rawPrompt);

            currentTurn = {
              index: turns.length + 1,
              startedAt: stepTime,
              endedAt: stepTime,
              summary: rawPrompt,
              inputTokens: Math.max(10, Math.ceil(rawPrompt.length / 3.8)),
              outputTokens: 0,
              thinkingChars: 0,
              thinkingSteps: 0,
              toolCalls: 0,
              detectedModel: turnModel,
              effortLevel: 'High',
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

      // Resolve workspace record for this conversation
      const sessionWorkspaceId = await WorkspaceService.resolveOrCreateWorkspace({
        dirPath: detectedWorkspacePath,
        corpusName: detectedCorpusName
      });

      // Upsert each turn into the SQLite sessions table
      if (turns.length > 1) {
        await db.delete(sessions).where(eq(sessions.id, sessionId)).catch(() => {});
      }

      for (const turn of turns) {
        const turnSessionId = turns.length === 1 ? sessionId : `${sessionId}-turn-${turn.index}`;
        const totalTokens = turn.inputTokens + turn.outputTokens;
        const durationMs = Math.max(1000, new Date(turn.endedAt).getTime() - new Date(turn.startedAt).getTime());

        // Resolve normalized model and calculate precise cost via ModelRegistry
        const resolvedModel = ModelRegistry.resolve(turn.detectedModel);
        const thinkingTokens = Math.ceil(turn.thinkingChars / 3.8);
        const estimatedCost = ModelRegistry.calculateCost(
          resolvedModel.id,
          turn.inputTokens,
          turn.outputTokens,
          thinkingTokens,
          this.config.inputPrice,
          this.config.outputPrice
        );

        const effortLevel = (turn.thinkingChars > 0 || resolvedModel.supportsThinking) ? 'High' : 'Medium';

        const metadata = {
          modelId: resolvedModel.id,
          modelName: resolvedModel.name,
          provider: resolvedModel.provider,
          effortLevel,
          effortScore: effortLevel === 'High' ? 1.0 : effortLevel === 'Medium' ? 0.5 : 0.0,
          thinkingMode: resolvedModel.supportsThinking || thinkingTokens > 0,
          thinkingChars: turn.thinkingChars,
          thinkingSteps: turn.thinkingSteps,
          thinkingTokens,
          workspacePath: detectedWorkspacePath,
          corpusName: detectedCorpusName
        };

        const existing = await db.query.sessions.findFirst({
          where: eq(sessions.id, turnSessionId)
        });

        if (existing) {
          await db.update(sessions).set({
            workspaceId: sessionWorkspaceId,
            endedAt: turn.endedAt,
            model: resolvedModel.id,
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
            workspaceId: sessionWorkspaceId,
            model: resolvedModel.id,
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

        // Refresh and link extracted intent tags in database
        await db.delete(sessionTags).where(eq(sessionTags.sessionId, turnSessionId));

        for (const tagName of turn.extractedTags) {
          const tagRaw = `[${tagName}]`;
          let tagRecord = await db.query.tags.findFirst({
            where: eq(tags.raw, tagRaw)
          });
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
