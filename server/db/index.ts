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

  CREATE UNIQUE INDEX IF NOT EXISTS idx_mcp_server_agent ON mcp_server_agents (server_id, agent_id);
  CREATE INDEX IF NOT EXISTS idx_mcp_server_name ON mcp_servers (name);
  CREATE INDEX IF NOT EXISTS idx_mcp_server_scope ON mcp_servers (scope);
  CREATE INDEX IF NOT EXISTS idx_mcp_server_status ON mcp_servers (status);
  CREATE INDEX IF NOT EXISTS idx_mcp_tool_server ON mcp_tools (server_id);
  CREATE INDEX IF NOT EXISTS idx_mcp_tool_name ON mcp_tools (name);
`);

export const db = drizzle(sqlite, { schema });
export type { BetterSqliteDatabase };


