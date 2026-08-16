import { Router } from 'express';
import { db } from '../db/index.js';
import { rules } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Helper to get default workspace
async function getDefaultWorkspaceId() {
  const allWorkspaces = await db.query.workspaces.findMany();
  return allWorkspaces.length > 0 ? allWorkspaces[0].id : null;
}

// GET /api/rules
router.get('/', async (req, res) => {
  try {
    const allRules = await db.query.rules.findMany({
      orderBy: [desc(rules.createdAt)]
    });

    // Deduplicate in response by name just in case
    const seen = new Set<string>();
    const uniqueRules = allRules.filter(r => {
      if (seen.has(r.name)) return false;
      seen.add(r.name);
      return true;
    });

    res.json(uniqueRules);
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/rules/sync
router.post('/sync', async (req, res) => {
  try {
    const { SkillScanner } = await import('../services/skill-scanner.js');
    const result = await SkillScanner.syncAll();
    res.json({ success: true, count: result.rulesCount, ...result });
  } catch (error) {
    console.error('Failed to sync rules:', error);
    res.status(500).json({ error: 'Failed to sync rules' });
  }
});

// GET /api/rules/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query.rules.findFirst({
      where: eq(rules.id, req.params.id)
    });

    if (!result) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching rule:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/rules
router.post('/', async (req, res) => {
  try {
    const { name, scope, target, priority, enabled, condition, instruction } = req.body;

    if (!name || !scope || !target || priority === undefined || !instruction) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const workspaceId = await getDefaultWorkspaceId();
    if (!workspaceId) {
      return res.status(400).json({ error: 'No workspace found' });
    }

    const id = uuidv4();
    
    await db.insert(rules).values({
      id,
      workspaceId,
      name,
      scope,
      target,
      priority,
      enabled: enabled !== undefined ? enabled : true,
      condition: condition || null,
      instruction,
    });

    const newRule = await db.query.rules.findFirst({
      where: eq(rules.id, id)
    });

    res.status(201).json(newRule);
  } catch (error) {
    console.error('Error creating rule:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/rules/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, scope, target, priority, enabled, condition, instruction } = req.body;

    await db.update(rules)
      .set({
        name,
        scope,
        target,
        priority,
        enabled,
        condition: condition || null,
        instruction,
        updatedAt: new Date().toISOString()
      })
      .where(eq(rules.id, req.params.id));

    const updatedRule = await db.query.rules.findFirst({
      where: eq(rules.id, req.params.id)
    });

    res.json(updatedRule);
  } catch (error) {
    console.error('Error updating rule:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/rules/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.delete(rules).where(eq(rules.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting rule:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
