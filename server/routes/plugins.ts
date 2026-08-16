import { Router } from 'express';
import { db } from '../db/index.js';
import { plugins, workspaces } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { PluginScanner } from '../services/plugin-scanner.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/plugins - List all plugins
router.get('/', async (req, res) => {
  try {
    const allPlugins = await db.query.plugins.findMany({
      orderBy: [desc(plugins.updatedAt)]
    });

    const parsed = allPlugins.map(p => ({
      ...p,
      keywords: typeof p.keywords === 'string' ? JSON.parse(p.keywords) : (p.keywords || []),
      manifest: typeof p.manifest === 'string' ? JSON.parse(p.manifest) : (p.manifest || {}),
      metadata: typeof p.metadata === 'string' ? JSON.parse(p.metadata) : (p.metadata || {})
    }));

    res.json({
      data: parsed,
      total: parsed.length
    });
  } catch (error: any) {
    console.error('[Plugins Route] GET / error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// GET /api/plugins/catalog - Get curated 1-click catalog
router.get('/catalog', (req, res) => {
  try {
    const catalog = PluginScanner.getCuratedCatalog();
    res.json({ data: catalog });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// POST /api/plugins/sync - Rescan all workspace and global plugin directories
router.post('/sync', async (req, res) => {
  try {
    const result = await PluginScanner.syncAll();
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[Plugins Route] POST /sync error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// POST /api/plugins/install-catalog - 1-Click install from catalog
router.post('/install-catalog', async (req, res) => {
  try {
    const { templateId } = req.body;
    if (!templateId) {
      return res.status(400).json({ error: 'templateId is required' });
    }

    const result = await PluginScanner.installCatalogPlugin(templateId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[Plugins Route] POST /install-catalog error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// GET /api/plugins/:id - Get single plugin detail with skills, manifest, and file tree
router.get('/:id', async (req, res) => {
  try {
    const detail = await PluginScanner.getPluginDetail(req.params.id);
    if (!detail) {
      return res.status(404).json({ error: 'Plugin not found' });
    }

    const p = detail.plugin;
    const parsedPlugin = {
      ...p,
      keywords: typeof p.keywords === 'string' ? JSON.parse(p.keywords) : (p.keywords || []),
      manifest: typeof p.manifest === 'string' ? JSON.parse(p.manifest) : (p.manifest || {}),
      metadata: typeof p.metadata === 'string' ? JSON.parse(p.metadata) : (p.metadata || {})
    };

    res.json({
      data: {
        ...detail,
        plugin: parsedPlugin
      }
    });
  } catch (error: any) {
    console.error('[Plugins Route] GET /:id error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// POST /api/plugins - Create new workspace plugin
router.post('/', async (req, res) => {
  try {
    const { name, slug, description, author, version, repository, license, keywords, initialSkill, hasHooks } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Plugin name is required' });
    }

    const result = await PluginScanner.createWorkspacePlugin({
      name,
      slug,
      description: description || 'Custom workspace plugin',
      author,
      version,
      repository,
      license,
      keywords,
      initialSkill,
      hasHooks
    });

    res.status(201).json({ success: true, ...result });
  } catch (error: any) {
    console.error('[Plugins Route] POST / error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// PUT /api/plugins/:id - Update plugin metadata
router.put('/:id', async (req, res) => {
  try {
    const { name, description, author, version, repository, license, keywords, enabled, status } = req.body;
    const existing = await db.query.plugins.findFirst({
      where: eq(plugins.id, req.params.id)
    });

    if (!existing) {
      return res.status(404).json({ error: 'Plugin not found' });
    }

    await db.update(plugins).set({
      name: name !== undefined ? name : existing.name,
      description: description !== undefined ? description : existing.description,
      author: author !== undefined ? author : existing.author,
      version: version !== undefined ? version : existing.version,
      repository: repository !== undefined ? repository : existing.repository,
      license: license !== undefined ? license : existing.license,
      keywords: keywords !== undefined ? JSON.stringify(keywords) as any : existing.keywords,
      enabled: enabled !== undefined ? enabled : existing.enabled,
      status: status !== undefined ? status : existing.status,
      updatedAt: new Date().toISOString()
    }).where(eq(plugins.id, req.params.id));

    res.json({ success: true });
  } catch (error: any) {
    console.error('[Plugins Route] PUT /:id error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// POST /api/plugins/:id/toggle - Toggle enabled state
router.post('/:id/toggle', async (req, res) => {
  try {
    const existing = await db.query.plugins.findFirst({
      where: eq(plugins.id, req.params.id)
    });

    if (!existing) {
      return res.status(404).json({ error: 'Plugin not found' });
    }

    const nextState = !existing.enabled;
    await db.update(plugins).set({
      enabled: nextState,
      status: nextState ? 'active' : 'disabled',
      updatedAt: new Date().toISOString()
    }).where(eq(plugins.id, req.params.id));

    res.json({ success: true, enabled: nextState });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// DELETE /api/plugins/:id - Delete workspace plugin
router.delete('/:id', async (req, res) => {
  try {
    const success = await PluginScanner.deleteWorkspacePlugin(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Plugin not found' });
    }
    res.json({ success: true });
  } catch (error: any) {
    console.error('[Plugins Route] DELETE /:id error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

export default router;
