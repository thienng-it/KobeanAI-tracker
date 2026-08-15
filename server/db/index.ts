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

export const db = drizzle(sqlite, { schema });
export type { BetterSqliteDatabase };

