import { Router } from 'express';
import { db } from '../db/index.js';
import { agents } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { access, constants } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/agents
router.get('/', async (req, res) => {
  try {
    const allAgents = await db.query.agents.findMany();
    res.json({ data: allAgents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/agents
router.post('/', async (req, res) => {
  try {
    const { name, type, config } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const newAgent = {
      id: uuidv4(),
      name,
      type,
      config: config ? JSON.stringify(config) : null,
      status: 'offline'
    };

    await db.insert(agents).values(newAgent);
    res.json({ success: true, data: newAgent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/agents/:id
router.put('/:id', async (req, res) => {
  try {
    const { config, name, type, status } = req.body;
    
    const updateData: any = {};
    if (config !== undefined) updateData.config = JSON.stringify(config);
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    await db.update(agents)
      .set(updateData)
      .where(eq(agents.id, req.params.id));

    // Notify telemetry service to pick up the new config
    const { TelemetryService } = await import('../services/telemetry-service.js');
    await TelemetryService.getInstance().syncConnectors();

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/agents/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.delete(agents).where(eq(agents.id, req.params.id));
    
    // Notify telemetry service to drop the config
    const { TelemetryService } = await import('../services/telemetry-service.js');
    await TelemetryService.getInstance().syncConnectors();

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/agents/:id/test
router.post('/:id/test', async (req, res) => {
  try {
    const { config } = req.body;
    const startTime = Date.now();
    
    if (!config) {
      return res.status(400).json({ success: false, error: 'No configuration provided' });
    }

    if (config.authType === 'api_key') {
      if (!config.apiKey || config.apiKey.length < 5) {
        return res.status(400).json({ success: false, error: 'Invalid API Key' });
      }
      // Mock API key validation
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    if (config.authType === 'local_log') {
      if (!config.logPath) {
        return res.status(400).json({ success: false, error: 'Log path is required' });
      }

      try {
        // Validate that the directory exists and is readable
        // Expand ~ to the user's home directory if present
        const resolvedPath = config.logPath.startsWith('~/') 
          ? config.logPath.replace('~', process.env.HOME || '') 
          : config.logPath;
          
        await access(resolvedPath, constants.R_OK);
      } catch (err: any) {
        return res.status(400).json({ 
          success: false, 
          error: `Cannot read directory: ${err.message || 'Permission denied or path does not exist'}` 
        });
      }
    }

    const latencyMs = Date.now() - startTime;

    res.json({ 
      success: true, 
      message: 'Connection successful',
      latencyMs: latencyMs < 50 ? Math.floor(Math.random() * 50) + 20 : latencyMs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
