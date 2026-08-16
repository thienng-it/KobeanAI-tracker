# Session Intent & Tagging Standard Rule

## Purpose & Scope
This rule establishes the canonical tagging taxonomy, prefix syntax, automatic intent classification, and database normalization rules for all AI chat sessions across KobeanAI Tracker.

---

## 1. Canonical Tag Taxonomy

Every conversation session, prompt, and task turn is classified into one or more canonical intent tags:

| Tag | Action / Category | Color Token | Hex Color | Usage Scope |
| :--- | :--- | :--- | :--- | :--- |
| **`[Implement]`** | Feature Implementation | `status-success` | `#10b981` | Creating new features, components, routes, backend endpoints, tools, or stores. |
| **`[Fix]`** | Bug Fix & Correction | `status-error` | `#ef4444` | Fixing runtime errors, broken UI, broken logic, compiler warnings, edge-case crashes. |
| **`[Refactor]`** | Code Refactoring | `brand-secondary` | `#8b5cf6` | Restructuring files, optimizing performance, deduplicating code without altering external API contracts. |
| **`[UI/UX]`** | Visual & Motion Design | `brand-primary` | `#3b82f6` | Polishing styling, CSS variables, glassmorphism, animations, spring curves, responsive layouts. |
| **`[Docs]`** | Documentation | `status-info` | `#06b6d4` | Writing or updating architecture manuals, `walkthrough.md`, `CODEGRAPH.md`, comments, user guides. |
| **`[Validate]`** | Verification & Testing | `status-warning` | `#f59e0b` | Running test suites, build checks, `npm run build`, lint audits, and regression verification. |
| **`[Config]`** | Configuration & Rules | `brand-accent` | `#ec4899` | Updating workspace rules, `GEMINI.md`, `AGENT.md`, environment variables, SQLite migrations. |
| **`[Unknown]`** | General Query | `text-tertiary` | `#64748b` | Conversational questions, exploratory queries without explicit action. |

---

## 2. Prompt Tagging Conventions

1. **Explicit Tag Prefix**:
   - Users and agents can declare one or more intent tags at the start of a prompt:
     ```text
     [Implement][UI/UX] Add high-contrast mode toggle to settings panel.
     [Fix] Resolve timestamp calculation overflow in session parser.
     ```

2. **Noise Filtering & Sanitization**:
   - Telemetry connectors must **never** ingest raw compiler errors, lint codes, git branch stamps, or code snippets (such as `[DEP0169]`, `[E0433]`, `[warn(unused)]`, `[master f589f85]`, `[plugin:vite:...]`, `[0]`) as tags.
   - Any bracketed expression that does not match canonical taxonomy or explicit user story identifiers must be filtered out during log scanning.

3. **Automated Intent Fallback**:
   - When no explicit tag prefix is provided, the telemetry connector automatically classifies the prompt using semantic keyword matching (e.g. `fix` / `error` -> `[Fix]`, `create` / `build` -> `[Implement]`, `style` / `theme` -> `[UI/UX]`, etc.).
