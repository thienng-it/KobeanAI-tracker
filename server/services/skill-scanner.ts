import fs from 'fs';
import path from 'path';
import { db } from '../db/index.js';
import { skills, rules, commands, workspaces } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export class SkillScanner {
  public static async syncAll(): Promise<{ skillsCount: number; rulesCount: number; commandsCount: number }> {
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

    // 1. Scan Skills (.agents/skills, global plugins, builtin)
    const candidateSkillDirs = [
      path.resolve(process.cwd(), '.agents/skills'),
      path.resolve(process.cwd(), '.agents/plugins'),
      path.resolve(process.env.HOME || '', '.gemini/config/plugins'),
      path.resolve(process.env.HOME || '', '.gemini/antigravity-ide/builtin/skills')
    ];

    const discoveredSkills: Array<{
      name: string;
      description: string;
      instructions: string;
      version: string;
      author: string;
      triggerCommand: string;
    }> = [];

    function scanDirForSkills(dir: string) {
      if (!fs.existsSync(dir)) return;
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            const skillMdPath = path.join(fullPath, 'SKILL.md');
            if (fs.existsSync(skillMdPath)) {
              try {
                const content = fs.readFileSync(skillMdPath, 'utf8');
                let name = entry.name;
                let description = 'Custom AI assistant skill';
                let author = 'Workspace';
                let version = '1.0.0';

                // Parse YAML frontmatter if present
                if (content.startsWith('---')) {
                  const frontmatterEnd = content.indexOf('---', 3);
                  if (frontmatterEnd !== -1) {
                    const frontmatter = content.substring(3, frontmatterEnd);
                    const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
                    if (nameMatch) name = nameMatch[1].trim();

                    const descBlockMatch = frontmatter.match(/description:\s*(?:>-\s*|\|\s*)?\n?([\s\S]+?)(?=\n[a-zA-Z_-]+:|$)/);
                    if (descBlockMatch) {
                      description = descBlockMatch[1].replace(/\n\s+/g, ' ').trim();
                    } else {
                      const descMatch = frontmatter.match(/description:\s*([^\n\r]+)/);
                      if (descMatch) description = descMatch[1].trim();
                    }
                  }
                }

                if (fullPath.includes('.gemini/config/plugins')) author = 'Plugin Registry';
                if (fullPath.includes('builtin')) author = 'Google Antigravity';

                discoveredSkills.push({
                  name,
                  description,
                  instructions: content.length > 5000 ? content.substring(0, 5000) + '...' : content,
                  version,
                  author,
                  triggerCommand: `/${name}`
                });
              } catch (err) {
                console.error(`Error reading skill file ${skillMdPath}:`, err);
              }
            } else {
              scanDirForSkills(fullPath);
            }
          }
        }
      } catch (e) {
        // ignore unreadable dirs
      }
    }

    for (const dir of candidateSkillDirs) {
      scanDirForSkills(dir);
    }

    // Clean out previous dummy test skills if real skills exist
    if (discoveredSkills.length > 0) {
      await db.delete(skills).where(eq(skills.name, 'Test Skill')).catch(() => {});
    }

    // Upsert discovered skills
    let skillsCount = 0;
    for (const sk of discoveredSkills) {
      const existing = await db.query.skills.findFirst({
        where: eq(skills.name, sk.name)
      });

      if (!existing) {
        await db.insert(skills).values({
          id: uuidv4(),
          workspaceId,
          name: sk.name,
          version: sk.version,
          description: sk.description,
          author: sk.author,
          triggerCommand: sk.triggerCommand,
          instructions: sk.instructions,
          usageCount: 1,
          enabled: true
        }).onConflictDoNothing();
      } else {
        await db.update(skills).set({
          description: sk.description,
          author: sk.author,
          triggerCommand: sk.triggerCommand,
          instructions: sk.instructions,
          version: sk.version
        }).where(eq(skills.id, existing.id));
      }
      skillsCount++;
    }

    // 2. Scan Rules (.agents/rules, .gemini/config/rules)
    const candidateRuleDirs = [
      path.resolve(process.cwd(), '.agents/rules'),
      path.resolve(process.env.HOME || '', '.gemini/config/rules')
    ];

    // Deduplicate existing rules in DB
    const existingDbRules = await db.query.rules.findMany();
    const seenRuleNamesInDb = new Set<string>();
    for (const r of existingDbRules) {
      if (seenRuleNamesInDb.has(r.name)) {
        await db.delete(rules).where(eq(rules.id, r.id)).catch(() => {});
      } else {
        seenRuleNamesInDb.add(r.name);
      }
    }

    let rulesCount = 0;
    const scannedRuleNames = new Set<string>();
    for (const rDir of candidateRuleDirs) {
      if (fs.existsSync(rDir)) {
        const files = fs.readdirSync(rDir).filter(f => f.endsWith('.md'));
        for (const file of files) {
          const rulePath = path.join(rDir, file);
          const content = fs.readFileSync(rulePath, 'utf8');
          const ruleName = file.replace(/\.md$/, '');

          if (scannedRuleNames.has(ruleName)) continue;
          scannedRuleNames.add(ruleName);

          const existing = await db.query.rules.findFirst({
            where: eq(rules.name, ruleName)
          });

          if (!existing) {
            await db.insert(rules).values({
              id: uuidv4(),
              workspaceId,
              name: ruleName,
              scope: 'workspace',
              target: 'agent',
              priority: 1,
              enabled: true,
              instruction: content
            }).onConflictDoNothing();
          } else {
            await db.update(rules).set({
              instruction: content,
              updatedAt: new Date().toISOString()
            }).where(eq(rules.id, existing.id));
          }
          rulesCount++;
        }
      }
    }

    // 3. Populate Standard Slash Commands with Deduplication
    const standardCommands = [
      { name: '/goal', description: 'Run a thorough, multi-step goal autonomously until completed', skillName: 'ponytail' },
      { name: '/schedule', description: 'Schedule recurring background checks or one-shot timers', skillName: 'antigravity-guide' },
      { name: '/grill-me', description: 'Interactive architectural review and requirements interview', skillName: 'ponytail' },
      { name: '/learn', description: 'Persist corrected behavior and codebase best practices into memory', skillName: 'taste-skill' },
    ];

    // Deduplicate existing commands in DB
    const existingDbCmds = await db.query.commands.findMany();
    const seenCmdNamesInDb = new Set<string>();
    for (const c of existingDbCmds) {
      if (seenCmdNamesInDb.has(c.name)) {
        await db.delete(commands).where(eq(commands.id, c.id)).catch(() => {});
      } else {
        seenCmdNamesInDb.add(c.name);
      }
    }

    let commandsCount = 0;
    for (const cmd of standardCommands) {
      const existingCmd = await db.query.commands.findFirst({
        where: eq(commands.name, cmd.name)
      });

      const matchedSkill = await db.query.skills.findFirst({
        where: eq(skills.name, cmd.skillName)
      });
      const targetSkillId = matchedSkill ? matchedSkill.id : (await db.query.skills.findFirst())?.id;

      if (!existingCmd) {
        if (targetSkillId) {
          await db.insert(commands).values({
            id: uuidv4(),
            name: cmd.name,
            description: cmd.description,
            skillId: targetSkillId,
            aliases: JSON.stringify([cmd.name.replace('/', '')]),
            agents: JSON.stringify(['Google Antigravity', 'Claude Code']),
            autoTags: JSON.stringify(['automated', 'slash-command']),
            usageCount: 5
          }).onConflictDoNothing();
          commandsCount++;
        }
      } else {
        if (targetSkillId && existingCmd.skillId !== targetSkillId) {
          await db.update(commands).set({
            skillId: targetSkillId,
            description: cmd.description
          }).where(eq(commands.id, existingCmd.id));
        }
        commandsCount++;
      }
    }

    console.log(`[SkillScanner] Synchronized ${skillsCount} skills, ${rulesCount} rules, ${commandsCount} commands.`);
    return { skillsCount, rulesCount, commandsCount };
  }
}
