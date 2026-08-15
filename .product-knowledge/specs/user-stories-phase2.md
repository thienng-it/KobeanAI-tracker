---
title: "Phase 2 User Stories"
type: plan
status: draft
author: "Chief Product Owner"
created: 2026-08-13
updated: 2026-08-13
tags: [phase2, user-stories, backlog, planning]
---

# Phase 2 User Stories & Backlog

## Epic Breakdown

| Epic ID | Epic Name | Mapped Features |
|:---|:---|:---|
| **EPIC-6** | Connectors & Telemetry Engine | Section 7.7 & 8.5 (Log Watching & Health Checks) |
| **EPIC-7** | Command Registry | Section 7.5 |
| **EPIC-8** | Rules Engine | Section 7.6 |

---

## User Stories

### EPIC-6: Connectors & Telemetry Engine

#### US-601: Antigravity Log Watcher Connector
**Description:**
As the system, I want to watch the Antigravity local log directories (`~/.gemini/antigravity-ide/brain`) for new conversation transcripts, so that I can automatically ingest session data, tokens, and durations into the Tracker.

**Acceptance Criteria:**
- **Given** an Antigravity agent is configured, **When** the connector starts, **Then** it watches the designated directory using `chokidar`.
- **Given** a new session transcript is written, **When** it completes, **Then** the connector parses the token usage, timestamp, and duration, creating a Session record in SQLite.

**Priority:** P0
**Complexity:** L
**Dependencies:** None

#### US-602: Real-time Connection Health Check
**Description:**
As a developer, I want the "Test Connection" button to perform a real check against the configured log paths to ensure the tracker has read permissions, so that I know my telemetry is working.

**Acceptance Criteria:**
- **Given** I configure a local log path for an agent, **When** I test the connection, **Then** the backend uses `fs.access` to verify the directory exists and is readable, returning the actual status.

**Priority:** P0
**Complexity:** S
**Dependencies:** None

---

### EPIC-7: Command Registry

#### US-701: Command CRUD & UI
**Description:**
As a power developer, I want to manage commands that trigger skills, so that I can create shortcuts (like `/review`) for complex prompt instructions.

**Acceptance Criteria:**
- **Given** I am on the Commands page, **When** I create a command, **Then** I can define a name, description, and link it to an existing skill.
- **Given** commands exist, **When** I view the list, **Then** I see all commands, their linked skills, and target agents.

**Priority:** P1
**Complexity:** M
**Dependencies:** None

---

### EPIC-8: Rules Engine

#### US-801: Rules CRUD & UI
**Description:**
As a team lead, I want to define behavioral rules (e.g., "always use strict typing") scoped globally or to specific agents, so that AI output remains consistent.

**Acceptance Criteria:**
- **Given** I am on the Rules page, **When** I create a rule, **Then** I can define a scope (global, workspace, agent), priority, condition, and instruction text.

**Priority:** P1
**Complexity:** M
**Dependencies:** None

---

## Prioritized Backlog Summary

| Rank | Story ID | Title | Epic | Priority | Complexity | Dependencies |
|:---|:---|:---|:---|:---|:---|:---|
| 1 | US-602 | Real-time Connection Health Check | EPIC-6 | P0 | S | None |
| 2 | US-601 | Antigravity Log Watcher Connector | EPIC-6 | P0 | L | US-602 |
| 3 | US-701 | Command CRUD & UI | EPIC-7 | P1 | M | None |
| 4 | US-801 | Rules CRUD & UI | EPIC-8 | P1 | M | None |
