import React, { useState, useEffect } from 'react';
import { useHookStore, CuratedHookTemplate } from '../../stores/useHookStore';
import { 
  X, 
  Sparkles, 
  Search, 
  Check, 
  Zap, 
  Clock, 
  FolderDown,
  RefreshCw
} from 'lucide-react';

interface HookCatalogModalProps {
  onClose: () => void;
  onInstalled?: (hookId: string) => void;
}

export const HookCatalogModal: React.FC<HookCatalogModalProps> = ({
  onClose,
  onInstalled
}) => {
  const { fetchCatalog, installFromCatalog } = useHookStore();
  const [catalog, setCatalog] = useState<CuratedHookTemplate[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installedId, setInstalledId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCatalog().then((data) => {
      setCatalog(data);
      setIsLoading(false);
    });
  }, [fetchCatalog]);

  const handleInstall = async (template: CuratedHookTemplate) => {
    setInstallingId(template.id);
    const res = await installFromCatalog(template.id);
    setInstallingId(null);
    if (res.success && res.id) {
      setInstalledId(template.id);
      if (onInstalled) onInstalled(res.id);
      setTimeout(() => {
        setInstalledId(null);
      }, 2500);
    }
  };

  const filteredCatalog = catalog.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.event.toLowerCase().includes(search.toLowerCase()) ||
      item.matcher.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
          maxWidth: '820px',
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
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--color-status-warning-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={18} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  1-Click Hook Templates Catalog
                </h2>
                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--color-status-warning-text)',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  {catalog.length} Curated Templates
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                Instantly install pre-configured safety gates, formatters, and telemetry guards into `.agents/hooks.json`.
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

        {/* Toolbar: Search & Categories */}
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          borderBottom: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface-hover)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)'
        }}>
          {/* Search input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-bg-surface)',
            padding: '6px 10px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)'
          }}>
            <Search size={15} style={{ color: 'var(--color-text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search hook templates by name, trigger event, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--color-text-primary)',
                fontSize: '0.8125rem',
                width: '100%'
              }}
            />
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'safety', label: 'Safety & Guardrails' },
              { id: 'lint', label: 'Formatting & Lint' },
              { id: 'security', label: 'Security & Secrets' },
              { id: 'workflow', label: 'Workflow Automation' },
              { id: 'observability', label: 'Observability' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '3px 9px',
                  borderRadius: 'var(--radius-sm)',
                  border: selectedCategory === cat.id ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border-subtle)',
                  backgroundColor: selectedCategory === cat.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: selectedCategory === cat.id ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div style={{ padding: 'var(--space-4)', overflowY: 'auto', flex: 1 }}>
          {isLoading ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto var(--space-2) auto' }} />
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Loading curated hooks...</p>
            </div>
          ) : filteredCatalog.length === 0 ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>No templates matched your search criteria.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: 'var(--space-3)'
            }}>
              {filteredCatalog.map(template => {
                const isInstalling = installingId === template.id;
                const isInstalled = installedId === template.id;

                return (
                  <div
                    key={template.id}
                    className="glass-panel"
                    style={{
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      backgroundColor: 'var(--color-bg-surface-hover)',
                      gap: 'var(--space-2)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'rgba(59, 130, 246, 0.15)',
                            color: 'var(--color-brand-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Zap size={16} />
                          </div>

                          <div>
                            <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                              {template.name}
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <span style={{
                                fontSize: '0.625rem',
                                fontWeight: 600,
                                padding: '1px 5px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                color: '#fbbf24'
                              }}>
                                {template.event}
                              </span>
                              <span style={{
                                fontSize: '0.625rem',
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--color-text-tertiary)'
                              }}>
                                matcher: {template.matcher}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p style={{
                        margin: 'var(--space-2) 0 0 0',
                        fontSize: '0.75rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.4'
                      }}>
                        {template.description}
                      </p>
                    </div>

                    {/* Footer Row with 1-Click Install */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 'var(--space-2)',
                      borderTop: '1px solid var(--color-border-subtle)',
                      marginTop: 'var(--space-1)'
                    }}>
                      <span style={{
                        fontSize: '0.6875rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-text-tertiary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <Clock size={10} /> {template.timeout}s
                      </span>

                      <button
                        onClick={() => handleInstall(template)}
                        disabled={isInstalling || isInstalled}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: isInstalling || isInstalled ? 'default' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          backgroundColor: isInstalled 
                            ? 'rgba(16, 185, 129, 0.15)' 
                            : 'var(--color-brand-primary)',
                          color: isInstalled 
                            ? 'var(--color-status-success-text)' 
                            : '#fff',
                          border: isInstalled ? '1px solid rgba(16, 185, 129, 0.3)' : 'none'
                        }}
                      >
                        {isInstalling ? (
                          <>
                            <RefreshCw size={12} className="animate-spin" />
                            <span>Installing...</span>
                          </>
                        ) : isInstalled ? (
                          <>
                            <Check size={12} />
                            <span>Installed!</span>
                          </>
                        ) : (
                          <>
                            <FolderDown size={12} />
                            <span>1-Click Install</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
