# KobeanAI Agent Memory Bank

> This file contains persistent architectural decisions, lessons learned, and behavioral guardrails for AI coding assistants.

## ARCHITECTURE

### 📌 [Pinned] Model Observability Standard [Priority: HIGH]
Model resolution and filtering must strictly use ModelRegistry and support granular model specs and per-model statistics isolation.
*Tags: model, telemetry, registry*

### 📌 [Pinned] Node.js ESM NodeNext Relative Import Standard [Priority: HIGH]
Backend runs Node.js ESM ("type": "module" with NodeNext resolution). All relative TypeScript imports must use the '.js' extension (e.g. import { db } from '../db/index.js';).
*Tags: esm, typescript, backend, nodenext*

### KobeanAI Agent Memory Bank [Priority: NORMAL]
> This file contains persistent architectural decisions, lessons learned, and behavioral guardrails for AI coding assistants.
*Tags: memory-bank, workspace*

### GOTCHAS [Priority: NORMAL]
### 📌 [Pinned] Gitleaks CI Secret Scanning Compliance [Priority: HIGH]
Gitleaks CI scans for database URIs with passwords. Never write mock connection strings formatted like 'postgresql://user:password@localhost'. Use 'postgresql://localhost:5432/mydb' or environment variables.
*Tags: ci, gitleaks, testing, secrets*

### 📌 [Pinned] Local-First Zero Telemetry Protocol [Priority: CRITICAL]
Never transmit source code, environment variables, or private API keys outside the local machine. All database operations must utilize SQLite in WAL mode with local file watchers.
*Tags: security, privacy, sqlite, local-first*
*Tags: memory-bank, workspace*

### ARCHITECTURE [Priority: NORMAL]
### 📌 [Pinned] Node.js ESM NodeNext Relative Import Standard [Priority: HIGH]
Backend runs Node.js ESM ("type": "module" with NodeNext resolution). All relative TypeScript imports must use the '.js' extension (e.g. import { db } from '../db/index.js';).
*Tags: esm, typescript, backend, nodenext*
*Tags: memory-bank, workspace*

### WORKFLOW [Priority: NORMAL]
### 📌 [Pinned] Ponytail Anti-Overengineering Decision Ladder [Priority: HIGH]
Apply the 6-step Ponytail Decision Ladder before adding new packages: 1. YAGNI • 2. Standard Library First • 3. Native Web APIs • 4. Direct 10-line Implementation • 5. Clean Architecture • 6. Zero Dead Code.
*Tags: ponytail, yagni, simplicity, architecture*
*Tags: memory-bank, workspace*

### USER-PREFERENCE [Priority: NORMAL]
### Taste-Skill Motion & Spring Easing Tokens [Priority: NORMAL]
Use 'cubic-bezier(0.16, 1, 0.3, 1)' spring curves for all interactive panels, modal transitions, and card elevations. Adhere to glassmorphism panels with backdrop-filter: blur(16px).
*Tags: ui-ux, taste-skill, animation, glassmorphism*
*Tags: memory-bank, workspace*

### API-CONVENTIONS [Priority: NORMAL]
### Drizzle ORM Type-Safe Query Callback Standard [Priority: NORMAL]
When querying via Drizzle relational API (db.query.table.findFirst), use callback syntax for type safety: where: (t, { eq }) => eq(t.id, req.params.id). For direct SQL updates, use eq(table.id, req.params.id).
*Tags: database, drizzle, sqlite, orm*
*Tags: memory-bank, workspace*

## GOTCHAS

### 📌 [Pinned] Gitleaks CI Secret Scanning Compliance [Priority: HIGH]
Gitleaks CI scans for database URIs with passwords. Never write mock connection strings formatted like 'postgresql://user:password@localhost'. Use 'postgresql://localhost:5432/mydb' or environment variables.
*Tags: ci, gitleaks, testing, secrets*

### 📌 [Pinned] Local-First Zero Telemetry Protocol [Priority: CRITICAL]
Never transmit source code, environment variables, or private API keys outside the local machine. All database operations must utilize SQLite in WAL mode with local file watchers.
*Tags: security, privacy, sqlite, local-first*

## WORKFLOW

### 📌 [Pinned] Ponytail Anti-Overengineering Decision Ladder [Priority: HIGH]
Apply the 6-step Ponytail Decision Ladder before adding new packages: 1. YAGNI • 2. Standard Library First • 3. Native Web APIs • 4. Direct 10-line Implementation • 5. Clean Architecture • 6. Zero Dead Code.
*Tags: ponytail, yagni, simplicity, architecture*

## USER-PREFERENCE

### Taste-Skill Motion & Spring Easing Tokens [Priority: NORMAL]
Use 'cubic-bezier(0.16, 1, 0.3, 1)' spring curves for all interactive panels, modal transitions, and card elevations. Adhere to glassmorphism panels with backdrop-filter: blur(16px).
*Tags: ui-ux, taste-skill, animation, glassmorphism*

## API-CONVENTIONS

### Drizzle ORM Type-Safe Query Callback Standard [Priority: NORMAL]
When querying via Drizzle relational API (db.query.table.findFirst), use callback syntax for type safety: where: (t, { eq }) => eq(t.id, req.params.id). For direct SQL updates, use eq(table.id, req.params.id).
*Tags: database, drizzle, sqlite, orm*
