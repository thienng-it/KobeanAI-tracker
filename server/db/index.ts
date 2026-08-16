import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database, { Database as BetterSqliteDatabase } from 'better-sqlite3';
import * as schema from './schema.js';
import path from 'path';
import fs from 'fs';

// Configurable database path with fallback to root sqlite.db
const dbPath = process.env.DATABASE_PATH 
  ? path.resolve(process.env.DATABASE_PATH)
  : path.resolve(process.cwd(), 'sqlite.db');

// Ensure the parent directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const sqlite: BetterSqliteDatabase = new Database(dbPath);

// Enable WAL mode, foreign keys, and performance optimizations for production
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('synchronous = NORMAL');

// Ensure all core and MCP tables exist gracefully without data loss
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS workspaces (
    id text PRIMARY KEY NOT NULL,
    name text NOT NULL,
    path text NOT NULL,
    description text,
    created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

  CREATE TABLE IF NOT EXISTS agents (
    id text PRIMARY KEY NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    config text,
    status text NOT NULL,
    last_sync text,
    created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

  CREATE TABLE IF NOT EXISTS mcp_servers (
    id text PRIMARY KEY NOT NULL,
    workspace_id text NOT NULL REFERENCES workspaces(id),
    name text NOT NULL,
    slug text,
    description text,
    transport text NOT NULL,
    command text,
    args text,
    env text,
    url text,
    headers text,
    scope text DEFAULT 'workspace' NOT NULL,
    status text DEFAULT 'configured' NOT NULL,
    enabled integer DEFAULT 1 NOT NULL,
    tools_count integer DEFAULT 0 NOT NULL,
    metadata text,
    created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

  CREATE TABLE IF NOT EXISTS mcp_tools (
    id text PRIMARY KEY NOT NULL,
    server_id text NOT NULL REFERENCES mcp_servers(id),
    name text NOT NULL,
    description text,
    parameters text,
    is_lazy integer DEFAULT 0 NOT NULL,
    usage_count integer DEFAULT 0 NOT NULL,
    created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

  CREATE TABLE IF NOT EXISTS mcp_server_agents (
    server_id text NOT NULL REFERENCES mcp_servers(id),
    agent_id text NOT NULL REFERENCES agents(id)
  );

  CREATE TABLE IF NOT EXISTS plugins (
    id text PRIMARY KEY NOT NULL,
    workspace_id text NOT NULL REFERENCES workspaces(id),
    name text NOT NULL,
    slug text,
    version text DEFAULT '1.0.0' NOT NULL,
    description text,
    author text,
    scope text DEFAULT 'workspace' NOT NULL,
    path text,
    repository text,
    license text,
    keywords text,
    skills_count integer DEFAULT 0 NOT NULL,
    agents_count integer DEFAULT 0 NOT NULL,
    has_mcp integer DEFAULT 0 NOT NULL,
    has_hooks integer DEFAULT 0 NOT NULL,
    enabled integer DEFAULT 1 NOT NULL,
    status text DEFAULT 'active' NOT NULL,
    readme text,
    manifest text,
    metadata text,
    created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

  CREATE TABLE IF NOT EXISTS hooks (
    id text PRIMARY KEY NOT NULL,
    workspace_id text NOT NULL REFERENCES workspaces(id),
    name text NOT NULL,
    slug text,
    description text,
    event text NOT NULL,
    matcher text,
    type text DEFAULT 'command' NOT NULL,
    command text,
    timeout integer DEFAULT 5 NOT NULL,
    scope text DEFAULT 'workspace' NOT NULL,
    enabled integer DEFAULT 1 NOT NULL,
    status text DEFAULT 'active' NOT NULL,
    execution_count integer DEFAULT 0 NOT NULL,
    last_executed_at text,
    metadata text,
    created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_mcp_server_agent ON mcp_server_agents (server_id, agent_id);
  CREATE INDEX IF NOT EXISTS idx_mcp_server_name ON mcp_servers (name);
  CREATE INDEX IF NOT EXISTS idx_mcp_server_scope ON mcp_servers (scope);
  CREATE INDEX IF NOT EXISTS idx_mcp_server_status ON mcp_servers (status);
  CREATE INDEX IF NOT EXISTS idx_mcp_tool_server ON mcp_tools (server_id);
  CREATE INDEX IF NOT EXISTS idx_mcp_tool_name ON mcp_tools (name);
  CREATE INDEX IF NOT EXISTS idx_plugin_name ON plugins (name);
  CREATE INDEX IF NOT EXISTS idx_plugin_scope ON plugins (scope);
  CREATE INDEX IF NOT EXISTS idx_plugin_status ON plugins (status);
  CREATE INDEX IF NOT EXISTS idx_hook_name ON hooks (name);
  CREATE INDEX IF NOT EXISTS idx_hook_event ON hooks (event);
  CREATE INDEX IF NOT EXISTS idx_hook_scope ON hooks (scope);
`);

export const db = drizzle(sqlite, { schema });
export type { BetterSqliteDatabase };


