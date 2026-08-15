---
title: "ADR-001: Web-First Architecture over Desktop App"
type: decision
status: draft
author: "Nguyen Thai Minh Thien (Joseph)"
created: 2026-08-11
updated: 2026-08-11
tags: [architecture, web, electron, tauri]
---

# ADR-001: Web-First Architecture over Desktop App

## Status

`Proposed`

---

## Context

KobeanAI Tracker aims to be a unified control center for AI agent usage. We need to decide on the platform strategy for v1.0. We want to ensure maximum portability, ease of installation, and a fast, lightweight user experience without sacrificing privacy.

---

## Options Considered

### Option A: Web-First Architecture (Localhost)

**Description:** Build the application as a React SPA served by a local Node.js Express server running on `localhost`.

| Pros | Cons |
|:-----|:-----|
| - Maximum portability across macOS, Windows, Linux without platform-specific builds | - Requires the user to run a command (e.g. `npm start`) to launch the server |
| - Lightweight, fast startup, avoiding Electron bloat | - Lacks native desktop app feel out-of-the-box |
| - Privacy-first, data stays on the machine (SQLite database) | |

### Option B: Electron

**Description:** Build a cross-platform desktop application using Electron.

| Pros | Cons |
|:-----|:-----|
| - Native desktop feel, easy to distribute as an executable | - 100+ MB overhead for a fundamentally dashboard-like app |
| - Strong ecosystem, familiar web technologies | - Higher memory consumption |
| - Access to file system and OS-level features out of the box | |

### Option C: Tauri

**Description:** Build a desktop application using Tauri with a Rust backend.

| Pros | Cons |
|:-----|:-----|
| - Tiny binaries (3-15 MB) | - Requires Rust knowledge for the backend |
| - Native performance and desktop integration | - Longer setup and build times compared to web-first |
| - Access to file system | - Might overcomplicate v1.0 delivery |

---

## Decision

We chose **Option A: Web-First Architecture (Localhost)** because it provides the most straightforward path for v1.0 delivery. It avoids the bloat of Electron while ensuring maximum portability and respecting privacy via a local server. For Phase 2, we will consider wrapping this web app using Tauri when desktop packaging is required, as Tauri provides a lightweight alternative to Electron.

---

## Consequences

**Positive:**
- Fast development cycle.
- Small footprint and low memory usage.
- Data privacy is ensured natively.

**Negative:**
- Users need to start a local server, which might feel slightly less integrated than double-clicking a desktop app icon.

**Risks:**
- Browser security policies could potentially interfere with local API requests, though running on localhost usually mitigates CORS and other restrictions.

---

## Changelog

| Date | Change |
|:-----|:-------|
| 2026-08-11 | Initial draft |
