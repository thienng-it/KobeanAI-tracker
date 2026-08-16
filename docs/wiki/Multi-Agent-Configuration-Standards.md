# Multi-Agent Configuration Standards

This article details how to configure skills, rules, and commands across **Google Antigravity**, **Claude Code**, **Cursor IDE**, and **GitHub Copilot**.

---

## 1. Directory Structure Comparison

```text
your-project/
├── .agents/                    # 🤖 Google Antigravity & Universal AI Standards
│   ├── skills/                 # Progressive disclosure skills (SKILL.md)
│   ├── rules/                  # Domain behavioral rules
│   ├── plugins/                # Bundled packages
│   └── hooks.json              # Lifecycle hooks
├── .claude/                    # 🧠 Anthropic Claude Code
│   ├── settings.json           # Permissions & tool approvals
│   └── skills/                 # Custom bash/prompt skills
├── .cursor/                    # ⚡ Cursor IDE
│   ├── rules/*.mdc             # Context-matched markdown rules
│   └── mcp.json                # Model Context Protocol servers
├── CLAUDE.md                   # Claude root directives & build commands
└── GEMINI.md                   # Antigravity root directives & standards
```

---

## 2. Progressive Disclosure Skill Format (`SKILL.md`)

```markdown
---
name: codegraph
description: >-
  Interactive dependency analysis tool for cross-module contract verification.
version: 1.0.0
author: Engineering Team
---

# Instructions
1. Inspect CODEGRAPH.md before modifying database schemas.
2. Verify all API routes match React store interfaces.
```
