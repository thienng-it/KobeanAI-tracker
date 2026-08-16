import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { memories, type Memory } from '../db/schema.js';
import { eq, and, desc, sql, or, like } from 'drizzle-orm';
import { MemoryScanner } from '../services/memory-scanner.js';
import crypto from 'crypto';

export const memoriesRouter = Router();

// GET /api/memories - Query memories with search and category filters
memoriesRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const search = (req.query.search as string || '').toLowerCase().trim();
    const category = req.query.category as string;
    const scope = req.query.scope as string;
    const priority = req.query.priority as string;
    const pinned = req.query.pinned as string;
    const status = (req.query.status as string) || 'active';
    const workspaceId = req.query.workspaceId as string;

    const allMemories = await db.query.memories.findMany({
      orderBy: [desc(memories.pinned), desc(memories.priority), desc(memories.createdAt)]
    });

    let filtered = allMemories;

    if (status) {
      filtered = filtered.filter(m => m.status === status);
    }

    if (category && category !== 'all') {
      filtered = filtered.filter(m => m.category === category);
    }

    if (scope && scope !== 'all') {
      filtered = filtered.filter(m => m.scope === scope);
    }

    if (priority && priority !== 'all') {
      filtered = filtered.filter(m => m.priority === priority);
    }

    if (pinned === 'true') {
      filtered = filtered.filter(m => !!m.pinned);
    }

    if (workspaceId && workspaceId !== 'all') {
      filtered = filtered.filter(m => m.workspaceId === workspaceId || m.scope === 'global');
    }

    if (search) {
      filtered = filtered.filter(m => {
        const titleMatch = m.title.toLowerCase().includes(search);
        const contentMatch = m.content.toLowerCase().includes(search);
        const tags = (m.tags as string[]) || [];
        const tagsMatch = tags.some(t => t.toLowerCase().includes(search));
        return titleMatch || contentMatch || tagsMatch;
      });
    }

    res.json({ data: filtered });
  } catch (error) {
    console.error('[Memories Route] GET / error:', error);
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// GET /api/memories/stats - Summary metrics for Memory Bank
memoriesRouter.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const all = await db.query.memories.findMany({
      where: eq(memories.status, 'active')
    });

    const totalMemories = all.length;
    const pinnedCount = all.filter(m => m.pinned).length;
    const totalTokens = all.reduce((sum, m) => sum + (m.tokens || MemoryScanner.estimateTokens(m.content)), 0);
    const pinnedTokens = all.filter(m => m.pinned).reduce((sum, m) => sum + (m.tokens || MemoryScanner.estimateTokens(m.content)), 0);

    const categories: Record<string, number> = {};
    const priorities: Record<string, number> = {};

    for (const m of all) {
      categories[m.category] = (categories[m.category] || 0) + 1;
      priorities[m.priority] = (priorities[m.priority] || 0) + 1;
    }

    res.json({
      data: {
        totalMemories,
        pinnedCount,
        totalTokens,
        pinnedTokens,
        budgetLimit: 16000, // 16k tokens recommended memory context budget
        budgetUtilizationPercent: Math.min(100, Number(((totalTokens / 16000) * 100).toFixed(1))),
        categories,
        priorities
      }
    });
  } catch (error) {
    console.error('[Memories Route] GET /stats error:', error);
    res.status(500).json({ error: 'Failed to fetch memory stats' });
  }
});

// GET /api/memories/templates - Curated templates catalog
memoriesRouter.get('/templates', async (_req: Request, res: Response): Promise<void> => {
  try {
    const templates = MemoryScanner.getCuratedTemplates();
    res.json({ data: templates });
  } catch (error) {
    console.error('[Memories Route] GET /templates error:', error);
    res.status(500).json({ error: 'Failed to fetch memory templates' });
  }
});

// GET /api/memories/:id - Get single memory detail
memoriesRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const mem = await db.query.memories.findFirst({
      where: (m, { eq }) => eq(m.id, req.params.id as string)
    });

    if (!mem) {
      res.status(404).json({ error: 'Memory not found' });
      return;
    }

    res.json({ data: mem });
  } catch (error) {
    console.error('[Memories Route] GET /:id error:', error);
    res.status(500).json({ error: 'Failed to fetch memory detail' });
  }
});

// POST /api/memories - Create custom memory
memoriesRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, category, priority, pinned, tags, scope, workspaceId } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }

    const memoryId = `mem-${crypto.randomUUID().slice(0, 8)}`;
    const tokens = MemoryScanner.estimateTokens(content);

    await db.insert(memories).values({
      id: memoryId,
      workspaceId: workspaceId || null,
      title: title.trim(),
      content: content.trim(),
      category: category || 'architecture',
      scope: scope || 'workspace',
      pinned: !!pinned,
      priority: priority || 'normal',
      tokens,
      recallCount: 0,
      source: 'manual',
      tags: Array.isArray(tags) ? tags : [],
      status: 'active'
    });

    if (scope === 'workspace') {
      await MemoryScanner.persistToWorkspaceFile(workspaceId);
    }

    res.json({ success: true, id: memoryId });
  } catch (error) {
    console.error('[Memories Route] POST / error:', error);
    res.status(500).json({ error: 'Failed to create memory' });
  }
});

// PUT /api/memories/:id - Update memory
memoriesRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const memoryId = req.params.id as string;
    const { title, content, category, priority, pinned, tags, scope, status } = req.body;

    const existing = await db.query.memories.findFirst({
      where: (m, { eq }) => eq(m.id, memoryId)
    });

    if (!existing) {
      res.status(404).json({ error: 'Memory not found' });
      return;
    }

    const tokens = content ? MemoryScanner.estimateTokens(content) : existing.tokens;

    await db.update(memories).set({
      title: title !== undefined ? title.trim() : existing.title,
      content: content !== undefined ? content.trim() : existing.content,
      category: category || existing.category,
      priority: priority || existing.priority,
      pinned: pinned !== undefined ? !!pinned : existing.pinned,
      scope: scope || existing.scope,
      tags: Array.isArray(tags) ? tags : existing.tags,
      tokens,
      status: status || existing.status,
      updatedAt: new Date().toISOString()
    }).where(eq(memories.id, memoryId));

    if (existing.scope === 'workspace') {
      await MemoryScanner.persistToWorkspaceFile(existing.workspaceId || undefined);
    }

    res.json({ success: true, id: memoryId });
  } catch (error) {
    console.error('[Memories Route] PUT /:id error:', error);
    res.status(500).json({ error: 'Failed to update memory' });
  }
});

// POST /api/memories/:id/pin - Toggle pin status
memoriesRouter.post('/:id/pin', async (req: Request, res: Response): Promise<void> => {
  try {
    const memoryId = req.params.id as string;
    const existing = await db.query.memories.findFirst({
      where: (m, { eq }) => eq(m.id, memoryId)
    });

    if (!existing) {
      res.status(404).json({ error: 'Memory not found' });
      return;
    }

    const newPinned = !existing.pinned;
    await db.update(memories).set({
      pinned: newPinned,
      updatedAt: new Date().toISOString()
    }).where(eq(memories.id, memoryId));

    if (existing.scope === 'workspace') {
      await MemoryScanner.persistToWorkspaceFile(existing.workspaceId || undefined);
    }

    res.json({ success: true, pinned: newPinned });
  } catch (error) {
    console.error('[Memories Route] POST /:id/pin error:', error);
    res.status(500).json({ error: 'Failed to toggle pin state' });
  }
});

// POST /api/memories/:id/archive - Toggle archive status
memoriesRouter.post('/:id/archive', async (req: Request, res: Response): Promise<void> => {
  try {
    const memoryId = req.params.id as string;
    const existing = await db.query.memories.findFirst({
      where: (m, { eq }) => eq(m.id, memoryId)
    });

    if (!existing) {
      res.status(404).json({ error: 'Memory not found' });
      return;
    }

    const newStatus = existing.status === 'active' ? 'archived' : 'active';
    await db.update(memories).set({
      status: newStatus,
      updatedAt: new Date().toISOString()
    }).where(eq(memories.id, memoryId));

    if (existing.scope === 'workspace') {
      await MemoryScanner.persistToWorkspaceFile(existing.workspaceId || undefined);
    }

    res.json({ success: true, status: newStatus });
  } catch (error) {
    console.error('[Memories Route] POST /:id/archive error:', error);
    res.status(500).json({ error: 'Failed to archive memory' });
  }
});

// DELETE /api/memories/:id - Delete memory
memoriesRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const memoryId = req.params.id as string;
    const existing = await db.query.memories.findFirst({
      where: (m, { eq }) => eq(m.id, memoryId)
    });

    if (!existing) {
      res.status(404).json({ error: 'Memory not found' });
      return;
    }

    await db.delete(memories).where(eq(memories.id, memoryId));

    if (existing.scope === 'workspace') {
      await MemoryScanner.persistToWorkspaceFile(existing.workspaceId || undefined);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[Memories Route] DELETE /:id error:', error);
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

// POST /api/memories/sync - Force sync from filesystem
memoriesRouter.post('/sync', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await MemoryScanner.syncAll();
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('[Memories Route] POST /sync error:', error);
    res.status(500).json({ error: 'Failed to sync memories' });
  }
});

// POST /api/memories/install-template - 1-Click install curated memory template
memoriesRouter.post('/install-template', async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId, workspaceId } = req.body;
    const templates = MemoryScanner.getCuratedTemplates();
    const tmpl = templates.find(t => t.id === templateId);

    if (!tmpl) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    const memoryId = `mem-${tmpl.id.replace('tmpl-', '')}-${crypto.randomUUID().slice(0, 6)}`;
    const tokens = MemoryScanner.estimateTokens(tmpl.content);

    await db.insert(memories).values({
      id: memoryId,
      workspaceId: workspaceId || null,
      title: tmpl.title,
      content: tmpl.content,
      category: tmpl.category,
      scope: 'workspace',
      pinned: tmpl.pinned,
      priority: tmpl.priority,
      tokens,
      recallCount: 1,
      source: 'learned',
      tags: tmpl.tags,
      status: 'active'
    });

    await MemoryScanner.persistToWorkspaceFile(workspaceId);

    res.json({ success: true, id: memoryId });
  } catch (error) {
    console.error('[Memories Route] POST /install-template error:', error);
    res.status(500).json({ error: 'Failed to install template' });
  }
});

// POST /api/memories/search-context - Test context retrieval simulation
memoriesRouter.post('/search-context', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, workspaceId } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const result = await MemoryScanner.searchContext(prompt, workspaceId);
    res.json({ data: result });
  } catch (error) {
    console.error('[Memories Route] POST /search-context error:', error);
    res.status(500).json({ error: 'Failed to simulate context retrieval' });
  }
});
