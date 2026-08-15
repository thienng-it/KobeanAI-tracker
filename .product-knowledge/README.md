# 📚 Product Knowledge Base

> **For AI Agents & Human Developers**  
> This folder is the **single source of truth** for all project knowledge.  
> **Read this README first** before building, refining, or reviewing anything.

---

## Purpose

This `.product-knowledge/` directory stores all reusable markdown documents that define **what** we're building, **why** we're building it, **how** it should work, and **what decisions** were made along the way.

Any AI agent (Claude, Codex, Antigravity, Cursor, Copilot, etc.) should:

1. **Read** relevant files here before starting work
2. **Reference** these files during implementation
3. **Update** these files when decisions change
4. **Create new** files when new knowledge is produced

---

## Folder Structure

```
.product-knowledge/
├── README.md              ← You are here. Start here always.
├── INDEX.md               ← Auto-maintained catalog of all documents
│
├── plans/                 ← Product & implementation plans
│   └── *.md                  Roadmaps, phased plans, feature specs
│
├── specs/                 ← Technical specifications
│   └── *.md                  API contracts, data schemas, architecture
│
├── decisions/             ← Architecture Decision Records (ADRs)
│   └── *.md                  Why we chose X over Y
│
├── guides/                ← How-to guides & runbooks
│   └── *.md                  Setup, deployment, contribution guides
│
└── templates/             ← Reusable document templates
    └── *.md                  Blueprints for creating new docs
```

---

## For AI Agents: How to Use This Knowledge Base

### Before You Build

```
1. Read  → .product-knowledge/INDEX.md        (discover what exists)
2. Read  → .product-knowledge/plans/*.md       (understand the plan)
3. Read  → .product-knowledge/specs/*.md       (understand the contracts)
4. Read  → .product-knowledge/decisions/*.md   (understand past choices)
5. Build → with full context
```

### When You Learn Something New

If your work produces reusable knowledge (a design decision, a debugging insight, a new spec), **write it down**:

1. Pick the right folder (see Folder Guide below)
2. Use the matching template from `templates/`
3. Add an entry to `INDEX.md`

### When Something Changes

If reality diverges from a document:

1. **Update the document first** — don't let docs rot
2. Add a changelog entry at the bottom of the file
3. Update `INDEX.md` if the summary changed

---

## Folder Guide

### `plans/` — What Are We Building?

Product plans, implementation roadmaps, and feature breakdowns.

| Use When | Example |
|:---------|:--------|
| Starting a new feature | `plans/auth-system-plan.md` |
| Defining a multi-week effort | `plans/kobeanai-tracker-plan.md` |
| Breaking work into phases | `plans/v2-migration-plan.md` |

### `specs/` — How Does It Work?

Technical specifications, API contracts, data models, and interface definitions.

| Use When | Example |
|:---------|:--------|
| Defining an API | `specs/rest-api-spec.md` |
| Documenting a data schema | `specs/database-schema.md` |
| Specifying a component interface | `specs/agent-connector-interface.md` |
| Defining the design system | `specs/design-system.md` |

### `decisions/` — Why Did We Choose This?

Architecture Decision Records (ADRs). One file per decision.

| Use When | Example |
|:---------|:--------|
| Choosing a tech stack | `decisions/001-web-over-electron.md` |
| Picking a database | `decisions/002-sqlite-over-postgres.md` |
| Selecting an approach | `decisions/003-file-watching-strategy.md` |

### `guides/` — How Do I Do This?

Step-by-step instructions for common tasks.

| Use When | Example |
|:---------|:--------|
| Onboarding a new developer | `guides/getting-started.md` |
| Deploying the app | `guides/deployment.md` |
| Adding a new agent connector | `guides/adding-a-connector.md` |

### `templates/` — Blank Starting Points

Templates for creating new documents consistently.

---

## File Naming Convention

```
[descriptive-kebab-case-name].md
```

**Rules:**
- All lowercase
- Words separated by hyphens (`-`)
- No dates in filenames (use YAML frontmatter instead)
- ADRs are numbered: `001-`, `002-`, etc.

**Good:** `kobeanai-tracker-plan.md`, `rest-api-spec.md`, `001-sqlite-over-postgres.md`  
**Bad:** `Plan_v2_FINAL.md`, `spec (1).md`, `2026-08-10-notes.md`

---

## Document Format Standard

Every `.md` file in this knowledge base **must** start with YAML frontmatter:

```yaml
---
title: "Human-Readable Title"
type: plan | spec | decision | guide     # Which folder it belongs in
status: draft | review | approved | deprecated
author: "Name"
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [tag1, tag2]                       # For cross-referencing
---
```

After frontmatter, use standard Markdown with:
- A single `# H1` matching the title
- Clear section headings (`## H2`, `### H3`)
- Tables for structured data
- Code blocks with language identifiers
- Mermaid diagrams for architecture/flows

---

## Quick Reference: Common Workflows

### "I'm starting a new feature"

```
1. Copy templates/plan-template.md → plans/my-feature-plan.md
2. Fill in the plan
3. Add to INDEX.md
4. Get approval
5. Build
6. Update plan status to "approved"
```

### "I made a technical decision"

```
1. Copy templates/decision-template.md → decisions/NNN-my-decision.md
2. Document the context, options, and chosen option
3. Add to INDEX.md
```

### "I defined an API or schema"

```
1. Copy templates/spec-template.md → specs/my-spec.md
2. Define the contract
3. Add to INDEX.md
```

### "I want to explain how to do something"

```
1. Copy templates/guide-template.md → guides/my-guide.md
2. Write step-by-step instructions
3. Add to INDEX.md
```
