import React, { useState, useEffect } from 'react';
import { useAgentsStore } from '../../stores/useAgentsStore';
import { 
  Key, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Save, 
  Trash2 
} from 'lucide-react';

interface ProviderCardProps {
  id: string;
  name: string;
  providerKey: 'gemini' | 'claude' | 'openai' | 'openrouter';
  placeholder: string;
  accentColor: string;
  description: string;
  docsUrl: string;
}

const PROVIDERS: ProviderCardProps[] = [
  {
    id: 'gemini',
    name: 'Google Gemini & Antigravity',
    providerKey: 'gemini',
    placeholder: 'AIzaSy...',
    accentColor: '#3b82f6',
    description: 'Used for Gemini 3.7 Flash, 3.1 Pro, and Antigravity subagent thinking loops.',
    docsUrl: 'https://aistudio.google.com/app/apikey'
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    providerKey: 'claude',
    placeholder: 'sk-ant-api03-...',
    accentColor: '#d97757',
    description: 'Used for Claude 3.7 Sonnet, Claude 3.5 Haiku, and Claude Code CLI traces.',
    docsUrl: 'https://console.anthropic.com/settings/keys'
  },
  {
    id: 'openai',
    name: 'OpenAI / Codex',
    providerKey: 'openai',
    placeholder: 'sk-proj-...',
    accentColor: '#10a37f',
    description: 'Used for GPT-4o, o1, o3-mini models and Codex CLI transcript sync.',
    docsUrl: 'https://platform.openai.com/api-keys'
  },
  {
    id: 'openrouter',
    name: 'OpenRouter & Custom LLMs',
    providerKey: 'openrouter',
    placeholder: 'sk-or-v1-...',
    accentColor: '#8b5cf6',
    description: 'Unified gateway for DeepSeek-R1, Qwen, Llama 3.3, and open-source weights.',
    docsUrl: 'https://openrouter.ai/keys'
  }
];

export const ProviderKeysManager: React.FC = () => {
  const { providerKeys, fetchProviderKeys, saveProviderKey, testProviderKey } = useAgentsStore();
  const [inputValues, setInputValues] = useState<Record<string, string>>({
    gemini: '',
    claude: '',
    openai: '',
    openrouter: ''
  });
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [testingStatus, setTestingStatus] = useState<Record<string, { loading: boolean; result?: { success: boolean; message?: string; error?: string; latencyMs?: number } }>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProviderKeys();
  }, [fetchProviderKeys]);

  const handleTest = async (provKey: 'gemini' | 'claude' | 'openai' | 'openrouter') => {
    const rawVal = inputValues[provKey];
    const isConfigured = providerKeys[provKey]?.isConfigured;
    
    if (!rawVal && !isConfigured) {
      setTestingStatus(prev => ({
        ...prev,
        [provKey]: { loading: false, result: { success: false, error: 'Please enter an API key first' } }
      }));
      return;
    }

    setTestingStatus(prev => ({ ...prev, [provKey]: { loading: true } }));
    const result = await testProviderKey(provKey, rawVal || 'dummy-stored-key');
    setTestingStatus(prev => ({ ...prev, [provKey]: { loading: false, result } }));
  };

  const handleSave = async (provKey: 'gemini' | 'claude' | 'openai' | 'openrouter') => {
    const rawVal = inputValues[provKey];
    setSaveStatus(prev => ({ ...prev, [provKey]: 'saving' }));
    const res = await saveProviderKey(provKey, rawVal);
    if (res.success) {
      setSaveStatus(prev => ({ ...prev, [provKey]: 'saved' }));
      setInputValues(prev => ({ ...prev, [provKey]: '' }));
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [provKey]: '' }));
      }, 3000);
    } else {
      setSaveStatus(prev => ({ ...prev, [provKey]: 'error' }));
    }
  };

  const handleClear = async (provKey: 'gemini' | 'claude' | 'openai' | 'openrouter') => {
    if (confirm(`Are you sure you want to clear the stored API key for ${provKey.toUpperCase()}?`)) {
      await saveProviderKey(provKey, '');
      setInputValues(prev => ({ ...prev, [provKey]: '' }));
    }
  };

  return (
    <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-8)' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: 'rgba(59, 130, 246, 0.12)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--color-brand-primary)' 
            }}>
              <Key size={18} />
            </div>
            <h2 className="text-xl" style={{ margin: 0, fontWeight: 700 }}>API Provider Keys & Direct Cloud Access</h2>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)', margin: 'var(--space-2) 0 0 0', maxWidth: '720px' }}>
            Input and manage your AI model API credentials directly from the user interface. Credentials are saved strictly to your local encrypted SQLite instance with zero external cloud exfiltration.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-status-success-text)',
          fontWeight: 600
        }}>
          <ShieldCheck size={14} />
          <span>Local-First & Encrypted</span>
        </div>
      </div>

      {/* Grid of Providers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 'var(--space-5)' }}>
        {PROVIDERS.map(prov => {
          const info = providerKeys[prov.providerKey];
          const testState = testingStatus[prov.providerKey];
          const isSaved = saveStatus[prov.providerKey] === 'saved';

          return (
            <div 
              key={prov.id}
              className="interactive-card"
              style={{
                backgroundColor: 'var(--color-bg-surface-hover)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 'var(--space-4)'
              }}
            >
              {/* Provider Info Row */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ 
                      width: '10px', 
                      height: '10px', 
                      borderRadius: '50%', 
                      backgroundColor: prov.accentColor,
                      boxShadow: `0 0 8px ${prov.accentColor}80`
                    }} />
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{prov.name}</h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: info?.isConfigured ? 'rgba(16, 185, 129, 0.12)' : 'var(--color-bg-surface)',
                      color: info?.isConfigured ? '#10b981' : 'var(--color-text-tertiary)',
                      border: `1px solid ${info?.isConfigured ? 'rgba(16, 185, 129, 0.3)' : 'var(--color-border-subtle)'}`
                    }}>
                      {info?.isConfigured ? `● Configured (${info.maskedKey || 'Saved'})` : '○ Not Configured'}
                    </span>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {prov.description}
                </p>
              </div>

              {/* Input & Action Bar */}
              <div>
                <div style={{ position: 'relative', marginBottom: 'var(--space-3)' }}>
                  <input
                    type={showKey[prov.providerKey] ? 'text' : 'password'}
                    placeholder={info?.isConfigured ? `•••••••••••••••• (${info.maskedKey})` : prov.placeholder}
                    value={inputValues[prov.providerKey] || ''}
                    onChange={(e) => setInputValues({ ...inputValues, [prov.providerKey]: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 36px 8px 12px',
                      backgroundColor: 'var(--color-bg-surface)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8125rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(prev => ({ ...prev, [prov.providerKey]: !prev[prov.providerKey] }))}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-text-tertiary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px'
                    }}
                    title={showKey[prov.providerKey] ? 'Hide Key' : 'Show Key'}
                  >
                    {showKey[prov.providerKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Test Feedback Pill */}
                {testState?.result && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-3)',
                    fontSize: '0.75rem',
                    backgroundColor: testState.result.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${testState.result.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    color: testState.result.success ? '#10b981' : '#ef4444'
                  }}>
                    {testState.result.success ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    <span>{testState.result.message || testState.result.error} {testState.result.latencyMs ? `(${testState.result.latencyMs}ms)` : ''}</span>
                  </div>
                )}

                {/* Button Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <button
                    onClick={() => handleTest(prov.providerKey)}
                    disabled={testState?.loading}
                    className="interactive-card"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 10px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-bg-surface)',
                      border: '1px solid var(--color-border-subtle)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      cursor: testState?.loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <RefreshCw size={13} className={testState?.loading ? 'animate-spin' : ''} />
                    <span>{testState?.loading ? 'Verifying...' : 'Test Key'}</span>
                  </button>

                  <button
                    onClick={() => handleSave(prov.providerKey)}
                    disabled={!inputValues[prov.providerKey]}
                    className="interactive-card"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: inputValues[prov.providerKey] ? prov.accentColor : 'var(--color-bg-surface)',
                      border: '1px solid var(--color-border-subtle)',
                      color: inputValues[prov.providerKey] ? '#fff' : 'var(--color-text-tertiary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: inputValues[prov.providerKey] ? 'pointer' : 'default',
                      marginLeft: 'auto'
                    }}
                  >
                    <Save size={13} />
                    <span>{isSaved ? 'Saved!' : 'Save Key'}</span>
                  </button>

                  {info?.isConfigured && (
                    <button
                      onClick={() => handleClear(prov.providerKey)}
                      title="Clear stored key"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'transparent',
                        border: '1px solid var(--color-border-subtle)',
                        color: 'var(--color-status-error-text)',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
