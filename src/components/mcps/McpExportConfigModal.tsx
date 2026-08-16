import React, { useState, useEffect } from 'react';
import { useMcpStore, MultiAgentExportConfig } from '../../stores/useMcpStore';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  FileCode2
} from 'lucide-react';

interface McpExportConfigModalProps {
  onClose: () => void;
}

export const McpExportConfigModal: React.FC<McpExportConfigModalProps> = ({ onClose }) => {
  const { exportConfigs } = useMcpStore();
  const [configData, setConfigData] = useState<MultiAgentExportConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'antigravity' | 'claude' | 'cursor' | 'windsurf'>('antigravity');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    exportConfigs().then(data => {
      setConfigData(data);
      setIsLoading(false);
    });
  }, [exportConfigs]);

  const tabs = [
    { id: 'antigravity', name: 'Google Antigravity', file: '.agents/mcp_config.json', badge: 'Recommended' },
    { id: 'claude', name: 'Claude Code & Desktop', file: 'claude_desktop_config.json' },
    { id: 'cursor', name: 'Cursor IDE', file: '.cursor/mcp.json' },
    { id: 'windsurf', name: 'Windsurf / OpenCode', file: '.windsurf/mcp_config.json' },
  ];

  const currentContent = configData ? configData[activeTab]?.content || '{}' : '{}';
  const currentFilename = configData ? configData[activeTab]?.filename || 'mcp.json' : 'mcp.json';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFilename.split('/').pop() || 'mcp_config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          maxWidth: '780px',
          maxHeight: '85vh',
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
              <Share2 size={18} />
            </div>

            <div>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Export Multi-Agent MCP Configuration
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Universal configuration files for Google Antigravity, Claude Code, Cursor IDE, and Windsurf
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

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface)',
          padding: '0 var(--space-6)',
          gap: '4px',
          overflowX: 'auto'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '10px 14px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: activeTab === tab.id ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--color-brand-primary)' : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                transition: 'all var(--duration-fast) ease'
              }}
            >
              <span>{tab.name}</span>
              {tab.badge && (
                <span style={{
                  fontSize: '0.625rem',
                  padding: '1px 5px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: 'var(--color-brand-primary)'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Target File location banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-surface-hover)',
            border: '1px solid var(--color-border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCode2 size={16} color="var(--color-brand-primary)" />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Target File Location:</span>
              <code style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-bg-surface-active)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)'
              }}>
                {currentFilename}
              </code>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCopy}
                className="btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 12px',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                {copied ? <Check size={13} color="var(--color-status-success-text)" /> : <Copy size={13} />}
                <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
              </button>

              <button
                onClick={handleDownload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 12px',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-brand-primary)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                <Download size={13} />
                <span>Download File</span>
              </button>
            </div>
          </div>

          {/* JSON Code Viewer */}
          <div style={{
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-subtle)',
            backgroundColor: 'var(--color-bg-app)',
            overflow: 'hidden'
          }}>
            <pre style={{
              margin: 0,
              padding: 'var(--space-4)',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-mono)',
              color: '#38bdf8',
              lineHeight: '1.5',
              overflowX: 'auto',
              maxHeight: '360px'
            }}>
              {isLoading ? 'Generating configuration...' : currentContent}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
