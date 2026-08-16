import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { memories, workspaces, type Memory, type InsertMemory } from '../db/schema.js';
import { eq, and, desc, sql, or } from 'drizzle-orm';
import { WorkspaceService } from './workspace-service.js';

export interface MemoryTemplate {
  id: string;
  title: string;
  category: 'architecture' | 'gotchas' | 'user-preference' | 'workflow' | 'api-conventions' | 'learned-pattern';
  priority: 'critical' | 'high' | 'normal' | 'low';
  pinned: boolean;
  content: string;
  tags: string[];
  description: string;
}

export interface ContextSearchResult {
  memory: Memory;
  relevanceScore: number;
  matchedTerms: string[];
  tokenCost: number;
}

export class MemoryScanner {
  /**
   * Estimate token footprint from text
   */
  public static estimateTokens(text: string): number {
    if (!text) return 0;
    return Math.max(1, Math.ceil(text.trim().length / 3.8));
  }

  /**
   * Curated Memory Bank Templates
   */
  public static getCuratedTemplates(): MemoryTemplate[] {
    return [
      {
        id: 'tmpl-local-first-security',
        title: 'Local-First Zero Telemetry Protocol',
        category: 'gotchas',
        priority: 'critical',
        pinned: true,
        description: 'Mandatory directive to prevent transmitting source code or API keys outside the local machine.',
        tags: ['security', 'privacy', 'sqlite', 'local-first'],
        content: `Never transmit source code, environment variables, or private API keys outside the local machine. All database operations must utilize SQLite in WAL mode with local file watchers.`
      },
      {
        id: 'tmpl-gitleaks-ci-avoidance',
        title: 'Gitleaks CI Secret Scanning Compliance',
        category: 'gotchas',
        priority: 'high',
        pinned: true,
        description: 'Prevent test connection strings with user:password from triggering Gitleaks CI failures.',
        tags: ['ci', 'gitleaks', 'testing', 'secrets'],
        content: `Gitleaks CI scans for database URIs with passwords. Never write mock connection strings formatted like 'postgresql://user:password@localhost'. Use 'postgresql://localhost:5432/mydb' or environment variables.`
      },
      {
        id: 'tmpl-esm-nodenext-imports',
        title: 'Node.js ESM NodeNext Relative Import Standard',
        category: 'architecture',
        priority: 'high',
        pinned: true,
        description: 'Enforce .js extensions on relative imports in backend TypeScript files for ESM module resolution.',
        tags: ['esm', 'typescript', 'backend', 'nodenext'],
        content: `Backend runs Node.js ESM ("type": "module" with NodeNext resolution). All relative TypeScript imports must use the '.js' extension (e.g. import { db } from '../db/index.js';).`
      },
      {
        id: 'tmpl-taste-skill-motion',
        title: 'Taste-Skill Motion & Spring Easing Tokens',
        category: 'user-preference',
        priority: 'normal',
        pinned: false,
        description: 'Design guidelines for smooth micro-interactions, spring curves, and glassmorphic panels.',
        tags: ['ui-ux', 'taste-skill', 'animation', 'glassmorphism'],
        content: `Use 'cubic-bezier(0.16, 1, 0.3, 1)' spring curves for all interactive panels, modal transitions, and card elevations. Adhere to glassmorphism panels with backdrop-filter: blur(16px).`
      },
      {
        id: 'tmpl-ponytail-decision-ladder',
        title: 'Ponytail Anti-Overengineering Decision Ladder',
        category: 'workflow',
        priority: 'high',
        pinned: true,
        description: 'Enforce YAGNI, standard library first, and native web capabilities over adding unnecessary npm dependencies.',
        tags: ['ponytail', 'yagni', 'simplicity', 'architecture'],
        content: `Apply the 6-step Ponytail Decision Ladder before adding new packages: 1. YAGNI • 2. Standard Library First • 3. Native Web APIs • 4. Direct 10-line Implementation • 5. Clean Architecture • 6. Zero Dead Code.`
      },
      {
        id: 'tmpl-drizzle-query-builder',
        title: 'Drizzle ORM Type-Safe Query Callback Standard',
        category: 'api-conventions',
        priority: 'normal',
        pinned: false,
        description: 'Standard for relational queries using Drizzle ORM callback syntax in Express routes.',
        tags: ['database', 'drizzle', 'sqlite', 'orm'],
        content: `When querying via Drizzle relational API (db.query.table.findFirst), use callback syntax for type safety: where: (t, { eq }) => eq(t.id, req.params.id). For direct SQL updates, use eq(table.id, req.params.id).`
      }
    ];
  }

  /**
   * Synchronize memories from workspace .agents/memory/ and global knowledge directory
   */
  public static async syncAll(): Promise<{ total: number; workspaceCount: number; globalCount: number }> {
    let workspaceCount = 0;
    let globalCount = 0;

    try {
      const allWorkspaces = await db.query.workspaces.findMany();
      const currentWorkspace = allWorkspaces.find(w => w.path && fs.existsSync(w.path)) || allWorkspaces[0];
      const targetWorkspaceId = currentWorkspace?.id || 'ws-kobeanai-tracker-ab6731';
      const workspaceRoot = currentWorkspace?.path || process.cwd();

      // 1. Scan Workspace Memory: .agents/memories.json or .agents/memory/MEMORY.md
      const agentsDir = path.join(workspaceRoot, '.agents');
      const memoryDir = path.join(agentsDir, 'memory');
      const memoriesJsonPath = path.join(agentsDir, 'memories.json');
      const memoryMdPath = path.join(memoryDir, 'MEMORY.md');

      // Check if memories.json exists
      if (fs.existsSync(memoriesJsonPath)) {
        try {
          const raw = fs.readFileSync(memoriesJsonPath, 'utf8');
          const data = JSON.parse(raw);
          const list: any[] = Array.isArray(data) ? data : (data.memories || []);

          for (const item of list) {
            const memoryId = item.id || `mem-${crypto.randomUUID().slice(0, 8)}`;
            const tokens = this.estimateTokens(item.content || '');

            const existing = await db.query.memories.findFirst({
              where: eq(memories.id, memoryId)
            });

            if (existing) {
              await db.update(memories).set({
                title: item.title || existing.title,
                content: item.content || existing.content,
                category: item.category || existing.category,
                priority: item.priority || existing.priority,
                pinned: item.pinned !== undefined ? !!item.pinned : existing.pinned,
                tokens,
                tags: Array.isArray(item.tags) ? item.tags : existing.tags,
                status: item.status || 'active',
                updatedAt: new Date().toISOString()
              }).where(eq(memories.id, memoryId));
            } else {
              await db.insert(memories).values({
                id: memoryId,
                workspaceId: targetWorkspaceId,
                title: item.title || 'Untitled Memory',
                content: item.content || '',
                category: item.category || 'architecture',
                scope: 'workspace',
                pinned: !!item.pinned,
                priority: item.priority || 'normal',
                tokens,
                recallCount: item.recallCount || 0,
                source: item.source || 'file',
                tags: Array.isArray(item.tags) ? item.tags : [],
                status: 'active'
              }).onConflictDoNothing();
            }
            workspaceCount++;
          }
        } catch (err) {
          console.error('[MemoryScanner] Error parsing .agents/memories.json:', err);
        }
      }

      // Check if .agents/memory/MEMORY.md exists
      if (fs.existsSync(memoryMdPath)) {
        try {
          const mdContent = fs.readFileSync(memoryMdPath, 'utf8');
          // Parse sections by Markdown H2 / H3 headers
          const sections = mdContent.split(/\n##\s+/).filter(Boolean);
          for (const sec of sections) {
            const lines = sec.split('\n');
            const title = lines[0].replace(/^#+\s*/, '').trim();
            const body = lines.slice(1).join('\n').trim();
            if (!title || !body) continue;

            const memorySlug = `mem-${title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 32)}`;
            const tokens = this.estimateTokens(body);

            const existing = await db.query.memories.findFirst({
              where: eq(memories.id, memorySlug)
            });

            if (!existing) {
              await db.insert(memories).values({
                id: memorySlug,
                workspaceId: targetWorkspaceId,
                title,
                content: body,
                category: 'architecture',
                scope: 'workspace',
                pinned: false,
                priority: 'normal',
                tokens,
                recallCount: 0,
                source: 'file',
                sourceReference: '.agents/memory/MEMORY.md',
                tags: ['memory-bank', 'workspace'],
                status: 'active'
              }).onConflictDoNothing();
              workspaceCount++;
            }
          }
        } catch (err) {
          console.error('[MemoryScanner] Error parsing .agents/memory/MEMORY.md:', err);
        }
      }

      // If DB has 0 workspace memories, seed with curated templates
      const currentCount = await db.select({ count: sql<number>`count(*)` }).from(memories);
      if ((currentCount[0]?.count || 0) === 0) {
        const templates = this.getCuratedTemplates();
        for (const tmpl of templates) {
          const memoryId = `mem-${tmpl.id.replace('tmpl-', '')}-${crypto.randomUUID().slice(0, 6)}`;
          await db.insert(memories).values({
            id: memoryId,
            workspaceId: targetWorkspaceId,
            title: tmpl.title,
            content: tmpl.content,
            category: tmpl.category,
            scope: 'workspace',
            pinned: tmpl.pinned,
            priority: tmpl.priority,
            tokens: this.estimateTokens(tmpl.content),
            recallCount: tmpl.pinned ? 5 : 1,
            source: 'learned',
            tags: tmpl.tags,
            status: 'active'
          }).onConflictDoNothing();
          workspaceCount++;
        }
        await this.persistToWorkspaceFile(targetWorkspaceId);
      }

      // 2. Scan Global Knowledge directory: ~/.gemini/antigravity-ide/knowledge/
      const homeDir = process.env.HOME || '';
      const globalKnowledgeDir = path.join(homeDir, '.gemini', 'antigravity-ide', 'knowledge');
      if (fs.existsSync(globalKnowledgeDir)) {
        try {
          const entries = fs.readdirSync(globalKnowledgeDir, { withFileTypes: true });
          for (const ent of entries) {
            if (ent.isDirectory()) {
              const metaPath = path.join(globalKnowledgeDir, ent.name, 'metadata.json');
              if (fs.existsSync(metaPath)) {
                const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
                const memId = `global-ki-${ent.name}`;
                const title = meta.title || meta.summary || `Knowledge Item ${ent.name}`;
                const content = meta.summary || meta.description || meta.title || '';
                const tokens = this.estimateTokens(content);

                const existing = await db.query.memories.findFirst({
                  where: eq(memories.id, memId)
                });

                if (!existing) {
                  await db.insert(memories).values({
                    id: memId,
                    workspaceId: null,
                    title,
                    content,
                    category: 'learned-pattern',
                    scope: 'global',
                    pinned: false,
                    priority: 'normal',
                    tokens,
                    recallCount: 2,
                    source: 'learned',
                    sourceReference: metaPath,
                    tags: ['global', 'knowledge-item'],
                    status: 'active'
                  }).onConflictDoNothing();
                  globalCount++;
                }
              }
            }
          }
        } catch (err) {
          console.error('[MemoryScanner] Error scanning global knowledge dir:', err);
        }
      }

    } catch (error) {
      console.error('[MemoryScanner] syncAll error:', error);
    }

    return {
      total: workspaceCount + globalCount,
      workspaceCount,
      globalCount
    };
  }

  /**
   * Re-serializes active workspace memories to .agents/memory/MEMORY.md and .agents/memories.json atomically.
   */
  public static async persistToWorkspaceFile(workspaceId?: string): Promise<void> {
    try {
      const allWorkspaces = await db.query.workspaces.findMany();
      const currentWorkspace = (workspaceId && allWorkspaces.find(w => w.id === workspaceId)) ||
                               allWorkspaces.find(w => w.path && fs.existsSync(w.path)) ||
                               allWorkspaces[0];
      const workspaceRoot = currentWorkspace?.path || process.cwd();

      const targetMemories = await db.query.memories.findMany({
        where: and(
          eq(memories.scope, 'workspace'),
          eq(memories.status, 'active')
        ),
        orderBy: [desc(memories.pinned), desc(memories.priority), desc(memories.createdAt)]
      });

      const agentsDir = path.join(workspaceRoot, '.agents');
      const memoryDir = path.join(agentsDir, 'memory');

      if (!fs.existsSync(agentsDir)) fs.mkdirSync(agentsDir, { recursive: true });
      if (!fs.existsSync(memoryDir)) fs.mkdirSync(memoryDir, { recursive: true });

      // 1. Write .agents/memories.json
      const jsonPayload = targetMemories.map(m => ({
        id: m.id,
        title: m.title,
        content: m.content,
        category: m.category,
        priority: m.priority,
        pinned: m.pinned,
        tokens: m.tokens,
        tags: m.tags || [],
        updatedAt: m.updatedAt
      }));
      fs.writeFileSync(path.join(agentsDir, 'memories.json'), JSON.stringify(jsonPayload, null, 2), 'utf8');

      // 2. Write .agents/memory/MEMORY.md
      let mdLines: string[] = [
        '# KobeanAI Agent Memory Bank',
        '',
        '> This file contains persistent architectural decisions, lessons learned, and behavioral guardrails for AI coding assistants.',
        ''
      ];

      // Group by Category
      const categories: Record<string, typeof targetMemories> = {};
      for (const m of targetMemories) {
        if (!categories[m.category]) categories[m.category] = [];
        categories[m.category].push(m);
      }

      for (const [cat, items] of Object.entries(categories)) {
        mdLines.push(`## ${cat.toUpperCase()}`);
        mdLines.push('');
        for (const item of items) {
          const pinBadge = item.pinned ? '📌 [Pinned] ' : '';
          const prioBadge = `[Priority: ${item.priority.toUpperCase()}]`;
          mdLines.push(`### ${pinBadge}${item.title} ${prioBadge}`);
          mdLines.push(item.content);
          if (item.tags && item.tags.length > 0) {
            mdLines.push(`*Tags: ${item.tags.join(', ')}*`);
          }
          mdLines.push('');
        }
      }

      fs.writeFileSync(path.join(memoryDir, 'MEMORY.md'), mdLines.join('\n'), 'utf8');
      console.log(`[MemoryScanner] Persisted ${targetMemories.length} memories to .agents/memory/MEMORY.md & memories.json`);
    } catch (err) {
      console.error('[MemoryScanner] Failed to persist memories to disk:', err);
    }
  }

  /**
   * Simulates how an agent retrieves memories given a prompt query
   */
  public static async searchContext(query: string, workspaceId?: string): Promise<{
    results: ContextSearchResult[];
    totalTokens: number;
    prompt: string;
  }> {
    const rawMemories = await db.query.memories.findMany({
      where: eq(memories.status, 'active'),
      orderBy: [desc(memories.pinned), desc(memories.priority)]
    });

    const searchTokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const scored: ContextSearchResult[] = [];

    for (const mem of rawMemories) {
      let score = 0;
      const matched: string[] = [];
      const titleLower = mem.title.toLowerCase();
      const contentLower = mem.content.toLowerCase();
      const tagsList = (mem.tags as string[]) || [];

      // Pinned memories always get high baseline score
      if (mem.pinned) {
        score += 50;
      }

      // Priority weighting
      if (mem.priority === 'critical') score += 30;
      else if (mem.priority === 'high') score += 20;
      else if (mem.priority === 'normal') score += 10;

      // Keyword matching
      for (const token of searchTokens) {
        if (titleLower.includes(token)) {
          score += 25;
          if (!matched.includes(token)) matched.push(token);
        }
        if (contentLower.includes(token)) {
          score += 15;
          if (!matched.includes(token)) matched.push(token);
        }
        if (tagsList.some(t => t.toLowerCase().includes(token))) {
          score += 20;
          if (!matched.includes(token)) matched.push(token);
        }
      }

      if (score > 15 || mem.pinned) {
        scored.push({
          memory: mem,
          relevanceScore: Math.min(100, score),
          matchedTerms: matched,
          tokenCost: mem.tokens || this.estimateTokens(mem.content)
        });
      }
    }

    scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const topResults = scored.slice(0, 8);
    const totalTokens = topResults.reduce((sum, r) => sum + r.tokenCost, 0);

    return {
      results: topResults,
      totalTokens,
      prompt: query
    };
  }
}
