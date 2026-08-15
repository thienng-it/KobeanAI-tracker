---
title: "ADR-003: File Watching for Agent Tracking"
type: decision
status: draft
author: "Nguyen Thai Minh Thien (Joseph)"
created: 2026-08-11
updated: 2026-08-11
tags: [architecture, agent-integration, file-watching, chokidar]
---

# ADR-003: File Watching for Agent Tracking

## Status

`Proposed`

---

## Context

We need a mechanism to passively track interactions between the user and various AI coding tools (Claude, Codex, Antigravity, Cursor) to gather session data without requiring the agents to actively push data to us (which most lack APIs for).

---

## Options Considered

### Option A: File Watching (Chokidar) on Log/Config Directories

**Description:** Use a file-watcher library (like Chokidar) to monitor specific directories (e.g. `~/.claude/`, `~/.gemini/`) for changes to log files or history databases, parse these files, and extract session details.

| Pros | Cons |
|:-----|:-----|
| - Non-intrusive; requires no changes to the AI agents | - Fragile; breaks if the AI tool changes its log format or location |
| - Can work entirely locally | - Requires reverse engineering log files |

### Option B: Local Proxy / MITM

**Description:** Intercept network requests made by the AI tools to their respective cloud endpoints.

| Pros | Cons |
|:-----|:-----|
| - Captures exact API requests/responses (tokens, cost) | - High friction: Requires users to install custom CA certificates |
| - Agnostic to log file changes | - Security risk; breaks end-to-end encryption |
| | - Complicated to configure correctly on user machines |

### Option C: Dedicated Extensions/Plugins

**Description:** Build IDE extensions (e.g. VS Code, Cursor) that read data via exposed APIs and send it to our local server.

| Pros | Cons |
|:-----|:-----|
| - Reliable and structured data access | - Requires building and maintaining multiple extensions |
| - Can provide UI integration | - Does not cover CLI tools easily |

---

## Decision

We chose **Option A: File Watching (Chokidar) on Log/Config Directories** as the primary integration strategy for v1.0, because it provides the lowest barrier to entry and works across multiple tools without complex setup or security warnings. For tools that expose APIs (like Cursor or GitHub Copilot via extension APIs), we will use those where possible as complementary methods.

---

## Consequences

**Positive:**
- Setup is seamless. The application auto-detects standard directories and begins tracking automatically.
- No need to MITM or install certificates.

**Negative:**
- The team must maintain parsing logic for each specific tool and react to format changes.

**Risks:**
- If an agent uses binary formats or encrypted local databases, file watching may not be able to extract meaningful session data.

---

## Changelog

| Date | Change |
|:-----|:-------|
| 2026-08-11 | Initial draft |
