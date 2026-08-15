# KobeanAI Tracker — Workspace AI Rules & Directives

> This project follows strict architecture patterns and engineering standards. See [`AGENT.md`](./AGENT.md) for full system specifications.

## Mandatory Directives
1. **Ponytail Decision Ladder**: Always prefer YAGNI, standard library built-ins, and native web capabilities over adding unnecessary npm dependencies or over-abstracted layers.
2. **Taste-Skill Motion & UI**: Use `cubic-bezier(0.16, 1, 0.3, 1)` spring curves, glassmorphism panels, and `Inter` / `JetBrains Mono` typography.
3. **Local-First Privacy**: Never transmit source code or API keys outside the local machine. SQLite operates in WAL mode with local file watchers.
4. **Codegraph Awareness**: Before refactoring or changing any module, consult [`CODEGRAPH.md`](./CODEGRAPH.md) to preserve cross-module contracts between Server, DB, Zustand Stores, and React Components.
