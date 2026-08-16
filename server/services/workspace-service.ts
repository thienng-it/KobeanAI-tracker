import { db } from '../db/index.js';
import { workspaces, sessions } from '../db/schema.js';
import { eq, or, sql } from 'drizzle-orm';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

export interface WorkspaceResolveOptions {
  dirPath?: string | null;
  corpusName?: string | null;
  workspaceName?: string | null;
  description?: string | null;
}

export class WorkspaceService {
  private static workspaceCache = new Map<string, string>(); // pathOrSlug -> workspaceId

  /**
   * Normalizes a directory path by expanding ~ and removing trailing slashes.
   */
  public static normalizePath(inputPath: string): string {
    if (!inputPath) return '';
    let normalized = inputPath.replace(/^["'\s]+|["'\s]+$/g, '').trim();
    if (normalized.startsWith('~')) {
      normalized = normalized.replace('~', process.env.HOME || '');
    }
    // Replace backslashes on Windows for consistent path representations
    normalized = normalized.replace(/\\/g, '/');
    if (normalized.length > 1 && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  }

  /**
   * Determines if a string looks like a git branch or pseudo-path rather than a real repository.
   */
  public static isBranchOrPseudoName(nameOrPath: string): boolean {
    if (!nameOrPath) return true;
    const lower = nameOrPath.toLowerCase().trim();
    if (lower.includes('...') || lower.includes('/...')) return true;
    if (lower.startsWith('feat/') || lower.startsWith('feature/') || lower.startsWith('fix/') ||
        lower.startsWith('chore/') || lower.startsWith('origin/') || lower.startsWith('bugfix/') ||
        lower.startsWith('hotfix/') || lower.startsWith('refactor/') || lower === 'main' || lower === 'master') {
      return true;
    }
    return false;
  }

  /**
   * Discovers the actual Git repository root or project root from any nested file or directory path.
   */
  public static findRepoRoot(dirOrFilePath?: string | null): { rootPath: string; repoName: string } | null {
    if (!dirOrFilePath) return null;
    const normalized = this.normalizePath(dirOrFilePath);
    if (!normalized || !normalized.startsWith('/')) return null;

    // Filter out internal/temp paths
    if (normalized.includes('.gemini') || normalized.includes('.system_generated') ||
        normalized.includes('/tmp/') || normalized.includes('/.cache/') ||
        normalized === '/Users/...' || normalized.startsWith('/Users/.../')) {
      return null;
    }

    // Must be a valid user directory
    if (!normalized.startsWith('/Users/') && !normalized.startsWith('/home/')) {
      return null;
    }

    let curr = normalized;
    try {
      if (fs.existsSync(curr) && fs.statSync(curr).isFile()) {
        curr = path.dirname(curr);
      }
    } catch {
      // If path doesn't exist directly on disk, treat as directory
    }

    // Walk up looking for .git or top-level project folder under Desktop/Documents/Projects
    let candidate = curr;
    const projectContainers = ['desktop', 'documents', 'projects', 'workspaces', 'workspace', 'dev', 'code', 'repos', 'github'];

    while (candidate && candidate !== '/' && candidate !== '/Users' && candidate !== process.env.HOME) {
      try {
        if (fs.existsSync(path.join(candidate, '.git'))) {
          return { rootPath: candidate, repoName: path.basename(candidate) };
        }
      } catch {}

      const parent = path.dirname(candidate);
      const parentBase = path.basename(parent).toLowerCase();
      if (projectContainers.includes(parentBase)) {
        return { rootPath: candidate, repoName: path.basename(candidate) };
      }
      if (candidate === parent) break;
      candidate = parent;
    }

    const baseName = path.basename(curr);
    if (this.isBranchOrPseudoName(baseName)) return null;

    return { rootPath: curr, repoName: baseName };
  }

  /**
   * Derives a clean, readable repository name from a path or corpus slug.
   */
  public static deriveName(dirPath?: string | null, corpusName?: string | null, customName?: string | null): string {
    if (customName && customName.trim() && !this.isBranchOrPseudoName(customName)) {
      return customName.trim();
    }
    if (corpusName && corpusName.trim() && !this.isBranchOrPseudoName(corpusName)) {
      const parts = corpusName.split('/');
      return parts[parts.length - 1] || corpusName.trim();
    }
    if (dirPath && dirPath.trim()) {
      const resolved = this.findRepoRoot(dirPath);
      if (resolved) return resolved.repoName;
      const normalized = this.normalizePath(dirPath);
      const base = path.basename(normalized);
      if (base && !this.isBranchOrPseudoName(base)) {
        return base;
      }
    }
    return 'Default Workspace';
  }

  /**
   * Resolves an existing workspace by path/corpus or creates a new one in SQLite.
   */
  public static async resolveOrCreateWorkspace(options: WorkspaceResolveOptions): Promise<string> {
    const rawPath = options.dirPath ? this.normalizePath(options.dirPath) : '';
    const corpus = options.corpusName ? options.corpusName.trim() : '';

    // First try finding the real repository root
    const resolvedRepo = this.findRepoRoot(rawPath) || (corpus && !this.isBranchOrPseudoName(corpus) ? {
      rootPath: rawPath || process.cwd(),
      repoName: this.deriveName(rawPath, corpus)
    } : null);

    const effectivePath = resolvedRepo ? resolvedRepo.rootPath : rawPath;
    const effectiveName = resolvedRepo ? resolvedRepo.repoName : this.deriveName(rawPath, corpus, options.workspaceName);
    const cacheKey = effectivePath || effectiveName || 'default';

    if (this.workspaceCache.has(cacheKey)) {
      return this.workspaceCache.get(cacheKey)!;
    }

    try {
      // 1. Try to find by real path or repo name
      let existing = null;
      if (effectivePath) {
        existing = await db.query.workspaces.findFirst({
          where: eq(workspaces.path, effectivePath)
        });
      }

      if (!existing && effectiveName && effectiveName !== 'Default Workspace') {
        existing = await db.query.workspaces.findFirst({
          where: eq(workspaces.name, effectiveName)
        });
      }

      // 2. If existing found, update cache and return
      if (existing) {
        this.workspaceCache.set(cacheKey, existing.id);
        if (effectivePath) this.workspaceCache.set(effectivePath, existing.id);
        return existing.id;
      }

      // 3. Fall back to default if invalid path
      if (!effectivePath || this.isBranchOrPseudoName(effectiveName)) {
        const first = await db.query.workspaces.findFirst();
        if (first) {
          this.workspaceCache.set(cacheKey, first.id);
          return first.id;
        }
      }

      // 4. Create new real repository workspace
      const slugId = `ws-${effectiveName.toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 36)}`;
      const newId = `${slugId}-${crypto.randomBytes(3).toString('hex')}`;

      await db.insert(workspaces).values({
        id: newId,
        name: effectiveName,
        path: effectivePath,
        description: `Repository: ${effectiveName} (${effectivePath})`
      }).onConflictDoNothing();

      this.workspaceCache.set(cacheKey, newId);
      if (effectivePath) this.workspaceCache.set(effectivePath, newId);

      return newId;
    } catch (error) {
      console.error('[WorkspaceService] Failed to resolve or create workspace:', error);
      const fallback = await db.query.workspaces.findFirst();
      return fallback?.id || 'default-workspace';
    }
  }

  /**
   * Cleans up legacy/dummy branch workspaces from the database and re-points sessions.
   */
  public static async cleanUpBranchWorkspaces(): Promise<void> {
    try {
      const allWorkspaces = await db.query.workspaces.findMany();
      const defaultWs = allWorkspaces.find(w => w.name === 'Default Workspace') || allWorkspaces[0];
      if (!defaultWs) return;

      for (const ws of allWorkspaces) {
        if (ws.id === defaultWs.id) continue;

        if (this.isBranchOrPseudoName(ws.name) || this.isBranchOrPseudoName(ws.path) || !ws.path.startsWith('/Users/')) {
          console.log(`[WorkspaceService] Cleaning up branch/pseudo workspace: ${ws.name} (${ws.id})`);
          
          // Re-associate sessions to default or matching real workspace
          await db.update(sessions)
            .set({ workspaceId: defaultWs.id })
            .where(eq(sessions.workspaceId, ws.id));

          // Delete dummy workspace
          await db.delete(workspaces).where(eq(workspaces.id, ws.id));
        }
      }
      this.clearCache();
    } catch (e) {
      console.error('[WorkspaceService] Error during branch cleanup:', e);
    }
  }

  /**
   * Clears the in-memory cache when workspaces are modified or refreshed.
   */
  public static clearCache(): void {
    this.workspaceCache.clear();
  }
}
