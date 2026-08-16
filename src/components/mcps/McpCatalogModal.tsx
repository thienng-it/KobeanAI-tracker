import React, { useState, useEffect } from 'react';
import { useMcpStore, CuratedMcpTemplate } from '../../stores/useMcpStore';
import { useAgentsStore } from '../../stores/useAgentsStore';
import { 
  X, 
  Sparkles, 
  Search, 
  ArrowRight, 
  Check, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Database, 
  Folder, 
  Brain, 
  Globe, 
  MessageSquare, 
  Box, 
  FileText,
  CheckCircle2,
  Terminal
} from 'lucide-react';

interface McpCatalogModalProps {
  onClose: () => void;
  onInstalled?: (serverId: string) => void;
}

export const McpCatalogModal: React.FC<McpCatalogModalProps> = ({ onClose, onInstalled }) => {
  const { catalog, fetchCatalog, installTemplate } = useMcpStore();
  const { agents, fetchAgents } = useAgentsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<CuratedMcpTemplate | null>(null);

  // Configuration Form State for 1-Click Install
  const [customName, setCustomName] = useState('');
  const [argsInput, setArgsInput] = useState('');
  const [envInputs, setEnvInputs] = useState<Record<string, string>>({});
  const [hiddenSecrets, setHiddenSecrets] = useState<Record<string, boolean>>({});
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    fetchCatalog();
    fetchAgents();
  }, [fetchCatalog, fetchAgents]);

  useEffect(() => {
    if (agents.length > 0 && selectedAgentIds.length === 0) {
      setSelectedAgentIds(agents.map(a => a.id));
    }
  }, [agents, selectedAgentIds]);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'database', name: 'Databases' },
    { id: 'devtools', name: 'DevTools & Code' },
    { id: 'productivity', name: 'Productivity & Memory' },
    { id: 'search', name: 'Web & Search' },
    { id: 'cloud', name: 'Cloud & Containers' },
  ];

  const filteredCatalog = catalog.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.featuredTools.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleSelectTemplate = (template: CuratedMcpTemplate) => {
    setSelectedTemplate(template);
    setCustomName(template.name);
    setArgsInput(template.defaultArgs.join(' '));
    const initialEnv: Record<string, string> = {};
    const initialHidden: Record<string, boolean> = {};
    template.requiredEnv.forEach(e => {
      initialEnv[e.key] = '';
      initialHidden[e.key] = e.secret;
    });
    setEnvInputs(initialEnv);
    setHiddenSecrets(initialHidden);
    setInstalledSuccess(false);
  };

  const handleToggleSecretVisibility = (key: string) => {
    setHiddenSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleInstall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || isInstalling) return;

    setIsInstalling(true);
    try {
      const parsedArgs = argsInput.trim().split(/\s+/).filter(Boolean);
      const serverId = await installTemplate({
        templateId: selectedTemplate.id,
        customName: customName || selectedTemplate.name,
        args: parsedArgs,
        env: envInputs,
        agentIds: selectedAgentIds
      });

      setIsInstalling(false);
      setInstalledSuccess(true);
      if (onInstalled) {
        onInstalled(serverId);
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setIsInstalling(false);
    }
  };

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'Database': return <Database size={20} />;
      case 'Folder': return <Folder size={20} />;
      case 'Brain': return <Brain size={20} />;
      case 'Search': return <Search size={20} />;
      case 'Globe': return <Globe size={20} />;
      case 'Box': return <Box size={20} />;
      case 'MessageSquare': return <MessageSquare size={20} />;
      case 'FileText': return <FileText size={20} />;
      default: return <Sparkles size={20} />;
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
          maxWidth: '1040px',
          height: '85vh',
          maxHeight: '800px',
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
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-status-warning-text)'
            }}>
              <Sparkles size={18} />
            </div>

            <div>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                MCP Registry & Template Catalog
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                1-click install standard, battle-tested Model Context Protocol servers into your workspace
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

        {/* Content Body: Split Layout if a template is selected, or Grid view */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* Main Catalog View */}
          <div style={{
            flex: selectedTemplate ? '0 0 55%' : '1',
            display: 'flex',
            flexDirection: 'column',
            borderRight: selectedTemplate ? '1px solid var(--color-border-subtle)' : 'none',
            minHeight: 0
          }}>
            {/* Filter Bar */}
            <div style={{
              padding: 'var(--space-4) var(--space-6)',
              borderBottom: '1px solid var(--color-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)'
            }}>
              {/* Search */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-surface-hover)',
                border: '1px solid var(--color-border-subtle)'
              }}>
                <Search size={15} style={{ color: 'var(--color-text-tertiary)' }} />
                <input
                  type="text"
                  placeholder="Search curated MCP templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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

              {/* Category Pills */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-full)',
                      border: selectedCategory === cat.id ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border-subtle)',
                      backgroundColor: selectedCategory === cat.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      color: selectedCategory === cat.id ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      transition: 'all var(--duration-fast) ease'
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Cards Grid */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: 'var(--space-6)',
              display: 'grid',
              gridTemplateColumns: selectedTemplate ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'var(--space-4)',
              alignContent: 'start'
            }}>
              {filteredCatalog.map(template => {
                const isSelected = selectedTemplate?.id === template.id;

                return (
                  <div
                    key={template.id}
                    className="glass-panel interactive-card"
                    onClick={() => handleSelectTemplate(template)}
                    style={{
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid var(--color-brand-primary)' : '1px solid var(--color-border-subtle)',
                      backgroundColor: isSelected ? 'var(--color-bg-surface-active)' : 'var(--color-bg-surface-hover)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 'var(--space-3)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'rgba(59, 130, 246, 0.12)',
                            color: 'var(--color-brand-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {getTemplateIcon(template.icon)}
                          </div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                              {template.name}
                            </h4>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)' }}>
                              by {template.author}
                            </span>
                          </div>
                        </div>

                        <span style={{
                          fontSize: '0.625rem',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-bg-surface-active)',
                          color: 'var(--color-text-tertiary)',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          {template.transport}
                        </span>
                      </div>

                      <p style={{
                        margin: 0,
                        fontSize: '0.75rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {template.description}
                      </p>
                    </div>

                    <div>
                      {/* Featured Tools Pills */}
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
                        {template.featuredTools.slice(0, 3).map(tool => (
                          <span
                            key={tool}
                            style={{
                              fontSize: '0.625rem',
                              padding: '1px 5px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              color: 'var(--color-text-secondary)',
                              fontFamily: 'var(--font-mono)'
                            }}
                          >
                            {tool}
                          </span>
                        ))}
                        {template.featuredTools.length > 3 && (
                          <span style={{ fontSize: '0.625rem', color: 'var(--color-text-tertiary)', padding: '1px 3px' }}>
                            +{template.featuredTools.length - 3}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTemplate(template);
                        }}
                        style={{
                          width: '100%',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isSelected ? 'var(--color-brand-primary)' : 'rgba(59, 130, 246, 0.12)',
                          color: isSelected ? '#fff' : 'var(--color-brand-primary)',
                          border: isSelected ? 'none' : '1px solid rgba(59, 130, 246, 0.25)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>{isSelected ? 'Configuring...' : 'Configure & Install'}</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Configuration & Install Drawer */}
          {selectedTemplate && (
            <div style={{
              flex: '0 0 45%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--color-bg-app)',
              minHeight: 0
            }}>
              <div style={{
                padding: 'var(--space-4) var(--space-6)',
                borderBottom: '1px solid var(--color-border-subtle)',
                backgroundColor: 'var(--color-bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Install {selectedTemplate.name}
                  </h3>
                  <a
                    href={selectedTemplate.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--color-brand-primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      textDecoration: 'none',
                      marginTop: '2px'
                    }}
                  >
                    <span>View official docs & repository</span>
                    <ExternalLink size={10} />
                  </a>
                </div>

                <button
                  onClick={() => setSelectedTemplate(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-tertiary)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleInstall} style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {/* Server Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Server Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-bg-surface-hover)',
                      border: '1px solid var(--color-border-subtle)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.8125rem'
                    }}
                  />
                </div>

                {/* Command & Arguments */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Command & Launch Arguments
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'var(--color-bg-surface-hover)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden'
                  }}>
                    <span style={{
                      padding: '7px 10px',
                      backgroundColor: 'var(--color-bg-surface-active)',
                      color: 'var(--color-text-tertiary)',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      borderRight: '1px solid var(--color-border-subtle)'
                    }}>
                      {selectedTemplate.command}
                    </span>
                    <input
                      type="text"
                      value={argsInput}
                      onChange={(e) => setArgsInput(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'var(--color-text-primary)',
                        fontSize: '0.8125rem',
                        fontFamily: 'var(--font-mono)'
                      }}
                    />
                  </div>
                </div>

                {/* Required Environment Variables */}
                {selectedTemplate.requiredEnv.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      Environment Variables & Tokens
                    </label>

                    {selectedTemplate.requiredEnv.map(envVar => (
                      <div key={envVar.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-brand-primary)' }}>
                            {envVar.key}
                          </span>
                          <span style={{ fontSize: '0.625rem', color: 'var(--color-text-tertiary)' }}>
                            {envVar.label}
                          </span>
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: 'var(--color-bg-surface-hover)',
                          border: '1px solid var(--color-border-subtle)',
                          borderRadius: 'var(--radius-md)'
                        }}>
                          <input
                            type={hiddenSecrets[envVar.key] ? 'password' : 'text'}
                            placeholder={envVar.placeholder}
                            value={envInputs[envVar.key] || ''}
                            onChange={(e) => setEnvInputs({ ...envInputs, [envVar.key]: e.target.value })}
                            style={{
                              flex: 1,
                              padding: '7px 10px',
                              background: 'transparent',
                              border: 'none',
                              outline: 'none',
                              color: 'var(--color-text-primary)',
                              fontSize: '0.8125rem',
                              fontFamily: 'var(--font-mono)'
                            }}
                          />
                          {envVar.secret && (
                            <button
                              type="button"
                              onClick={() => handleToggleSecretVisibility(envVar.key)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--color-text-tertiary)',
                                padding: '6px 8px',
                                cursor: 'pointer'
                              }}
                            >
                              {hiddenSecrets[envVar.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--color-text-tertiary)' }}>
                          {envVar.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Target AI Agents */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Connect to AI Agents
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {agents.map(ag => {
                      const isAssigned = selectedAgentIds.includes(ag.id);
                      return (
                        <button
                          key={ag.id}
                          type="button"
                          onClick={() => {
                            if (isAssigned) {
                              setSelectedAgentIds(selectedAgentIds.filter(id => id !== ag.id));
                            } else {
                              setSelectedAgentIds([...selectedAgentIds, ag.id]);
                            }
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-md)',
                            border: isAssigned ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border-subtle)',
                            backgroundColor: isAssigned ? 'rgba(59, 130, 246, 0.15)' : 'var(--color-bg-surface-hover)',
                            color: isAssigned ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer'
                          }}
                        >
                          <Terminal size={12} />
                          <span>{ag.name}</span>
                          {isAssigned && <Check size={11} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Action */}
                <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)' }}>
                  <button
                    type="submit"
                    disabled={isInstalling || installedSuccess}
                    style={{
                      width: '100%',
                      padding: '9px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: installedSuccess ? 'var(--color-status-success)' : 'var(--color-brand-primary)',
                      color: '#fff',
                      border: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: isInstalling ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all var(--duration-fast) ease'
                    }}
                  >
                    {installedSuccess ? (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Installed Successfully!</span>
                      </>
                    ) : isInstalling ? (
                      <span>Installing MCP Server...</span>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Install MCP Server to Workspace</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
