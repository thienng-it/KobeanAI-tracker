import React, { useState, useRef, useEffect } from 'react';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { Sparkles, Bot, Zap, Flame, Cpu, ChevronDown, Check, X, Search, Layers } from 'lucide-react';

interface ModelFilterToolbarProps {
  disabled?: boolean;
}

export const ModelFilterToolbar: React.FC<ModelFilterToolbarProps> = ({ disabled = false }) => {
  const { selectedModel, setSelectedModel, availableModels, fetchAvailableModels } = useDashboardStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAvailableModels();
  }, [fetchAvailableModels]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activeModelOption = availableModels.find(m => m.id === selectedModel);

  const getProviderIcon = (provider: string, modelId: string = '') => {
    const p = (provider || '').toLowerCase();
    const m = (modelId || '').toLowerCase();
    if (p.includes('anthropic') || m.includes('claude')) return <Bot size={13} />;
    if (p.includes('openai') || m.includes('gpt') || m.includes('o1') || m.includes('o3')) return <Zap size={13} />;
    if (p.includes('deepseek') || m.includes('deepseek')) return <Flame size={13} />;
    if (p.includes('google') || m.includes('gemini')) return <Sparkles size={13} />;
    return <Cpu size={13} />;
  };

  const getProviderColor = (provider: string, modelId: string = '') => {
    const p = (provider || '').toLowerCase();
    const m = (modelId || '').toLowerCase();
    if (p.includes('anthropic') || m.includes('claude')) return '#ea580c';
    if (p.includes('openai') || m.includes('gpt') || m.includes('o1') || m.includes('o3')) return '#10b981';
    if (p.includes('deepseek') || m.includes('deepseek')) return '#06b6d4';
    if (p.includes('google') || m.includes('gemini')) return '#3b82f6';
    return '#8b5cf6';
  };

  const formatContextWindow = (tokens: number) => {
    if (!tokens) return '';
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(tokens % 1000000 === 0 ? 0 : 1)}M`;
    if (tokens >= 1000) return `${Math.round(tokens / 1000)}k`;
    return `${tokens}`;
  };

  const filteredModels = availableModels.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.provider.toLowerCase().includes(q) ||
      m.rawModels.some(r => r.toLowerCase().includes(q))
    );
  });

  const totalSessionsAcrossAll = availableModels.reduce((acc, m) => acc + m.sessionCount, 0);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="glass-panel"
        title="Filter dashboard and statistics by AI model"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          height: '32px',
          padding: '0 12px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: selectedModel !== 'all' ? 'var(--color-bg-surface-active)' : 'var(--color-bg-surface)',
          border: selectedModel !== 'all' 
            ? `1px solid ${activeModelOption?.specs?.color || 'var(--color-brand-primary)'}70` 
            : '1px solid var(--color-border-subtle)',
          color: 'var(--color-text-primary)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all var(--duration-fast) var(--ease-spring-smooth)',
          boxShadow: selectedModel !== 'all' ? '0 1px 4px rgba(0, 0, 0, 0.2)' : 'none',
          userSelect: 'none'
        }}
      >
        {selectedModel === 'all' ? (
          <>
            <Layers size={13} color="var(--color-brand-primary)" />
            <span>All Models</span>
          </>
        ) : (
          <>
            <span style={{ color: activeModelOption?.specs?.color || getProviderColor(activeModelOption?.provider || '', selectedModel) }}>
              {getProviderIcon(activeModelOption?.provider || '', selectedModel)}
            </span>
            <span>{activeModelOption?.name || selectedModel}</span>
            {activeModelOption?.specs?.supportsThinking && (
              <span style={{
                fontSize: '0.625rem',
                padding: '1px 5px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(168, 85, 247, 0.15)',
                color: '#a855f7',
                fontWeight: 700
              }}>
                Thinking
              </span>
            )}
          </>
        )}

        <ChevronDown size={12} style={{ opacity: 0.7, marginLeft: '2px' }} />
      </button>

      {/* Clear Button if filtered */}
      {selectedModel !== 'all' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedModel('all');
          }}
          title="Reset to all models"
          style={{
            marginLeft: '4px',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-tertiary)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 'var(--radius-full)'
          }}
        >
          <X size={12} />
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="glass-panel animate-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 100,
            width: '320px',
            maxHeight: '420px',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--color-border-default)',
            backgroundColor: 'var(--color-bg-surface)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header & Search */}
          <div style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--color-border-subtle)' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: '8px', color: 'var(--color-text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search models or providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '6px 8px 6px 28px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-surface-hover)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.75rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Model List */}
          <div style={{ overflowY: 'auto', maxHeight: '340px', padding: '4px 0' }}>
            {/* All Models Option */}
            <div
              onClick={() => {
                setSelectedModel('all');
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                cursor: 'pointer',
                backgroundColor: selectedModel === 'all' ? 'var(--color-status-info-bg)' : 'transparent',
                transition: 'background var(--duration-fast) ease'
              }}
              onMouseEnter={(e) => {
                if (selectedModel !== 'all') e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)';
              }}
              onMouseLeave={(e) => {
                if (selectedModel !== 'all') e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '24px', height: '24px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-bg-surface-active)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-brand-primary)'
                }}>
                  <Layers size={13} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    All Models
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)' }}>
                    Aggregate workspace telemetry
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-bg-surface-hover)',
                  color: 'var(--color-text-secondary)'
                }}>
                  {totalSessionsAcrossAll} sessions
                </span>
                {selectedModel === 'all' && <Check size={14} color="var(--color-brand-primary)" />}
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--color-border-subtle)', margin: '4px 0' }} />

            {/* List of Models */}
            {filteredModels.length === 0 ? (
              <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.75rem' }}>
                No matching models found.
              </div>
            ) : (
              filteredModels.map((m) => {
                const isSelected = selectedModel === m.id;
                const color = m.specs?.color || getProviderColor(m.provider, m.id);

                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedModel(m.id);
                      setIsOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--color-status-info-bg)' : 'transparent',
                      transition: 'background var(--duration-fast) ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '24px', height: '24px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: m.specs?.badgeBg || `${color}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: color
                      }}>
                        {getProviderIcon(m.provider, m.id)}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {m.name}
                          </span>
                          {m.specs?.supportsThinking && (
                            <span style={{
                              fontSize: '0.5625rem',
                              padding: '0 4px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: 'rgba(168, 85, 247, 0.15)',
                              color: '#a855f7',
                              fontWeight: 700
                            }}>
                              THINK
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', color: 'var(--color-text-tertiary)' }}>
                          <span>{m.provider}</span>
                          {m.specs?.contextWindow && (
                            <>
                              <span>•</span>
                              <span>{formatContextWindow(m.specs.contextWindow)} ctx</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {m.sessionCount > 0 && (
                        <span style={{
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-bg-surface-hover)',
                          color: 'var(--color-text-secondary)',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          {m.sessionCount}
                        </span>
                      )}
                      {isSelected && <Check size={14} color="var(--color-brand-primary)" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
