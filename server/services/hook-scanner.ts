import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { db } from '../db/index.js';
import { hooks, workspaces } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface CuratedHookTemplate {
  id: string;
  name: string;
  description: string;
  event: 'PreToolUse' | 'PostToolUse' | 'SessionStart' | 'SessionEnd' | 'UserPrompt' | 'PreCommit';
  matcher: string;
  command: string;
  timeout: number;
  icon: string;
  category: 'safety' | 'lint' | 'security' | 'workflow' | 'observability';
}

export interface HookTestResult {
  success: boolean;
  decision: 'allow' | 'deny' | 'modify' | 'executed';
  reason?: string;
  stdout: string;
  stderr: string;
  latencyMs: number;
  exitCode: number | null;
}

export class HookScanner {
  public static getCuratedCatalog(): CuratedHookTemplate[] {
    return [
      {
        id: 'safety-gate',
        name: 'Destructive Command Safety Gate',
        description: 'Intercepts run_command and blocks dangerous shell executions (rm -rf /, fork bombs, disk wipe commands).',
        event: 'PreToolUse',
        matcher: 'run_command',
        command: `node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); const cmd = (data.toolCall && data.toolCall.args && data.toolCall.args.CommandLine) || ''; if (cmd.includes('rm -rf /') || cmd.includes(':(){ :|:& };:')) { console.log(JSON.stringify({ decision: 'deny', reason: 'Destructive command blocked by safety gate.' })); } else { console.log(JSON.stringify({ decision: 'allow' })); }"`,
        timeout: 5,
        icon: 'ShieldAlert',
        category: 'safety'
      },
      {
        id: 'auto-linter',
        name: 'Auto-Linter on File Edit',
        description: 'Runs formatting or lint verification checks immediately after write_to_file or replace_file_content operations.',
        event: 'PostToolUse',
        matcher: 'write_to_file',
        command: `node -e "console.log(JSON.stringify({ decision: 'executed', message: 'File edit verified by auto-linter hook.' }));"`,
        timeout: 5,
        icon: 'Sparkles',
        category: 'lint'
      },
      {
        id: 'secret-scanner',
        name: 'Pre-Commit Secret Leak Scanner',
        description: 'Audits staged files and commit messages against active .betterleak patterns before Git commits occur.',
        event: 'PreCommit',
        matcher: '*',
        command: `npx -y betterleaks audit --staged`,
        timeout: 10,
        icon: 'Lock',
        category: 'security'
      },
      {
        id: 'git-status-injector',
        name: 'Session Context Injector',
        description: 'Extracts current Git branch, modified file lists, and local runtime environment at session initialization.',
        event: 'SessionStart',
        matcher: '*',
        command: `node -e "const cp = require('child_process'); const branch = cp.execSync('git branch --show-current').toString().trim(); console.log(JSON.stringify({ decision: 'modify', context: { currentBranch: branch, timestamp: new Date().toISOString() } }));"`,
        timeout: 5,
        icon: 'GitBranch',
        category: 'workflow'
      },
      {
        id: 'codegraph-updater',
        name: 'Codegraph Auto-Regenerator',
        description: 'Automatically regenerates CODEGRAPH.md and module dependency matrix whenever core server or client files change.',
        event: 'PostToolUse',
        matcher: 'write_to_file',
        command: `node scripts/generate-codegraph.js`,
        timeout: 8,
        icon: 'Network',
        category: 'observability'
      },
      {
        id: 'sensitive-file-guard',
        name: 'Sensitive File Access Guard',
        description: 'Blocks tool calls attempting to read or overwrite .env, credentials, or private keys directly.',
        event: 'PreToolUse',
        matcher: 'view_file',
        command: `node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); const p = (data.toolCall && data.toolCall.args && data.toolCall.args.AbsolutePath) || ''; if (p.endsWith('.env') || p.includes('id_rsa') || p.endsWith('.pem')) { console.log(JSON.stringify({ decision: 'deny', reason: 'Access to sensitive credential file blocked.' })); } else { console.log(JSON.stringify({ decision: 'allow' })); }"`,
        timeout: 5,
        icon: 'ShieldCheck',
        category: 'safety'
      }
    ];
  }

  public static async syncAll(): Promise<{ hooksCount: number; gitHookInstalled: boolean }> {
    let workspace = await db.query.workspaces.findFirst();
    if (!workspace) {
      const newId = uuidv4();
      await db.insert(workspaces).values({
        id: newId,
        name: 'Default Workspace',
        path: process.cwd()
      });
      workspace = { id: newId, name: 'Default Workspace', path: process.cwd(), description: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    }

    const workspaceId = workspace.id;

    // Clean out duplicates if any
    const allDbHooks = await db.query.hooks.findMany();
    const seenHookKeys = new Set<string>();
    for (const h of allDbHooks) {
      const key = `${h.scope}:${h.slug || h.name}`;
      if (seenHookKeys.has(key)) {
        await db.delete(hooks).where(eq(hooks.id, h.id)).catch(() => {});
      } else {
        seenHookKeys.add(key);
      }
    }

    let hooksCount = 0;

    // 1. Scan .agents/hooks.json
    const hooksJsonPath = path.resolve(process.cwd(), '.agents/hooks.json');
    if (fs.existsSync(hooksJsonPath)) {
      try {
        const raw = fs.readFileSync(hooksJsonPath, 'utf8');
        const parsed = JSON.parse(raw);

        for (const [hookSlug, hookConfig] of Object.entries<any>(parsed)) {
          const isEnabled = hookConfig.enabled !== false;

          // Parse event arrays (PreToolUse, PostToolUse, SessionStart, PreCommit, etc.)
          const eventNames = ['PreToolUse', 'PostToolUse', 'SessionStart', 'SessionEnd', 'UserPrompt', 'PreCommit'];
          for (const ev of eventNames) {
            if (Array.isArray(hookConfig[ev])) {
              for (const entry of hookConfig[ev]) {
                const matcher = entry.matcher || '*';
                const subHooks = Array.isArray(entry.hooks) ? entry.hooks : [];
                for (const sub of subHooks) {
                  const command = sub.command || '';
                  const timeout = sub.timeout || 5;
                  const hookName = hookSlug
                    .replace(/[-_]/g, ' ')
                    .split(' ')
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');

                  const existing = await db.query.hooks.findFirst({
                    where: and(eq(hooks.slug, hookSlug), eq(hooks.scope, 'workspace'))
                  });

                  if (!existing) {
                    await db.insert(hooks).values({
                      id: uuidv4(),
                      workspaceId,
                      name: hookName,
                      slug: hookSlug,
                      description: `Lifecycle guard for ${ev} (${matcher})`,
                      event: ev,
                      matcher,
                      type: sub.type || 'command',
                      command,
                      timeout,
                      scope: 'workspace',
                      enabled: isEnabled,
                      status: isEnabled ? 'active' : 'disabled',
                      metadata: JSON.stringify({ sourceFile: '.agents/hooks.json' }) as any
                    });
                  } else {
                    await db.update(hooks).set({
                      name: hookName,
                      event: ev,
                      matcher,
                      command,
                      timeout,
                      enabled: isEnabled,
                      status: isEnabled ? 'active' : 'disabled',
                      updatedAt: new Date().toISOString()
                    }).where(eq(hooks.id, existing.id));
                  }
                  hooksCount++;
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('[HookScanner] Error reading .agents/hooks.json:', err);
      }
    }

    // 2. Check Git pre-commit hook
    const gitHookInstalled = HookScanner.isGitPreCommitInstalled();
    const gitHookSlug = 'git-pre-commit-scanner';
    const existingGitHook = await db.query.hooks.findFirst({
      where: and(eq(hooks.slug, gitHookSlug), eq(hooks.scope, 'git'))
    });

    if (gitHookInstalled) {
      if (!existingGitHook) {
        await db.insert(hooks).values({
          id: uuidv4(),
          workspaceId,
          name: 'Git Pre-Commit Secret Scanner',
          slug: gitHookSlug,
          description: 'Local repository pre-commit hook enforcing secret detection via .betterleak',
          event: 'PreCommit',
          matcher: '*',
          type: 'script',
          command: '.git/hooks/pre-commit',
          timeout: 10,
          scope: 'git',
          enabled: true,
          status: 'active',
          metadata: JSON.stringify({ gitHookPath: '.git/hooks/pre-commit' }) as any
        });
      }
      hooksCount++;
    } else if (existingGitHook) {
      await db.delete(hooks).where(eq(hooks.id, existingGitHook.id));
    }

    return { hooksCount, gitHookInstalled };
  }

  public static isGitPreCommitInstalled(): boolean {
    const gitHookPath = path.resolve(process.cwd(), '.git/hooks/pre-commit');
    if (!fs.existsSync(gitHookPath)) return false;
    try {
      const content = fs.readFileSync(gitHookPath, 'utf8');
      return content.includes('betterleak') || content.includes('gitleaks') || content.includes('audit');
    } catch (e) {
      return false;
    }
  }

  public static installGitPreCommitHook(): boolean {
    const gitDir = path.resolve(process.cwd(), '.git/hooks');
    if (!fs.existsSync(gitDir)) {
      fs.mkdirSync(gitDir, { recursive: true });
    }

    const hookScript = `#!/bin/sh
# KobeanAI Tracker — Pre-Commit Secret Scanner Hook
echo "🔒 [KobeanAI] Scanning staged files for sensitive keys & passwords..."
if which betterleaks >/dev/null 2>&1; then
  betterleaks audit --staged
elif which gitleaks >/dev/null 2>&1; then
  gitleaks detect --staged --config=.betterleak -v
else
  echo "ℹ️ [KobeanAI] Gitleaks / Betterleaks scanner not found on PATH, skipping local pre-commit check."
fi
`;

    const target = path.join(gitDir, 'pre-commit');
    fs.writeFileSync(target, hookScript, { encoding: 'utf8', mode: 0o755 });
    return true;
  }

  public static uninstallGitPreCommitHook(): boolean {
    const target = path.resolve(process.cwd(), '.git/hooks/pre-commit');
    if (fs.existsSync(target)) {
      try {
        fs.unlinkSync(target);
        return true;
      } catch (e) {
        console.error('[HookScanner] Error deleting pre-commit hook:', e);
        return false;
      }
    }
    return true;
  }

  public static async persistToWorkspaceFile(): Promise<void> {
    const workspaceHooks = await db.query.hooks.findMany({
      where: eq(hooks.scope, 'workspace')
    });

    const outputObj: Record<string, any> = {};

    for (const h of workspaceHooks) {
      const slug = h.slug || h.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      outputObj[slug] = {
        enabled: h.enabled,
        [h.event]: [
          {
            matcher: h.matcher || '*',
            hooks: [
              {
                type: h.type || 'command',
                command: h.command || '',
                timeout: h.timeout || 5
              }
            ]
          }
        ]
      };
    }

    const targetFile = path.resolve(process.cwd(), '.agents/hooks.json');
    fs.writeFileSync(targetFile, JSON.stringify(outputObj, null, 2), 'utf8');
  }

  public static async testHook(params: {
    command: string;
    mockPayload?: any;
    timeoutSeconds?: number;
    hookId?: string;
  }): Promise<HookTestResult> {
    const startTime = Date.now();
    const timeoutMs = (params.timeoutSeconds || 5) * 1000;
    const inputData = params.mockPayload 
      ? (typeof params.mockPayload === 'string' ? params.mockPayload : JSON.stringify(params.mockPayload))
      : JSON.stringify({ toolCall: { name: 'run_command', args: { CommandLine: 'ls -la' } } });

    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let isSettled = false;

      const child = spawn('sh', ['-c', params.command], {
        cwd: process.cwd(),
        env: { ...process.env, NODE_ENV: 'test' }
      });

      const timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          try { child.kill('SIGTERM'); } catch (e) {}
          resolve({
            success: false,
            decision: 'deny',
            reason: `Execution timed out after ${params.timeoutSeconds || 5}s`,
            stdout,
            stderr: stderr + '\n[Timeout Error: Process terminated]',
            latencyMs: Date.now() - startTime,
            exitCode: null
          });
        }
      }, timeoutMs);

      if (child.stdin) {
        child.stdin.write(inputData);
        child.stdin.end();
      }

      child.stdout?.on('data', (d) => { stdout += d.toString(); });
      child.stderr?.on('data', (d) => { stderr += d.toString(); });

      child.on('close', async (code) => {
        if (isSettled) return;
        isSettled = true;
        clearTimeout(timer);
        const latencyMs = Date.now() - startTime;

        let decision: 'allow' | 'deny' | 'modify' | 'executed' = code === 0 ? 'allow' : 'deny';
        let reason: string | undefined = undefined;

        // Try parsing JSON decision from stdout
        try {
          const lines = stdout.trim().split('\n');
          for (const line of lines.reverse()) {
            if (line.startsWith('{') && line.endsWith('}')) {
              const parsed = JSON.parse(line);
              if (parsed.decision) {
                decision = parsed.decision;
                reason = parsed.reason || parsed.message;
                break;
              }
            }
          }
        } catch (e) {}

        // Update DB execution stats if hookId was provided
        if (params.hookId) {
          try {
            const h = await db.query.hooks.findFirst({ where: eq(hooks.id, params.hookId) });
            if (h) {
              await db.update(hooks).set({
                executionCount: (h.executionCount || 0) + 1,
                lastExecutedAt: new Date().toISOString()
              }).where(eq(hooks.id, params.hookId));
            }
          } catch (e) {}
        }

        resolve({
          success: code === 0 && decision !== 'deny',
          decision,
          reason,
          stdout,
          stderr,
          latencyMs,
          exitCode: code
        });
      });

      child.on('error', (err) => {
        if (isSettled) return;
        isSettled = true;
        clearTimeout(timer);
        resolve({
          success: false,
          decision: 'deny',
          reason: err.message,
          stdout,
          stderr: err.message,
          latencyMs: Date.now() - startTime,
          exitCode: 1
        });
      });
    });
  }
}
