import React, { useState } from 'react';
import { Hook, useHookStore, HookTestResult } from '../../stores/useHookStore';
import { 
  X, 
  Play, 
  Zap, 
  Clock, 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle, 
  RotateCcw,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';

interface HookSimulatorModalProps {
  hook: Hook;
  onClose: () => void;
}

export const HookSimulatorModal: React.FC<HookSimulatorModalProps> = ({
  hook,
  onClose
}) => {
  const { testHook } = useHookStore();

  const presets = [
    {
      name: 'Safe Shell Command (Allow)',
      payload: JSON.stringify({
        toolCall: {
          name: 'run_command',
          args: {
            CommandLine: 'git status -s',
            Cwd: '/workspace'
          }
        }
      }, null, 2)
    },
    {
      name: 'Destructive Shell (Deny)',
      payload: JSON.stringify({
        toolCall: {
          name: 'run_command',
          args: {
            CommandLine: 'rm -rf / --no-preserve-root',
            Cwd: '/workspace'
          }
        }
      }, null, 2)
    },
    {
      name: 'Fork Bomb (Deny)',
      payload: JSON.stringify({
        toolCall: {
          name: 'run_command',
          args: {
            CommandLine: ':(){ :|:& };:',
            Cwd: '/workspace'
          }
        }
      }, null, 2)
    },
    {
      name: 'Sensitive File Access (Deny)',
      payload: JSON.stringify({
        toolCall: {
          name: 'view_file',
          args: {
            AbsolutePath: '/workspace/.env'
          }
        }
      }, null, 2)
    }
  ];

  const [mockPayload, setMockPayload] = useState(presets[0].payload);
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<HookTestResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRunTest = async () => {
    setIsRunning(true);
    setTestResult(null);

    let parsedPayload: any = mockPayload;
    try {
      parsedPayload = JSON.parse(mockPayload);
    } catch (e) {}

    const res = await testHook({
      command: hook.command || '',
      mockPayload: parsedPayload,
      timeoutSeconds: hook.timeout || 5,
      hookId: hook.id
    });

    if (res.success && res.result) {
      setTestResult(res.result);
    } else if (res.result) {
      setTestResult(res.result);
    } else {
      setTestResult({
        success: false,
        decision: 'deny',
        reason: res.error || 'Execution failed',
        stdout: '',
        stderr: res.error || 'Execution error',
        latencyMs: 0,
        exitCode: 1
      });
    }

    setIsRunning(false);
  };

  const handleCopyOutput = () => {
    if (testResult) {
      navigator.clipboard.writeText(`Decision: ${testResult.decision}\nStdout:\n${testResult.stdout}\nStderr:\n${testResult.stderr}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      className="animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: 'var(--space-4)',
          borderBottom: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: 'var(--color-brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={18} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Hook Simulator & Playground
                </h2>
                <span style={{
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-brand-primary)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  {hook.name}
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                Test this hook in a sandboxed subprocess with mock tool parameters to verify decision logic.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-tertiary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 'var(--space-4)', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Target Hook Command Summary */}
          <div style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-bg-surface-hover)',
            border: '1px solid var(--color-border-subtle)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)'
          }}>
            <div style={{ color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
              TARGET HOOK SCRIPT:
            </div>
            <div style={{ color: 'var(--color-brand-primary)', wordBreak: 'break-all' }}>
              {hook.command}
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              Select Mock Payload Preset
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {presets.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setMockPayload(p.payload)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    border: '1px solid var(--color-border-subtle)',
                    backgroundColor: mockPayload === p.payload ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    color: mockPayload === p.payload ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Sparkles size={11} />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payload Editor */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
              Mock Tool Call Input (passed via standard input)
            </label>
            <textarea
              rows={6}
              value={mockPayload}
              onChange={(e) => setMockPayload(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-surface-hover)',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                lineHeight: '1.4'
              }}
            />
          </div>

          {/* Action Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <button
              onClick={handleRunTest}
              disabled={isRunning}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-brand-primary)',
                color: '#fff',
                border: 'none',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: isRunning ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)'
              }}
            >
              {isRunning ? (
                <>
                  <RotateCcw size={14} className="animate-spin" />
                  <span>Simulating...</span>
                </>
              ) : (
                <>
                  <Play size={14} fill="currentColor" />
                  <span>Execute Simulation</span>
                </>
              )}
            </button>
          </div>

          {/* Simulation Output Section */}
          {testResult && (
            <div 
              className="animate-fade-in"
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-bg-surface-hover)',
                border: '1px solid var(--color-border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)'
              }}
            >
              {/* Output Header with Decision Pill */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    SIMULATION RESULT:
                  </span>

                  {/* Decision Tag */}
                  {testResult.decision === 'allow' && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 9px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: 'var(--color-status-success-text)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      <CheckCircle2 size={12} /> ALLOWED
                    </span>
                  )}

                  {testResult.decision === 'deny' && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 9px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      color: 'var(--color-status-error-text)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      <AlertOctagon size={12} /> DENIED / BLOCKED
                    </span>
                  )}

                  {testResult.decision === 'modify' && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 9px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      color: 'var(--color-status-warning-text)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      <AlertTriangle size={12} /> MODIFIED CONTEXT
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '0.6875rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-tertiary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}>
                    <Clock size={10} /> {testResult.latencyMs}ms
                  </span>

                  <button
                    onClick={handleCopyOutput}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: copied ? 'var(--color-status-success-text)' : 'var(--color-text-tertiary)',
                      cursor: 'pointer',
                      fontSize: '0.6875rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy Output'}</span>
                  </button>
                </div>
              </div>

              {/* Reason Banner if present */}
              {testResult.reason && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: testResult.decision === 'deny' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                  color: testResult.decision === 'deny' ? 'var(--color-status-error-text)' : 'var(--color-brand-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 500
                }}>
                  Reason: {testResult.reason}
                </div>
              )}

              {/* Terminal Logs View */}
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: '#e2e8f0',
                maxHeight: '180px',
                overflowY: 'auto'
              }}>
                <div style={{ color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>// STDOUT:</div>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{testResult.stdout || '(no stdout output)'}</pre>

                {testResult.stderr && (
                  <>
                    <div style={{ color: 'var(--color-status-error-text)', marginTop: '8px', marginBottom: '4px' }}>// STDERR:</div>
                    <pre style={{ margin: 0, color: 'var(--color-status-error-text)', whiteSpace: 'pre-wrap' }}>{testResult.stderr}</pre>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
