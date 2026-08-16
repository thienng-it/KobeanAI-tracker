import React, { useState } from 'react';
import { useMemoryStore } from '../../stores/useMemoryStore';
import { 
  X, 
  Sparkles, 
  Search, 
  Zap, 
  Pin, 
  CheckCircle2, 
  HelpCircle
} from 'lucide-react';

export const MemoryContextSimulatorModal: React.FC = () => {
  const { 
    isSimulatorOpen, 
    closeSimulator, 
    simulatorPrompt, 
    simulatorResults, 
    simulatorTotalTokens, 
    isSimulating, 
    simulateContext 
  } = useMemoryStore();

  const [inputPrompt, setInputPrompt] = useState(simulatorPrompt || '');

  if (!isSimulatorOpen) return null;

  const handleRunSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;
    simulateContext(inputPrompt);
  };

  const samplePresets = [
    'Fix Gitleaks CI failure with mock database connection',
    'Create new Express backend route using Drizzle ORM',
    'Refactor panel animations with spring curves and glassmorphism',
    'Install a new npm package for formatting numbers'
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)'
      }}
      onClick={closeSimulator}
    >
      <div
        className="glass-panel animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-2xl)',
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--color-border-subtle)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--space-5)',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-brand-primary)'
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Agent Memory Context Simulator
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                Simulate how autonomous coding assistants recall and inject memories for any prompt
              </span>
            </div>
          </div>

          <button
            onClick={closeSimulator}
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

        {/* Query Input Section */}
        <div style={{ padding: 'var(--space-5)', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <form onSubmit={handleRunSimulation} style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Enter any user prompt to simulate memory recall..."
                value={inputPrompt}
                onChange={e => setInputPrompt(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                  backgroundColor: 'var(--color-bg-surface)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isSimulating || !inputPrompt.trim()}
              className="btn-primary"
              style={{
                padding: '0 20px',
                fontSize: '0.875rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <Search size={15} />
              <span>{isSimulating ? 'Evaluating...' : 'Simulate Context'}</span>
            </button>
          </form>

          {/* Quick Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)' }}>Presets:</span>
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputPrompt(preset);
                  simulateContext(preset);
                }}
                style={{
                  fontSize: '0.6875rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-bg-surface-hover)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {preset.length > 35 ? `${preset.slice(0, 35)}...` : preset}
              </button>
            ))}
          </div>
        </div>

        {/* Results Container */}
        <div style={{ padding: 'var(--space-5)', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {simulatorResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--color-text-tertiary)' }}>
              <HelpCircle size={32} style={{ opacity: 0.4, margin: '0 auto 8px' }} />
              <p style={{ margin: '0 0 4px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                No active memory query evaluated.
              </p>
              <span style={{ fontSize: '0.75rem' }}>
                Type a prompt above or select a preset to test relevance ranking and token costs.
              </span>
            </div>
          ) : (
            <>
              {/* Telemetry Summary */}
              <div
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--color-brand-primary)" />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                    {simulatorResults.length} Memories Recalled for Context Window
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>
                  <Zap size={13} />
                  <span>+{simulatorTotalTokens} tokens injected</span>
                </div>
              </div>

              {/* Memory Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {simulatorResults.map((item, idx) => (
                  <div
                    key={item.memory.id || idx}
                    className="glass-panel"
                    style={{
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border-subtle)',
                      backgroundColor: 'var(--color-bg-surface-hover)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: 'var(--color-brand-primary)',
                            backgroundColor: 'rgba(59, 130, 246, 0.15)',
                            padding: '1px 7px',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          #{idx + 1}
                        </span>
                        <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {item.memory.title}
                        </h4>
                        {item.memory.pinned && (
                          <span style={{ fontSize: '0.6875rem', color: '#ec4899', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            <Pin size={11} /> Pinned
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            color: item.relevanceScore > 75 ? 'var(--color-status-success)' : 'var(--color-status-warning)'
                          }}
                        >
                          {item.relevanceScore}% Match
                        </span>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>
                          {item.tokenCost} tok
                        </span>
                      </div>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-primary)', lineHeight: 1.4, fontFamily: 'var(--font-mono)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', padding: '6px 10px', borderRadius: 'var(--radius-md)' }}>
                      {item.memory.content}
                    </p>

                    {item.matchedTerms.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', color: 'var(--color-text-tertiary)' }}>
                        <span>Matched tokens:</span>
                        {item.matchedTerms.map((t, i) => (
                          <span key={i} style={{ color: 'var(--color-brand-primary)', fontFamily: 'var(--font-mono)' }}>
                            [{t}]
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
