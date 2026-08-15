# 📖 Knowledge Base Index

> Auto-maintained catalog of all documents. AI agents should read this to discover available knowledge.

---

## Plans

| Document | Status | Summary |
|:---------|:-------|:--------|
| [kobeanai-tracker-plan.md](plans/kobeanai-tracker-plan.md) | `draft` | Full product & engineering spec — AI usage tracking, skill/command/rule management, tag system, setup wizard, multi-agent integration |
| [agent-company-blueprint.md](plans/agent-company-blueprint.md) | `approved` | Reusable multi-agent company structure — org chart, roles, execution pipeline, communication protocols |

---

## Specs

| Document | Status | Summary |
|:---------|:-------|:--------|
| [user-stories-phase1.md](specs/user-stories-phase1.md) | `draft` | Phase 1 user stories — 5 epics (Setup Wizard, Dashboard, Session Tracker, Skill Manager, Agent Hub) with acceptance criteria |
| [api-spec.md](specs/api-spec.md) | `draft` | REST API contract — all endpoints for sessions, skills, tags, agents, setup, analytics with TypeScript types |
| [database-schema.md](specs/database-schema.md) | `draft` | Drizzle ORM SQLite schema — all tables, indexes, relations, TypeScript type exports (copy-pasteable) |
| [design-system.md](specs/design-system.md) | `draft` | Full UI/UX design system — colors, typography, spacing, animations, 35+ component specs, page layouts |

---

## Decisions

| # | Document | Status | Summary |
|:--|:---------|:-------|:--------|
| 001 | [001-web-first-over-desktop.md](decisions/001-web-first-over-desktop.md) | `proposed` | Web-first (localhost) over Electron/Tauri for v1.0 — portability, lightweight, privacy |
| 002 | [002-sqlite-local-first.md](decisions/002-sqlite-local-first.md) | `proposed` | SQLite + Drizzle ORM over PostgreSQL — zero-config, single-file, local-first |
| 003 | [003-file-watching-for-agents.md](decisions/003-file-watching-for-agents.md) | `proposed` | File watching via chokidar for passive agent log tracking |

---

## Guides

| Document | Status | Summary |
|:---------|:-------|:--------|
| *No guides yet* | — | — |

---

*Last updated: 2026-08-11*
