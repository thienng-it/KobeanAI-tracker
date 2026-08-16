# Canonical Intent Taxonomy & Classification Protocol

KobeanAI Tracker utilizes a 7-tier canonical intent taxonomy via `TagService` to categorize interaction turns and filter conversational noise.

---

## 1. The 7 Intent Categories

| Intent Tag | Category | Scope & Purpose |
| :--- | :--- | :--- |
| `[Implement]` | Feature Creation | Net-new feature development, API scaffolding, endpoint creation. |
| `[Fix]` | Defect Resolution | Bug fixes, syntax errors, edge case handling, regression patches. |
| `[Refactor]` | Architecture | Code restructuring, decoupling, DRY cleanup, dead-code removal. |
| `[UI/UX]` | Frontend Design | Styling, CSS design tokens, glassmorphism, animations, a11y. |
| `[Docs]` | Documentation | README updates, wikis, inline docstrings, walkthroughs. |
| `[Validate]` | Quality Assurance | Unit tests, integration suites, linting, CI/CD pipeline checks. |
| `[Config]` | Infrastructure | Build manifests, package updates, Docker configurations, `.env`. |

---

## 2. Multi-Repo Bracketed Tagging Syntax

You can explicitly tag your prompts when switching between repositories:

```text
[repo:facebook/react][issue-1024][Fix] Fix concurrent reconciliation bug
```

`TagService` automatically extracts:
* **Repository**: `facebook/react`
* **Issue Identifier**: `issue-1024`
* **Intent**: `[Fix]`
