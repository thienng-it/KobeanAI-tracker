import { useState, useEffect } from 'react';
import { useAgentsStore, type DetailedAgent, type AgentConfig } from '../stores/useAgentsStore';
import { Terminal, Save, CheckCircle, AlertCircle, RefreshCw, Trash2, Edit2, X } from 'lucide-react';

const AgentConfigCard = ({ agent }: { agent: DetailedAgent }) => {
  const { updateAgent, deleteAgent, testConnection } = useAgentsStore();
  const [config, setConfig] = useState<AgentConfig>(
    (agent.config as AgentConfig) || { authType: 'api_key', apiKey: '', logPath: '' }
  );
  
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [name, setName] = useState(agent.name);
  const [type, setType] = useState(agent.type);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string; error?: string; latencyMs?: number } | null>(null);

  const handleSave = async () => {
    await updateAgent(agent.id, { config, name, type });
    setIsEditingMetadata(false);
    alert('Agent saved!');
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${agent.name}?`)) {
      await deleteAgent(agent.id);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testConnection(agent.id, config);
    setTestResult(result);
    setIsTesting(false);
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--color-bg-surface-hover)',
    border: '1px solid var(--color-border-subtle)',
    padding: 'var(--space-2) var(--space-3)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-4)'
  };

  return (
    <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <Terminal size={24} color="var(--color-brand-primary)" style={{ flexShrink: 0, marginTop: '4px' }} />
        
        {isEditingMetadata ? (
          <div style={{ flex: 1 }}>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)}
              style={{ ...inputStyle, marginBottom: 'var(--space-2)' }} 
              placeholder="Agent Name"
            />
            <input 
              value={type} 
              onChange={e => setType(e.target.value)}
              style={{ ...inputStyle, marginBottom: 0 }} 
              placeholder="Agent Type (e.g. IDE, CLI)"
            />
          </div>
        ) : (
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {agent.name}
            </h3>
            <span style={{ 
              fontSize: 'var(--text-xs)', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              background: 'var(--color-bg-surface-hover)',
              color: 'var(--color-text-secondary)',
              display: 'inline-block',
              marginTop: 'var(--space-1)'
            }}>
              {agent.type}
            </span>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginLeft: 'auto' }}>
          <button 
            onClick={() => {
              if (isEditingMetadata) {
                setName(agent.name);
                setType(agent.type);
              }
              setIsEditingMetadata(!isEditingMetadata);
            }}
            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 'var(--space-1)' }}
          >
            {isEditingMetadata ? <X size={16} /> : <Edit2 size={16} />}
          </button>
          <button 
            onClick={handleDelete}
            style={{ background: 'transparent', border: 'none', color: 'var(--color-status-error-text)', cursor: 'pointer', padding: 'var(--space-1)' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-4)' }}>
        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          Connection Type
        </label>
        <select 
          value={config.authType || 'api_key'}
          onChange={e => setConfig({ ...config, authType: e.target.value as 'api_key' | 'local_log' })}
          style={inputStyle}
        >
          <option value="api_key">API Key (Cloud)</option>
          <option value="local_log">Local Log Directory (CLI)</option>
        </select>

        {config.authType === 'api_key' ? (
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              API Key
            </label>
            <input 
              type="password" 
              placeholder="sk-..." 
              value={config.apiKey || ''}
              onChange={e => setConfig({ ...config, apiKey: e.target.value })}
              style={inputStyle}
            />
          </div>
        ) : (
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              Log Directory Path
            </label>
            <input 
              type="text" 
              placeholder="/Users/name/.cursor/logs" 
              value={config.logPath || ''}
              onChange={e => setConfig({ ...config, logPath: e.target.value })}
              style={inputStyle}
            />
          </div>
        )}
      </div>

      {testResult && (
        <div style={{ 
          padding: 'var(--space-3)', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: 'var(--space-4)',
          background: testResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${testResult.success ? 'var(--color-status-success-text)' : 'var(--color-status-error-text)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontSize: 'var(--text-sm)'
        }}>
          {testResult.success ? <CheckCircle size={16} color="var(--color-status-success-text)" /> : <AlertCircle size={16} color="var(--color-status-error-text)" />}
          <span style={{ color: testResult.success ? 'var(--color-status-success-text)' : 'var(--color-status-error-text)' }}>
            {testResult.success ? `${testResult.message} (${testResult.latencyMs}ms)` : testResult.error}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-3)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-4)' }}>
        <button 
          onClick={handleTest}
          disabled={isTesting}
          style={{ 
            background: 'var(--color-bg-surface-hover)', 
            border: '1px solid var(--color-border-strong)', 
            padding: 'var(--space-2) var(--space-4)', 
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)',
            cursor: isTesting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
            fontWeight: 500
          }}
        >
          <RefreshCw size={14} className={isTesting ? 'animate-spin' : ''} /> 
          {isTesting ? 'Testing...' : 'Test Connection'}
        </button>
        <button 
          onClick={handleSave}
          style={{ 
            background: 'var(--color-brand-primary)', 
            border: 'none', 
            padding: 'var(--space-2) var(--space-4)', 
            borderRadius: 'var(--radius-md)',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            marginLeft: 'auto'
          }}
        >
          <Save size={14} /> Save Config
        </button>
      </div>
    </div>
  );
};

export default function AgentsConfigPage() {
  const { agents, fetchAgents, createAgent, isLoading } = useAgentsStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('IDE');

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createAgent({ name: newName, type: newType });
    setIsAdding(false);
    setNewName('');
    setNewType('IDE');
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="text-2xl" style={{ margin: 0 }}>Agent Integration Hub</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)', margin: 'var(--space-2) 0 0 0' }}>
            Configure connections to your AI agents to enable log tailing and session tracking.
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          style={{ 
            background: 'var(--color-brand-primary)', 
            border: 'none', 
            padding: 'var(--space-2) var(--space-4)', 
            borderRadius: 'var(--radius-md)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          + Add Agent
        </button>
      </header>

      {isAdding && (
        <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)' }}>
          <h3 style={{ margin: '0 0 var(--space-4) 0' }}>Add New Agent</h3>
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>Name</label>
              <input 
                value={newName} 
                onChange={e => setNewName(e.target.value)} 
                placeholder="e.g. Cursor IDE"
                style={{
                  width: '100%', background: 'var(--color-bg-surface-hover)', border: '1px solid var(--color-border-subtle)',
                  padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>Type</label>
              <select 
                value={newType} 
                onChange={e => setNewType(e.target.value)}
                style={{
                  width: '100%', background: 'var(--color-bg-surface-hover)', border: '1px solid var(--color-border-subtle)',
                  padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)'
                }}
              >
                <option value="IDE">IDE</option>
                <option value="CLI">CLI</option>
                <option value="Browser">Browser</option>
                <option value="Desktop">Desktop</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
            <button onClick={() => setIsAdding(false)} style={{ background: 'transparent', border: '1px solid var(--color-border-subtle)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleCreate} style={{ background: 'var(--color-brand-primary)', border: 'none', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', color: '#fff', cursor: 'pointer' }}>Create</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading agents...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-6)' }}>
          {agents.map(agent => (
            <AgentConfigCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}
