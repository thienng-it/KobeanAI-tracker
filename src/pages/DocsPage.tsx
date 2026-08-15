import { useState } from 'react';
import { 
  BookOpen, 
  Key, 
  GitBranch, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  Zap,
  Check
} from 'lucide-react';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<'tokens' | 'multirepo' | 'telemetry' | 'security' | 'frameworks'>('tokens');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '1280px', margin: '0 auto' }}>
      <header style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', color: 'var(--color-brand-primary)', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
          <BookOpen size={14} />
          <span>User & Contributor Guide</span>
        </div>
        <h1 className="text-3xl" style={{ margin: '0 0 var(--space-2)' }}>Documentation & Setup Guide</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Everything you need to know about connecting AI tokens, tracking multi-repo contributions, and obtaining real-time telemetry.
        </p>
      </header>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', borderBottom: '1px solid var(--color-border-subtle)', marginBottom: 'var(--space-6)', overflowX: 'auto', paddingBottom: 'var(--space-2)' }}>
        {[
          { id: 'tokens', label: 'API Tokens & Connection', icon: <Key size={16} /> },
          { id: 'multirepo', label: 'Multi-Repo Contributor Guide', icon: <GitBranch size={16} /> },
          { id: 'telemetry', label: 'Real Telemetry & Figures', icon: <Zap size={16} /> },
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
        {/* Tab 1: API Tokens & Connection */}
        {activeTab === 'tokens' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
              <h2 className="text-xl" style={{ margin: '0 0 var(--space-3)' }}>1. How KobeanAI Tracker Ingests AI Sessions</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: 'var(--space-4)' }}>
                KobeanAI Tracker operates on a <strong>Local-First Architecture</strong>. You do <em>not</em> need to send your private code to third-party tracking servers. KobeanAI Tracker monitors the local transcript outputs generated on your machine by coding assistants:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface-hover)' }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: '#4285f4', marginBottom: '4px' }}>Google Antigravity / Gemini CLI</div>
                  <code style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>~/.gemini/antigravity-ide/brain/&lt;session-id&gt;/.system_generated/logs/transcript.jsonl</code>
                </div>

                <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface-hover)' }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: '#d97757', marginBottom: '4px' }}>Claude Code & Desktop</div>
                  <code style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>~/.claude/transcripts/*.jsonl</code>
                </div>

                <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface-hover)' }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: '#9333ea', marginBottom: '4px' }}>Cursor IDE / Codex</div>
                  <code style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>~/.cursor/logs or project-level transcripts</code>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
              <h2 className="text-xl" style={{ margin: '0 0 var(--space-3)' }}>2. Connecting API Provider Keys (Optional Direct Usage)</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: 'var(--space-4)' }}>
                If you run standalone AI scripts, CLI utilities, or background subagents, provide your provider API tokens in your shell environment or in your project root <code style={{ color: 'var(--color-brand-primary)' }}>.env</code> file:
              </p>

              <div style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
                <pre style={{ 
                  backgroundColor: '#0d1117', 
                  padding: 'var(--space-4)', 
                  borderRadius: 'var(--radius-lg)', 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: 'var(--text-xs)', 
                  color: '#e6edf3',
                  overflowX: 'auto',
                  border: '1px solid var(--color-border-subtle)'
                }}>
{`# Google Gemini / Antigravity API Key
export GEMINI_API_KEY="AIzaSy..."

# Anthropic Claude API Key
export ANTHROPIC_API_KEY="sk-ant-..."

# OpenAI API Key
export OPENAI_API_KEY="sk-proj-..."`}
                </pre>
                <button
                  onClick={() => handleCopy(`export GEMINI_API_KEY="your_api_key_here"\nexport ANTHROPIC_API_KEY="your_api_key_here"\nexport OPENAI_API_KEY="your_api_key_here"`, 'env-tokens')}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-subtle)',
                    backgroundColor: 'var(--color-bg-surface)',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: 'var(--text-xs)'
                  }}
                >
                  {copiedKey === 'env-tokens' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{copiedKey === 'env-tokens' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Multi-Repo Contributor Guide */}
        {activeTab === 'multirepo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
              <h2 className="text-xl" style={{ margin: '0 0 var(--space-3)' }}>Contributing to Multiple GitHub Repositories</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: 'var(--space-4)' }}>
                As an active open-source contributor or developer managing 10+ GitHub repositories, you want to track your AI usage across all projects in one single dashboard. Here is how to configure it effectively:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface-hover)', borderLeft: '4px solid var(--color-brand-primary)' }}>
                  <h3 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-base)', fontWeight: 600 }}>Strategy 1: Universal Daemon Watcher (Zero Config)</h3>
                  <p style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                    Keep KobeanAI Tracker running locally in the background (`npm run dev` or `docker compose up -d`). Whenever you switch repositories and invoke an AI assistant (Antigravity, Claude, Cursor), the tracker automatically detects the new session and parses the metadata immediately.
                  </p>
                </div>

                <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface-hover)', borderLeft: '4px solid #10b981' }}>
                  <h3 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-base)', fontWeight: 600 }}>Strategy 2: Multi-Repo Tagging Conventions</h3>
                  <p style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                    Prefix your prompts or session summaries with repository identifiers or issue tags:
                  </p>
                  <pre style={{ backgroundColor: '#0d1117', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: '#10b981', margin: '0 0 var(--space-2)' }}>
                    [repo:facebook/react][issue-1234] Refactor useState hook microtask queue
                  </pre>
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                    KobeanAI Tracker automatically parses bracketed tags (`[repo:...]`) and lets you filter stats by repository on the Sessions Page.
                  </p>
                </div>

                <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface-hover)', borderLeft: '4px solid #8b5cf6' }}>
                  <h3 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-base)', fontWeight: 600 }}>Strategy 3: Distributing `.betterleak` & `.agents` Across Repos</h3>
                  <p style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                    Copy the `.betterleak` secret scanner and `.agents/rules/` directory into any repo you contribute to so you never accidentally leak API tokens in public pull requests.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Real Telemetry & Figures */}
        {activeTab === 'telemetry' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
              <h2 className="text-xl" style={{ margin: '0 0 var(--space-3)' }}>How Figures & Token Costs are Computed</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: 'var(--space-4)' }}>
                KobeanAI Tracker calculates exact token volumes, latency, tool calls, and model cost projections from raw session transcripts:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div className="glass-panel" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: '4px' }}>Input & Output Tokens</div>
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>Calculated per interaction turn (~3.8 characters per token) and agent payload overhead.</p>
                </div>

                <div className="glass-panel" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: '4px' }}>Model Pricing Engine</div>
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>Gemini 1.5 Pro ($1.25/M in, $5.00/M out), Claude 3.5 Sonnet ($3.00/M in, $15.00/M out).</p>
                </div>

                <div className="glass-panel" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: '4px' }}>Tool Call Tracking</div>
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>Tracks subagents, file edits, bash executions, and grep searches performed by AI agents.</p>
                </div>
              </div>

              <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Need to re-sync all historical sessions from disk?</div>
                  <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Click "Sync Real Logs" on the Sessions page to parse all transcripts immediately.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Secret Leaks (.betterleak) */}
        {activeTab === 'security' && (
          <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
            <h2 className="text-xl" style={{ margin: '0 0 var(--space-3)' }}>Secret Leak Prevention (`.betterleak`)</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: 'var(--space-4)' }}>
              `.betterleak` monitors your codebase before commits, pushes, and CI builds to prevent exposing sensitive credentials (OpenAI tokens, Gemini keys, Anthropic keys, AWS credentials, GitHub PATs).
            </p>

            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Automated Pre-Commit Hook</h3>
            <pre style={{ 
              backgroundColor: '#0d1117', 
              padding: 'var(--space-4)', 
              borderRadius: 'var(--radius-lg)', 
              fontFamily: 'var(--font-mono)', 
              fontSize: 'var(--text-xs)', 
              color: '#e6edf3',
              marginBottom: 'var(--space-4)'
            }}>
{`# Add to .git/hooks/pre-commit
#!/bin/sh
echo "🔍 Running .betterleak secret scan..."
git diff --cached | grep -E "(AIzaSy[0-9A-Za-z_-]{33}|sk-ant-[a-zA-Z0-9_-]{20,}|sk-[a-zA-Z0-9]{32,})"
if [ $? -eq 0 ]; then
  echo "❌ Sensitive API token detected in staged files! Aborting commit."
  exit 1
fi
echo "✅ No sensitive secrets found."`}
            </pre>
          </div>
        )}

        {/* Tab 5: Ponytail & Taste-Skill */}
        {activeTab === 'frameworks' && (
          <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
            <h2 className="text-xl" style={{ margin: '0 0 var(--space-3)' }}>Installed Frameworks</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
              <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface-hover)' }}>
                <h3 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-base)', color: 'var(--color-brand-primary)' }}>🧠 Ponytail Framework</h3>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                  Enforces the 6-step Decision Ladder: YAGNI first, Standard library first, Native platform capabilities, and zero unnecessary npm bloat.
                </p>
              </div>

              <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface-hover)' }}>
                <h3 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-base)', color: '#a855f7' }}>🎨 Taste-Skill Motion</h3>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                  Fluid spring physics curves (`--ease-spring-smooth`), layered glassmorphism, glowing indicator dots, and interactive card lift effects.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
