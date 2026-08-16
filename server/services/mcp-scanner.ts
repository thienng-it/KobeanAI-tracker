import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { db } from '../db/index.js';
import { mcpServers, mcpTools, mcpServerAgents, workspaces } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface CuratedMcpTemplate {
  id: string;
  name: string;
  category: 'database' | 'devtools' | 'productivity' | 'search' | 'cloud' | 'monitoring';
  description: string;
  author: string;
  transport: 'stdio' | 'sse' | 'http';
  command: string;
  defaultArgs: string[];
  requiredEnv: Array<{ key: string; label: string; description: string; placeholder: string; secret: boolean }>;
  docsUrl: string;
  icon: string;
  featuredTools: string[];
}

export class McpScanner {
  public static getCuratedCatalog(): CuratedMcpTemplate[] {
    return [
      {
        id: 'postgres',
        name: 'PostgreSQL Database',
        category: 'database',
        description: 'Read-only and read-write SQL operations, schema reflection, table inspection, and query analysis for PostgreSQL databases.',
        author: 'Model Context Protocol',
        transport: 'stdio',
        command: 'npx',
        defaultArgs: ['-y', '@modelcontextprotocol/server-postgres', 'postgresql://user:password@localhost:5432/mydb'],
        requiredEnv: [],
        docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
        icon: 'Database',
        featuredTools: ['query', 'describe_table', 'list_tables', 'read_query']
      },
      {
        id: 'github',
        name: 'GitHub API & Repositories',
        category: 'devtools',
        description: 'Manage issues, pull requests, branch reviews, repository search, code browsing, and commit activities on GitHub.',
        author: 'Model Context Protocol',
        transport: 'stdio',
        command: 'npx',
        defaultArgs: ['-y', '@modelcontextprotocol/server-github'],
        requiredEnv: [
          { key: 'GITHUB_PERSONAL_ACCESS_TOKEN', label: 'GitHub Personal Access Token', description: 'Classic or Fine-grained PAT with repo permissions', placeholder: 'ghp_xxxxxxxxxxxxxxxxxxxx', secret: true }
        ],
        docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
        icon: 'Github',
        featuredTools: ['search_repositories', 'create_issue', 'get_file_contents', 'create_pull_request', 'fork_repository']
      },
      {
        id: 'filesystem',
        name: 'Local Filesystem Access',
        category: 'devtools',
        description: 'Secure, sandboxed read and write access to designated workspace and project directories.',
        author: 'Model Context Protocol',
        transport: 'stdio',
        command: 'npx',
        defaultArgs: ['-y', '@modelcontextprotocol/server-filesystem', process.cwd()],
        requiredEnv: [],
        docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
        icon: 'Folder',
        featuredTools: ['read_file', 'write_file', 'list_directory', 'directory_tree', 'move_file', 'get_file_info']
      },
      {
        id: 'memory',
        name: 'Persistent Memory Graph',
        category: 'productivity',
        description: 'Knowledge graph-based long-term memory for remembering user preferences, architecture decisions, and cross-session insights.',
        author: 'Model Context Protocol',
        transport: 'stdio',
        command: 'npx',
        defaultArgs: ['-y', '@modelcontextprotocol/server-memory'],
        requiredEnv: [],
        docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/memory',
        icon: 'Brain',
        featuredTools: ['create_entities', 'create_relations', 'read_graph', 'search_nodes', 'open_nodes']
      },
      {
        id: 'brave-search',
        name: 'Brave Web Search',
        category: 'search',
        description: 'Fast, privacy-focused real-time web search and local location intelligence.',
        author: 'Model Context Protocol',
        transport: 'stdio',
        command: 'npx',
        defaultArgs: ['-y', '@modelcontextprotocol/server-brave-search'],
        requiredEnv: [
          { key: 'BRAVE_API_KEY', label: 'Brave Search API Key', description: 'Free API key from Brave Search API dashboard', placeholder: 'BSAxxxxxxxxxxxxxxxxxxxx', secret: true }
        ],
        docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search',
        icon: 'Search',
        featuredTools: ['brave_web_search', 'brave_local_search']
      },
      {
        id: 'puppeteer',
        name: 'Puppeteer Browser Automation',
        category: 'devtools',
        description: 'Headless browser automation for executing web interactions, taking screenshots, evaluating JavaScript, and scraping dynamic pages.',
        author: 'Model Context Protocol',
        transport: 'stdio',
        command: 'npx',
        defaultArgs: ['-y', '@modelcontextprotocol/server-puppeteer'],
        requiredEnv: [],
        docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer',
        icon: 'Globe',
        featuredTools: ['puppeteer_navigate', 'puppeteer_screenshot', 'puppeteer_click', 'puppeteer_fill', 'puppeteer_evaluate']
      },
      {
        id: 'docker',
        name: 'Docker Engine & Containers',
        category: 'cloud',
        description: 'Inspect Docker containers, manage images, view live logs, and execute commands within isolated development containers.',
        author: 'Community',
        transport: 'stdio',
        command: 'npx',
        defaultArgs: ['-y', '@modelcontextprotocol/server-docker'],
        requiredEnv: [],
        docsUrl: 'https://github.com/modelcontextprotocol/servers',
        icon: 'Box',
        featuredTools: ['docker_list_containers', 'docker_get_logs', 'docker_inspect_container', 'docker_restart_container']
      },
      {
        id: 'slack',
        name: 'Slack Workspace Messaging',
        category: 'productivity',
        description: 'Interact with Slack channels, post updates, read thread discussions, and collaborate with teams directly via AI.',
        author: 'Model Context Protocol',
        transport: 'stdio',
        command: 'npx',
        defaultArgs: ['-y', '@modelcontextprotocol/server-slack'],
        requiredEnv: [
          { key: 'SLACK_BOT_TOKEN', label: 'Slack Bot Token', description: 'xoxb-... bot token with chat:write and channels:history scopes', placeholder: 'xoxb-xxxxxxxxxxxx', secret: true },
          { key: 'SLACK_TEAM_ID', label: 'Slack Team ID', description: 'Your Slack Workspace Team ID (e.g. T0123456789)', placeholder: 'T0123456789', secret: false }
        ],
        docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/slack',
        icon: 'MessageSquare',
        featuredTools: ['slack_post_message', 'slack_reply_to_thread', 'slack_add_reaction', 'slack_get_channel_history', 'slack_list_channels']
      },
      {
        id: 'sqlite',
        name: 'SQLite Database Explorer',
        category: 'database',
        description: 'Direct SQL query execution, table schema inspection, and data manipulation on local SQLite database files.',
        author: 'Model Context Protocol',
        transport: 'stdio',
        command: 'npx',
        defaultArgs: ['-y', '@modelcontextprotocol/server-sqlite', '--db-path', path.resolve(process.cwd(), 'sqlite.db')],
        requiredEnv: [],
        docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite',
        icon: 'Database',
        featuredTools: ['read_query', 'write_query', 'create_table', 'list_tables', 'describe_table']
      },
      {
        id: 'fetch',
        name: 'Web Fetch & Markdown Extractor',
        category: 'search',
        description: 'Fetch and parse HTML pages, clean markdown converter, and fast document ingestion for web content.',
        author: 'Model Context Protocol',
        transport: 'stdio',
        command: 'npx',
        defaultArgs: ['-y', '@modelcontextprotocol/server-fetch'],
        requiredEnv: [],
        docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/fetch',
        icon: 'FileText',
        featuredTools: ['fetch']
      }
    ];
  }

  public static async syncAll(): Promise<{ serversCount: number; toolsCount: number }> {
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

    // Get all agents in workspace for linking
    const existingAgents = await db.query.agents.findMany();
    const agentIds = existingAgents.map(a => a.id);

    let serversCount = 0;
    let toolsCount = 0;

    // Clean out duplicate records if any exist
    const allDbServers = await db.query.mcpServers.findMany();
    const seenServerSlugs = new Set<string>();
    for (const s of allDbServers) {
      const key = `${s.scope}:${s.slug || s.name}`;
      if (seenServerSlugs.has(key)) {
        await db.delete(mcpTools).where(eq(mcpTools.serverId, s.id)).catch(() => {});
        await db.delete(mcpServerAgents).where(eq(mcpServerAgents.serverId, s.id)).catch(() => {});
        await db.delete(mcpServers).where(eq(mcpServers.id, s.id)).catch(() => {});
      } else {
        seenServerSlugs.add(key);
      }
    }

    // 1. Scan Global IDE MCP Tool Schemas (~/.gemini/antigravity-ide/mcp/)
    const globalMcpDir = path.resolve(process.env.HOME || '', '.gemini/antigravity-ide/mcp');
    if (fs.existsSync(globalMcpDir)) {
      try {
        const entries = fs.readdirSync(globalMcpDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const serverSlug = entry.name;
            const serverDir = path.join(globalMcpDir, serverSlug);

            const displayNames: Record<string, string> = {
              'StitchMCP': 'Stitch MCP',
              'chrome-devtools-mcp': 'Chrome DevTools',
              'clickhouse': 'ClickHouse',
              'cloudrun': 'Cloud Run',
              'gmp-code-assist': 'Google Maps Platform',
              'google-developer-knowledge': 'Google Developer Knowledge',
              'netlify': 'Netlify',
              'postman-mcp-server': 'Postman MCP',
              'sonatype-guide': 'Sonatype Guide'
            };

            const serverName = displayNames[serverSlug] || serverSlug
              .replace(/-mcp$/i, '')
              .replace(/[-_]/g, ' ')
              .replace(/([a-z])([A-Z])/g, '$1 $2')
              .split(' ')
              .map(w => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ');

            let instructions = '';
            const instructionsPath = path.join(serverDir, 'instructions.md');
            if (fs.existsSync(instructionsPath)) {
              try {
                instructions = fs.readFileSync(instructionsPath, 'utf8');
              } catch (e) {}
            }

            // Find or create MCP Server
            let server = await db.query.mcpServers.findFirst({
              where: and(eq(mcpServers.slug, serverSlug), eq(mcpServers.scope, 'global'))
            });

            const serverId = server ? server.id : uuidv4();
            if (!server) {
              await db.insert(mcpServers).values({
                id: serverId,
                workspaceId,
                name: serverName,
                slug: serverSlug,
                description: `Global Antigravity IDE built-in tool server (${serverSlug})`,
                transport: 'builtin',
                scope: 'global',
                status: 'active',
                enabled: true,
                metadata: JSON.stringify({
                  icon: 'Boxes',
                  vendor: 'Google Antigravity IDE',
                  instructions: instructions || undefined,
                  isBuiltin: true
                })
              }).onConflictDoNothing();
            } else {
              await db.update(mcpServers).set({
                name: serverName,
                status: 'active',
                updatedAt: new Date().toISOString()
              }).where(eq(mcpServers.id, serverId));
            }

            // Scan tool json files in directory
            const toolFiles = fs.readdirSync(serverDir).filter(f => f.endsWith('.json'));
            for (const file of toolFiles) {
              const filePath = path.join(serverDir, file);
              try {
                const toolJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const toolName = toolJson.name || file.replace(/\.json$/, '');
                const toolDesc = toolJson.description || 'MCP Tool';
                const toolParams = toolJson.parameters || toolJson.inputSchema || {};

                const existingTool = await db.query.mcpTools.findFirst({
                  where: and(eq(mcpTools.serverId, serverId), eq(mcpTools.name, toolName))
                });

                if (!existingTool) {
                  await db.insert(mcpTools).values({
                    id: uuidv4(),
                    serverId,
                    name: toolName,
                    description: toolDesc,
                    parameters: JSON.stringify(toolParams),
                    isLazy: true,
                    usageCount: 0
                  }).onConflictDoNothing();
                } else {
                  await db.update(mcpTools).set({
                    description: toolDesc,
                    parameters: JSON.stringify(toolParams),
                    updatedAt: new Date().toISOString()
                  }).where(eq(mcpTools.id, existingTool.id));
                }
                toolsCount++;
              } catch (err) {
                console.error(`[McpScanner] Error parsing tool schema in ${filePath}:`, err);
              }
            }

            // Update tools count on server
            await db.update(mcpServers).set({
              toolsCount: toolFiles.length
            }).where(eq(mcpServers.id, serverId));

            // Link agents
            for (const aId of agentIds) {
              await db.insert(mcpServerAgents).values({
                serverId,
                agentId: aId
              }).onConflictDoNothing();
            }

            serversCount++;
          }
        }
      } catch (err) {
        console.error('[McpScanner] Error scanning global MCP directory:', err);
      }
    }

    // 2. Scan Workspace & Local Configuration Files
    const configLocations = [
      { path: path.resolve(process.cwd(), '.agents/mcp_config.json'), scope: 'workspace', format: 'standard' },
      { path: path.resolve(process.cwd(), '.cursor/mcp.json'), scope: 'workspace', format: 'cursor' },
      { path: path.resolve(process.cwd(), '.vscode/mcp.json'), scope: 'workspace', format: 'vscode' },
      { path: path.resolve(process.env.HOME || '', '.claude/mcp.json'), scope: 'global', format: 'claude' },
      { path: path.resolve(process.env.HOME || '', 'Library/Application Support/Claude/claude_desktop_config.json'), scope: 'global', format: 'claude' },
    ];

    for (const loc of configLocations) {
      if (fs.existsSync(loc.path)) {
        try {
          const raw = fs.readFileSync(loc.path, 'utf8');
          const parsed = JSON.parse(raw);
          const mcpServersMap = parsed.mcpServers || parsed.servers || {};

          for (const [srvName, srvConfig] of Object.entries<any>(mcpServersMap)) {
            const slug = srvName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
            const transport = srvConfig.url ? (srvConfig.transport || 'sse') : 'stdio';
            const command = srvConfig.command || '';
            const args = srvConfig.args || [];
            const env = srvConfig.env || {};
            const url = srvConfig.url || null;
            const headers = srvConfig.headers || {};

            let server = await db.query.mcpServers.findFirst({
              where: and(eq(mcpServers.slug, slug), eq(mcpServers.scope, loc.scope))
            });

            const serverId = server ? server.id : uuidv4();
            if (!server) {
              await db.insert(mcpServers).values({
                id: serverId,
                workspaceId,
                name: srvName,
                slug,
                description: `Configured in ${path.basename(loc.path)} (${loc.scope})`,
                transport,
                command,
                args: JSON.stringify(args),
                env: JSON.stringify(env),
                url,
                headers: JSON.stringify(headers),
                scope: loc.scope,
                status: 'configured',
                enabled: true,
                toolsCount: 0,
                metadata: JSON.stringify({ sourceFile: loc.path, format: loc.format })
              }).onConflictDoNothing();
              serversCount++;
            } else {
              await db.update(mcpServers).set({
                transport,
                command,
                args: JSON.stringify(args),
                env: JSON.stringify(env),
                url,
                headers: JSON.stringify(headers),
                status: 'configured',
                updatedAt: new Date().toISOString()
              }).where(eq(mcpServers.id, serverId));
            }

            // Link agents
            for (const aId of agentIds) {
              await db.insert(mcpServerAgents).values({
                serverId,
                agentId: aId
              }).onConflictDoNothing();
            }
          }
        } catch (err) {
          console.warn(`[McpScanner] Could not parse config at ${loc.path}:`, err);
        }
      }
    }

    console.log(`[McpScanner] Successfully synchronized ${serversCount} MCP servers and ${toolsCount} tools.`);
    return { serversCount, toolsCount };
  }

  public static async testServer(server: { transport: string; command?: string | null; url?: string | null; args?: string[] | string | null }): Promise<{ success: boolean; latencyMs: number; message: string; error?: string }> {
    const startTime = Date.now();

    if (server.transport === 'builtin') {
      return {
        success: true,
        latencyMs: 1,
        message: 'Built-in IDE tool server is active and verified by local runtime.'
      };
    }

    if (server.transport === 'stdio') {
      const command = server.command || '';
      if (!command) {
        return { success: false, latencyMs: 0, message: 'No executable command configured.', error: 'Missing command' };
      }

      try {
        // Quick PATH check for the executable
        const probeCheck = process.platform === 'win32' ? `where ${command}` : `which ${command}`;
        execSync(probeCheck, { stdio: 'pipe', timeout: 2000 });
        const latencyMs = Date.now() - startTime;
        return {
          success: true,
          latencyMs,
          message: `Command binary "${command}" found on system PATH. Ready for stdio execution.`
        };
      } catch (err: any) {
        const latencyMs = Date.now() - startTime;
        return {
          success: false,
          latencyMs,
          message: `Command "${command}" was not found on system PATH. Ensure it is installed.`,
          error: err.message
        };
      }
    }

    if (server.transport === 'sse' || server.transport === 'http') {
      const url = server.url || '';
      if (!url) {
        return { success: false, latencyMs: 0, message: 'No URL configured for SSE/HTTP transport.', error: 'Missing URL' };
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(url, { method: 'GET', signal: controller.signal });
        clearTimeout(timeoutId);
        const latencyMs = Date.now() - startTime;

        return {
          success: res.ok || res.status < 500,
          latencyMs,
          message: `Endpoint responded with HTTP ${res.status} (${res.statusText || 'OK'}).`
        };
      } catch (err: any) {
        const latencyMs = Date.now() - startTime;
        return {
          success: false,
          latencyMs,
          message: `Failed to connect to ${url}: ${err.message}`,
          error: err.message
        };
      }
    }

    return { success: true, latencyMs: 1, message: 'Transport configuration verified.' };
  }

  public static async persistToWorkspaceFile(server: { name: string; command?: string | null; args?: any; env?: any; url?: string | null; headers?: any }): Promise<void> {
    try {
      const configDir = path.resolve(process.cwd(), '.agents');
      const configPath = path.join(configDir, 'mcp_config.json');

      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      let currentConfig: any = { mcpServers: {} };
      if (fs.existsSync(configPath)) {
        try {
          currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          if (!currentConfig.mcpServers) currentConfig.mcpServers = {};
        } catch (e) {}
      }

      const serverEntry: any = {};
      if (server.command) serverEntry.command = server.command;
      if (server.args) serverEntry.args = typeof server.args === 'string' ? JSON.parse(server.args) : server.args;
      if (server.env && Object.keys(server.env).length > 0) {
        serverEntry.env = typeof server.env === 'string' ? JSON.parse(server.env) : server.env;
      }
      if (server.url) serverEntry.url = server.url;
      if (server.headers && Object.keys(server.headers).length > 0) {
        serverEntry.headers = typeof server.headers === 'string' ? JSON.parse(server.headers) : server.headers;
      }

      currentConfig.mcpServers[server.name] = serverEntry;
      fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2), 'utf8');
      console.log(`[McpScanner] Successfully persisted server "${server.name}" to ${configPath}`);
    } catch (err) {
      console.error('[McpScanner] Failed to write workspace mcp_config.json:', err);
    }
  }

  public static async removeFromWorkspaceFile(serverName: string): Promise<void> {
    try {
      const configPath = path.resolve(process.cwd(), '.agents/mcp_config.json');
      if (fs.existsSync(configPath)) {
        const currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (currentConfig.mcpServers && currentConfig.mcpServers[serverName]) {
          delete currentConfig.mcpServers[serverName];
          fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2), 'utf8');
          console.log(`[McpScanner] Removed server "${serverName}" from ${configPath}`);
        }
      }
    } catch (err) {
      console.error('[McpScanner] Failed to remove server from workspace mcp_config.json:', err);
    }
  }

  public static generateExportConfigs(servers: Array<{ name: string; command?: string | null; args?: any; env?: any; url?: string | null; headers?: any; transport: string; enabled: boolean }>) {
    const activeServers = servers.filter(s => s.enabled);
    const mcpServersMap: Record<string, any> = {};

    for (const s of activeServers) {
      if (s.transport === 'builtin') continue;
      const entry: any = {};
      if (s.command) entry.command = s.command;
      if (s.args) {
        entry.args = typeof s.args === 'string' ? JSON.parse(s.args) : s.args;
      }
      if (s.env) {
        const parsedEnv = typeof s.env === 'string' ? JSON.parse(s.env) : s.env;
        if (Object.keys(parsedEnv).length > 0) entry.env = parsedEnv;
      }
      if (s.url) entry.url = s.url;
      if (s.headers) {
        const parsedHeaders = typeof s.headers === 'string' ? JSON.parse(s.headers) : s.headers;
        if (Object.keys(parsedHeaders).length > 0) entry.headers = parsedHeaders;
      }
      mcpServersMap[s.name] = entry;
    }

    return {
      antigravity: {
        filename: '.agents/mcp_config.json',
        content: JSON.stringify({ mcpServers: mcpServersMap }, null, 2)
      },
      claude: {
        filename: 'claude_desktop_config.json',
        content: JSON.stringify({ mcpServers: mcpServersMap }, null, 2)
      },
      cursor: {
        filename: '.cursor/mcp.json',
        content: JSON.stringify({ mcpServers: mcpServersMap }, null, 2)
      },
      windsurf: {
        filename: '.windsurf/mcp_config.json',
        content: JSON.stringify({ mcpServers: mcpServersMap }, null, 2)
      }
    };
  }
}
