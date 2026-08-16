import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Layers, 
  Bot, 
  ShieldCheck, 
  Sparkles, 
  Cpu, 
  Tag, 
  HelpCircle, 
  Copy, 
  Check, 
  ArrowLeft, 
  ChevronRight, 
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router';

interface WikiArticle {
  id: string;
  title: string;
  category: 'architecture' | 'agent-protocols' | 'standards' | 'security' | 'troubleshooting';
  summary: string;
  icon: React.ReactNode;
  tags: string[];
  readTime: string;
  content: string;
}

const WIKI_ARTICLES: WikiArticle[] = [
  {
    id: 'system-architecture',
    title: 'System Architecture & Local Data Flow',
    category: 'architecture',
    summary: 'Deep-dive into SQLite in WAL mode, event-driven transcript file watchers, and zero-telemetry exfiltration.',
    icon: <Layers size={18} color="var(--color-brand-primary)" />,
    tags: ['Architecture', 'SQLite', 'Express', 'Chokidar'],
    readTime: '4 min read',
    content: `
# System Architecture & Local-First Data Flow

KobeanAI Tracker is engineered from the ground up to be **100% Local-First, Private, and High-Throughput**.

## Core Engineering Principles
1. **Zero External Telemetry**: Your source code, API keys, and conversational transcripts never leave your machine.
2. **SQLite in WAL Mode**: SQLite operates with \`PRAGMA journal_mode = WAL\` for non-blocking concurrent reads and lightning-fast writes.
3. **Event-Driven File Watchers**: Uses Node.js \`chokidar\` to monitor local filesystem transcript changes without CPU-heavy polling loops.

\`\`\`mermaid
graph TD
    Transcript["Local Transcript (~/.gemini / ~/.claude / ~/.cursor)"] -->|File Mutation| Watcher["File Watcher (chokidar)"]
    Watcher -->|Stream Parsed Turns| Ingestion["Ingestion & Token Calculator"]
    Ingestion -->|WAL Write| DB[("SQLite Database")]
    DB --> Express["Express 5 REST API"]
    Express --> ReactUI["React 19 + Zustand Dashboard"]
\`\`\`

## High-Concurrency Database Layer
- Schema defined using **Drizzle ORM** with foreign-key relationships.
- Automated migrations and vacuum optimizations on startup.
- Full support for multi-workspace directory resolution.
    `
  },
  {
    id: 'agent-protocols',
    title: 'Agent Protocol & Progressive Disclosure Standards',
    category: 'agent-protocols',
    summary: 'How Google Antigravity, Claude Code, and Cursor load skills on-demand using YAML frontmatter.',
    icon: <Bot size={18} color="#4285f4" />,
    tags: ['Agents', 'Skills', 'YAML', 'Antigravity', 'Claude'],
    readTime: '5 min read',
    content: `
# Multi-Agent Configuration & Progressive Disclosure

Modern autonomous AI coding assistants require structured guidelines without overwhelming the LLM's active context window.

## The Principle of Progressive Disclosure
Instead of injecting 10,000 lines of documentation into every turn:
1. **Metadata Tier**: The agent only reads the skill's \`name\` and \`description\` from YAML frontmatter on initialization (~50 tokens per skill).
2. **Execution Tier**: When the model encounters a task that triggers the skill (or the user runs a slash command), the agent reads the full \`SKILL.md\` file on-demand.

## Universal \`SKILL.md\` Schema
Every skill managed by KobeanAI Tracker is written to disk in this standard format:

\`\`\`markdown
---
name: ponytail
description: >-
  Smart coding reasoning and anti-overengineering framework. Enforces YAGNI,
  standard library first, and native web capabilities.
version: 1.0.0
author: KobeanAI Tracker
---

# Instructions & Directives
1. Prefer built-ins before adding third-party npm packages.
2. Maintain documentation and code comments.
\`\`\`
    `
  },
  {
    id: 'ponytail-framework',
    title: 'Ponytail Anti-Overengineering Decision Ladder',
    category: 'standards',
    summary: 'The 6-step logical decision ladder to prevent AI hallucinations, bloated dependencies, and over-abstracted layers.',
    icon: <Sparkles size={18} color="#8b5cf6" />,
    tags: ['Ponytail', 'YAGNI', 'Decision Ladder', 'Best Practices'],
    readTime: '3 min read',
    content: `
# Ponytail Engineering & Anti-Overengineering Standards

AI models tend to over-engineer solutions by proposing complex design patterns or unnecessary npm packages. The **Ponytail Decision Ladder** acts as a strict guardrail:

## The 6-Step Decision Ladder
1. **Ladder Step 1 (YAGNI & Simplicity)**: Never build for speculative future needs. Implement the minimum clean code required for the current requirement.
2. **Ladder Step 2 (Standard Library First)**: Prefer language built-ins (\`URLSearchParams\`, \`fetch\`, \`crypto.randomUUID()\`, \`AbortController\`) over third-party utilities.
3. **Ladder Step 3 (Native Platform Capabilities)**: Use native CSS variables, grid/flexbox layouts, and browser APIs before adding UI widget libraries.
4. **Ladder Step 4 (Direct Implementations)**: Prefer a direct 10-line function over an external 50kb dependency.
5. **Ladder Step 5 (Clean Architecture & Contracts)**: Preserve strict separation of concerns between API routes, state stores, and React components.
6. **Ladder Step 6 (Zero Dead Code & Deprecations)**: Remove unused imports, dead variables, and legacy dependencies during refactoring.
    `
  },
  {
    id: 'taste-skill-motion',
    title: 'Taste-Skill Motion & UI Aesthetics Guide',
    category: 'standards',
    summary: 'Design tokens, cubic-bezier(0.16, 1, 0.3, 1) spring physics, glassmorphism panels, and theme-aware contrast.',
    icon: <Sparkles size={18} color="#ec4899" />,
    tags: ['UI/UX', 'Glassmorphism', 'Design Tokens', 'Motion'],
    readTime: '4 min read',
    content: `
# Taste-Skill UI/UX Design System

KobeanAI Tracker adheres to the **Taste-Skill Design System** for fluid, state-of-the-art developer tools.

## Key Motion & Style Tokens
- **Spring Curve Easing**: \`cubic-bezier(0.16, 1, 0.3, 1)\` provides responsive, natural spring motion for modals, toolbars, and card elevations.
- **Glassmorphic Surface**: \`rgba(17, 24, 39, 0.75)\` with \`backdrop-filter: blur(16px)\` and \`inset 0 1px 0 0 rgba(255, 255, 255, 0.08)\` highlight borders.
- **Keycap Badges**: Command triggers are styled with keycap pills (\`⌘ /command\`) using monospace typography and text truncation protection.
- **Light & Dark Theme Contrast**: All surface colors use semantic CSS variables (\`var(--color-bg-surface)\`, \`var(--color-text-primary)\`) ensuring zero contrast defects.
    `
  },
  {
    id: 'model-observability',
    title: 'Model Observability, Token Rates & Pricing',
    category: 'architecture',
    summary: 'Granular mathematical formulas for input tokens, output completions, subagent tool execution, and dollar cost projection.',
    icon: <Cpu size={18} color="#10b981" />,
    tags: ['Pricing', 'Tokens', 'Cost Calculator', 'Gemini', 'Claude'],
    readTime: '4 min read',
    content: `
# Model Observability & Token Math

KobeanAI Tracker computes real-time costs and token tallies from raw transcripts using exact model rate cards.

## Pricing Rate Card (Per 1 Million Tokens)
- **Google Gemini 3.7 / 2.0 / 1.5 Pro**: $1.25 Input • $5.00 Output
- **Anthropic Claude 3.7 / 3.5 Sonnet**: $3.00 Input • $15.00 Output
- **OpenAI GPT-4o**: $2.50 Input • $10.00 Output
- **OpenAI o1 / o3-mini**: $1.10 Input • $4.40 Output

## Cost Calculation Equation
\`\`\`text
Total Cost = (Input Tokens / 1,000,000 * Input Rate) + (Output Tokens / 1,000,000 * Output Rate)
\`\`\`

## Thinking Loops & Subagent Telemetry
When an agent spawns subagents or generates internal chain-of-thought traces, KobeanAI Tracker extracts thinking turns and attributes tool latency separately from user-facing completion output.
    `
  },
  {
    id: 'intent-taxonomy',
    title: 'Canonical Intent Taxonomy & Noise Filtering',
    category: 'standards',
    summary: 'TagService classification protocol: [Implement], [Fix], [Refactor], [UI/UX], [Docs], [Validate], [Config].',
    icon: <Tag size={18} color="#f59e0b" />,
    tags: ['Intent Taxonomy', 'Tagging', 'Telemetry', 'Classification'],
    readTime: '3 min read',
    content: `
# Canonical Intent Taxonomy & Classification Protocol

KobeanAI Tracker utilizes a 7-tier intent standard via \`TagService\` to classify every prompt turn while filtering transient noise:

## The 7 Intent Tags
1. **\`[Implement]\`** (Blue): Net-new feature development, scaffolding, and new API routes.
2. **\`[Fix]\`** (Red): Bug fixes, error handling, syntax resolutions, and regression patches.
3. **\`[Refactor]\`** (Purple): Code decoupling, architectural restructuring, and dead-code cleanup.
4. **\`[UI/UX]\`** (Pink): Frontend styling, animations, themes, and accessibility improvements.
5. **\`[Docs]\`** (Emerald): Documentation, README files, walkthroughs, and inline docstrings.
6. **\`[Validate]\`** (Amber): Unit tests, end-to-end suites, typechecks, and CI pipeline checks.
7. **\`[Config]\`** (Slate): Package dependencies, Docker manifests, environment configs.

## Noise Filter Rule
Prompt queries consisting solely of conversational pleasantries ("thanks", "ok", "proceed") are filtered from category analytics to ensure pristine reporting.
    `
  },
  {
    id: 'secret-leak-security',
    title: 'Secret Leak Prevention & Betterleak Protocol',
    category: 'security',
    summary: 'Active secret scanning patterns protecting OpenAI, Anthropic, Gemini, AWS, and GitHub tokens.',
    icon: <ShieldCheck size={18} color="#ef4444" />,
    tags: ['Security', 'Betterleak', 'API Keys', 'Pre-Commit'],
    readTime: '3 min read',
    content: `
# Secret Leak Prevention (\`.betterleak\`)

To safeguard your API credentials when working with AI agents across open-source or private repositories:

## Active Scanning Regex Patterns
\`\`\`bash
# Google Gemini API Key
AIzaSy[0-9A-Za-z_-]{33}

# Anthropic Claude API Key
sk-ant-[a-zA-Z0-9_-]{20,}

# OpenAI API Key
sk-[a-zA-Z0-9]{32,}
\`\`\`

## Automated Pre-Commit Hook Installation
Add this pre-commit hook into your repository to prevent accidental credential commits:

\`\`\`bash
cat << 'EOF' > .git/hooks/pre-commit
#!/bin/sh
echo "🔍 Running .betterleak secret scan..."
git diff --cached | grep -E "(AIzaSy[0-9A-Za-z_-]{33}|sk-ant-[a-zA-Z0-9_-]{20,}|sk-[a-zA-Z0-9]{32,})"
if [ $? -eq 0 ]; then
  echo "❌ Sensitive API token detected in staged files! Aborting commit."
  exit 1
fi
echo "✅ No sensitive secrets detected."
EOF
chmod +x .git/hooks/pre-commit
\`\`\`
    `
  },
  {
    id: 'mcp-servers-tools',
    title: 'Model Context Protocol (MCP) Server & Tool Architecture',
    category: 'architecture',
    summary: 'Connecting AI assistants to external databases, web tools, cloud services, and custom subprocess CLI tools.',
    icon: <Cpu size={18} color="#3b82f6" />,
    tags: ['MCP', 'Tools', 'JSON-RPC', 'Postgres', 'GitHub'],
    readTime: '4 min read',
    content: `
# Model Context Protocol (MCP) Hub

The **Model Context Protocol (MCP)** is the open standard that connects LLMs to real-time tools, internal APIs, and local development environments.

## Architecture & Configuration
KobeanAI Tracker manages MCP configurations across two complementary scopes:
1. **Workspace Scope (\`.agents/mcp_config.json\`)**: Project-level servers shared across team members.
2. **Global Scope (\`~/.gemini/antigravity-ide/mcp/\`)**: Workstation-wide tools, lazily-loaded tool schemas, and environment credentials.

## Supported MCP Tool Transports
- **STDIO Process Transport**: Runs local commands via \`npx\` or binary execution with JSON-RPC over stdin/stdout.
- **SSE (Server-Sent Events)**: Real-time event streaming for cloud-hosted MCP endpoints.

## 1-Click Installation Catalog
KobeanAI Tracker includes verified templates for PostgreSQL, GitHub, Puppeteer browser automation, Local Filesystem, Sequential Thinking / Memory, and Fetch.
    `
  },
  {
    id: 'plugins-extensions',
    title: 'Plugins & Modular Extension Bundles',
    category: 'agent-protocols',
    summary: 'Encapsulating progressive disclosure skills, subagent configurations, and MCP servers into reusable plugin bundles.',
    icon: <Sparkles size={18} color="#ec4899" />,
    tags: ['Plugins', 'Extensions', 'Modular', 'Bundles', 'Manifest'],
    readTime: '3 min read',
    content: `
# Modular Plugins & Capability Bundles

Plugins provide a declarative way to package skills, subagents, and MCP servers into portable modules.

## Plugin Directory Structure
\`\`\`text
.agents/plugins/<plugin_name>/
├── plugin.json       # Declarative manifest (name, version, author, description)
├── skills/           # Skill folders containing SKILL.md instructions
├── agents/           # Specialized subagent definitions
└── mcp_config.json   # Optional MCP tool server bindings
\`\`\`

## Plugin Discovery Lifecycle
1. **On Boot**: \`PluginScanner.syncAll()\` reads both workspace (\`.agents/plugins/\`) and global plugin directories.
2. **Dynamic Ingestion**: KobeanAI Tracker extracts bundled skills, tool schemas, and capabilities into SQLite.
3. **Workspace Scaffolding**: Create custom plugins directly from the UI with automatic disk synchronization.
    `
  },
  {
    id: 'lifecycle-hooks-guards',
    title: 'Lifecycle Hooks & Safety Guardrails',
    category: 'security',
    summary: 'Intercepting agent actions at PreToolUse, PostToolUse, and SessionStart with subprocess testing and pre-commit secret scanners.',
    icon: <ShieldCheck size={18} color="#f59e0b" />,
    tags: ['Hooks', 'Safety', 'PreToolUse', 'Guards', 'Simulation'],
    readTime: '4 min read',
    content: `
# Lifecycle Hooks & Safety Guardrails

Autonomous coding agents can execute shell commands, edit files, and make web requests. **Lifecycle Hooks** allow developers to enforce safety constraints, auto-format code, and inject workspace context.

## Supported Lifecycle Event Triggers
- **\`PreToolUse\`**: Intercepts tool calls before execution. Hook scripts can return \`{"decision": "allow"}\`, \`{"decision": "deny", "reason": "..."}\`, or \`{"decision": "modify"}\`.
- **\`PostToolUse\`**: Executes immediately after a tool finishes (e.g., auto-formatting code with ESLint after \`write_to_file\`).
- **\`SessionStart\`**: Injects repository context, git branch status, and active issues at the beginning of a turn.
- **\`PreCommit\`**: Validates secrets and code health before commits.

## Testing in the Interactive Simulator
KobeanAI Tracker features a real-time **Hook Simulator Sandbox** where you can test destructive command filters, fork-bomb blocks, and file guards with mock payloads before enabling them live in production.
    `
  },
  {
    id: 'agent-memory-knowledge-bank',
    title: 'Agent Long-Term Memory & Context Budgeting',
    category: 'agent-protocols',
    summary: 'How AI agents recall past decisions, store failure gotchas, and manage active context window token budgets.',
    icon: <Sparkles size={18} color="#10b981" />,
    tags: ['Memory', 'Context Window', 'Knowledge Bank', 'Token Budget', 'Gotchas'],
    readTime: '4 min read',
    content: `
# AI Agent Memory & Knowledge Bank

Autonomous AI coding agents need structured, persistent memory to retain project standards across sessions without consuming massive LLM context windows.

## Memory Architecture & Storage
1. **Workspace Memory (\`.agents/memory/MEMORY.md\`)**: Human-readable Markdown file committed to git containing architecture decisions, gotchas, and conventions.
2. **Serialized Directives (\`.agents/memories.json\`)**: JSON-encoded directives with priority flags, category taxonomy, and estimated token counts.
3. **Global Knowledge Items (\`~/.gemini/antigravity-ide/knowledge/\`)**: Workstation-wide knowledge items learned from task interactions.

## Context Budgeting & Pinned Directives
- **Pinned Memories**: Automatically prioritized and injected into LLM prompt turns (e.g. Critical security rules).
- **Token Budget Gauge**: Tracks total memory footprint against recommended headroom (16k token limit).
- **Relevance Simulator**: Evaluates query terms and semantic tags to simulate real-time agent memory retrieval.
    `
  },
  {
    id: 'troubleshooting-faq',
    title: 'Troubleshooting & Frequently Asked Questions',
    category: 'troubleshooting',
    summary: 'Common setup questions, transcript location mapping, port configuration, and manual synchronization.',
    icon: <HelpCircle size={18} color="#64748b" />,
    tags: ['FAQ', 'Troubleshooting', 'Ports', 'Transcripts'],
    readTime: '4 min read',
    content: `
# Troubleshooting & Frequently Asked Questions

## Q: Why are my sessions not appearing on the Dashboard?
1. Click **"Sync Logs"** on the Sessions page or **"Sync"** in the top header.
2. Verify that your AI assistant is writing transcripts to local default paths:
   - Google Antigravity: \`~/.gemini/antigravity-ide/brain/\`
   - Claude Code: \`~/.claude/transcripts/\`
   - Cursor: \`~/.cursor/logs/\`

## Q: How do I change the backend port?
By default, the backend API runs on port \`3000\` and the frontend on port \`5173\`. You can customize this by setting \`PORT=3001\` in your \`.env\` file.

## Q: How do I backup or reset my SQLite telemetry database?
The SQLite database is stored locally at \`./sqlite.db\`. To reset all telemetry, simply delete \`sqlite.db\` (and associated \`-wal\` / \`-shm\` files) and restart the server; it will automatically recreate fresh tables with WAL mode enabled.
    `
  }
];

export default function WikiPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeArticle, setActiveArticle] = useState<WikiArticle | null>(null);
  const [copiedSection, setCopiedSection] = useState(false);

  const filteredArticles = WIKI_ARTICLES.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCopyContent = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(true);
      setTimeout(() => setCopiedSection(false), 2000);
    } catch (e) {
      console.error('Failed to copy wiki text:', e);
    }
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '6px', 
          padding: '4px 12px', 
          borderRadius: 'var(--radius-full)', 
          backgroundColor: 'rgba(59, 130, 246, 0.1)', 
          border: '1px solid rgba(59, 130, 246, 0.25)', 
          color: 'var(--color-brand-primary)', 
          fontSize: 'var(--text-xs)', 
          fontWeight: 600, 
          marginBottom: 'var(--space-2)' 
        }}>
          <BookOpen size={14} />
          <span>Knowledge Base & Wiki</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h1 className="text-3xl" style={{ margin: '0 0 var(--space-2)' }}>KobeanAI Engineering Wiki</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
              Architecture specifications, prompt engineering guidelines, telemetry mathematical formulas, and developer runbooks.
            </p>
          </div>
          <button
            onClick={() => navigate('/docs')}
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Quick Start Docs</span>
            <ExternalLink size={13} />
          </button>
        </div>
      </header>

      {/* If an article is selected, show Article Reader */}
      {activeArticle ? (
        <div className="animate-slide-up">
          {/* Breadcrumb & Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <button
              onClick={() => setActiveArticle(null)}
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px' }}
            >
              <ArrowLeft size={14} />
              <span>Back to Articles</span>
            </button>
            <button
              onClick={() => handleCopyContent(activeArticle.content)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: copiedSection ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-bg-surface-hover)',
                border: `1px solid ${copiedSection ? '#10b981' : 'var(--color-border-subtle)'}`,
                color: copiedSection ? '#10b981' : 'var(--color-text-primary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {copiedSection ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedSection ? 'Copied Markdown' : 'Copy Article'}</span>
            </button>
          </div>

          {/* Article Viewer Frame */}
          <div className="glass-panel" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-brand-primary)',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                padding: '3px 9px',
                borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase'
              }}>
                {activeArticle.category}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{activeArticle.readTime}</span>
            </div>

            <h2 className="text-2xl" style={{ margin: '0 0 var(--space-4)', fontWeight: 700 }}>
              {activeArticle.title}
            </h2>

            {/* Tags */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 'var(--space-4)' }}>
              {activeArticle.tags.map(t => (
                <span 
                  key={t}
                  style={{
                    fontSize: '0.6875rem',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: 'var(--color-bg-surface-hover)',
                    color: 'var(--color-text-secondary)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border-subtle)'
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>

            {/* Article Content Monospace / Markdown Box */}
            <div style={{
              fontSize: '0.875rem',
              lineHeight: 1.7,
              color: 'var(--color-text-primary)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'var(--font-sans)'
            }}>
              {activeArticle.content.trim()}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
              <input 
                type="text" 
                placeholder="Search wiki articles by topic, keywords, or tags..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border-subtle)',
                  padding: '9px 14px 9px 40px',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color var(--duration-fast) ease'
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-brand-primary)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-subtle)'; }}
              />
            </div>

            {/* Category Filter Chips */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Articles' },
                { id: 'architecture', label: 'Architecture' },
                { id: 'agent-protocols', label: 'Agent Protocols' },
                { id: 'standards', label: 'Standards' },
                { id: 'security', label: 'Security' },
                { id: 'troubleshooting', label: 'FAQ' },
              ].map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${isActive ? 'var(--color-brand-primary)' : 'var(--color-border-subtle)'}`,
                      backgroundColor: isActive ? 'rgba(59, 130, 246, 0.12)' : 'var(--color-bg-surface)',
                      color: isActive ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all var(--duration-fast) ease'
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid of Wiki Article Cards */}
          {filteredArticles.length === 0 ? (
            <div className="glass-panel" style={{ padding: 'var(--space-12)', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
              <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: '1rem', fontWeight: 600 }}>No articles found</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
                No wiki articles match "{searchQuery}". Try searching for another topic.
              </p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', 
              gap: 'var(--space-5)' 
            }}>
              {filteredArticles.map(article => (
                <div 
                  key={article.id}
                  onClick={() => setActiveArticle(article)}
                  className="glass-panel interactive-card"
                  style={{
                    padding: 'var(--space-5)',
                    borderRadius: 'var(--radius-xl)',
                    backgroundColor: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 'var(--space-4)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg-surface-hover)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--color-border-subtle)'
                      }}>
                        {article.icon}
                      </div>

                      <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
                        {article.readTime}
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 var(--space-2) 0', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {article.title}
                    </h3>

                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                      {article.summary}
                    </p>
                  </div>

                  <div>
                    {/* Tags & Action Link */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-3)' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {article.tags.slice(0, 2).map(t => (
                          <span 
                            key={t}
                            style={{
                              fontSize: '0.625rem',
                              fontFamily: 'var(--font-mono)',
                              backgroundColor: 'var(--color-bg-surface-hover)',
                              color: 'var(--color-text-tertiary)',
                              padding: '1px 6px',
                              borderRadius: 'var(--radius-sm)'
                            }}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-brand-primary)', fontSize: '0.75rem', fontWeight: 600 }}>
                        <span>Read Article</span>
                        <ChevronRight size={13} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
