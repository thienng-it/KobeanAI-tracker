import { Router } from 'express';
import { db } from '../db/index.js';
import { mcpServers, mcpTools, mcpServerAgents, workspaces, agents } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { McpScanner } from '../services/mcp-scanner.js';

const router = Router();

// GET /api/mcps - List all MCP servers with tools and agents
router.get('/', async (req, res) => {
  try {
    let servers = await db.query.mcpServers.findMany({
      with: {
        tools: true,
        serverAgents: { with: { agent: true } }
      },
      orderBy: (mcpServers, { desc }) => [desc(mcpServers.createdAt)]
    });

    // If empty on first load, run auto-sync
    if (servers.length === 0) {
      await McpScanner.syncAll();
      servers = await db.query.mcpServers.findMany({
        with: {
          tools: true,
          serverAgents: { with: { agent: true } }
        },
        orderBy: (mcpServers, { desc }) => [desc(mcpServers.createdAt)]
      });
    }

    const formatted = servers.map(s => ({
      ...s,
      args: typeof s.args === 'string' ? JSON.parse(s.args) : (s.args || []),
      env: typeof s.env === 'string' ? JSON.parse(s.env) : (s.env || {}),
      headers: typeof s.headers === 'string' ? JSON.parse(s.headers) : (s.headers || {}),
      metadata: typeof s.metadata === 'string' ? JSON.parse(s.metadata) : (s.metadata || {}),
      tools: s.tools.map(t => ({
        ...t,
        parameters: typeof t.parameters === 'string' ? JSON.parse(t.parameters) : (t.parameters || {})
      })),
      agents: s.serverAgents.map(sa => sa.agent)
    }));

    res.json({ data: formatted });
  } catch (error: any) {
    console.error('[MCP Route] GET / error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// GET /api/mcps/catalog - Return curated MCP templates
router.get('/catalog', (req, res) => {
  try {
    const catalog = McpScanner.getCuratedCatalog();
    res.json({ data: catalog });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch catalog' });
  }
});

// POST /api/mcps/sync - Force sync across global IDE and workspace files
router.post('/sync', async (req, res) => {
  try {
    const result = await McpScanner.syncAll();
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[MCP Route] POST /sync error:', error);
    res.status(500).json({ error: error.message || 'Failed to sync MCP servers' });
  }
});

// GET /api/mcps/export-config - Export configurations formatted for Antigravity, Claude, Cursor, Windsurf
router.get('/export-config', async (req, res) => {
  try {
    const allServers = await db.query.mcpServers.findMany();
    const exportData = McpScanner.generateExportConfigs(allServers);
    res.json({ data: exportData });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate export configs' });
  }
});

// POST /api/mcps/install-template - 1-Click install from template
router.post('/install-template', async (req, res) => {
  try {
    const { templateId, customName, args, env = {}, agentIds = [] } = req.body;
    const catalog = McpScanner.getCuratedCatalog();
    const template = catalog.find(t => t.id === templateId);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    let workspace = await db.query.workspaces.findFirst();
    const workspaceId = workspace?.id || (await db.insert(workspaces).values({ id: uuidv4(), name: 'Default Workspace', path: process.cwd() }).returning())[0].id;

    const serverId = uuidv4();
    const serverName = customName || template.name;
    const slug = serverName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const finalArgs = args || template.defaultArgs;

    await db.insert(mcpServers).values({
      id: serverId,
      workspaceId,
      name: serverName,
      slug,
      description: template.description,
      transport: template.transport,
      command: template.command,
      args: JSON.stringify(finalArgs),
      env: JSON.stringify(env),
      scope: 'workspace',
      status: 'active',
      enabled: true,
      toolsCount: template.featuredTools.length,
      metadata: JSON.stringify({
        icon: template.icon,
        docsUrl: template.docsUrl,
        vendor: template.author,
        category: template.category,
        installedFromTemplate: template.id
      })
    });

    // Populate placeholder tools from featured list
    for (const toolName of template.featuredTools) {
      await db.insert(mcpTools).values({
        id: uuidv4(),
        serverId,
        name: toolName,
        description: `Tool provided by ${template.name}`,
        parameters: JSON.stringify({ type: 'object', properties: {} }),
        isLazy: false,
        usageCount: 0
      });
    }

    // Link target agents
    if (agentIds.length > 0) {
      for (const aId of agentIds) {
        await db.insert(mcpServerAgents).values({
          serverId,
          agentId: aId
        }).onConflictDoNothing();
      }
    } else {
      const allAgents = await db.query.agents.findMany();
      for (const ag of allAgents) {
        await db.insert(mcpServerAgents).values({
          serverId,
          agentId: ag.id
        }).onConflictDoNothing();
      }
    }

    // Persist to workspace .agents/mcp_config.json
    await McpScanner.persistToWorkspaceFile({
      name: slug,
      command: template.command,
      args: finalArgs,
      env
    });

    res.json({ success: true, id: serverId });
  } catch (error: any) {
    console.error('[MCP Route] POST /install-template error:', error);
    res.status(500).json({ error: error.message || 'Failed to install template' });
  }
});

// GET /api/mcps/:id - Get single MCP server
router.get('/:id', async (req, res) => {
  try {
    const server = await db.query.mcpServers.findFirst({
      where: eq(mcpServers.id, req.params.id),
      with: {
        tools: true,
        serverAgents: { with: { agent: true } }
      }
    });

    if (!server) {
      return res.status(404).json({ error: 'MCP Server not found' });
    }

    res.json({
      data: {
        ...server,
        args: typeof server.args === 'string' ? JSON.parse(server.args) : (server.args || []),
        env: typeof server.env === 'string' ? JSON.parse(server.env) : (server.env || {}),
        headers: typeof server.headers === 'string' ? JSON.parse(server.headers) : (server.headers || {}),
        metadata: typeof server.metadata === 'string' ? JSON.parse(server.metadata) : (server.metadata || {}),
        tools: server.tools.map(t => ({
          ...t,
          parameters: typeof t.parameters === 'string' ? JSON.parse(t.parameters) : (t.parameters || {})
        })),
        agents: server.serverAgents.map(sa => sa.agent)
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// POST /api/mcps - Create custom MCP server
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      transport = 'stdio',
      command,
      args = [],
      env = {},
      url,
      headers = {},
      scope = 'workspace',
      agentIds = []
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Server name is required' });
    }

    let workspace = await db.query.workspaces.findFirst();
    const workspaceId = workspace?.id || (await db.insert(workspaces).values({ id: uuidv4(), name: 'Default Workspace', path: process.cwd() }).returning())[0].id;

    const serverId = uuidv4();
    const slug = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

    await db.insert(mcpServers).values({
      id: serverId,
      workspaceId,
      name,
      slug,
      description: description || 'Custom Model Context Protocol server',
      transport,
      command: command || null,
      args: JSON.stringify(args),
      env: JSON.stringify(env),
      url: url || null,
      headers: JSON.stringify(headers),
      scope,
      status: 'configured',
      enabled: true,
      toolsCount: 0,
      metadata: JSON.stringify({ custom: true })
    });

    // Link agents
    if (agentIds.length > 0) {
      for (const aId of agentIds) {
        await db.insert(mcpServerAgents).values({ serverId, agentId: aId }).onConflictDoNothing();
      }
    }

    // Persist to workspace if scope is workspace
    if (scope === 'workspace') {
      await McpScanner.persistToWorkspaceFile({
        name: slug,
        command,
        args,
        env,
        url,
        headers
      });
    }

    res.json({ success: true, id: serverId });
  } catch (error: any) {
    console.error('[MCP Route] POST / error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// PUT /api/mcps/:id - Update MCP server
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      description,
      transport,
      command,
      args,
      env,
      url,
      headers,
      scope,
      agentIds
    } = req.body;

    const existing = await db.query.mcpServers.findFirst({
      where: eq(mcpServers.id, req.params.id)
    });

    if (!existing) {
      return res.status(404).json({ error: 'MCP Server not found' });
    }

    const updatedName = name || existing.name;
    const slug = updatedName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

    await db.update(mcpServers).set({
      name: updatedName,
      slug,
      description: description !== undefined ? description : existing.description,
      transport: transport !== undefined ? transport : existing.transport,
      command: command !== undefined ? command : existing.command,
      args: args !== undefined ? JSON.stringify(args) : existing.args,
      env: env !== undefined ? JSON.stringify(env) : existing.env,
      url: url !== undefined ? url : existing.url,
      headers: headers !== undefined ? JSON.stringify(headers) : existing.headers,
      scope: scope !== undefined ? scope : existing.scope,
      updatedAt: new Date().toISOString()
    }).where(eq(mcpServers.id, req.params.id));

    // Update agent links if provided
    if (agentIds !== undefined) {
      await db.delete(mcpServerAgents).where(eq(mcpServerAgents.serverId, req.params.id));
      for (const aId of agentIds) {
        await db.insert(mcpServerAgents).values({
          serverId: req.params.id,
          agentId: aId
        }).onConflictDoNothing();
      }
    }

    // Persist changes
    if ((scope || existing.scope) === 'workspace') {
      await McpScanner.persistToWorkspaceFile({
        name: slug,
        command: command !== undefined ? command : existing.command,
        args: args !== undefined ? args : (typeof existing.args === 'string' ? JSON.parse(existing.args) : (existing.args || [])),
        env: env !== undefined ? env : (typeof existing.env === 'string' ? JSON.parse(existing.env) : (existing.env || {})),
        url: url !== undefined ? url : existing.url,
        headers: headers !== undefined ? headers : (typeof existing.headers === 'string' ? JSON.parse(existing.headers) : (existing.headers || {}))
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('[MCP Route] PUT /:id error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// POST /api/mcps/:id/toggle - Quick toggle enabled state
router.post('/:id/toggle', async (req, res) => {
  try {
    const existing = await db.query.mcpServers.findFirst({
      where: eq(mcpServers.id, req.params.id)
    });

    if (!existing) {
      return res.status(404).json({ error: 'MCP Server not found' });
    }

    const nextState = !existing.enabled;
    await db.update(mcpServers).set({
      enabled: nextState,
      status: nextState ? 'active' : 'disabled',
      updatedAt: new Date().toISOString()
    }).where(eq(mcpServers.id, req.params.id));

    res.json({ success: true, enabled: nextState });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// POST /api/mcps/:id/test - Test connection & latency
router.post('/:id/test', async (req, res) => {
  try {
    const server = await db.query.mcpServers.findFirst({
      where: eq(mcpServers.id, req.params.id)
    });

    if (!server) {
      return res.status(404).json({ error: 'MCP Server not found' });
    }

    const result = await McpScanner.testServer({
      transport: server.transport,
      command: server.command,
      url: server.url,
      args: (server.args as any)
    });

    // Update status in DB
    const newStatus = result.success ? 'active' : 'error';
    await db.update(mcpServers).set({
      status: newStatus,
      updatedAt: new Date().toISOString()
    }).where(eq(mcpServers.id, server.id));

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, latencyMs: 0, message: error.message || 'Test failed', error: error.message });
  }
});

// DELETE /api/mcps/:id - Delete MCP server
router.delete('/:id', async (req, res) => {
  try {
    const server = await db.query.mcpServers.findFirst({
      where: eq(mcpServers.id, req.params.id)
    });

    if (!server) {
      return res.status(404).json({ error: 'MCP Server not found' });
    }

    // Clean workspace config if applicable
    if (server.scope === 'workspace') {
      await McpScanner.removeFromWorkspaceFile(server.slug || server.name);
    }

    // Delete child rows and server
    await db.delete(mcpTools).where(eq(mcpTools.serverId, req.params.id));
    await db.delete(mcpServerAgents).where(eq(mcpServerAgents.serverId, req.params.id));
    await db.delete(mcpServers).where(eq(mcpServers.id, req.params.id));

    res.json({ success: true });
  } catch (error: any) {
    console.error('[MCP Route] DELETE /:id error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

export default router;
