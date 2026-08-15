import { Router } from 'express';
import { db } from '../db/index.js';
import { commands, skills } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/commands
router.get('/', async (req, res) => {
  try {
    const allCommands = await db.query.commands.findMany({
      orderBy: [desc(commands.createdAt)],
      with: {
        skill: true
      }
    });
    res.json(allCommands);
  } catch (error) {
    console.error('Error fetching commands:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/commands/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query.commands.findFirst({
      where: eq(commands.id, req.params.id),
      with: {
        skill: true
      }
    });

    if (!result) {
      return res.status(404).json({ error: 'Command not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching command:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/commands
router.post('/', async (req, res) => {
  try {
    const { name, description, skillId, aliases, parameters, agents, autoTags } = req.body;

    if (!name || !skillId) {
      return res.status(400).json({ error: 'name and skillId are required' });
    }

    const id = uuidv4();
    
    // Note: Drizzle stringifies JSON for mode: 'json' automatically or we might have to pass raw depending on setup.
    // In our schema, it's defined as mode: 'json', so we pass JS objects/arrays directly.
    await db.insert(commands).values({
      id,
      name,
      description,
      skillId,
      aliases: aliases || null,
      parameters: parameters || null,
      agents: agents || null,
      autoTags: autoTags || null,
    });

    const newCommand = await db.query.commands.findFirst({
      where: eq(commands.id, id),
      with: {
        skill: true
      }
    });

    res.status(201).json(newCommand);
  } catch (error) {
    console.error('Error creating command:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/commands/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, description, skillId, aliases, parameters, agents, autoTags } = req.body;

    await db.update(commands)
      .set({
        name,
        description,
        skillId,
        aliases: aliases || null,
        parameters: parameters || null,
        agents: agents || null,
        autoTags: autoTags || null,
      })
      .where(eq(commands.id, req.params.id));

    const updatedCommand = await db.query.commands.findFirst({
      where: eq(commands.id, req.params.id),
      with: {
        skill: true
      }
    });

    res.json(updatedCommand);
  } catch (error) {
    console.error('Error updating command:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/commands/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.delete(commands).where(eq(commands.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting command:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
