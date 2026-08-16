import React, { useState, useEffect } from 'react';
import { useMcpStore, McpServer } from '../../stores/useMcpStore';
import { useAgentsStore } from '../../stores/useAgentsStore';
import { 
  X, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save, 
  Server
} from 'lucide-react';

interface McpEditorModalProps {
  server?: McpServer | null;
  onClose: () => void;
}

export const McpEditorModal: React.FC<McpEditorModalProps> = ({ server, onClose }) => {
  const { createServer, updateServer } = useMcpStore();
  const { agents, fetchAgents } = useAgentsStore();

  const isEditing = Boolean(server);

  const [name, setName] = useState(server?.name || '');
  const [description, setDescription] = useState(server?.description || '');
  const [transport, setTransport] = useState<'stdio' | 'sse' | 'http'>(
    (server?.transport as 'stdio' | 'sse' | 'http') || 'stdio'
  );
  const [command, setCommand] = useState(server?.command || 'npx');
  const [argsList, setArgsList] = useState<string[]>(
    server?.args && Array.isArray(server.args) ? server.args : []
  );
  const [newArg, setNewArg] = useState('');

  const [envPairs, setEnvPairs] = useState<Array<{ key: string; value: string; isSecret: boolean }>>(() => {
    if (server?.env && typeof server.env === 'object') {
      return Object.entries(server.env).map(([k, v]) => ({ key: k, value: String(v), isSecret: false }));
    }
    return [];
  });

  const [url, setUrl] = useState(server?.url || '');
  const [headersPairs, setHeadersPairs] = useState<Array<{ key: string; value: string }>>(() => {
    if (server?.headers && typeof server.headers === 'object') {
      return Object.entries(server.headers).map(([k, v]) => ({ key: k, value: String(v) }));
    }
    return [];
  });

  const [scope, setScope] = useState<'workspace' | 'global'>(
    (server?.scope as 'workspace' | 'global') || 'workspace'
  );
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>(() => {
    if (server?.agents) {
      return server.agents.map(a => a.id);
    }
    return [];
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    if (!server && agents.length > 0 && selectedAgentIds.length === 0) {
      setSelectedAgentIds(agents.map(a => a.id));
    }
  }, [server, agents, selectedAgentIds]);

  const handleAddArg = () => {
    if (newArg.trim()) {
      setArgsList([...argsList, newArg.trim()]);
      setNewArg('');
    }
  };

  const handleRemoveArg = (index: number) => {
    setArgsList(argsList.filter((_, i) => i !== index));
  };

  const handleAddEnv = () => {
    setEnvPairs([...envPairs, { key: '', value: '', isSecret: false }]);
  };

  const handleRemoveEnv = (index: number) => {
    setEnvPairs(envPairs.filter((_, i) => i !== index));
  };

  const handleAddHeader = () => {
    setHeadersPairs([...headersPairs, { key: '', value: '' }]);
  };

  const handleRemoveHeader = (index: number) => {
    setHeadersPairs(headersPairs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const envObj: Record<string, string> = {};
      envPairs.forEach(p => {
        if (p.key.trim()) envObj[p.key.trim()] = p.value;
      });

      const headersObj: Record<string, string> = {};
      headersPairs.forEach(h => {
        if (h.key.trim()) headersObj[h.key.trim()] = h.value;
      });

      const payload = {
        name: name.trim(),
        description: description.trim(),
        transport,
        command: transport === 'stdio' ? command.trim() : null,
        args: transport === 'stdio' ? argsList : [],
        env: envObj,
        url: transport !== 'stdio' ? url.trim() : null,
        headers: headersObj,
        scope,
        agentIds: selectedAgentIds
      };

      if (isEditing && server) {
        await updateServer(server.id, payload);
      } else {
        await createServer(payload);
      }

      setIsSaving(false);
      onClose();
    } catch (err) {
      console.error(err);
      setIsSaving(false);
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
          maxWidth: '680px',
          maxHeight: '90vh',
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
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-brand-primary)'
            }}>
              <Server size={18} />
            </div>

            <div>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {isEditing ? `Edit ${server?.name}` : 'Add Custom MCP Server'}
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Configure stdio process arguments or SSE/HTTP stream endpoints
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
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Server Name & Transport Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Server Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. postgres-db or local-git"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-surface-hover)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.8125rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Transport Protocol
              </label>
              <select
                value={transport}
                onChange={(e) => setTransport(e.target.value as any)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-surface-hover)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.8125rem'
                }}
              >
                <option value="stdio">stdio (Local Command / Process)</option>
                <option value="sse">sse (Server-Sent Events HTTP)</option>
                <option value="http">http (HTTP Streaming Endpoint)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Description
            </label>
            <input
              type="text"
              placeholder="Brief description of tools and capabilities..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-surface-hover)',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-primary)',
                fontSize: '0.8125rem'
              }}
            />
          </div>

          {/* Stdio Specific Fields */}
          {transport === 'stdio' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Command Binary *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. npx, uvx, node, python, docker"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-surface-hover)',
                    border: '1px solid var(--color-border-subtle)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.8125rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>

              {/* Arguments Array Builder */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Launch Arguments
                </label>

                {argsList.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    {argsList.map((arg, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-bg-surface-active)',
                          border: '1px solid var(--color-border-subtle)',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        <span>{arg}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveArg(idx)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text-tertiary)',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Add argument (e.g. -y, @modelcontextprotocol/server-postgres)..."
                    value={newArg}
                    onChange={(e) => setNewArg(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddArg();
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '7px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-bg-surface-hover)',
                      border: '1px solid var(--color-border-subtle)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.8125rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddArg}
                    className="btn-secondary"
                    style={{
                      padding: '7px 14px',
                      fontSize: '0.75rem',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    Add Arg
                  </button>
                </div>
              </div>

              {/* Environment Variables Builder */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Environment Variables
                  </label>
                  <button
                    type="button"
                    onClick={handleAddEnv}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-brand-primary)',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus size={12} /> Add Variable
                  </button>
                </div>

                {envPairs.map((pair, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="KEY (e.g. API_KEY)"
                      value={pair.key}
                      onChange={(e) => {
                        const next = [...envPairs];
                        next[idx].key = e.target.value;
                        setEnvPairs(next);
                      }}
                      style={{
                        flex: '0 0 35%',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg-surface-hover)',
                        border: '1px solid var(--color-border-subtle)',
                        color: 'var(--color-brand-primary)',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)'
                      }}
                    />
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: 'var(--color-bg-surface-hover)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      <input
                        type={pair.isSecret ? 'password' : 'text'}
                        placeholder="Value..."
                        value={pair.value}
                        onChange={(e) => {
                          const next = [...envPairs];
                          next[idx].value = e.target.value;
                          setEnvPairs(next);
                        }}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          color: 'var(--color-text-primary)',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...envPairs];
                          next[idx].isSecret = !next[idx].isSecret;
                          setEnvPairs(next);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--color-text-tertiary)',
                          padding: '4px 6px',
                          cursor: 'pointer'
                        }}
                      >
                        {pair.isSecret ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEnv(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-status-error-text)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* SSE / HTTP Specific Fields */}
          {transport !== 'stdio' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Endpoint URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="http://localhost:8000/sse"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-surface-hover)',
                    border: '1px solid var(--color-border-subtle)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.8125rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>

              {/* Headers Builder */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    HTTP Headers
                  </label>
                  <button
                    type="button"
                    onClick={handleAddHeader}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-brand-primary)',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus size={12} /> Add Header
                  </button>
                </div>

                {headersPairs.map((pair, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Header Name (e.g. Authorization)"
                      value={pair.key}
                      onChange={(e) => {
                        const next = [...headersPairs];
                        next[idx].key = e.target.value;
                        setHeadersPairs(next);
                      }}
                      style={{
                        flex: '0 0 40%',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg-surface-hover)',
                        border: '1px solid var(--color-border-subtle)',
                        color: 'var(--color-text-primary)',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Header Value"
                      value={pair.value}
                      onChange={(e) => {
                        const next = [...headersPairs];
                        next[idx].value = e.target.value;
                        setHeadersPairs(next);
                      }}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg-surface-hover)',
                        border: '1px solid var(--color-border-subtle)',
                        color: 'var(--color-text-primary)',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveHeader(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-status-error-text)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Scope & Agent Associations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Configuration Scope
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as any)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-surface-hover)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.8125rem'
                }}
              >
                <option value="workspace">Workspace (.agents/mcp_config.json)</option>
                <option value="global">Global User Scope</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Target AI Agents
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-md)',
                        border: isAssigned ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border-subtle)',
                        backgroundColor: isAssigned ? 'rgba(59, 130, 246, 0.15)' : 'var(--color-bg-surface-hover)',
                        color: isAssigned ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      {ag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Save Button */}
          <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem' }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-brand-primary)',
                color: '#fff',
                border: 'none',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Save size={14} />
              <span>{isSaving ? 'Saving...' : (isEditing ? 'Update MCP Server' : 'Save MCP Server')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
