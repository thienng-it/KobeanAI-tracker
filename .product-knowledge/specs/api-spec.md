---
title: "REST API Specification"
type: spec
status: draft
author: "Nguyen Thai Minh Thien (Joseph)"
created: 2026-08-11
updated: 2026-08-11
tags: [api, rest, spec, backend]
---

# REST API Specification

## Overview

This document specifies the complete set of REST API endpoints for Phase 1 of KobeanAI Tracker. The Express API server provides standard CRUD, setup operations, and aggregation endpoints to the React frontend.

---

## Scope

**In scope:** 
- Sessions CRUD + filtering + search
- Skills CRUD + import/export
- Tags CRUD + search/autocomplete
- Agents CRUD + health check
- Setup/system-check endpoints
- Analytics aggregation endpoints

**Out of scope:** 
- WebSocket/SSE for real-time updates (to be added in future phases)

---

## Data Model / Types

```typescript
// Common Error Response
interface ApiError {
  error: string;
  code: string;
  details?: any;
}

// Pagination Metadata
interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

// Paginated Response
interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
```

---

## API Contract

### Sessions

#### `GET /api/sessions`
**Description:** List sessions, supporting filtering, search, and pagination.

**Query Parameters:**
| Param | Type | Required | Default | Description |
|:------|:-----|:---------|:--------|:------------|
| page | number | No | 1 | Page number |
| limit | number | No | 50 | Items per page |
| tags | string | No | | Comma-separated list of tag IDs to filter by |
| agentId | string | No | | Filter by agent ID |
| status | string | No | | Filter by status (`active`, `completed`, `error`) |
| search | string | No | | Full-text search string for summary/metadata |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "agentId": "uuid",
      "workspaceId": "uuid",
      "model": "claude-3-opus",
      "startedAt": "2026-08-11T00:00:00Z",
      "endedAt": "2026-08-11T01:00:00Z",
      "durationMs": 3600000,
      "inputTokens": 1000,
      "outputTokens": 500,
      "totalTokens": 1500,
      "estimatedCost": 0.045,
      "status": "completed",
      "summary": "Implemented auth flow",
      "toolCalls": 5,
      "filesModified": ["src/auth.ts"],
      "metadata": {},
      "tags": [
        { "id": "tag-1", "raw": "[us-1234][implement]" }
      ]
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 50 }
}
```

#### `POST /api/sessions`
**Description:** Create a new manual session.

**Request Body:**
```typescript
interface CreateSessionRequest {
  agentId: string;
  workspaceId: string;
  model: string;
  startedAt: string;
  status: string;
  tags?: string[]; // Tag IDs
  summary?: string;
  inputTokens?: number;
  outputTokens?: number;
}
```

**Response:** `201 Created` with Session object.

#### `GET /api/sessions/:id`
**Description:** Retrieve a single session by ID.

**Response:** `200 OK` with Session object.

#### `PUT /api/sessions/:id`
**Description:** Update a session (e.g., status, cost, ending time).

**Request Body:**
```typescript
interface UpdateSessionRequest {
  status?: string;
  endedAt?: string;
  durationMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  estimatedCost?: number;
  summary?: string;
  tags?: string[]; // Updated Tag IDs list
}
```

**Response:** `200 OK` with updated Session object.

#### `DELETE /api/sessions/:id`
**Description:** Delete a session by ID.

**Response:** `204 No Content`.

---

### Skills

#### `GET /api/skills`
**Description:** List all skills.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "code-review",
      "version": "1.0",
      "description": "Reviews code",
      "instructions": "...",
      "tags": []
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 50 }
}
```

#### `POST /api/skills`
**Description:** Create or import a skill.

**Request Body:**
```typescript
interface CreateSkillRequest {
  name: string;
  version: string;
  workspaceId: string;
  description?: string;
  author?: string;
  triggerCommand?: string;
  instructions: string;
  parameters?: Record<string, any>;
  tags?: string[];
}
```

**Response:** `201 Created` with Skill object.

#### `GET /api/skills/:id`
**Description:** Get a skill by ID.

**Response:** `200 OK` with Skill object.

#### `PUT /api/skills/:id`
**Description:** Update a skill.

**Request Body:** `Partial<CreateSkillRequest>`

**Response:** `200 OK` with updated Skill object.

#### `DELETE /api/skills/:id`
**Description:** Delete a skill.

**Response:** `204 No Content`.

---

### Tags

#### `GET /api/tags`
**Description:** List all distinct tags.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "prefix": "us",
      "identifier": "1234",
      "action": "implement",
      "raw": "[us-1234][implement]"
    }
  ]
}
```

#### `POST /api/tags`
**Description:** Parse and create a tag if it doesn't exist.

**Request Body:**
```typescript
interface CreateTagRequest {
  raw: string; // e.g. "[us-123][debug]"
}
```

**Response:** `201 Created` or `200 OK` (if existing) with Tag object.

#### `GET /api/tags/search`
**Description:** Search/autocomplete tags.

**Query Parameters:**
| Param | Type | Required | Description |
|:------|:-----|:---------|:------------|
| q | string | Yes | The query string (e.g. `[us-` or `auth`) |

**Response:** List of matching Tag objects.

---

### Agents

#### `GET /api/agents`
**Description:** List configured agent connections.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Claude Desktop",
      "type": "claude",
      "status": "connected",
      "lastSync": "2026-08-11T00:00:00Z"
    }
  ]
}
```

#### `POST /api/agents`
**Description:** Register a new agent configuration.

**Request Body:**
```typescript
interface CreateAgentRequest {
  name: string;
  type: string;
  config?: Record<string, any>;
}
```

**Response:** `201 Created` with Agent object.

#### `GET /api/agents/:id`
**Description:** Get agent details.

**Response:** `200 OK` with Agent object.

#### `PUT /api/agents/:id`
**Description:** Update agent configuration.

**Request Body:** `Partial<CreateAgentRequest>`

**Response:** `200 OK` with updated Agent object.

#### `GET /api/agents/:id/health`
**Description:** Perform a health check on the agent connection.

**Response:**
```json
{
  "status": "ok", // or "error"
  "details": "Connection established and config directory found."
}
```

---

### Setup & System

#### `GET /api/setup/check`
**Description:** Run a system prerequisite check.

**Response:**
```json
{
  "os": "darwin",
  "tools": [
    { "tool": "Node.js", "installed": true, "version": "20.18.0" },
    { "tool": "Python", "installed": false, "version": null }
  ]
}
```

#### `POST /api/setup/complete`
**Description:** Mark the setup wizard as complete and save initial config.

**Request Body:**
```typescript
interface CompleteSetupRequest {
  workspaceName: string;
  workspacePath: string;
  defaultTags: string[];
  agents: CreateAgentRequest[];
}
```

**Response:** `200 OK` with `{ success: true, workspaceId: "uuid" }`.

---

### Analytics

#### `GET /api/analytics/summary`
**Description:** Global usage summary statistics.

**Query Parameters:** `startDate`, `endDate`

**Response:**
```json
{
  "totalSessions": 150,
  "totalTokens": 2500000,
  "totalCost": 12.50,
  "topTags": ["us-1234", "debug"]
}
```

#### `GET /api/analytics/by-tag`
**Description:** Usage metrics grouped by tag.

**Response:**
```json
{
  "data": [
    { "tag": "[us-1234][implement]", "sessions": 10, "cost": 1.25 }
  ]
}
```

#### `GET /api/analytics/by-agent`
**Description:** Usage metrics grouped by AI agent.

**Response:**
```json
{
  "data": [
    { "agentName": "Claude Desktop", "sessions": 45, "cost": 5.00 }
  ]
}
```

---

## Error Handling

| Error Code | HTTP Status | Description |
|:-----------|:------------|:------------|
| `VALIDATION_ERROR` | 400 | Invalid request body or parameters |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists (e.g. duplicate tag) |
| `INTERNAL_ERROR` | 500 | Server exception |

---

## Changelog

| Date | Change |
|:-----|:-------|
| 2026-08-11 | Initial draft |
