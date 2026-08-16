# KobeanAI Tracker — Workspace AI Rules & Directives

> This project follows strict architecture patterns and engineering standards. See [`AGENT.md`](./AGENT.md) for full system specifications.

## Mandatory Directives
1. **Ponytail Decision Ladder**: Always prefer YAGNI, standard library built-ins, and native web capabilities over adding unnecessary npm dependencies or over-abstracted layers.
2. **Taste-Skill Motion & UI**: Use `cubic-bezier(0.16, 1, 0.3, 1)` spring curves, glassmorphism panels, and `Inter` / `JetBrains Mono` typography.
3. **Local-First Privacy**: Never transmit source code or API keys outside the local machine. SQLite operates in WAL mode with local file watchers.
4. **Codegraph Awareness**: Before refactoring or changing any module, consult [`CODEGRAPH.md`](./CODEGRAPH.md) to preserve cross-module contracts between Server, DB, Zustand Stores, and React Components.
5. **Model Observability & Telemetry Standard**: Model resolution and filtering must strictly use `ModelRegistry` and support granular model specs and per-model statistics isolation across all dashboard routes and React components (see [`.agents/rules/model-observability.md`](./.agents/rules/model-observability.md)).
6. **Session Tagging & Intent Taxonomy Standard**: Chat sessions and prompt turns must be classified using the canonical intent taxonomy (`[Implement]`, `[Fix]`, `[Refactor]`, `[UI/UX]`, `[Docs]`, `[Validate]`, `[Config]`) via `TagService` with strict noise filtering (see [`.agents/rules/session-tags.md`](./.agents/rules/session-tags.md)).
7. **Git Author & Contributor Identity Standard**: When committing on behalf of the project maintainer, use Git username `thienng-it` with email `thienng.it@gmail.com`. For other external contributors, respect and preserve their individual Git author credentials.


