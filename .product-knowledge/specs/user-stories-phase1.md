---
title: "Phase 1 User Stories"
type: plan
status: draft
author: "Chief Product Owner"
created: 2026-08-11
updated: 2026-08-11
tags: [phase1, user-stories, backlog, planning]
---

# Phase 1 User Stories & Backlog

## Epic Breakdown

| Epic ID | Epic Name | Mapped Features |
|:---|:---|:---|
| **EPIC-1** | Setup Wizard & Onboarding | Section 7.1 (Setup Wizard) |
| **EPIC-2** | Dashboard & Core UI | Section 7.2 (Dashboard) |
| **EPIC-3** | AI Usage Tracker | Section 7.3 (AI Usage Tracker) |
| **EPIC-4** | Skill Manager | Section 7.4 (Skill Manager) |
| **EPIC-5** | Agent Integration Hub | Section 7.7 (Agent Integration Hub - connection config only) |

---

## User Stories

### EPIC-1: Setup Wizard & Onboarding

#### US-101: Welcome & System Check
**Description:**
As a first-time user,
I want to be welcomed and have my system automatically checked for prerequisites,
So that I know if my environment is ready for KobeanAI Tracker.

**Acceptance Criteria:**
- **Given** I launch the app for the first time, **When** the app opens, **Then** I am presented with the Welcome screen and a "Get Started" button.
- **Given** I click "Get Started", **When** the system check runs, **Then** it detects my OS, free disk space, and RAM, displaying the results clearly.

**Priority:** P0
**Complexity:** S
**Dependencies:** None

#### US-102: Prerequisites Checklist
**Description:**
As a developer setting up the tracker,
I want to see a checklist of required tools with their installation status and quick install commands,
So that I can easily install missing dependencies.

**Acceptance Criteria:**
- **Given** I am on the Prerequisites step, **When** the page loads, **Then** I see a list of tools (Node.js, pnpm, Git, etc.) marked as ✅ Installed, ❌ Not Found, or ⚠️ Outdated.
- **Given** a tool is missing, **When** I look at its entry, **Then** I see the required version, purpose, and a copyable install command.

**Priority:** P0
**Complexity:** M
**Dependencies:** US-101

#### US-103: Workspace Setup & First Launch
**Description:**
As a new user,
I want to create my first workspace and set default tags before launching the dashboard,
So that my environment is organized from the start.

**Acceptance Criteria:**
- **Given** I am on the Workspace Setup step, **When** I provide a workspace name and path, **Then** the workspace is created in the local database.
- **Given** the workspace is created, **When** I click "Launch Dashboard", **Then** my setup state is saved and I am redirected to the Dashboard.

**Priority:** P0
**Complexity:** M
**Dependencies:** US-102, US-501

---

### EPIC-5: Agent Integration Hub

#### US-501: Configure Agent Connections
**Description:**
As a developer,
I want to configure connections to my AI agents (Claude, Antigravity, etc.) during setup and in settings,
So that the tracker knows where to read logs and send commands.

**Acceptance Criteria:**
- **Given** I am on the Agent Connections step, **When** I select an agent (e.g., Claude), **Then** I am prompted to enter API keys or verify auto-detected log directories.
- **Given** I enter connection details, **When** I click "Test Connection", **Then** the system validates the config and shows a success/failure indicator.

**Priority:** P0
**Complexity:** M
**Dependencies:** None

---

### EPIC-2: Dashboard & Core UI

#### US-201: Dashboard Activity Feed & Summary
**Description:**
As a power developer,
I want to see a real-time stream of my recent AI sessions and usage summaries on the dashboard,
So that I have a quick bird's-eye view of my AI activity.

**Acceptance Criteria:**
- **Given** I have recorded sessions, **When** I visit the Dashboard, **Then** I see a feed of recent sessions showing tags, agent name, and timestamp.
- **Given** I visit the Dashboard, **When** I view the Usage Summary widget, **Then** I see token counts, session counts, and estimated costs for Today, This Week, and This Month.

**Priority:** P0
**Complexity:** M
**Dependencies:** US-103, US-301

#### US-202: Dashboard Quick Actions & Tags
**Description:**
As a user,
I want quick action buttons and a view of recent/frequent tags on my dashboard,
So that I can easily start new sessions or reuse tags.

**Acceptance Criteria:**
- **Given** I am on the Dashboard, **When** I click "New Session" or "Browse Skills", **Then** I am navigated to the respective pages.
- **Given** I have used tags previously, **When** I look at the Recent Tags widget, **Then** I see my last 10 used tags available for one-click reuse.

**Priority:** P0
**Complexity:** S
**Dependencies:** US-201

---

### EPIC-3: AI Usage Tracker

#### US-301: Session Data Model & Storage
**Description:**
As the system,
I want to store comprehensive session data including tags, token counts, and cost,
So that users can query and analyze their AI usage later.

**Acceptance Criteria:**
- **Given** an AI interaction occurs, **When** it is captured, **Then** it is stored in the local SQLite database with UUID, agent, model, timestamps, token counts, and applied tags.
- **Given** a session is saved, **When** the cost is calculated, **Then** it uses the predefined model pricing to store the estimated cost.

**Priority:** P0
**Complexity:** L
**Dependencies:** US-103

#### US-302: Session List View & Filtering
**Description:**
As a team lead or developer,
I want to view a sortable, filterable list of all my AI sessions,
So that I can find specific interactions and understand my history.

**Acceptance Criteria:**
- **Given** I navigate to the Sessions page, **When** the list loads, **Then** I see a tabular view of all sessions sorted by date descending.
- **Given** the list is displayed, **When** I apply filters (by tag, agent, date range), **Then** the list updates instantly to show only matching sessions.

**Priority:** P0
**Complexity:** M
**Dependencies:** US-301

---

### EPIC-4: Skill Manager

#### US-401: Create and Edit Skills
**Description:**
As a power developer,
I want to create, read, update, and delete skills (prompt templates),
So that I can reuse effective instructions across my AI agents.

**Acceptance Criteria:**
- **Given** I am on the Skills page, **When** I click "Create Skill", **Then** I can input a name, description, tags, compatible agents, and instructions.
- **Given** I have created a skill, **When** I select it, **Then** I can edit its details or delete it, and changes are saved to the local database.

**Priority:** P0
**Complexity:** M
**Dependencies:** None

#### US-402: Browse and Search Skills
**Description:**
As a user,
I want to search and filter my saved skills,
So that I can quickly find the right template for my current task.

**Acceptance Criteria:**
- **Given** I have multiple skills, **When** I use the search bar, **Then** the list filters in real-time by skill name and description.
- **Given** the skill list, **When** I filter by tag or compatible agent, **Then** only skills matching those criteria are displayed.

**Priority:** P0
**Complexity:** S
**Dependencies:** US-401

---

## Prioritized Backlog Summary

| Rank | Story ID | Title | Epic | Priority | Complexity | Dependencies |
|:---|:---|:---|:---|:---|:---|:---|
| 1 | US-101 | Welcome & System Check | EPIC-1 | P0 | S | None |
| 2 | US-102 | Prerequisites Checklist | EPIC-1 | P0 | M | US-101 |
| 3 | US-501 | Configure Agent Connections | EPIC-5 | P0 | M | None |
| 4 | US-103 | Workspace Setup & First Launch | EPIC-1 | P0 | M | US-102, US-501 |
| 5 | US-301 | Session Data Model & Storage | EPIC-3 | P0 | L | US-103 |
| 6 | US-302 | Session List View & Filtering | EPIC-3 | P0 | M | US-301 |
| 7 | US-201 | Dashboard Activity Feed & Summary | EPIC-2 | P0 | M | US-103, US-301 |
| 8 | US-202 | Dashboard Quick Actions & Tags | EPIC-2 | P0 | S | US-201 |
| 9 | US-401 | Create and Edit Skills | EPIC-4 | P0 | M | None |
| 10 | US-402 | Browse and Search Skills | EPIC-4 | P0 | S | US-401 |
