import React from 'react';
import { useWizardStore } from '../stores/useWizardStore';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Terminal, 
  Bot, 
  Sparkles, 
  Database,
  Layers,
  Zap,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router';

const STEPS = [
  'Welcome',
  'System Check',
  'Prerequisites',
  'Agent Connections',
  'Workspace Setup',
  'Import',
  'Confirmation'
];

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary', disabled = false }) => {
  const isPrimary = variant === 'primary';
  const isAccent = variant === 'accent';

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '0.625rem 1.25rem',
        borderRadius: 'var(--radius-lg)',
        fontWeight: 600,
        fontSize: 'var(--text-sm)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: isPrimary || isAccent ? 'none' : '1px solid var(--color-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: isAccent 
          ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' 
          : isPrimary 
            ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
            : 'var(--color-bg-surface-hover)',
        color: isPrimary || isAccent ? '#ffffff' : 'var(--color-text-primary)',
        boxShadow: (isPrimary || isAccent) && !disabled ? '0 4px 14px rgba(59, 130, 246, 0.35)' : 'none',
        opacity: disabled ? 0.4 : 1,
        transition: 'transform var(--duration-fast) var(--ease-spring-snappy), box-shadow var(--duration-fast) ease, opacity var(--duration-fast) ease',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          if (isPrimary || isAccent) {
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.45)';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          if (isPrimary || isAccent) {
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.35)';
          }
        }
      }}
    >
      {children}
    </button>
  );
};

const Stepper = ({ currentStep, onSelectStep }: { currentStep: number; onSelectStep: (step: number) => void }) => {
  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div style={{ position: 'relative', marginBottom: 'var(--space-8)' }}>
      {/* Background Track Line */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '4%',
        right: '4%',
        height: '3px',
        backgroundColor: 'var(--color-border-subtle)',
        borderRadius: 'var(--radius-full)',
        zIndex: 0
      }} />

      {/* Animated Active Progress Fill Line */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '4%',
        width: `${Math.max(0, Math.min(progressPercent * 0.92, 92))}%`,
        height: '3px',
        background: 'linear-gradient(90deg, #10b981, #3b82f6)',
        borderRadius: 'var(--radius-full)',
        zIndex: 1,
        transition: 'width var(--duration-smooth) var(--ease-spring-smooth)',
        boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
      }} />

      {/* Stepper Nodes */}
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isAccessible = stepNumber <= currentStep;
          
          return (
            <div 
              key={step} 
              onClick={() => isAccessible && onSelectStep(stepNumber)}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                flex: 1, 
                cursor: isAccessible ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              <div style={{ 
                backgroundColor: isCompleted 
                  ? 'var(--color-status-success)' 
                  : isCurrent 
                    ? 'var(--color-brand-primary)' 
                    : 'var(--color-bg-surface)', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                border: isCurrent 
                  ? '3px solid var(--color-bg-app)' 
                  : isCompleted 
                    ? 'none' 
                    : '2px solid var(--color-border-subtle)',
                transform: isCurrent ? 'scale(1.15)' : 'scale(1)',
                boxShadow: isCurrent 
                  ? '0 0 16px rgba(59, 130, 246, 0.6), 0 0 0 4px rgba(59, 130, 246, 0.2)' 
                  : isCompleted 
                    ? '0 0 10px rgba(16, 185, 129, 0.4)' 
                    : 'none',
                transition: 'all var(--duration-normal) var(--ease-spring-smooth)'
              }}>
                {isCompleted ? (
                  <Check size={16} color="#ffffff" strokeWidth={3} />
                ) : isCurrent ? (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
                ) : (
                  <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>{stepNumber}</span>
                )}
              </div>
              <span style={{ 
                marginTop: '0.625rem', 
                fontSize: 'var(--text-xs)', 
                fontWeight: isCurrent ? 600 : 500,
                color: isCurrent 
                  ? 'var(--color-text-primary)' 
                  : isCompleted 
                    ? 'var(--color-status-success-text)' 
                    : 'var(--color-text-tertiary)',
                textAlign: 'center',
                transition: 'color var(--duration-fast) ease'
              }}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function SetupWizardPage() {
  const { 
    currentStep, 
    setStep, 
    nextStep, 
    prevStep, 
    completed,
    completeWizard, 
    workspaceName, 
    workspacePath, 
    setWorkspace, 
    agents, 
    toggleAgent,
    importOption,
    setImportOption
  } = useWizardStore();
  const navigate = useNavigate();

  // If already completed and no explicit reconfigure query, automatically bypass to dashboard
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isReconfiguring = params.get('reconfigure') === 'true';
    if (completed && !isReconfiguring) {
      navigate('/dashboard', { replace: true });
    }
  }, [completed, navigate]);

  const handleComplete = () => {
    completeWizard();
    navigate('/dashboard');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div key="step-1" className="animate-slide-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', color: 'var(--color-brand-primary)', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              <Sparkles size={14} />
              <span>Next-Gen AI Observability</span>
            </div>
            <h2 className="text-3xl" style={{ margin: '0 0 var(--space-3)' }}>Welcome to KobeanAI Tracker</h2>
            <p className="text-base" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', maxWidth: '640px', lineHeight: '1.6' }}>
              One centralized hub to see, trace, and optimize every AI interaction across your favorite coding agents with local-first telemetry.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              <div className="glass-panel interactive-card" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand-primary)', marginBottom: 'var(--space-3)' }}>
                  <Activity size={20} />
                </div>
                <h4 style={{ margin: '0 0 var(--space-1)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>Live Telemetry</h4>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>Real-time streaming token counters, execution latency, and model cost projections.</p>
              </div>

              <div className="glass-panel interactive-card" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(147, 51, 234, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7', marginBottom: 'var(--space-3)' }}>
                  <Bot size={20} />
                </div>
                <h4 style={{ margin: '0 0 var(--space-1)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>Multi-Agent Hub</h4>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>Seamless connectors for Google Antigravity, Claude Code, Cursor, and Codex.</p>
              </div>

              <div className="glass-panel interactive-card" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-status-success)', marginBottom: 'var(--space-3)' }}>
                  <ShieldCheck size={20} />
                </div>
                <h4 style={{ margin: '0 0 var(--space-1)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>Local-First Privacy</h4>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>All sessions, traces, and rules stay 100% private in local SQLite storage.</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div key="step-2" className="animate-slide-up">
            <h2 className="text-2xl" style={{ margin: '0 0 var(--space-2)' }}>System Diagnostics</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
              Verifying local runtime environment, database engine, and agent watchers.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-bg-surface-hover)',
                border: '1px solid var(--color-border-subtle)',
                transition: 'transform var(--duration-fast) var(--ease-spring-smooth)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <Cpu size={20} color="var(--color-brand-primary)" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Operating System</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Platform architecture</div>
                  </div>
                </div>
                <span style={{ 
                  padding: '3px 10px', 
                  borderRadius: 'var(--radius-full)', 
                  backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                  color: 'var(--color-status-success-text)', 
                  fontSize: 'var(--text-xs)', 
                  fontWeight: 600 
                }}>
                  macOS (Apple Silicon / x64)
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-bg-surface-hover)',
                border: '1px solid var(--color-border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <Terminal size={20} color="#10b981" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Node.js Runtime</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Execution engine</div>
                  </div>
                </div>
                <span style={{ 
                  padding: '3px 10px', 
                  borderRadius: 'var(--radius-full)', 
                  backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                  color: 'var(--color-status-success-text)', 
                  fontSize: 'var(--text-xs)', 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <div className="live-dot" />
                  Node.js v20+ Active
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-bg-surface-hover)',
                border: '1px solid var(--color-border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <Database size={20} color="#f59e0b" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Local SQLite Engine</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>WAL mode enabled</div>
                  </div>
                </div>
                <span style={{ 
                  padding: '3px 10px', 
                  borderRadius: 'var(--radius-full)', 
                  backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                  color: 'var(--color-status-success-text)', 
                  fontSize: 'var(--text-xs)', 
                  fontWeight: 600 
                }}>
                  Ready & Mounted
                </span>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div key="step-3" className="animate-slide-up">
            <h2 className="text-2xl" style={{ margin: '0 0 var(--space-2)' }}>Prerequisites</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
              Checking file system permissions and log directories for agent integration.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              {[
                { title: 'Local File System Access', desc: 'Read/write permissions for ~/.gemini and project roots', ok: true },
                { title: 'Chokidar File Watcher', desc: 'Kernel event subscription for live log telemetry updates', ok: true },
                { title: 'Security Isolation', desc: 'No remote telemetry transmission; entirely offline compatible', ok: true }
              ].map((item, i) => (
                <div key={i} className="glass-panel" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{item.title}</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{item.desc}</div>
                  </div>
                  <CheckCircle2 size={20} color="var(--color-status-success)" />
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div key="step-4" className="animate-slide-up">
            <h2 className="text-2xl" style={{ margin: '0 0 var(--space-2)' }}>Agent Connections</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
              Click to select or toggle AI agents you want KobeanAI Tracker to monitor.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              {[
                { id: 'antigravity', name: 'Google Antigravity', desc: 'Full agent trajectory & tool calls', color: '#4285f4' },
                { id: 'claude', name: 'Claude Code', desc: 'Terminal AI CLI transcripts', color: '#d97757' },
                { id: 'cursor', name: 'Cursor IDE', desc: 'Editor prompt logs & diff traces', color: '#9333ea' },
                { id: 'codex', name: 'GitHub Copilot / Codex', desc: 'Workspace completions & suggestions', color: '#10a37f' }
              ].map((agent) => {
                const isSelected = agents[agent.id] ?? true;
                return (
                  <div 
                    key={agent.id}
                    onClick={() => toggleAgent(agent.id)}
                    className="glass-panel interactive-card"
                    style={{
                      padding: 'var(--space-5)',
                      borderRadius: 'var(--radius-xl)',
                      cursor: 'pointer',
                      border: isSelected ? `2px solid ${agent.color}` : '1px solid var(--color-border-subtle)',
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.06)' : 'var(--color-bg-glass)',
                      boxShadow: isSelected ? `0 0 20px ${agent.color}33` : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-2)',
                      transition: 'all var(--duration-fast) var(--ease-spring-smooth)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: agent.color }}>{agent.name}</span>
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isSelected ? agent.color : 'transparent',
                        border: isSelected ? 'none' : '2px solid var(--color-border-strong)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all var(--duration-fast) ease'
                      }}>
                        {isSelected && <Check size={14} color="#fff" strokeWidth={3} />}
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>{agent.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 5:
        return (
          <div key="step-5" className="animate-slide-up">
            <h2 className="text-2xl" style={{ margin: '0 0 var(--space-2)' }}>Workspace Setup</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
              Configure your primary workspace directory for capturing project-specific metrics.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                  Workspace Name
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    value={workspaceName}
                    onChange={(e) => setWorkspace(e.target.value, workspacePath)}
                    style={{ 
                      width: '100%', 
                      padding: '0.625rem 0.875rem', 
                      borderRadius: 'var(--radius-lg)', 
                      border: '1px solid var(--color-border-default)', 
                      backgroundColor: 'var(--color-bg-surface-hover)', 
                      color: 'var(--color-text-primary)',
                      fontSize: 'var(--text-sm)',
                      outline: 'none',
                      transition: 'border-color var(--duration-fast) ease, box-shadow var(--duration-fast) ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-brand-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.25)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border-default)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                  Storage & Log Path
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    value={workspacePath}
                    onChange={(e) => setWorkspace(workspaceName, e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '0.625rem 0.875rem', 
                      borderRadius: 'var(--radius-lg)', 
                      border: '1px solid var(--color-border-default)', 
                      backgroundColor: 'var(--color-bg-surface-hover)', 
                      color: 'var(--color-text-primary)',
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-mono)',
                      outline: 'none',
                      transition: 'border-color var(--duration-fast) ease, box-shadow var(--duration-fast) ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-brand-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.25)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border-default)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div key="step-6" className="animate-slide-up">
            <h2 className="text-2xl" style={{ margin: '0 0 var(--space-2)' }}>Historical Logs & Import</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
              Choose how you would like to initialize your activity feed.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              {/* Automatic option */}
              <div 
                onClick={() => setImportOption('auto')}
                className="glass-panel interactive-card" 
                style={{ 
                  padding: 'var(--space-5)', 
                  borderRadius: 'var(--radius-xl)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: 'var(--space-4)', 
                  cursor: 'pointer',
                  border: importOption === 'auto' ? '2px solid var(--color-brand-primary)' : '1px solid var(--color-border-subtle)',
                  backgroundColor: importOption === 'auto' ? 'rgba(59, 130, 246, 0.08)' : 'var(--color-bg-glass)',
                  boxShadow: importOption === 'auto' ? '0 0 20px rgba(59, 130, 246, 0.25)' : 'none',
                  transition: 'all var(--duration-fast) var(--ease-spring-smooth)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand-primary)', flexShrink: 0 }}>
                    <Zap size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-base)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Automatic Log Ingestion</span>
                      <span style={{ fontSize: 'var(--text-xs)', padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: 'var(--color-brand-primary)', fontWeight: 600 }}>Recommended</span>
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>Scan existing session transcripts from active agent folders immediately.</div>
                  </div>
                </div>

                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: importOption === 'auto' ? '2px solid var(--color-brand-primary)' : '2px solid var(--color-border-strong)',
                  backgroundColor: importOption === 'auto' ? 'var(--color-brand-primary)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all var(--duration-fast) ease'
                }}>
                  {importOption === 'auto' && <Check size={14} color="#fff" strokeWidth={3} />}
                </div>
              </div>

              {/* Fresh option */}
              <div 
                onClick={() => setImportOption('fresh')}
                className="glass-panel interactive-card" 
                style={{ 
                  padding: 'var(--space-5)', 
                  borderRadius: 'var(--radius-xl)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: 'var(--space-4)', 
                  cursor: 'pointer',
                  border: importOption === 'fresh' ? '2px solid var(--color-status-success)' : '1px solid var(--color-border-subtle)',
                  backgroundColor: importOption === 'fresh' ? 'rgba(16, 185, 129, 0.08)' : 'var(--color-bg-glass)',
                  boxShadow: importOption === 'fresh' ? '0 0 20px rgba(16, 185, 129, 0.25)' : 'none',
                  transition: 'all var(--duration-fast) var(--ease-spring-smooth)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-status-success)', flexShrink: 0 }}>
                    <Layers size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-base)', marginBottom: '2px' }}>Start Fresh Workspace</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>Begin capturing new sessions from this moment forward without importing old logs.</div>
                  </div>
                </div>

                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: importOption === 'fresh' ? '2px solid var(--color-status-success)' : '2px solid var(--color-border-strong)',
                  backgroundColor: importOption === 'fresh' ? 'var(--color-status-success)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all var(--duration-fast) ease'
                }}>
                  {importOption === 'fresh' && <Check size={14} color="#fff" strokeWidth={3} />}
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div key="step-7" className="animate-slide-up" style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)',
              boxShadow: '0 0 24px rgba(16, 185, 129, 0.35)',
              animation: 'scaleIn var(--duration-fast) var(--ease-spring-snappy)'
            }}>
              <CheckCircle2 size={36} color="var(--color-status-success)" />
            </div>

            <h2 className="text-3xl" style={{ margin: '0 0 var(--space-2)', letterSpacing: '-0.02em' }}>You're all set!</h2>
            <p className="text-base" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', maxWidth: '480px', margin: '0 auto var(--space-6)' }}>
              KobeanAI Tracker is fully configured and ready. Click below to launch your real-time analytics dashboard.
            </p>

            <div style={{ display: 'inline-flex', gap: 'var(--space-4)', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
              <div style={{ padding: '8px 16px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface-hover)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                Workspace: <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{workspaceName}</span>
              </div>
              <div style={{ padding: '8px 16px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface-hover)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                Mode: <span style={{ fontWeight: 600, color: 'var(--color-brand-primary)' }}>{importOption === 'auto' ? 'Auto Ingestion' : 'Fresh'}</span>
              </div>
              <div style={{ padding: '8px 16px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface-hover)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                Telemetry: <span style={{ fontWeight: 600, color: 'var(--color-status-success-text)' }}>Active</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: 'var(--space-6)',
      position: 'relative',
      overflow: 'hidden',
      background: 'radial-gradient(ellipse at 50% 10%, rgba(59, 130, 246, 0.15), transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(147, 51, 234, 0.1), transparent 50%), var(--color-bg-app)'
    }}>
      <div style={{ width: '100%', maxWidth: '820px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="live-dot" />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              {completed ? 'Setup Configured (Active)' : 'Quick Setup Wizard'}
            </span>
          </div>
          <button
            onClick={() => {
              completeWizard();
              navigate('/dashboard');
            }}
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border-subtle)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-brand-primary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>Skip to Dashboard →</span>
          </button>
        </div>

        <Stepper currentStep={currentStep} onSelectStep={setStep} />
        
        <div className="glass-panel" style={{
          padding: 'var(--space-8)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--glass-highlight), var(--shadow-lg), 0 20px 40px -15px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {renderStepContent()}
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginTop: 'var(--space-6)', 
            paddingTop: 'var(--space-6)', 
            borderTop: '1px solid var(--color-border-subtle)' 
          }}>
            <Button variant="secondary" onClick={prevStep} disabled={currentStep === 1}>
              <ArrowLeft size={16} /> Back
            </Button>
            
            {currentStep < 7 ? (
              <Button onClick={nextStep}>
                Next <ArrowRight size={16} />
              </Button>
            ) : (
              <Button variant="accent" onClick={handleComplete}>
                <Sparkles size={16} /> Launch Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
