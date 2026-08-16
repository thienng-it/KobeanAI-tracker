import { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  BookOpen, 
  Key, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Terminal, 
  Layers, 
  Bot, 
  Lock, 
  ArrowRight, 
  Tag, 
  FolderGit2,
  ExternalLink,
  Boxes,
  Puzzle,
  Brain
} from 'lucide-react';

export default function DocsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tokens' | 'agents' | 'mcps' | 'extensions' | 'memory' | 'taxonomy' | 'telemetry' | 'security' | 'frameworks'>('tokens');

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '1280px', margin: '0 auto' }}>
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
          <span>User & Contributor Guide</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h1 className="text-3xl" style={{ margin: '0 0 var(--space-2)' }}>Documentation & Architecture Guide</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
              Comprehensive references for AI agent connectors, filesystem synchronization, model observability, and local privacy.
            </p>
          </div>
          <button
            onClick={() => navigate('/wiki')}
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Open Knowledge Wiki</span>
            <ExternalLink size={13} />
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--space-2)', 
        borderBottom: '1px solid var(--color-border-subtle)', 
        marginBottom: 'var(--space-6)', 
        overflowX: 'auto', 
        paddingBottom: 'var(--space-2)' 
      }}>
        {[
          { id: 'tokens', label: 'API Tokens & Connection', icon: <Key size={16} /> },
          { id: 'agents', label: 'Multi-Agent Folder Architectures', icon: <FolderGit2 size={16} /> },
          { id: 'mcps', label: 'MCP Servers & Tools', icon: <Boxes size={16} /> },
          { id: 'extensions', label: 'Plugins & Lifecycle Hooks', icon: <Puzzle size={16} /> },
          { id: 'memory', label: 'Agent Memory & Knowledge Bank', icon: <Brain size={16} /> },
          { id: 'taxonomy', label: 'Intent Taxonomy & Tagging', icon: <Tag size={16} /> },
          { id: 'telemetry', label: 'Model Observability & Costs', icon: <Zap size={16} /> },
          { id: 'security', label: 'Secret Leaks (.betterleak)', icon: <ShieldCheck size={16} /> },
          { id: 'frameworks', label: 'Ponytail & Taste-Skill', icon: <Sparkles size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-lg)',
              border: 'none',
              backgroundColor: activeTab === tab.id ? 'var(--color-brand-primary)' : 'transparent',
              color: activeTab === tab.id ? '#ffffff' : 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all var(--duration-fast) var(--ease-spring-snappy)'
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-slide-up">
        {/* Tab 1: API Tokens & Ingestion */}
        {activeTab === 'tokens' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                <h2 className="text-xl" style={{ margin: 0 }}>1. Local-First Transcript Ingestion</h2>
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '3px 10px', 
                  borderRadius: 'var(--radius-full)', 
                  backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                  border: '1px solid rgba(16, 185, 129, 0.25)', 
                  color: 'var(--color-status-success-text)', 
                  fontSize: 'var(--text-xs)', 
                  fontWeight: 600 
                }}>
                  <Lock size={12} />
                  <span>100% Local-First Privacy</span>
                </div>
              </div>

              <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: 'var(--space-5)' }}>
                KobeanAI Tracker operates on a strict <strong>Local-First Architecture</strong>. You do <em>not</em> need to send your private code, prompts, or API keys to third-party cloud trackers. KobeanAI Tracker passively monitors local transcript outputs generated directly on your workstation:
              </p>

              {/* Ingestion Sources Cards Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                gap: 'var(--space-4)', 
                marginBottom: 'var(--space-4)' 
              }}>
                {/* 1. Google Antigravity */}
                <div className="interactive-card" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-bg-surface-hover)', border: '1px solid var(--color-border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(66, 133, 244, 0.15)', color: '#4285f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Bot size={16} />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: '#4285f4' }}>Google Antigravity</span>
                      </div>
                      <span style={{ fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(66, 133, 244, 0.12)', color: '#60a5fa', fontWeight: 600 }}>Active Stream</span>
                    </div>
                    <p style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                      Monitors real-time session transcripts, thinking iterations, and subagent tool executions.
                    </p>
                  </div>
                  <div style={{ backgroundColor: '#0d1117', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8', overflowWrap: 'anywhere' }}>
                      ~/.gemini/antigravity-ide/brain/&lt;id&gt;/.system_generated/logs/transcript.jsonl
                    </code>
                  </div>
                </div>

                {/* 2. Claude Code */}
                <div className="interactive-card" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-bg-surface-hover)', border: '1px solid var(--color-border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(217, 119, 87, 0.15)', color: '#d97757', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Terminal size={16} />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: '#d97757' }}>Claude Code & Desktop</span>
                      </div>
                      <span style={{ fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(217, 119, 87, 0.12)', color: '#fb923c', fontWeight: 600 }}>Auto-Detect</span>
                    </div>
                    <p style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                      Parses conversational turn histories, token tallies, and bash execution traces.
                    </p>
                  </div>
                  <div style={{ backgroundColor: '#0d1117', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8', overflowWrap: 'anywhere' }}>
                      ~/.claude/transcripts/*.jsonl
                    </code>
                  </div>
                </div>

                {/* 3. Cursor IDE */}
                <div className="interactive-card" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-bg-surface-hover)', border: '1px solid var(--color-border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(147, 51, 234, 0.15)', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Layers size={16} />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: '#9333ea' }}>Cursor IDE & Codex</span>
                      </div>
                      <span style={{ fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(147, 51, 234, 0.12)', color: '#c084fc', fontWeight: 600 }}>Workspace Sync</span>
                    </div>
                    <p style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                      Tracks multi-file edits, indexing logs, and model interactions across workspace roots.
                    </p>
                  </div>
                  <div style={{ backgroundColor: '#0d1117', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8', overflowWrap: 'anywhere' }}>
                      ~/.cursor/logs / workspace state.vscdb
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Key Settings */}
            <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
              <h2 className="text-xl" style={{ margin: '0 0 var(--space-3)' }}>2. Managing API Provider Keys</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: 'var(--space-4)' }}>
                Configure and test your AI provider credentials directly in the app. Keys are encrypted and stored exclusively in your local database:
              </p>
              <button
                onClick={() => navigate('/settings/agents')}
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Key size={14} />
                <span>Open API Key Settings Vault</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Multi-Agent Folder Architectures */}
        {activeTab === 'agents' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
              <h2 className="text-xl" style={{ margin: '0 0 var(--space-3)' }}>Cross-Platform Agent Configuration Matrix</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: 'var(--space-5)' }}>
                Every major AI coding assistant has converged on a local, Git-tracked folder structure. KobeanAI Tracker bridges these formats automatically:
              </p>

              <div style={{ overflowX: 'auto', marginBottom: 'var(--space-6)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-surface-hover)' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>Assistant / IDE</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>Configuration Path</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>Root Rules</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>Progressive Skills</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#4285f4' }}>Google Antigravity</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>.agents/</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>GEMINI.md, AGENTS.md</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>.agents/skills/&lt;name&gt;/SKILL.md</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#d97757' }}>Claude Code (Anthropic)</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>.claude/</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>CLAUDE.md</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>.claude/skills/, commands/</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#9333ea' }}>Cursor IDE</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>.cursor/</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>.cursorrules</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>.cursor/rules/*.mdc</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#10b981' }}>GitHub Copilot</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>.github/</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>copilot-instructions.md</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>-</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Anatomy of SKILL.md */}
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Anatomy of a Progressive Disclosure Skill (`SKILL.md`)</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
                Skills use YAML frontmatter so agents only load the name and description into memory initially, reserving full token context for actual activation:
              </p>
              <div style={{ backgroundColor: '#0d1117', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#e6edf3', lineHeight: 1.6 }}>
                <span style={{ color: '#ff7b72' }}>---</span><br />
                <span style={{ color: '#79c0ff' }}>name:</span> <span style={{ color: '#a5d6ff' }}>ponytail</span><br />
                <span style={{ color: '#79c0ff' }}>description:</span> <span style={{ color: '#a5d6ff' }}>Smart coding reasoning and anti-overengineering framework. Enforces YAGNI and standard library first.</span><br />
                <span style={{ color: '#ff7b72' }}>---</span><br /><br />
                <span style={{ color: '#8b949e' }}># Ponytail Engineering Standards</span><br />
                <span style={{ color: '#8b949e' }}>Always apply the 6-step Decision Ladder before installing third-party npm packages...</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab: MCP Servers & Tools */}
        {activeTab === 'mcps' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
              <h2 className="text-xl" style={{ margin: '0 0 var(--space-3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Boxes size={20} color="var(--color-brand-primary)" />
                Model Context Protocol (MCP) Management Hub
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: 'var(--space-5)' }}>
                The Model Context Protocol (MCP) standardizes how AI coding assistants connect to external tools, databases, web browsers, and cloud resources. KobeanAI Tracker provides an integrated server manager, tool schema inspector, live subprocess health tester, and 1-click catalog.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div className="glass-panel" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                  <h3 style={{ margin: '0 0 var(--space-2)', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-brand-primary)' }}>
                    Workspace Scope (.agents/mcp_config.json)
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    Configures project-specific tool servers committed alongside the codebase for all team members.
                  </p>
                </div>
                <div className="glass-panel" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                  <h3 style={{ margin: '0 0 var(--space-2)', fontSize: '0.9375rem', fontWeight: 600, color: '#8b5cf6' }}>
                    Global Scope (~/.gemini/antigravity-ide/mcp/)
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    Manages developer workstation MCP servers and lazily-loaded tool schemas available across all workspaces.
                  </p>
                </div>
                <div className="glass-panel" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                  <h3 style={{ margin: '0 0 var(--space-2)', fontSize: '0.9375rem', fontWeight: 600, color: '#10b981' }}>
                    1-Click Verified Catalog
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    Install standard MCP servers (Postgres, GitHub, Puppeteer, Filesystem, Memory, Fetch) with zero manual JSON formatting.
                  </p>
                </div>
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 var(--space-3)' }}>Example MCP Configuration (.agents/mcp_config.json)</h3>
              <div style={{ backgroundColor: '#0d1117', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#e6edf3', lineHeight: 1.5 }}>
                <span style={{ color: '#ff7b72' }}>&#123;</span><br />
                &nbsp;&nbsp;<span style={{ color: '#79c0ff' }}>"mcpServers"</span>: <span style={{ color: '#ff7b72' }}>&#123;</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#79c0ff' }}>"postgres"</span>: <span style={{ color: '#ff7b72' }}>&#123;</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#79c0ff' }}>"command"</span>: <span style={{ color: '#a5d6ff' }}>"npx"</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#79c0ff' }}>"args"</span>: [<span style={{ color: '#a5d6ff' }}>"-y"</span>, <span style={{ color: '#a5d6ff' }}>"@modelcontextprotocol/server-postgres"</span>, <span style={{ color: '#a5d6ff' }}>"postgresql://localhost/mydb"</span>]<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#ff7b72' }}>&#125;</span><br />
                &nbsp;&nbsp;<span style={{ color: '#ff7b72' }}>&#125;</span><br />
                <span style={{ color: '#ff7b72' }}>&#125;</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Plugins & Lifecycle Hooks */}
        {activeTab === 'extensions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
              <h2 className="text-xl" style={{ margin: '0 0 var(--space-3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Puzzle size={20} color="#ec4899" />
                Modular Plugins & Lifecycle Safety Guards
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: 'var(--space-5)' }}>
                KobeanAI Tracker provides full support for modular plugin packages and event-driven lifecycle intercepts to guard agent execution safely.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div className="glass-panel" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                  <h3 style={{ margin: '0 0 var(--space-2)', fontSize: '0.9375rem', fontWeight: 600, color: '#ec4899' }}>
                    1. Plugin Bundles (.agents/plugins/*/)
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 var(--space-2)' }}>
                    Encapsulate skills, subagents, and custom configurations inside namespaced directories with a declarative <code style={{ fontFamily: 'var(--font-mono)' }}>plugin.json</code> manifest.
                  </p>
                </div>
                <div className="glass-panel" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                  <h3 style={{ margin: '0 0 var(--space-2)', fontSize: '0.9375rem', fontWeight: 600, color: '#f59e0b' }}>
                    2. Lifecycle Hooks (.agents/hooks.json)
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 var(--space-2)' }}>
                    Intercept agent actions before tool execution (<code style={{ fontFamily: 'var(--font-mono)' }}>PreToolUse</code>), after execution (<code style={{ fontFamily: 'var(--font-mono)' }}>PostToolUse</code>), on session boot (<code style={{ fontFamily: 'var(--font-mono)' }}>SessionStart</code>), or on Git commit.
                  </p>
                </div>
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 var(--space-3)' }}>Safety Gate Hook Architecture (.agents/hooks.json)</h3>
              <div style={{ backgroundColor: '#0d1117', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#e6edf3', lineHeight: 1.5 }}>
                <span style={{ color: '#8b949e' }}>// Intercepts destructive terminal commands and denies execution automatically</span><br />
                <span style={{ color: '#ff7b72' }}>&#123;</span><br />
                &nbsp;&nbsp;<span style={{ color: '#79c0ff' }}>"safety-gate"</span>: <span style={{ color: '#ff7b72' }}>&#123;</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#79c0ff' }}>"enabled"</span>: <span style={{ color: '#ff7b72' }}>true</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#79c0ff' }}>"PreToolUse"</span>: [<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#ff7b72' }}>&#123;</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#79c0ff' }}>"matcher"</span>: <span style={{ color: '#a5d6ff' }}>"run_command"</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#79c0ff' }}>"hooks"</span>: [<span style={{ color: '#ff7b72' }}>&#123;</span> <span style={{ color: '#79c0ff' }}>"type"</span>: <span style={{ color: '#a5d6ff' }}>"command"</span>, <span style={{ color: '#79c0ff' }}>"command"</span>: <span style={{ color: '#a5d6ff' }}>"node scripts/safety-gate.js"</span> <span style={{ color: '#ff7b72' }}>&#123;</span>]<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#ff7b72' }}>&#125;</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;]<br />
                &nbsp;&nbsp;<span style={{ color: '#ff7b72' }}>&#125;</span><br />
                <span style={{ color: '#ff7b72' }}>&#125;</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Agent Memory & Knowledge Bank */}
        {activeTab === 'memory' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
              <h2 className="text-xl" style={{ margin: '0 0 var(--space-3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Brain size={20} color="var(--color-brand-primary)" />
                AI Agent Long-Term Memory & Context Budgeting
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: 'var(--space-5)' }}>
                Autonomous coding agents need persistent memory across sessions to avoid repeating past mistakes, respect team conventions, and maintain codebase architecture standards. KobeanAI Tracker introduces a local-first Knowledge Bank with real-time context token budgeting.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div className="glass-panel" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                  <h3 style={{ margin: '0 0 var(--space-2)', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-brand-primary)' }}>
                    1. Workspace Memory (.agents/memory/MEMORY.md)
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    Architectural directives, fail-safes, and lessons learned formatted in clean Markdown and shared with the repository.
                  </p>
                </div>
                <div className="glass-panel" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                  <h3 style={{ margin: '0 0 var(--space-2)', fontSize: '0.9375rem', fontWeight: 600, color: '#ec4899' }}>
                    2. Pinned Directives & Priorities
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    Mark critical security rules and standards as Pinned to prioritize them in the active LLM context window.
                  </p>
                </div>
                <div className="glass-panel" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                  <h3 style={{ margin: '0 0 var(--space-2)', fontSize: '0.9375rem', fontWeight: 600, color: '#f59e0b' }}>
                    3. Interactive Context Simulator
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    Test prompt queries against the memory bank to verify relevance ranking and token footprint before execution.
                  </p>
                </div>
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 var(--space-3)' }}>Serialized Memory Standard (.agents/memories.json)</h3>
              <div style={{ backgroundColor: '#0d1117', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#e6edf3', lineHeight: 1.5 }}>
                <span style={{ color: '#ff7b72' }}>[</span><br />
                &nbsp;&nbsp;<span style={{ color: '#ff7b72' }}>&#123;</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#79c0ff' }}>"title"</span>: <span style={{ color: '#a5d6ff' }}>"Local-First Zero Telemetry Protocol"</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#79c0ff' }}>"category"</span>: <span style={{ color: '#a5d6ff' }}>"gotchas"</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#79c0ff' }}>"priority"</span>: <span style={{ color: '#a5d6ff' }}>"critical"</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#79c0ff' }}>"pinned"</span>: <span style={{ color: '#79c0ff' }}>true</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#79c0ff' }}>"content"</span>: <span style={{ color: '#a5d6ff' }}>"Never transmit source code or API keys outside the local machine..."</span><br />
                &nbsp;&nbsp;<span style={{ color: '#ff7b72' }}>&#125;</span><br />
                <span style={{ color: '#ff7b72' }}>]</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Intent Taxonomy & Tagging */}
        {activeTab === 'taxonomy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
              <h2 className="text-xl" style={{ margin: '0 0 var(--space-3)' }}>Canonical Intent Taxonomy Standard</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: 'var(--space-5)' }}>
                KobeanAI Tracker utilizes a 7-category intent standard to classify every interaction turn and session while filtering transient noise:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                {[
                  { tag: '[Implement]', color: '#3b82f6', desc: 'Net-new feature development, scaffolding, endpoint creation.' },
                  { tag: '[Fix]', color: '#ef4444', desc: 'Bug fixes, regression resolutions, error handling.' },
                  { tag: '[Refactor]', color: '#8b5cf6', desc: 'Code restructuring, decoupling, DRY cleanup without altering behavior.' },
                  { tag: '[UI/UX]', color: '#ec4899', desc: 'Frontend styling, glassmorphism, animations, accessibility (a11y).' },
                  { tag: '[Docs]', color: '#10b981', desc: 'Documentation, README updates, code comments, wikis.' },
                  { tag: '[Validate]', color: '#f59e0b', desc: 'Unit tests, integration suites, CI/CD verification, lint checks.' },
                  { tag: '[Config]', color: '#64748b', desc: 'Build configurations, Dockerfiles, package updates, .env setups.' },
                ].map((item, idx) => (
                  <div key={idx} className="glass-panel" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                    <span style={{
                      display: 'inline-block',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      color: item.color,
                      backgroundColor: `${item.color}15`,
                      border: `1px solid ${item.color}40`,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '6px'
                    }}>
                      {item.tag}
                    </span>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Model Observability & Telemetry */}
        {activeTab === 'telemetry' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
              <h2 className="text-xl" style={{ margin: '0 0 var(--space-3)' }}>Model Registry & Pricing Engine</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: 'var(--space-5)' }}>
                Granular pricing calculations for all major AI models across prompt input tokens, output completions, cached reads, and thinking iterations:
              </p>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-surface-hover)' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>Model Name</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>Provider</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>Input Rate ($/1M)</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>Output Rate ($/1M)</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>Context Window</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>Gemini 1.5 / 2.0 / 3.7 Pro</td>
                      <td style={{ padding: '10px 14px' }}>Google</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>$1.25</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>$5.00</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>2,000,000 tokens</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>Claude 3.5 / 3.7 Sonnet</td>
                      <td style={{ padding: '10px 14px' }}>Anthropic</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>$3.00</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>$15.00</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>200,000 tokens</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>GPT-4o</td>
                      <td style={{ padding: '10px 14px' }}>OpenAI</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>$2.50</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>$10.00</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>128,000 tokens</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Secret Leaks (.betterleak) */}
        {activeTab === 'security' && (
          <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
            <h2 className="text-xl" style={{ margin: '0 0 var(--space-3)' }}>Secret Leak Prevention (`.betterleak`)</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: 'var(--space-4)' }}>
              <code style={{ color: '#ef4444', fontFamily: 'var(--font-mono)' }}>.betterleak</code> monitors your codebase before commits, pushes, and CI builds to prevent exposing sensitive credentials:
            </p>
            <div style={{ backgroundColor: '#0d1117', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#e6edf3' }}>
              git diff --cached | grep -E "(AIzaSy[0-9A-Za-z_-]&#123;33&#125;|sk-ant-[a-zA-Z0-9_-]&#123;20,&#125;|sk-[a-zA-Z0-9]&#123;32,&#125;)"
            </div>
          </div>
        )}

        {/* Tab 6: Frameworks */}
        {activeTab === 'frameworks' && (
          <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
            <h2 className="text-xl" style={{ margin: '0 0 var(--space-3)' }}>Ponytail & Taste-Skill Standards</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: 'var(--space-4)' }}>
              Two core engineering and design frameworks power KobeanAI Tracker:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
              <div className="glass-panel" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ margin: '0 0 var(--space-2)', fontSize: '1rem', color: 'var(--color-brand-primary)' }}>Ponytail Decision Ladder</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  1. YAGNI • 2. Standard Library First • 3. Native Web Capabilities • 4. Clean Architecture • 5. Zero Dead Packages.
                </p>
              </div>
              <div className="glass-panel" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ margin: '0 0 var(--space-2)', fontSize: '1rem', color: '#ec4899' }}>Taste-Skill Motion & UI</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  Spring curve <code style={{ fontFamily: 'var(--font-mono)' }}>cubic-bezier(0.16, 1, 0.3, 1)</code>, glassmorphism panels, and high-contrast typography.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
