---
name: codegraph
description: >-
  Interactive code graph and dependency analysis skill for KobeanAI Tracker.
  Use before refactoring, fixing bugs, adding new features, or modifying schemas to verify
  all incoming and outgoing dependencies across Electron desktop, Express server, SQLite DB,
  Zustand stores, and React components.
---

# Codegraph — Dependency Analysis & Refactoring Protocol

When working on **KobeanAI Tracker**, execute this dependency check workflow before modifying or adding code:

## 1. Cross-Layer Dependency Layers
- **Desktop Host**: `electron/main.cjs`
- **Server Core**: `server/index.ts`, `server/middleware/error.ts`
- **Database Layer**: `server/db/schema.ts`, `server/db/index.ts`, `drizzle.config.ts`
- **Telemetry Layer**: `server/services/telemetry-service.ts`, `server/connectors/antigravity.ts`, `server/connectors/base.ts`
- **Skill Engine**: `server/services/skill-scanner.ts`
- **REST Routes**: `server/routes/{dashboard, sessions, skills, rules, agents, commands, health}.ts`
- **Client Stores**: `src/stores/{useDashboardStore, useSessionsStore, useSkillsStore, useAgentsStore, useRulesStore, useCommandsStore}.ts`
- **UI Components & Pages**: `src/pages/*`, `src/components/*`

## 2. Refactoring Safety Protocol
1. **Consult `CODEGRAPH.md`**: Look up the target file in the Dependency Matrix to find all files in the `Incoming Dependencies (Imported By)` column.
2. **Schema Integrity**: If altering `server/db/schema.ts`, update:
   - Corresponding server routes (`server/routes/`)
   - Client API response types in `src/stores/`
   - UI component render properties
3. **Verify Build**: Always run `npm run build` after changes.
4. **Regenerate Codegraph**: Run `npm run codegraph` to update `CODEGRAPH.md` whenever new files or modules are created.
