import React, { useState, useEffect } from 'react';
import { usePluginStore, CuratedPluginTemplate } from '../../stores/usePluginStore';
import { 
  X, 
  Sparkles, 
  Search, 
  Check, 
  ExternalLink, 
  BrainCircuit, 
  FolderDown,
  RefreshCw
} from 'lucide-react';

interface PluginCatalogModalProps {
  onClose: () => void;
  onInstalled?: (pluginId: string) => void;
}

export const PluginCatalogModal: React.FC<PluginCatalogModalProps> = ({
  onClose,
  onInstalled
}) => {
  const { fetchCatalog, installFromCatalog } = usePluginStore();
  const [catalog, setCatalog] = useState<CuratedPluginTemplate[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installedId, setInstalledId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCatalog().then(data => {
      setCatalog(data);
      setIsLoading(false);
    });
  }, [fetchCatalog]);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'science', label: 'Science & Bio' },
    { id: 'devtools', label: 'Developer Tools' },
    { id: 'cloud', label: 'Cloud & Backend' },
    { id: 'frontend', label: 'Web & UI/UX' },
    { id: 'ai', label: 'AI & Multi-Agent' },
  ];

  const filteredCatalog = catalog.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleInstall = async (template: CuratedPluginTemplate) => {
    setInstallingId(template.id);
    const result = await installFromCatalog(template.id);
    setInstallingId(null);

    if (result.success) {
      setInstalledId(template.id);
      if (onInstalled && result.id) {
        onInstalled(result.id);
      }
      setTimeout(() => {
        setInstalledId(null);
      }, 3000);
    } else {
      alert(`Installation failed: ${result.error || 'Unknown error'}`);
    }
  };

  return (
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 'var(--space-4)',
        animation: 'fadeIn var(--duration-fast) ease'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '960px',
          height: '85vh',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'var(--color-bg-surface)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--color-border-subtle)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4) var(--space-6)',
          borderBottom: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface-hover)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(234, 179, 8, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-status-warning-text)'
            }}>
              <Sparkles size={18} />
            </div>

            <div>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                1-Click Plugins Marketplace
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Curated AI agent plugins, bundled specialized skills, and tool extensions
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
            <X size={20} />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          padding: 'var(--space-4) var(--space-6)',
          borderBottom: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface)'
        }}>
          {/* Search Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-surface-hover)',
            border: '1px solid var(--color-border-subtle)'
          }}>
            <Search size={16} color="var(--color-text-tertiary)" />
            <input
              type="text"
              placeholder="Search plugin catalog by name, category, or bundled skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--color-text-primary)',
                fontSize: '0.875rem',
                width: '100%'
              }}
            />
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: selectedCategory === cat.id ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border-subtle)',
                  backgroundColor: selectedCategory === cat.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: selectedCategory === cat.id ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all var(--duration-fast) ease'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-tertiary)' }}>
              Loading plugins catalog...
            </div>
          ) : filteredCatalog.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-tertiary)' }}>
              No plugins match your filter.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: 'var(--space-4)'
            }}>
              {filteredCatalog.map(template => {
                const isInstalling = installingId === template.id;
                const isInstalled = installedId === template.id;

                return (
                  <div
                    key={template.id}
                    className="glass-panel"
                    style={{
                      padding: 'var(--space-5)',
                      borderRadius: 'var(--radius-xl)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: '1px solid var(--color-border-subtle)',
                      backgroundColor: 'var(--color-bg-surface-hover)'
                    }}
                  >
                    <div>
                      {/* Top Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                              {template.name}
                            </h3>

                            <span style={{
                              fontSize: '0.625rem',
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--color-brand-primary)',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              padding: '1px 5px',
                              borderRadius: 'var(--radius-sm)'
                            }}>
                              v{template.version}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                            by {template.author}
                          </div>
                        </div>

                        {template.repository && (
                          <a
                            href={template.repository}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: 'var(--color-text-tertiary)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.6875rem',
                              textDecoration: 'none'
                            }}
                          >
                            <span>Repo</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>

                      {/* Description */}
                      <p style={{
                        margin: 'var(--space-3) 0 0 0',
                        fontSize: '0.8125rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.45'
                      }}>
                        {template.description}
                      </p>

                      {/* Bundled Skills tags */}
                      <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', marginRight: '2px' }}>
                          Skills:
                        </span>
                        {template.skills.slice(0, 4).map((s, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.625rem',
                              fontFamily: 'var(--font-mono)',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'rgba(255, 255, 255, 0.04)',
                              color: 'var(--color-text-secondary)',
                              border: '1px solid var(--color-border-subtle)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            <BrainCircuit size={10} style={{ opacity: 0.7 }} />
                            <span>{s}</span>
                          </span>
                        ))}
                        {template.skills.length > 4 && (
                          <span style={{ fontSize: '0.625rem', color: 'var(--color-brand-primary)', fontWeight: 600 }}>
                            +{template.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer / Install Button */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 'var(--space-4)',
                      borderTop: '1px solid var(--color-border-subtle)',
                      marginTop: 'var(--space-4)'
                    }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {template.hasMcp && (
                          <span style={{ fontSize: '0.625rem', padding: '1px 5px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }}>
                            MCP Included
                          </span>
                        )}
                        {template.hasHooks && (
                          <span style={{ fontSize: '0.625rem', padding: '1px 5px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(244, 114, 182, 0.1)', color: '#f472b6' }}>
                            Hooks
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleInstall(template)}
                        disabled={isInstalling}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isInstalled ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-brand-primary)',
                          border: isInstalled ? '1px solid rgba(16, 185, 129, 0.3)' : 'none',
                          color: isInstalled ? 'var(--color-status-success-text)' : '#fff',
                          cursor: isInstalling ? 'not-allowed' : 'pointer',
                          transition: 'all var(--duration-fast) ease'
                        }}
                      >
                        {isInstalling ? (
                          <>
                            <RefreshCw size={12} className="animate-spin" />
                            <span>Scaffolding...</span>
                          </>
                        ) : isInstalled ? (
                          <>
                            <Check size={12} />
                            <span>Installed in Workspace!</span>
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
