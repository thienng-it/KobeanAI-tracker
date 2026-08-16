import { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  BookOpen, 
  Key, 
  GitBranch, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  Zap, 
  Check, 
  Terminal, 
  Layers, 
  Bot, 
  Lock, 
  ArrowRight,
  RefreshCw,
  DollarSign,
  Cpu,
  Wrench
} from 'lucide-react';

export default function DocsPage() {
  const navigate = useNavigate();
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
        <h1 className="text-3xl" style={{ margin: '0 0 var(--space-2)' }}>Documentation & Setup Guide</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Everything you need to know about connecting AI tokens, tracking multi-repo contributions, and obtaining real-time telemetry.
        </p>
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
        {/* Tab 1: API Tokens & Connection */}
        {activeTab === 'tokens' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                <h2 className="text-xl" style={{ margin: 0 }}>1. How KobeanAI Tracker Ingests AI Sessions</h2>
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
                {/* 1. Google Antigravity / Gemini CLI */}
                <div 
                  className="interactive-card"
                  style={{ 
                    padding: 'var(--space-5)', 
                    borderRadius: 'var(--radius-xl)', 
                    backgroundColor: 'var(--color-bg-surface-hover)',
                    border: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minWidth: 0
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          width: '28px', 
                          height: '28px', 
                          borderRadius: 'var(--radius-md)', 
                          backgroundColor: 'rgba(66, 133, 244, 0.15)', 
                          color: '#4285f4',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Bot size={16} />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: '#4285f4' }}>
                          Google Antigravity & Gemini CLI
                        </span>
                      </div>
                      <span style={{ 
                        fontSize: '0.6875rem', 
                        padding: '2px 8px', 
                        borderRadius: 'var(--radius-full)', 
                        backgroundColor: 'rgba(66, 133, 244, 0.12)', 
                        color: '#60a5fa',
                        fontWeight: 600 
                      }}>
                        Active Stream
                      </span>
                    </div>

                    <p style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                      Monitors real-time session transcripts, thinking iterations, and subagent tool executions.
                    </p>
                  </div>

                  {/* Path Monospace Box */}
                  <div style={{
                    backgroundColor: '#0d1117',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    minWidth: 0
                  }}>
                    <div style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '0.75rem', 
                      color: '#94a3b8', 
                      overflowWrap: 'anywhere', 
                      wordBreak: 'break-all', 
                      lineHeight: '1.4',
                      minWidth: 0
                    }}>
                      <span style={{ color: '#64748b' }}>~/.gemini/antigravity-ide/brain/</span>
                      <span style={{ color: '#60a5fa', fontWeight: 600 }}>&lt;session-id&gt;</span>
                      <span style={{ color: '#94a3b8' }}>/.system_generated/logs/transcript.jsonl</span>
                    </div>
                    <button
                      onClick={() => handleCopy('~/.gemini/antigravity-ide/brain/<session-id>/.system_generated/logs/transcript.jsonl', 'path-gemini')}
                      title="Copy path template"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: 'var(--radius-sm)',
                        color: copiedKey === 'path-gemini' ? '#10b981' : '#cbd5e1',
                        padding: '4px 6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.6875rem',
                        flexShrink: 0,
                        transition: 'all var(--duration-fast) ease'
                      }}
                    >
                      {copiedKey === 'path-gemini' ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedKey === 'path-gemini' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Claude Code & Desktop */}
                <div 
                  className="interactive-card"
                  style={{ 
                    padding: 'var(--space-5)', 
                    borderRadius: 'var(--radius-xl)', 
                    backgroundColor: 'var(--color-bg-surface-hover)',
                    border: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minWidth: 0
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          width: '28px', 
                          height: '28px', 
                          borderRadius: 'var(--radius-md)', 
                          backgroundColor: 'rgba(217, 119, 87, 0.15)', 
                          color: '#d97757',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Terminal size={16} />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: '#d97757' }}>
                          Claude Code & Desktop
                        </span>
                      </div>
                      <span style={{ 
                        fontSize: '0.6875rem', 
                        padding: '2px 8px', 
                        borderRadius: 'var(--radius-full)', 
                        backgroundColor: 'rgba(217, 119, 87, 0.12)', 
                        color: '#fb923c',
                        fontWeight: 600 
                      }}>
                        Auto-Detect
                      </span>
                    </div>

                    <p style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                      Parses conversational turn histories, token tallies, and bash execution traces.
                    </p>
                  </div>

                  {/* Path Monospace Box */}
                  <div style={{
                    backgroundColor: '#0d1117',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    minWidth: 0
                  }}>
                    <div style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '0.75rem', 
                      color: '#94a3b8', 
                      overflowWrap: 'anywhere', 
                      wordBreak: 'break-all', 
                      lineHeight: '1.4',
                      minWidth: 0
                    }}>
                      <span style={{ color: '#64748b' }}>~/.claude/transcripts/</span>
                      <span style={{ color: '#fb923c', fontWeight: 600 }}>*.jsonl</span>
                    </div>
                    <button
                      onClick={() => handleCopy('~/.claude/transcripts/*.jsonl', 'path-claude')}
                      title="Copy path template"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: 'var(--radius-sm)',
                        color: copiedKey === 'path-claude' ? '#10b981' : '#cbd5e1',
                        padding: '4px 6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.6875rem',
                        flexShrink: 0,
                        transition: 'all var(--duration-fast) ease'
                      }}
                    >
                      {copiedKey === 'path-claude' ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedKey === 'path-claude' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* 3. Cursor IDE / Codex */}
                <div 
                  className="interactive-card"
                  style={{ 
                    padding: 'var(--space-5)', 
                    borderRadius: 'var(--radius-xl)', 
                    backgroundColor: 'var(--color-bg-surface-hover)',
                    border: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minWidth: 0
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          width: '28px', 
                          height: '28px', 
                          borderRadius: 'var(--radius-md)', 
                          backgroundColor: 'rgba(147, 51, 234, 0.15)', 
                          color: '#9333ea',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Layers size={16} />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: '#9333ea' }}>
                          Cursor IDE & Codex
                        </span>
                      </div>
                      <span style={{ 
                        fontSize: '0.6875rem', 
                        padding: '2px 8px', 
                        borderRadius: 'var(--radius-full)', 
                        backgroundColor: 'rgba(147, 51, 234, 0.12)', 
                        color: '#c084fc',
                        fontWeight: 600 
                      }}>
                        Workspace Sync
                      </span>
                    </div>

                    <p style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                      Tracks multi-file edits, indexing logs, and model interactions across workspace roots.
                    </p>
                  </div>

                  {/* Path Monospace Box */}
                  <div style={{
                    backgroundColor: '#0d1117',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    minWidth: 0
                  }}>
                    <div style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '0.75rem', 
                      color: '#94a3b8', 
                      overflowWrap: 'anywhere', 
                      wordBreak: 'break-all', 
                      lineHeight: '1.4',
                      minWidth: 0
                    }}>
                      <span style={{ color: '#64748b' }}>~/.cursor/logs</span>
                      <span style={{ color: '#c084fc' }}> or project-level transcripts</span>
                    </div>
                    <button
                      onClick={() => handleCopy('~/.cursor/logs', 'path-cursor')}
                      title="Copy path template"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: 'var(--radius-sm)',
                        color: copiedKey === 'path-cursor' ? '#10b981' : '#cbd5e1',
                        padding: '4px 6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.6875rem',
                        flexShrink: 0,
                        transition: 'all var(--duration-fast) ease'
                      }}
                    >
                      {copiedKey === 'path-cursor' ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedKey === 'path-cursor' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Connecting API Provider Keys */}
            <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
              <h2 className="text-xl" style={{ margin: '0 0 var(--space-3)' }}>2. Connecting API Provider Keys (Direct UI Input or Shell .env)</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: 'var(--space-4)' }}>
                You can configure and test your AI provider credentials directly inside the KobeanAI Tracker user interface without editing any configuration files:
              </p>

              {/* Method A: In-App UI Input */}
              <div style={{ 
                padding: 'var(--space-4)', 
                borderRadius: 'var(--radius-lg)', 
                backgroundColor: 'rgba(59, 130, 246, 0.08)', 
                border: '1px solid rgba(59, 130, 246, 0.25)', 
                marginBottom: 'var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 'var(--space-3)'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-brand-primary)' }}>
                      Option A: Direct UI Input (Recommended)
                    </span>
                    <span style={{ 
                      fontSize: '0.6875rem', 
                      backgroundColor: 'rgba(59, 130, 246, 0.15)', 
                      color: 'var(--color-brand-primary)', 
                      padding: '2px 6px', 
                      borderRadius: 'var(--radius-sm)', 
                      fontWeight: 600 
                    }}>
                      Live Vault
                    </span>
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                    Configure Google Gemini, Anthropic Claude, OpenAI, and OpenRouter keys with live 1-click test verification.
                  </div>
                </div>
                <button
                  onClick={() => navigate('/settings/agents')}
                  className="interactive-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-brand-primary)',
                    border: 'none',
                    color: '#fff',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Key size={14} /> 
                  <span>Open API Key Settings</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Method B: Shell .env */}
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-2)' }}>
                Option B: For background daemons or shell scripts, export keys in your environment or <code style={{ color: 'var(--color-brand-primary)', fontFamily: 'var(--font-mono)' }}>.env</code> file:
              </p>

              {/* Terminal Code Frame */}
              <div style={{ 
                position: 'relative', 
                marginBottom: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--color-border-subtle)',
                backgroundColor: '#0d1117'
              }}>
                {/* Terminal Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
                    <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: '#64748b', marginLeft: '6px' }}>
                      ~/.zshrc / .env
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(`export GEMINI_API_KEY="AIzaSy..."\nexport ANTHROPIC_API_KEY="sk-ant-..."\nexport OPENAI_API_KEY="sk-proj-..."`, 'env-tokens')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      color: copiedKey === 'env-tokens' ? '#10b981' : '#cbd5e1',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: 'var(--text-xs)',
                      transition: 'all var(--duration-fast) ease'
                    }}
                  >
                    {copiedKey === 'env-tokens' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey === 'env-tokens' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <pre style={{ 
                  margin: 0,
                  padding: 'var(--space-4)', 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: 'var(--text-xs)', 
                  color: '#e6edf3',
                  overflowX: 'auto',
                  lineHeight: '1.6'
                }}>
{`# Google Gemini / Antigravity API Key
export GEMINI_API_KEY="AIzaSy..."

# Anthropic Claude API Key
export ANTHROPIC_API_KEY="sk-ant-..."

# OpenAI / Codex API Key
export OPENAI_API_KEY="sk-proj-..."`}
                </pre>
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
                As an active open-source contributor or engineer managing multiple repositories, you can effortlessly track your AI usage across all projects in one single dashboard. Here is how to configure it effectively:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface-hover)', borderLeft: '4px solid var(--color-brand-primary)' }}>
                  <h3 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-base)', fontWeight: 600 }}>Strategy 1: Universal Daemon Watcher (Zero Config)</h3>
                  <p style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                    Keep KobeanAI Tracker running locally in the background (<code style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-brand-primary)' }}>npm run dev</code> or desktop app). Whenever you switch repositories and invoke an AI assistant (Antigravity, Claude, Cursor), the tracker automatically detects the new session and parses the metadata immediately.
                  </p>
                </div>

                <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface-hover)', borderLeft: '4px solid #10b981' }}>
                  <h3 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-base)', fontWeight: 600 }}>Strategy 2: Multi-Repo Tagging Conventions</h3>
                  <p style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                    Prefix your prompts or session summaries with repository identifiers or issue tags:
                  </p>
                  
                  {/* Tag Syntax Box */}
                  <div style={{ 
                    backgroundColor: '#0d1117', 
                    padding: 'var(--space-3)', 
                    borderRadius: 'var(--radius-md)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: '8px',
                    margin: '0 0 var(--space-2)',
                    border: '1px solid var(--color-border-subtle)'
                  }}>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: '#10b981', overflowWrap: 'anywhere' }}>
                      [repo:facebook/react][issue-1234] Refactor useState hook microtask queue
                    </code>
                    <button
                      onClick={() => handleCopy('[repo:facebook/react][issue-1234] Refactor useState hook microtask queue', 'tag-example')}
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: 'var(--radius-sm)',
                        color: copiedKey === 'tag-example' ? '#10b981' : '#cbd5e1',
                        padding: '3px 6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.6875rem',
                        flexShrink: 0
                      }}
                    >
                      {copiedKey === 'tag-example' ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedKey === 'tag-example' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                    KobeanAI Tracker automatically parses bracketed tags (<code style={{ color: '#10b981', fontFamily: 'var(--font-mono)' }}>[repo:...]</code>, <code style={{ color: '#3b82f6', fontFamily: 'var(--font-mono)' }}>[issue-...]</code>) and lets you filter stats by repository on the Sessions Page.
                  </p>
                </div>

                <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface-hover)', borderLeft: '4px solid #8b5cf6' }}>
                  <h3 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-base)', fontWeight: 600 }}>Strategy 3: Distributing `.betterleak` & `.agents` Across Repos</h3>
                  <p style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                    Copy the <code style={{ color: '#8b5cf6', fontFamily: 'var(--font-mono)' }}>.betterleak</code> secret scanner and <code style={{ color: '#8b5cf6', fontFamily: 'var(--font-mono)' }}>.agents/rules/</code> directory into any repo you contribute to so you never accidentally leak API tokens in public pull requests.
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
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: 'var(--space-5)' }}>
                KobeanAI Tracker calculates exact token volumes, latency, tool calls, and model cost projections from raw session transcripts:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div className="glass-panel" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Cpu size={15} />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Input & Output Tokens</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                    Calculated per interaction turn (~3.8 characters per token) with thinking loop token extraction and agent system prompt overhead tracking.
                  </p>
                </div>

                <div className="glass-panel" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DollarSign size={15} />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Model Pricing Engine</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                    Granular rates: Gemini 3.7 / 1.5 Pro ($1.25/M in, $5.00/M out), Claude 3.7 / 3.5 Sonnet ($3.00/M in, $15.00/M out), OpenAI GPT-4o / o1.
                  </p>
                </div>

                <div className="glass-panel" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Wrench size={15} />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Tool Call Tracking</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                    Telemetry counts subagent spawns, file edits, bash executions, and ripgrep queries across coding turns.
                  </p>
                </div>
              </div>

              {/* Sync Action Banner */}
              <div style={{ 
                padding: 'var(--space-4) var(--space-5)', 
                borderRadius: 'var(--radius-lg)', 
                backgroundColor: 'var(--color-bg-surface-hover)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-3)'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Need to re-sync all historical sessions from disk?</div>
                  <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    Trigger full re-scanning of local transcripts and rebuild telemetry metrics immediately.
                  </div>
                </div>
                <button
                  onClick={() => navigate('/sessions')}
                  className="interactive-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-brand-primary)',
                    border: 'none',
                    color: '#fff',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={13} />
                  <span>Go to Sessions & Sync</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Secret Leaks (.betterleak) */}
        {activeTab === 'security' && (
          <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
            <h2 className="text-xl" style={{ margin: '0 0 var(--space-3)' }}>Secret Leak Prevention (`.betterleak`)</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: 'var(--space-4)' }}>
              <code style={{ color: '#ef4444', fontFamily: 'var(--font-mono)' }}>.betterleak</code> monitors your codebase before commits, pushes, and CI builds to prevent exposing sensitive credentials (OpenAI tokens, Gemini keys, Anthropic keys, AWS credentials, GitHub PATs).
            </p>

            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Automated Pre-Commit Hook</h3>
            
            {/* Terminal Mockup */}
            <div style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              border: '1px solid var(--color-border-subtle)',
              backgroundColor: '#0d1117',
              marginBottom: 'var(--space-4)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
                  <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: '#64748b', marginLeft: '6px' }}>
                    .git/hooks/pre-commit
                  </span>
                </div>

                <button
                  onClick={() => handleCopy(`#!/bin/sh\necho "🔍 Running .betterleak secret scan..."\ngit diff --cached | grep -E "(AIzaSy[0-9A-Za-z_-]{33}|sk-ant-[a-zA-Z0-9_-]{20,}|sk-[a-zA-Z0-9]{32,})"\nif [ $? -eq 0 ]; then\n  echo "❌ Sensitive API token detected in staged files! Aborting commit."\n  exit 1\nfi\necho "✅ No sensitive secrets found."`, 'precommit-hook')}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: copiedKey === 'precommit-hook' ? '#10b981' : '#cbd5e1',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: 'var(--text-xs)',
                    transition: 'all var(--duration-fast) ease'
                  }}
                >
                  {copiedKey === 'precommit-hook' ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedKey === 'precommit-hook' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre style={{ 
                margin: 0,
                padding: 'var(--space-4)', 
                fontFamily: 'var(--font-mono)', 
                fontSize: 'var(--text-xs)', 
                color: '#e6edf3',
                overflowX: 'auto',
                lineHeight: '1.6'
              }}>
{`#!/bin/sh
echo "🔍 Running .betterleak secret scan..."
git diff --cached | grep -E "(AIzaSy[0-9A-Za-z_-]{33}|sk-ant-[a-zA-Z0-9_-]{20,}|sk-[a-zA-Z0-9]{32,})"
if [ $? -eq 0 ]; then
  echo "❌ Sensitive API token detected in staged files! Aborting commit."
  exit 1
fi
echo "✅ No sensitive secrets found."`}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 5: Ponytail & Taste-Skill */}
        {activeTab === 'frameworks' && (
          <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
            <h2 className="text-xl" style={{ margin: '0 0 var(--space-3)' }}>Installed Engineering Frameworks</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: 'var(--space-5)' }}>
              KobeanAI Tracker is built with strict architectural standards prioritizing minimal overhead, native web capabilities, and fluid physics-based interactions:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
              {/* Ponytail */}
              <div 
                className="interactive-card"
                style={{ 
                  padding: 'var(--space-5)', 
                  borderRadius: 'var(--radius-lg)', 
                  backgroundColor: 'var(--color-bg-surface-hover)',
                  border: '1px solid var(--color-border-subtle)' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
                  <span style={{ fontSize: '1.25rem' }}>🧠</span>
                  <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-brand-primary)', fontWeight: 600 }}>
                    Ponytail Framework
                  </h3>
                </div>
                <p style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                  Enforces the 6-step Decision Ladder: YAGNI first, Standard library first, Native platform capabilities, and zero unnecessary npm bloat.
                </p>
                <div style={{ 
                  backgroundColor: 'rgba(59, 130, 246, 0.08)', 
                  border: '1px solid rgba(59, 130, 246, 0.2)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '8px 12px',
                  fontSize: '0.6875rem',
                  color: 'var(--color-brand-primary)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  Standard Lib &gt; Native Web &gt; YAGNI Core
                </div>
              </div>

              {/* Taste-Skill */}
              <div 
                className="interactive-card"
                style={{ 
                  padding: 'var(--space-5)', 
                  borderRadius: 'var(--radius-lg)', 
                  backgroundColor: 'var(--color-bg-surface-hover)',
                  border: '1px solid var(--color-border-subtle)' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
                  <span style={{ fontSize: '1.25rem' }}>🎨</span>
                  <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: '#a855f7', fontWeight: 600 }}>
                    Taste-Skill Motion & UI
                  </h3>
                </div>
                <p style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                  Fluid spring physics curves (<code style={{ fontFamily: 'var(--font-mono)', color: '#a855f7' }}>--ease-spring-smooth</code>), layered glassmorphism, glowing indicator dots, and interactive card lift effects.
                </p>
                <div style={{ 
                  backgroundColor: 'rgba(168, 85, 247, 0.08)', 
                  border: '1px solid rgba(168, 85, 247, 0.2)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '8px 12px',
                  fontSize: '0.6875rem',
                  color: '#a855f7',
                  fontFamily: 'var(--font-mono)'
                }}>
                  cubic-bezier(0.16, 1, 0.3, 1) spring physics
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
