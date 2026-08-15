---
title: "ADR-002: SQLite Local-First Architecture"
type: decision
status: draft
author: "Nguyen Thai Minh Thien (Joseph)"
created: 2026-08-11
updated: 2026-08-11
tags: [database, sqlite, drizzle, postgresql]
---

# ADR-002: SQLite Local-First Architecture

## Status

`Proposed`

---

## Context

The application needs a reliable, fast, and private data store for sessions, skills, rules, and analytics. We need to decide on the database technology for KobeanAI Tracker v1.0.

---

## Options Considered

### Option A: SQLite (via better-sqlite3) with Drizzle ORM

**Description:** Use a local, single-file SQLite database, accessed synchronously via `better-sqlite3` and managed with Drizzle ORM.

| Pros | Cons |
|:-----|:-----|
| - Zero configuration, no external database server needed | - Lacks some advanced features of Postgres (e.g. JSONB indexing, although JSON is supported) |
| - Perfect for local-first, privacy-focused applications | - Concurrent writes can be a bottleneck, though unlikely for a single-user app |
| - Single file makes backups trivial | |
| - High performance for single-user scenarios | |

### Option B: PostgreSQL (Local or Cloud)

**Description:** Run a local PostgreSQL instance or connect to a managed cloud database.

| Pros | Cons |
|:-----|:-----|
| - Highly scalable, robust features | - Requires users to install and manage Postgres locally, violating zero-friction onboarding |
| - Great support for JSONB, complex queries, and concurrency | - Cloud hosted violates privacy-first and offline-support goals |

### Option C: Document Store (e.g. NeDB / Local JSON files)

**Description:** Store data as flat JSON files or use a lightweight document store.

| Pros | Cons |
|:-----|:-----|
| - Easy to implement | - Poor performance for complex analytical queries |
| - Human-readable data | - Lack of relationships, making tags and skills linking harder |

---

## Decision

We chose **Option A: SQLite (via better-sqlite3) with Drizzle ORM** because it provides the best balance of relational data modeling, query performance, and zero-configuration installation. SQLite perfectly aligns with the local-first, privacy-respecting nature of the product, and Drizzle ORM provides a modern, type-safe API for our TypeScript stack.

---

## Consequences

**Positive:**
- Users don't need to install database servers. Setup wizard remains fast and straightforward.
- Easy to back up data simply by copying the `.db` file.
- Fast, local queries enabling real-time analytics.

**Negative:**
- We cannot leverage cloud-native database features.

**Risks:**
- Migration management might require careful handling during application updates.

---

## Changelog

| Date | Change |
|:-----|:-------|
| 2026-08-11 | Initial draft |
