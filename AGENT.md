# KobeanAI Tracker — Agent Development & Architecture Manual

> **Scope**: This document defines the engineering standards, architecture, cross-module dependencies, and behavioral rules for AI pair-programmers and human contributors building and enhancing the **KobeanAI Tracker** codebase.

---

## 1. System Architecture & Component Topology

KobeanAI Tracker is a **local-first AI observability platform** built with an Electron desktop wrapper, Express backend, React 19 frontend, and SQLite database with WAL mode.

```mermaid
graph TD
    subgraph Desktop & Host Layer
        ElectronMain["electron/main.cjs<br>(Window & Process Lifecycle)"]
        ChokidarWatcher["server/connectors/*<br>(Async File Watchers)"]
        LocalLogs["~/.gemini/antigravity-ide/brain/<br>~/.claude/transcripts/"]
    end

    subgraph Backend Layer (Node.js / Express 5)
        Server["server/index.ts<br>(API Gateway & Static Host)"]
        Telemetry["server/services/telemetry-service.ts"]
        SkillScanner["server/services/skill-scanner.ts"]
        DB["server/db/index.ts<br>(better-sqlite3 + Drizzle ORM)"]
        Routes["server/routes/*<br>(dashboard, sessions, skills, rules, agents)"]
    end

    subgraph Frontend Layer (React 19 + Vite)
        MainReact["src/main.tsx & App.tsx"]
        Stores["src/stores/*<br>(useDashboardStore, useSessionsStore, etc.)"]
        Components["src/components/*<br>(dashboard, sessions, skills, layout)"]
        Pages["src/pages/*<br>(DashboardPage, SessionsPage, etc.)"]
    end

    subgraph Documentation Portal
        StaticDocs["docs/index.html + styles.css + script.js<br>(GitHub Pages Deploy)"]
    end

    ElectronMain --> Server
    LocalLogs --> ChokidarWatcher
    ChokidarWatcher --> Telemetry
    Telemetry --> DB
    SkillScanner --> DB
    Server --> Routes
    Routes --> DB
    Server --> MainReact
    MainReact --> Stores
    Stores --> Components
    Components --> Pages
```

---

## 2. Core Engineering Rules & Guidelines

### Rule 1: Ponytail Decision Ladder (Anti-Overengineering)
Every feature, refactor, or bug fix must strictly follow the **6-Step Ponytail Ladder**:
1. **YAGNI (You Aren't Gonna Need It)**: Do not create speculative abstractions, plugin bridges, or helper factories unless actively required.
2. **Standard Library First**: Use native ECMAScript and Node.js built-ins (`fetch`, `crypto`, `Intl`, `structuredClone`, `URL`, `path`, `fs/promises`) over external npm packages.
3. **Native Web Platform**: Leverage HTML5 semantics (`<dialog>`, `<details>`, CSS container queries, `:has()`, CSS custom properties) over heavy JavaScript layout libraries.
4. **Reuse Installed Dependencies**: Only use packages already in `package.json` (`drizzle-orm`, `better-sqlite3`, `zustand`, `lucide-react`, `recharts`, `date-fns`, `chokidar`, `helmet`, `express-rate-limit`).
5. **Concise Idiomatic Expressions**: Prefer clear, readable functions and early returns over deeply nested object hierarchies.
6. **Zero Regression Safety**: Always ensure TypeScript builds cleanly with `npm run build` and zero type errors.

### Rule 2: UI Motion & Taste Standard (`taste-skill`)
- **Physics Curves**: Always use `cubic-bezier(0.16, 1, 0.3, 1)` for smooth spring micro-interactions.
- **Glassmorphism**: Combine `backdrop-filter: blur(16px)` with layered semi-transparent dark surfaces (`rgba(15, 23, 42, 0.65)`) and subtle `1px solid rgba(255, 255, 255, 0.08)` borders.
- **Micro-interactions**: Interactive cards must have 2px hover elevation; buttons must have tactile `transform: scale(0.98)` active states.
- **Typography**: `Inter` for interface labels and headings; `JetBrains Mono` for token metrics, cost values, and code snippets.

### Rule 3: Secret Protection (`.betterleak`)
- **Zero API Key Leakage**: Never commit or log raw API tokens (Gemini `AIzaSy...`, OpenAI `sk-...`, Anthropic `sk-ant-...`, GitHub PATs `ghp_...`).
- Pre-commit hooks and CI workflows enforce secret auditing on all staged diffs.

---

## 3. Directory Layout & Module Registry

| Directory | Role | Key Dependencies |
| :--- | :--- | :--- |
| `electron/` | Native desktop wrapper | `electron`, child processes |
| `server/` | Express REST API & Telemetry daemon | `better-sqlite3`, `drizzle-orm`, `chokidar`, `helmet` |
| `server/db/` | Database schema & connections | `schema.ts`, `drizzle.config.ts`, SQLite WAL mode |
| `server/connectors/` | Local agent log observers | `antigravity.ts`, `base.ts` |
| `server/services/` | Telemetry & skill scanning | `telemetry-service.ts`, `skill-scanner.ts` |
| `server/routes/` | REST API endpoint handlers | `dashboard.ts`, `sessions.ts`, `skills.ts`, `rules.ts`, `agents.ts` |
| `src/` | React 19 Frontend SPA | `react`, `zustand`, `recharts`, `lucide-react`, `react-router` |
| `src/stores/` | Client state management | Zustand stores (`useDashboardStore`, `useSessionsStore`, etc.) |
| `src/components/` | Modular UI components | Design system tokens, `TagBadge`, `MetricsCard`, `SessionsTable` |
| `docs/` | Static Documentation Portal | Standalone HTML5/CSS3/JS hosted on GitHub Pages |
| `.agents/` | Customization Root | Workspace skills (`ponytail`, `taste-skill`), rules, hooks |

---

## 4. Build & Execution Cheat Sheet

```bash
# 1. Full Development Mode (Vite Frontend :5173 + Express Backend :3000)
npm run dev

# 2. Production Compile & Check
npm run build

# 3. Desktop Application Development Window
npm run desktop:dev

# 4. Standalone Desktop Packager (macOS, Windows, Linux)
npm run desktop:build:mac    # .dmg & .app
npm run desktop:build:win    # .exe installer
npm run desktop:build:linux  # .AppImage & .deb

# 5. Dependency Graph Generation
npm run codegraph
```

---

## 5. Guidelines for Refactoring & Adding Features

Before modifying or adding code in this repository:
1. Consult [`CODEGRAPH.md`](file:///Users/josephnguyen/Desktop/KobeanAI-tracker/CODEGRAPH.md) to inspect incoming and outgoing dependencies of the modified module.
2. If modifying database schemas in [`server/db/schema.ts`](file:///Users/josephnguyen/Desktop/KobeanAI-tracker/server/db/schema.ts), update corresponding REST controllers in [`server/routes/`](file:///Users/josephnguyen/Desktop/KobeanAI-tracker/server/routes) and Zustand stores in [`src/stores/`](file:///Users/josephnguyen/Desktop/KobeanAI-tracker/src/stores).
3. If modifying the frontend routing in [`src/main.tsx`](file:///Users/josephnguyen/Desktop/KobeanAI-tracker/src/main.tsx), verify that the Express static file server in [`server/index.ts`](file:///Users/josephnguyen/Desktop/KobeanAI-tracker/server/index.ts) routes SPA fallback requests to `index.html`.
4. Run `npm run build` to verify type safety before committing changes.
