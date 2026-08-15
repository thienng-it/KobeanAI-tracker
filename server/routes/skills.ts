import { Router } from 'express';
import { db } from '../db/index.js';
import { skills, agentSkills, skillTags } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/skills
router.get('/', async (req, res) => {
  try {
    let allSkills = await db.query.skills.findMany({
      with: {
        agentSkills: { with: { agent: true } },
        skillTags: { with: { tag: true } }
      }
    });

    // If only dummy skills or empty, auto-sync
    if (allSkills.length <= 1) {
      const { SkillScanner } = await import('../services/skill-scanner.js');
      await SkillScanner.syncAll();
      allSkills = await db.query.skills.findMany({
        with: {
          agentSkills: { with: { agent: true } },
          skillTags: { with: { tag: true } }
        }
      });
    }

    // Flatten relations for easier consumption
    const formatted = allSkills.map(s => ({
      ...s,
      agents: s.agentSkills.map(as => as.agent),
      tags: s.skillTags.map(st => st.tag)
    }));

    res.json({ data: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/skills/sync
router.post('/sync', async (req, res) => {
  try {
    const { SkillScanner } = await import('../services/skill-scanner.js');
    const result = await SkillScanner.syncAll();
    res.json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to sync skills' });
  }
});

// GET /api/skills/:id
router.get('/:id', async (req, res) => {
  try {
    const skill = await db.query.skills.findFirst({
      where: eq(skills.id, req.params.id),
      with: {
        agentSkills: { with: { agent: true } },
        skillTags: { with: { tag: true } }
      }
    });

    if (!skill) return res.status(404).json({ error: 'Skill not found' });

    res.json({
      data: {
        ...skill,
        agents: skill.agentSkills.map(as => as.agent),
        tags: skill.skillTags.map(st => st.tag)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/skills
router.post('/', async (req, res) => {
  try {
    // Basic body validation omitted for brevity
    const { name, version = '1.0', description, author, triggerCommand, instructions, workspaceId, agentIds = [] } = req.body;
    
    // Default workspaceId for phase 1 since we only have one workspace
    const targetWorkspaceId = workspaceId || (await db.query.workspaces.findFirst())?.id;
    if (!targetWorkspaceId) return res.status(400).json({ error: 'No workspace exists' });

    const newSkillId = uuidv4();
    
    await db.insert(skills).values({
      id: newSkillId,
      workspaceId: targetWorkspaceId,
      name,
      version,
      description,
      author,
      triggerCommand,
      instructions
    });

    if (agentIds && agentIds.length > 0) {
      const agentLinks = agentIds.map((agentId: string) => ({
        skillId: newSkillId,
        agentId
      }));
      await db.insert(agentSkills).values(agentLinks);
    }

    res.json({ success: true, id: newSkillId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/skills/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, version, description, author, triggerCommand, instructions, agentIds } = req.body;
    
    await db.update(skills).set({
      name,
      version,
      description,
      author,
      triggerCommand,
      instructions,
      updatedAt: new Date().toISOString()
    }).where(eq(skills.id, req.params.id));

    if (agentIds !== undefined) {
      // Simplest approach: delete existing links, insert new ones
      await db.delete(agentSkills).where(eq(agentSkills.skillId, req.params.id));
      if (agentIds.length > 0) {
        const agentLinks = agentIds.map((agentId: string) => ({
          skillId: req.params.id,
          agentId
        }));
        await db.insert(agentSkills).values(agentLinks);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/skills/:id
router.delete('/:id', async (req, res) => {
  try {
    // Must delete relation links first
    await db.delete(agentSkills).where(eq(agentSkills.skillId, req.params.id));
    await db.delete(skillTags).where(eq(skillTags.skillId, req.params.id));
    
    // Then delete the skill
    await db.delete(skills).where(eq(skills.id, req.params.id));
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
