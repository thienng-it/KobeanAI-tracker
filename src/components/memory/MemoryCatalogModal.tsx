import React, { useState } from 'react';
import { useMemoryStore, MemoryTemplate } from '../../stores/useMemoryStore';
import { X, Sparkles, Download, Check, Pin } from 'lucide-react';

export const MemoryCatalogModal: React.FC = () => {
  const { isCatalogOpen, closeCatalog, templates, installTemplate } = useMemoryStore();
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installedIds, setInstalledIds] = useState<string[]>([]);

  if (!isCatalogOpen) return null;

  const handleInstall = async (tmpl: MemoryTemplate) => {
    setInstallingId(tmpl.id);
    try {
      const success = await installTemplate(tmpl.id);
      if (success) {
        setInstalledIds(prev => [...prev, tmpl.id]);
      }
    } finally {
      setInstallingId(null);
    }
  };

  const getPriorityBadgeColor = (prio: string) => {
    switch (prio) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'normal': return '#3b82f6';
      default: return '#64748b';
    }
  };

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
      onClick={closeCatalog}
    >
      <div
        className="glass-panel animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '88vh',
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
                backgroundColor: 'rgba(236, 72, 153, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ec4899'
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Curated Memory Bank Marketplace
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                1-Click install architectural directives and guardrails into your workspace
              </span>
            </div>
          </div>

          <button
            onClick={closeCatalog}
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

        {/* Templates Grid */}
        <div style={{ padding: 'var(--space-5)', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-4)' }}>
          {templates.map(tmpl => {
            const isInstalled = installedIds.includes(tmpl.id);
            const isInstalling = installingId === tmpl.id;
            const prioColor = getPriorityBadgeColor(tmpl.priority);

            return (
              <div
                key={tmpl.id}
                className="glass-panel"
                style={{
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-xl)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px',
                  border: '1px solid var(--color-border-subtle)',
                  backgroundColor: 'var(--color-bg-surface-hover)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: prioColor,
                          backgroundColor: `${prioColor}15`,
                          border: `1px solid ${prioColor}40`,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          textTransform: 'uppercase'
                        }}
                      >
                        {tmpl.priority}
                      </span>
                      {tmpl.pinned && (
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            color: '#ec4899',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <Pin size={11} /> Pinned
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 style={{ margin: '0 0 6px', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {tmpl.title}
                  </h3>

                  <p style={{ margin: '0 0 10px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                    {tmpl.description}
                  </p>

                  <div
                    style={{
                      backgroundColor: 'var(--color-bg-surface)',
                      border: '1px solid var(--color-border-subtle)',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-primary)',
                      lineHeight: 1.4,
                      maxHeight: '75px',
                      overflowY: 'auto'
                    }}
                  >
                    {tmpl.content}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--color-border-subtle)' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {tmpl.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleInstall(tmpl)}
                    disabled={isInstalled || isInstalling}
                    className={isInstalled ? 'btn-secondary' : 'btn-primary'}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    {isInstalled ? (
                      <>
                        <Check size={12} color="var(--color-status-success)" />
                        <span>Installed</span>
                      </>
                    ) : (
                      <>
                        <Download size={12} />
                        <span>{isInstalling ? 'Installing...' : '1-Click Install'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
