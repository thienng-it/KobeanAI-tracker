import fs from 'fs';
import path from 'path';
import { db } from '../db/index.js';
import { plugins, workspaces } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface CuratedPluginTemplate {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  category: 'science' | 'devtools' | 'cloud' | 'frontend' | 'ai' | 'security';
  repository?: string;
  skills: string[];
  agents?: string[];
  hasMcp?: boolean;
  hasHooks?: boolean;
  icon?: string;
  featured?: boolean;
}

export interface BundledSkillDetail {
  name: string;
  slug: string;
  description: string;
  path: string;
  instructionsPreview: string;
}

export interface PluginFileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  sizeBytes?: number;
  children?: PluginFileNode[];
}

export class PluginScanner {
  public static getCuratedCatalog(): CuratedPluginTemplate[] {
    return [
      {
        id: 'science',
        name: 'Science Skills Suite',
        description: 'Curated collection of 25+ scientific AI agent skills for AlphaFold, ChEMBL, UniProt, PDB, PubMed, GTEx, and genomics.',
        author: 'Google DeepMind',
        version: '1.1.0',
        category: 'science',
        repository: 'https://github.com/google-deepmind/science-skills',
        skills: ['alphafold-database', 'chembl-database', 'uniprot-database', 'pdb-database', 'pubmed-database', 'gtex-database', 'jaspar-database'],
        hasHooks: false,
        hasMcp: false,
        icon: 'Microscope',
        featured: true
      },
      {
        id: 'chrome-devtools-plugin',
        name: 'Chrome DevTools & Automation',
        description: 'Reliable automation, accessibility debugging, memory leak diagnostics, and Lighthouse CWV performance analysis.',
        author: 'Chrome DevTools Team',
        version: '0.21.0',
        category: 'devtools',
        repository: 'https://github.com/ChromeDevTools/chrome-devtools-mcp',
        skills: ['a11y-debugging', 'chrome-devtools', 'debug-optimize-lcp', 'memory-leak-debugging', 'troubleshooting'],
        hasMcp: true,
        hasHooks: false,
        icon: 'Globe',
        featured: true
      },
      {
        id: 'firebase',
        name: 'Firebase AI & Cloud Platform',
        description: 'Comprehensive Firebase SDK & AI Logic integrations: Firestore, Data Connect SQL, Authentication, App Hosting, Remote Config.',
        author: 'Firebase Team',
        version: '1.0.0',
        category: 'cloud',
        repository: 'https://github.com/firebase/firebase-tools',
        skills: ['firebase-ai-logic-basics', 'firebase-firestore', 'firebase-auth-basics', 'firebase-data-connect', 'firebase-app-hosting-basics'],
        hasMcp: false,
        hasHooks: false,
        icon: 'Flame',
        featured: true
      },
      {
        id: 'google-antigravity-sdk',
        name: 'Google Antigravity SDK',
        description: 'Design, configure, and orchestrate autonomous AI multi-agent systems, sidecars, and event-driven subagent swarms.',
        author: 'Google Antigravity Team',
        version: '2.0.0',
        category: 'ai',
        repository: 'https://github.com/google/antigravity',
        skills: ['google-antigravity-sdk'],
        agents: ['PlannerSubagent', 'BrowserSubagent', 'ReviewerSubagent'],
        hasMcp: true,
        hasHooks: true,
        icon: 'Bot',
        featured: true
      },
      {
        id: 'modern-web-guidance-plugin',
        name: 'Modern Web Guidance',
        description: 'Up-to-date web best practices: View Transitions, Container Queries, CSS :has(), Glassmorphism, and Chrome Extensions Manifest V3.',
        author: 'Web Standards Working Group',
        version: '1.2.0',
        category: 'frontend',
        skills: ['modern-web-guidance', 'chrome-extensions'],
        hasMcp: false,
        hasHooks: false,
        icon: 'Code',
        featured: false
      },
      {
        id: 'android-cli-plugin',
        name: 'Android CLI & Emulator',
        description: 'Automate Android Virtual Devices (AVD), install SDK components, inspect UI hierarchies, and capture screenshots.',
        author: 'Android Developer Relations',
        version: '1.0.0',
        category: 'devtools',
        skills: ['android-cli'],
        hasMcp: false,
        hasHooks: false,
        icon: 'Smartphone',
        featured: false
      },
      {
        id: 'codegraph',
        name: 'Codegraph & Architecture Analyzer',
        description: 'Interactive code graph and dependency matrix generator for tracking contracts across DB, Express server, and React UI.',
        author: 'KobeanAI',
        version: '1.0.0',
        category: 'devtools',
        skills: ['codegraph'],
        hasMcp: false,
        hasHooks: true,
        icon: 'Network',
        featured: false
      },
      {
        id: 'taste-skill',
        name: 'Taste-Skill Motion & Design System',
        description: 'UI/UX fluid animation tokens, spring physics (cubic-bezier 0.16, 1, 0.3, 1), and sleek glassmorphism component guidelines.',
        author: 'KobeanAI',
        version: '1.0.0',
        category: 'frontend',
        skills: ['taste-skill'],
        hasMcp: false,
        hasHooks: false,
        icon: 'Palette',
        featured: false
      }
    ];
  }

  public static async syncAll(): Promise<{ pluginsCount: number; skillsCount: number }> {
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

    // Clean out duplicate records if any exist
    const allDbPlugins = await db.query.plugins.findMany();
    const seenPluginKeys = new Set<string>();
    for (const p of allDbPlugins) {
      const key = `${p.scope}:${p.slug || p.name}`;
      if (seenPluginKeys.has(key)) {
        await db.delete(plugins).where(eq(plugins.id, p.id)).catch(() => {});
      } else {
        seenPluginKeys.add(key);
      }
    }

    let pluginsCount = 0;
    let totalSkillsCount = 0;

    const scanLocations: Array<{ dir: string; scope: 'workspace' | 'global' }> = [
      { dir: path.resolve(process.cwd(), '.agents/plugins'), scope: 'workspace' },
      { dir: path.resolve(process.env.HOME || '', '.gemini/config/plugins'), scope: 'global' }
    ];

    for (const loc of scanLocations) {
      if (!fs.existsSync(loc.dir)) continue;

      try {
        const entries = fs.readdirSync(loc.dir, { withFileTypes: true });
        for (const entry of entries) {
          if (!entry.isDirectory()) continue;

          const pluginSlug = entry.name;
          const pluginDir = path.join(loc.dir, pluginSlug);

          // Read plugin.json if present
          let manifest: any = {};
          const manifestPath = path.join(pluginDir, 'plugin.json');
          if (fs.existsSync(manifestPath)) {
            try {
              manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            } catch (e) {
              console.warn(`[PluginScanner] Could not parse manifest at ${manifestPath}`);
            }
          }

          // Format clean display name
          const displayNameMap: Record<string, string> = {
            'science': 'Science Skills Suite',
            'chrome-devtools-plugin': 'Chrome DevTools',
            'firebase': 'Firebase Platform & AI',
            'google-antigravity-sdk': 'Google Antigravity SDK',
            'modern-web-guidance-plugin': 'Modern Web Guidance',
            'android-cli-plugin': 'Android CLI',
            'codegraph': 'Codegraph Analyzer',
            'ponytail': 'Ponytail Anti-Overengineering',
            'taste-skill': 'Taste-Skill Motion'
          };

          const pluginName = manifest.name && displayNameMap[manifest.name] 
            ? displayNameMap[manifest.name]
            : (displayNameMap[pluginSlug] || manifest.name || pluginSlug
                .replace(/-plugin$/i, '')
                .replace(/[-_]/g, ' ')
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                .split(' ')
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' '));

          const version = manifest.version || '1.0.0';
          const description = manifest.description || `AI agent customization plugin (${pluginSlug})`;
          const author = typeof manifest.author === 'object' ? manifest.author.name || 'Community' : (manifest.author || (loc.scope === 'global' ? 'Global IDE' : 'Workspace'));
          const repository = typeof manifest.repository === 'object' ? manifest.repository.url : manifest.repository;
          const license = manifest.license || 'MIT';
          const keywords = Array.isArray(manifest.keywords) ? manifest.keywords : [];

          // Scan bundled skills
          let bundledSkillsCount = 0;
          const skillsDir = path.join(pluginDir, 'skills');
          if (fs.existsSync(skillsDir)) {
            try {
              const skillEntries = fs.readdirSync(skillsDir, { withFileTypes: true });
              for (const sEntry of skillEntries) {
                if (sEntry.isDirectory()) {
                  if (fs.existsSync(path.join(skillsDir, sEntry.name, 'SKILL.md'))) {
                    bundledSkillsCount++;
                  }
                } else if (sEntry.name === 'SKILL.md') {
                  bundledSkillsCount++;
                }
              }
            } catch (e) {}
          } else if (Array.isArray(manifest.skills)) {
            bundledSkillsCount = manifest.skills.length;
          }

          // Scan bundled agents
          let bundledAgentsCount = 0;
          const agentsDir = path.join(pluginDir, 'agents');
          if (fs.existsSync(agentsDir)) {
            try {
              const agentEntries = fs.readdirSync(agentsDir);
              bundledAgentsCount = agentEntries.length;
            } catch (e) {}
          } else if (Array.isArray(manifest.agents)) {
            bundledAgentsCount = manifest.agents.length;
          }

          // Check for MCP and Hooks
          const hasMcp = fs.existsSync(path.join(pluginDir, 'mcp_config.json')) || fs.existsSync(path.join(pluginDir, 'mcp.json'));
          const hasHooks = fs.existsSync(path.join(pluginDir, 'hooks.json'));

          // Read README.md
          let readme = '';
          const readmePath = path.join(pluginDir, 'README.md');
          if (fs.existsSync(readmePath)) {
            try {
              readme = fs.readFileSync(readmePath, 'utf8');
            } catch (e) {}
          }

          // Find or create in DB
          let existing = await db.query.plugins.findFirst({
            where: and(eq(plugins.slug, pluginSlug), eq(plugins.scope, loc.scope))
          });

          const pluginId = existing ? existing.id : uuidv4();
          if (!existing) {
            await db.insert(plugins).values({
              id: pluginId,
              workspaceId,
              name: pluginName,
              slug: pluginSlug,
              version,
              description,
              author,
              scope: loc.scope,
              path: pluginDir,
              repository: repository || null,
              license,
              keywords: JSON.stringify(keywords) as any,
              skillsCount: bundledSkillsCount,
              agentsCount: bundledAgentsCount,
              hasMcp,
              hasHooks,
              enabled: true,
              status: 'active',
              readme: readme || null,
              manifest: JSON.stringify(manifest) as any,
              metadata: JSON.stringify({ scannedAt: new Date().toISOString() }) as any
            });
          } else {
            await db.update(plugins).set({
              name: pluginName,
              version,
              description,
              author,
              path: pluginDir,
              repository: repository || existing.repository,
              license,
              keywords: JSON.stringify(keywords) as any,
              skillsCount: bundledSkillsCount,
              agentsCount: bundledAgentsCount,
              hasMcp,
              hasHooks,
              readme: readme || existing.readme,
              manifest: JSON.stringify(manifest) as any,
              updatedAt: new Date().toISOString()
            }).where(eq(plugins.id, existing.id));
          }

          pluginsCount++;
          totalSkillsCount += bundledSkillsCount;
        }
      } catch (err) {
        console.error(`[PluginScanner] Error scanning directory ${loc.dir}:`, err);
      }
    }

    return { pluginsCount, skillsCount: totalSkillsCount };
  }

  public static async getPluginDetail(id: string): Promise<{
    plugin: any;
    bundledSkills: BundledSkillDetail[];
    fileTree: PluginFileNode;
    rawManifest: string;
  } | null> {
    const plugin = await db.query.plugins.findFirst({
      where: eq(plugins.id, id)
    });

    if (!plugin) return null;

    const pluginDir = plugin.path || (
      plugin.scope === 'workspace'
        ? path.resolve(process.cwd(), '.agents/plugins', plugin.slug || plugin.name)
        : path.resolve(process.env.HOME || '', '.gemini/config/plugins', plugin.slug || plugin.name)
    );

    const bundledSkills: BundledSkillDetail[] = [];
    const skillsDir = path.join(pluginDir, 'skills');

    if (fs.existsSync(skillsDir)) {
      try {
        const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const skillMd = path.join(skillsDir, entry.name, 'SKILL.md');
            if (fs.existsSync(skillMd)) {
              const content = fs.readFileSync(skillMd, 'utf8');
              let sName = entry.name;
              let sDesc = 'Custom skill';

              if (content.startsWith('---')) {
                const end = content.indexOf('---', 3);
                if (end !== -1) {
                  const fm = content.substring(3, end);
                  const nameMatch = fm.match(/^name:\s*(.+)$/m);
                  if (nameMatch) sName = nameMatch[1].trim();
                  const descMatch = fm.match(/^description:\s*(.+)$/m);
                  if (descMatch) sDesc = descMatch[1].trim();
                }
              }

              bundledSkills.push({
                name: sName,
                slug: entry.name,
                description: sDesc,
                path: skillMd,
                instructionsPreview: content.substring(0, 1200)
              });
            }
          } else if (entry.name === 'SKILL.md') {
            const content = fs.readFileSync(path.join(skillsDir, 'SKILL.md'), 'utf8');
            bundledSkills.push({
              name: plugin.name,
              slug: plugin.slug || 'main',
              description: plugin.description || 'Plugin root skill',
              path: path.join(skillsDir, 'SKILL.md'),
              instructionsPreview: content.substring(0, 1200)
            });
          }
        }
      } catch (e) {}
    }

    // Build directory tree
    function buildFileTree(dir: string, depth = 0): PluginFileNode {
      const base = path.basename(dir);
      if (depth > 4 || !fs.existsSync(dir)) {
        return { name: base, path: dir, type: 'directory', children: [] };
      }

      const stat = fs.statSync(dir);
      if (!stat.isDirectory()) {
        return { name: base, path: dir, type: 'file', sizeBytes: stat.size };
      }

      const children: PluginFileNode[] = [];
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const e of entries) {
          if (e.name === '.git' || e.name === 'node_modules') continue;
          const full = path.join(dir, e.name);
          if (e.isDirectory()) {
            children.push(buildFileTree(full, depth + 1));
          } else {
            const fStat = fs.statSync(full);
            children.push({ name: e.name, path: full, type: 'file', sizeBytes: fStat.size });
          }
        }
      } catch (e) {}

      return { name: base, path: dir, type: 'directory', children };
    }

    const fileTree: PluginFileNode = fs.existsSync(pluginDir) 
      ? buildFileTree(pluginDir)
      : { name: plugin.slug || plugin.name, path: pluginDir, type: 'directory' as const, children: [] };

    let rawManifest = '{}';
    const manifestPath = path.join(pluginDir, 'plugin.json');
    if (fs.existsSync(manifestPath)) {
      try {
        rawManifest = fs.readFileSync(manifestPath, 'utf8');
      } catch (e) {}
    } else if (plugin.manifest) {
      rawManifest = typeof plugin.manifest === 'string' ? plugin.manifest : JSON.stringify(plugin.manifest, null, 2);
    }

    return {
      plugin,
      bundledSkills,
      fileTree,
      rawManifest
    };
  }

  public static async createWorkspacePlugin(params: {
    name: string;
    slug?: string;
    description: string;
    author?: string;
    version?: string;
    repository?: string;
    license?: string;
    keywords?: string[];
    initialSkill?: {
      name: string;
      description: string;
      instructions: string;
    };
    hasHooks?: boolean;
  }): Promise<{ id: string; slug: string }> {
    const slug = (params.slug || params.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || 'custom-plugin';
    const targetDir = path.resolve(process.cwd(), '.agents/plugins', slug);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Write plugin.json
    const manifestObj = {
      name: slug,
      version: params.version || '1.0.0',
      description: params.description,
      author: params.author || 'Workspace',
      repository: params.repository || '',
      license: params.license || 'MIT',
      keywords: params.keywords || ['agent-plugin', 'kobean-tracker'],
      skills: params.initialSkill ? [params.initialSkill.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')] : []
    };

    fs.writeFileSync(path.join(targetDir, 'plugin.json'), JSON.stringify(manifestObj, null, 2), 'utf8');

    // Write README.md
    const readmeContent = `# ${params.name}\n\n${params.description}\n\n## Overview\nThis plugin extends AI assistant capabilities in KobeanAI Tracker.\n\n## Skills\n${params.initialSkill ? `- \`${params.initialSkill.name}\`: ${params.initialSkill.description}` : '*(No skills declared yet)*'}\n`;
    fs.writeFileSync(path.join(targetDir, 'README.md'), readmeContent, 'utf8');

    // Scaffold initial skill if requested
    if (params.initialSkill) {
      const skillSlug = params.initialSkill.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const skillDir = path.join(targetDir, 'skills', skillSlug);
      fs.mkdirSync(skillDir, { recursive: true });

      const skillContent = `---
name: ${params.initialSkill.name}
description: ${params.initialSkill.description}
---

# ${params.initialSkill.name}

${params.initialSkill.instructions || '## Instructions\nProvide workflow guidance for this specialized skill.'}
`;
      fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillContent, 'utf8');
    }

    if (params.hasHooks) {
      const hooksObj = {
        hooks: {
          onSessionStart: [],
          onToolCall: []
        }
      };
      fs.writeFileSync(path.join(targetDir, 'hooks.json'), JSON.stringify(hooksObj, null, 2), 'utf8');
    }

    // Resync
    await PluginScanner.syncAll();

    const created = await db.query.plugins.findFirst({
      where: and(eq(plugins.slug, slug), eq(plugins.scope, 'workspace'))
    });

    return { id: created ? created.id : uuidv4(), slug };
  }

  public static async installCatalogPlugin(templateId: string): Promise<{ id: string; slug: string }> {
    const catalog = PluginScanner.getCuratedCatalog();
    const template = catalog.find(c => c.id === templateId);

    if (!template) {
      throw new Error(`Template "${templateId}" not found in catalog.`);
    }

    return await PluginScanner.createWorkspacePlugin({
      name: template.name,
      slug: template.id,
      description: template.description,
      author: template.author,
      version: template.version,
      repository: template.repository,
      keywords: [template.category, 'curated-plugin'],
      initialSkill: template.skills[0] ? {
        name: template.skills[0],
        description: `${template.name} core capabilities`,
        instructions: `## ${template.name} Skill\nAutomated workflows provided by ${template.name}.`
      } : undefined,
      hasHooks: template.hasHooks
    });
  }

  public static async deleteWorkspacePlugin(id: string): Promise<boolean> {
    const plugin = await db.query.plugins.findFirst({
      where: eq(plugins.id, id)
    });

    if (!plugin) return false;
    if (plugin.scope !== 'workspace') {
      throw new Error('Cannot delete global IDE plugins from workspace manager.');
    }

    const pluginDir = plugin.path || path.resolve(process.cwd(), '.agents/plugins', plugin.slug || plugin.name);
    if (fs.existsSync(pluginDir)) {
      try {
        fs.rmSync(pluginDir, { recursive: true, force: true });
      } catch (e) {
        console.error(`[PluginScanner] Error removing directory ${pluginDir}:`, e);
      }
    }

    await db.delete(plugins).where(eq(plugins.id, id));
    return true;
  }
}
