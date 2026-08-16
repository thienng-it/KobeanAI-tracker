import React, { useState, useMemo } from 'react';
import { McpServer } from '../../stores/useMcpStore';
import { JsonSchemaViewer } from './JsonSchemaViewer';
import { 
  X, 
  Wrench, 
  Search, 
  Play, 
  Code2, 
  Copy, 
  Check, 
  Info,
  CheckCircle2
} from 'lucide-react';

interface McpToolInspectorModalProps {
  server: McpServer;
  initialToolName?: string;
  onClose: () => void;
}

export const McpToolInspectorModal: React.FC<McpToolInspectorModalProps> = ({
  server,
  initialToolName,
  onClose
}) => {
  const tools = server.tools || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToolId, setSelectedToolId] = useState<string>(() => {
    if (initialToolName) {
      const match = tools.find(t => t.name === initialToolName);
      if (match) return match.id;
    }
    return tools.length > 0 ? tools[0].id : '';
  });

  const [activeTab, setActiveTab] = useState<'schema' | 'playground' | 'instructions'>('schema');
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedInvocation, setCopiedInvocation] = useState(false);

  // Playground simulated state
  const [playgroundInputs, setPlaygroundInputs] = useState<Record<string, any>>({});
  const [simulationResult, setSimulationResult] = useState<{ executed: boolean; payload: any } | null>(null);

  const filteredTools = useMemo(() => {
    return tools.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [tools, searchQuery]);

  const currentTool = useMemo(() => {
    return tools.find(t => t.id === selectedToolId) || (tools.length > 0 ? tools[0] : null);
  }, [tools, selectedToolId]);

  const handleCopySchema = () => {
    if (!currentTool) return;
    navigator.clipboard.writeText(JSON.stringify(currentTool.parameters, null, 2));
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const handleCopyInvocation = () => {
    if (!currentTool) return;
    const invocation = `call_mcp_tool({\n  ServerName: "${server.name}",\n  ToolName: "${currentTool.name}",\n  Arguments: ${JSON.stringify(playgroundInputs, null, 2)}\n})`;
    navigator.clipboard.writeText(invocation);
    setCopiedInvocation(true);
    setTimeout(() => setCopiedInvocation(false), 2000);
  };

  const handleSimulateCall = () => {
    if (!currentTool) return;
    setSimulationResult({
      executed: true,
      payload: {
        server: server.name,
        tool: currentTool.name,
        transport: server.transport,
        arguments: playgroundInputs,
        timestamp: new Date().toISOString()
      }
    });
  };

  const handleInputChange = (field: string, val: any) => {
    setPlaygroundInputs(prev => ({
      ...prev,
      [field]: val
    }));
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
          maxHeight: '780px',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
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
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-brand-primary)'
            }}>
              <Wrench size={18} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {server.name}
                </h2>
                <span style={{
                  fontSize: '0.6875rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  color: 'var(--color-brand-primary)',
                  fontWeight: 600,
                  border: '1px solid rgba(59, 130, 246, 0.25)'
                }}>
                  {server.tools.length} Tools
                </span>
                <span style={{
                  fontSize: '0.6875rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-bg-surface-active)',
                  color: 'var(--color-text-tertiary)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {server.transport}
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                {server.description || 'Model Context Protocol tool inspector & schema explorer'}
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
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: Split Master-Detail Layout */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* Left Column: Tool List with Search */}
          <div style={{
            width: '320px',
            borderRight: '1px solid var(--color-border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--color-bg-surface)'
          }}>
            {/* Search Tools Input */}
            <div style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--color-border-subtle)' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-surface-hover)',
                border: '1px solid var(--color-border-subtle)'
              }}>
                <Search size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                <input
                  type="text"
                  placeholder="Filter tools..."
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
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-2)' }}>
              {filteredTools.length === 0 ? (
                <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.8125rem' }}>
                  No tools matched "{searchQuery}"
                </div>
              ) : (
                filteredTools.map((t) => {
                  const isSelected = t.id === currentTool?.id;
                  const propCount = Object.keys(t.parameters?.properties || {}).length;

                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedToolId(t.id);
                        setSimulationResult(null);
                        setPlaygroundInputs({});
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        margin: '2px 0',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isSelected ? 'var(--color-bg-surface-active)' : 'transparent',
                        border: isSelected ? '1px solid var(--color-brand-primary)' : '1px solid transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        transition: 'all var(--duration-fast) ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: isSelected ? 'var(--color-brand-primary)' : 'var(--color-text-primary)',
                          fontFamily: 'var(--font-mono)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {t.name}
                        </span>

                        <span style={{
                          fontSize: '0.625rem',
                          color: 'var(--color-text-tertiary)',
                          backgroundColor: 'var(--color-bg-surface-hover)',
                          padding: '1px 5px',
                          borderRadius: 'var(--radius-sm)',
                          fontFamily: 'var(--font-mono)',
                          flexShrink: 0
                        }}>
                          {propCount} {propCount === 1 ? 'arg' : 'args'}
                        </span>
                      </div>

                      {t.description && (
                        <p style={{
                          margin: 0,
                          fontSize: '0.6875rem',
                          color: 'var(--color-text-secondary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {t.description}
                        </p>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Active Tool Inspector */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, backgroundColor: 'var(--color-bg-app)' }}>
            {currentTool ? (
              <>
                {/* Tool Detail Header */}
                <div style={{
                  padding: 'var(--space-4) var(--space-6)',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  backgroundColor: 'var(--color-bg-surface)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
                    <div>
                      <h3 style={{
                        margin: 0,
                        fontSize: '1rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-brand-primary)'
                      }}>
                        {currentTool.name}
                      </h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: '1.45' }}>
                        {currentTool.description || 'No tool description provided in schema.'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        onClick={handleCopySchema}
                        className="btn-secondary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '5px 10px',
                          fontSize: '0.75rem',
                          borderRadius: 'var(--radius-md)'
                        }}
                      >
                        {copiedSchema ? <Check size={12} color="var(--color-status-success-text)" /> : <Code2 size={12} />}
                        <span>{copiedSchema ? 'Copied' : 'Copy Schema'}</span>
                      </button>

                      <button
                        onClick={handleCopyInvocation}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '5px 10px',
                          fontSize: '0.75rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-brand-primary)',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        {copiedInvocation ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedInvocation ? 'Copied' : 'Copy Invocation'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'var(--space-4)' }}>
                    <button
                      onClick={() => setActiveTab('schema')}
                      style={{
                        padding: '4px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: activeTab === 'schema' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                        color: activeTab === 'schema' ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)',
                        transition: 'all var(--duration-fast) ease'
                      }}
                    >
                      Parameter Schema
                    </button>
                    <button
                      onClick={() => setActiveTab('playground')}
                      style={{
                        padding: '4px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: activeTab === 'playground' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                        color: activeTab === 'playground' ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)',
                        transition: 'all var(--duration-fast) ease'
                      }}
                    >
                      Payload Simulator / Playground
                    </button>
                    {server.metadata?.instructions && (
                      <button
                        onClick={() => setActiveTab('instructions')}
                        style={{
                          padding: '4px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-md)',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: activeTab === 'instructions' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                          color: activeTab === 'instructions' ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)',
                          transition: 'all var(--duration-fast) ease'
                        }}
                      >
                        Server Instructions
                      </button>
                    )}
                  </div>
                </div>

                {/* Tab Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)' }}>
                  {activeTab === 'schema' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                      <JsonSchemaViewer
                        schema={currentTool.parameters}
                        rootTitle={`${currentTool.name} Schema`}
                      />

                      {/* Raw JSON Schema preview */}
                      <div style={{
                        marginTop: 'var(--space-4)',
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--color-bg-surface-hover)',
                        border: '1px solid var(--color-border-subtle)'
                      }}>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontWeight: 600, marginBottom: '6px' }}>
                          RAW JSON SCHEMA
                        </div>
                        <pre style={{
                          margin: 0,
                          fontSize: '0.6875rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-text-secondary)',
                          whiteSpace: 'pre-wrap',
                          maxHeight: '180px',
                          overflowY: 'auto'
                        }}>
                          {JSON.stringify(currentTool.parameters, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {activeTab === 'playground' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                      <div style={{
                        padding: 'var(--space-3) var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Info size={16} color="var(--color-brand-primary)" />
                        <span>Simulate arguments to preview the structured JSON payload passed into this MCP tool.</span>
                      </div>

                      {/* Form fields generated from properties */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {Object.entries(currentTool.parameters?.properties || {}).map(([propName, propDef]: [string, any]) => {
                          const isReq = new Set(currentTool.parameters?.required || []).has(propName);
                          return (
                            <div key={propName} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--color-text-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                <span>{propName}</span>
                                {isReq && <span style={{ color: 'var(--color-status-error-text)', fontSize: '0.625rem' }}>*required</span>}
                              </label>
                              
                              <input
                                type="text"
                                placeholder={propDef.description || `Enter ${propDef.type || 'value'}...`}
                                value={playgroundInputs[propName] || ''}
                                onChange={(e) => handleInputChange(propName, e.target.value)}
                                style={{
                                  padding: '7px 12px',
                                  borderRadius: 'var(--radius-md)',
                                  backgroundColor: 'var(--color-bg-surface-hover)',
                                  border: '1px solid var(--color-border-subtle)',
                                  color: 'var(--color-text-primary)',
                                  fontSize: '0.8125rem',
                                  fontFamily: 'var(--font-mono)'
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                        <button
                          onClick={handleSimulateCall}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--color-brand-primary)',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.8125rem',
                            fontWeight: 600
                          }}
                        >
                          <Play size={13} fill="currentColor" />
                          <span>Generate Simulation Payload</span>
                        </button>
                      </div>

                      {/* Simulation Result Preview */}
                      {simulationResult && (
                        <div style={{
                          marginTop: 'var(--space-4)',
                          padding: 'var(--space-4)',
                          borderRadius: 'var(--radius-lg)',
                          backgroundColor: 'var(--color-bg-surface)',
                          border: '1px solid var(--color-border-subtle)',
                          animation: 'fadeIn var(--duration-fast) ease'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 'var(--space-2)'
                          }}>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: 'var(--color-status-success-text)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <CheckCircle2 size={13} /> Tool Call Simulation Payload
                            </span>
                          </div>

                          <pre style={{
                            margin: 0,
                            padding: 'var(--space-3)',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--color-bg-app)',
                            color: '#38bdf8',
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-mono)',
                            overflowX: 'auto'
                          }}>
                            {JSON.stringify(simulationResult.payload, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'instructions' && server.metadata?.instructions && (
                    <div style={{
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--color-bg-surface)',
                      border: '1px solid var(--color-border-subtle)'
                    }}>
                      <pre style={{
                        margin: 0,
                        fontSize: '0.8125rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-text-secondary)',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.5'
                      }}>
                        {server.metadata.instructions}
                      </pre>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-tertiary)',
                fontSize: '0.875rem'
              }}>
                No tool selected
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
