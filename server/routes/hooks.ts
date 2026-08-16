import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { hooks, workspaces } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { HookScanner } from '../services/hook-scanner.js';
import { v4 as uuidv4 } from 'uuid';

export const hooksRouter = Router();

// GET /api/hooks - List all configured hooks & git status
hooksRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const list = await db.query.hooks.findMany({
      orderBy: [desc(hooks.createdAt)]
    });

    const gitHookInstalled = HookScanner.isGitPreCommitInstalled();

    res.json({
      data: list,
      gitHookInstalled
    });
  } catch (error) {
    console.error('Error fetching hooks:', error);
    res.status(500).json({ error: 'Failed to fetch hooks' });
  }
});

// GET /api/hooks/catalog - Curated hook templates
hooksRouter.get('/catalog', async (_req: Request, res: Response): Promise<void> => {
  try {
    const catalog = HookScanner.getCuratedCatalog();
    res.json({ data: catalog });
  } catch (error) {
    console.error('Error fetching hook catalog:', error);
    res.status(500).json({ error: 'Failed to fetch hook catalog' });
  }
});

// GET /api/hooks/:id - Single hook details
hooksRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const hook = await db.query.hooks.findFirst({
      where: (h, { eq }) => eq(h.id, req.params.id as string)
    });

    if (!hook) {
      res.status(404).json({ error: 'Hook not found' });
      return;
    }

    res.json({ data: hook });
  } catch (error) {
    console.error('Error fetching hook:', error);
    res.status(500).json({ error: 'Failed to fetch hook' });
  }
});

// POST /api/hooks - Create custom hook
hooksRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, description, event, matcher, type, command, timeout, scope } = req.body;

    if (!name || !event || !command) {
      res.status(400).json({ error: 'Name, event, and command are required.' });
      return;
    }

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

    const hookSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newHookId = uuidv4();

    await db.insert(hooks).values({
      id: newHookId,
      workspaceId: workspace.id,
      name,
      slug: hookSlug,
      description: description || `Lifecycle guard for ${event} (${matcher || '*'})`,
      event,
      matcher: matcher || '*',
      type: type || 'command',
      command,
      timeout: timeout || 5,
      scope: scope || 'workspace',
      enabled: true,
      status: 'active',
      metadata: JSON.stringify({ source: 'user_created' }) as any
    });

    if ((scope || 'workspace') === 'workspace') {
      await HookScanner.persistToWorkspaceFile();
    }

    const created = await db.query.hooks.findFirst({
      where: (h, { eq }) => eq(h.id, newHookId)
    });

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Error creating hook:', error);
    res.status(500).json({ error: 'Failed to create hook' });
  }
});

// PUT /api/hooks/:id - Update hook
hooksRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, event, matcher, type, command, timeout, enabled } = req.body;

    const existing = await db.query.hooks.findFirst({
      where: (h, { eq }) => eq(h.id, req.params.id as string)
    });

    if (!existing) {
      res.status(404).json({ error: 'Hook not found' });
      return;
    }

    await db.update(hooks).set({
      name: name ?? existing.name,
      description: description ?? existing.description,
      event: event ?? existing.event,
      matcher: matcher ?? existing.matcher,
      type: type ?? existing.type,
      command: command ?? existing.command,
      timeout: timeout ?? existing.timeout,
      enabled: enabled !== undefined ? enabled : existing.enabled,
      status: (enabled !== undefined ? enabled : existing.enabled) ? 'active' : 'disabled',
      updatedAt: new Date().toISOString()
    }).where(eq(hooks.id, req.params.id as string));

    if (existing.scope === 'workspace') {
      await HookScanner.persistToWorkspaceFile();
    }

    const updated = await db.query.hooks.findFirst({
      where: (h, { eq }) => eq(h.id, req.params.id as string)
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating hook:', error);
    res.status(500).json({ error: 'Failed to update hook' });
  }
});

// POST /api/hooks/:id/toggle - Toggle enabled status
hooksRouter.post('/:id/toggle', async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await db.query.hooks.findFirst({
      where: (h, { eq }) => eq(h.id, req.params.id as string)
    });

    if (!existing) {
      res.status(404).json({ error: 'Hook not found' });
      return;
    }

    const nextEnabled = !existing.enabled;
    await db.update(hooks).set({
      enabled: nextEnabled,
      status: nextEnabled ? 'active' : 'disabled',
      updatedAt: new Date().toISOString()
    }).where(eq(hooks.id, req.params.id as string));

    if (existing.scope === 'workspace') {
      await HookScanner.persistToWorkspaceFile();
    }

    res.json({ success: true, enabled: nextEnabled });
  } catch (error) {
    console.error('Error toggling hook:', error);
    res.status(500).json({ error: 'Failed to toggle hook' });
  }
});

// DELETE /api/hooks/:id - Remove hook
hooksRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await db.query.hooks.findFirst({
      where: (h, { eq }) => eq(h.id, req.params.id as string)
    });

    if (!existing) {
      res.status(404).json({ error: 'Hook not found' });
      return;
    }

    await db.delete(hooks).where(eq(hooks.id, req.params.id as string));

    if (existing.scope === 'workspace') {
      await HookScanner.persistToWorkspaceFile();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting hook:', error);
    res.status(500).json({ error: 'Failed to delete hook' });
  }
});

// POST /api/hooks/sync - Force sync from filesystem
hooksRouter.post('/sync', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await HookScanner.syncAll();
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error syncing hooks:', error);
    res.status(500).json({ error: 'Failed to sync hooks' });
  }
});

// POST /api/hooks/install-template - 1-Click install template
hooksRouter.post('/install-template', async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId } = req.body;
    const catalog = HookScanner.getCuratedCatalog();
    const template = catalog.find(t => t.id === templateId);

    if (!template) {
      res.status(404).json({ error: 'Template not found in catalog' });
      return;
    }

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

    const newId = uuidv4();
    await db.insert(hooks).values({
      id: newId,
      workspaceId: workspace.id,
      name: template.name,
      slug: template.id,
      description: template.description,
      event: template.event,
      matcher: template.matcher,
      type: 'command',
      command: template.command,
      timeout: template.timeout,
      scope: 'workspace',
      enabled: true,
      status: 'active',
      metadata: JSON.stringify({ installedFromCatalog: true, templateId: template.id }) as any
    });

    await HookScanner.persistToWorkspaceFile();

    res.json({ success: true, id: newId });
  } catch (error) {
    console.error('Error installing hook template:', error);
    res.status(500).json({ error: 'Failed to install hook template' });
  }
});

// POST /api/hooks/test - Run interactive hook simulation
hooksRouter.post('/test', async (req: Request, res: Response): Promise<void> => {
  try {
    const { command, mockPayload, timeoutSeconds, hookId } = req.body;

    if (!command) {
      res.status(400).json({ error: 'Command is required for test execution.' });
      return;
    }

    const result = await HookScanner.testHook({
      command,
      mockPayload,
      timeoutSeconds: timeoutSeconds || 5,
      hookId
    });

    res.json({ data: result });
  } catch (error) {
    console.error('Error testing hook:', error);
    res.status(500).json({ error: 'Failed to test hook' });
  }
});

// POST /api/hooks/git/toggle - Toggle Git pre-commit secret scanner
hooksRouter.post('/git/toggle', async (_req: Request, res: Response): Promise<void> => {
  try {
    const isCurrentlyInstalled = HookScanner.isGitPreCommitInstalled();
    if (isCurrentlyInstalled) {
      HookScanner.uninstallGitPreCommitHook();
    } else {
      HookScanner.installGitPreCommitHook();
    }

    await HookScanner.syncAll();
    const updatedStatus = HookScanner.isGitPreCommitInstalled();

    res.json({ success: true, gitHookInstalled: updatedStatus });
  } catch (error) {
    console.error('Error toggling git pre-commit hook:', error);
    res.status(500).json({ error: 'Failed to toggle git hook' });
  }
});
