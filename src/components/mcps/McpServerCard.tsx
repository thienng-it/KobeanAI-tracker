import React, { useState } from 'react';
import { McpServer, useMcpStore } from '../../stores/useMcpStore';
import { 
  Pencil, 
  Trash2, 
  Terminal, 
  ArrowUpRight, 
  Wrench, 
  Activity, 
  CheckCircle2, 
  Power,
  RefreshCw
} from 'lucide-react';

interface McpServerCardProps {
  server: McpServer;
  onEdit: (server: McpServer) => void;
  onDelete: (id: string) => void;
  onInspectTools: (server: McpServer, toolName?: string) => void;
}

export const McpServerCard: React.FC<McpServerCardProps> = ({
  server,
  onEdit,
  onDelete,
  onInspectTools
}) => {
  const { toggleServer, testConnection } = useMcpStore();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs: number; message: string } | null>(null);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleServer(server.id);
  };

  const handleTestPing = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTesting(true);
    setTestResult(null);
    const res = await testConnection(server.id);
    setTestResult(res);
    setIsTesting(false);

    setTimeout(() => {
      setTestResult(null);
    }, 4000);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove MCP server "${server.name}"?`)) {
      onDelete(server.id);
    }
  };

  const getStatusIndicator = () => {
    if (!server.enabled) {
      return {
        color: 'var(--color-text-tertiary)',
        bg: 'rgba(107, 114, 128, 0.1)',
        label: 'Disabled',
        dotClass: ''
      };
    }
    switch (server.status) {
      case 'active':
        return {
          color: 'var(--color-status-success-text)',
          bg: 'var(--color-status-success-bg)',
          label: 'Active',
          dotClass: 'live-dot'
        };
      case 'error':
        return {
          color: 'var(--color-status-error-text)',
          bg: 'var(--color-status-error-bg)',
          label: 'Error',
          dotClass: ''
        };
      case 'configured':
      default:
        return {
          color: 'var(--color-status-info-text)',
          bg: 'var(--color-status-info-bg)',
          label: 'Configured',
          dotClass: ''
        };
    }
  };

  const statusInfo = getStatusIndicator();
  const toolsCount = server.tools?.length || server.toolsCount || 0;
  const isBuiltin = server.transport === 'builtin' || server.metadata?.isBuiltin;

  return (
    <div
      className="glass-panel interactive-card"
      onClick={() => onInspectTools(server)}
      style={{
        padding: 'var(--space-5)',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '220px',
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
        opacity: server.enabled ? 1 : 0.65,
        transition: 'all var(--duration-normal) var(--ease-spring-smooth)'
      }}
      title="Click to inspect all tools and parameter schemas"
    >
      {/* Top Row: Title, Status Pill, and Actions */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {server.name}
              </h3>

              {/* Status Pill */}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: statusInfo.bg,
                color: statusInfo.color,
                fontSize: '0.6875rem',
                fontWeight: 600
              }}>
                {statusInfo.dotClass ? (
                  <span className="live-dot" style={{ width: '6px', height: '6px' }} />
                ) : (
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: statusInfo.color
                  }} />
                )}
                <span>{statusInfo.label}</span>
              </span>

              {/* Scope Badge */}
              <span style={{
                fontSize: '0.6875rem',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-bg-surface-active)',
                color: 'var(--color-text-tertiary)',
                fontWeight: 500,
                textTransform: 'capitalize'
              }}>
                {server.scope}
              </span>
            </div>

            {/* Transport & Subtitle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-brand-primary)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                padding: '1px 5px',
                borderRadius: 'var(--radius-sm)'
              }}>
                {server.transport}
              </span>

              {server.metadata?.vendor && (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                  by {server.metadata.vendor}
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions (Edit / Delete) */}
          {!isBuiltin && (
            <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(server);
                }}
                title="Edit MCP Server"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Pencil size={14} />
              </button>

              <button
                onClick={handleDelete}
                title="Delete MCP Server"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-status-error-text)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.85
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <p style={{
          margin: 'var(--space-3) 0 0 0',
          color: 'var(--color-text-secondary)',
          fontSize: '0.8125rem',
          lineHeight: '1.45',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {server.description || 'Model Context Protocol tool server'}
        </p>

        {/* Command or URL Badge */}
        {(server.command || server.url) && (
          <div style={{
            marginTop: 'var(--space-2)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflow: 'hidden'
          }}>
            <code style={{
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-tertiary)',
              backgroundColor: 'var(--color-bg-surface-hover)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              display: 'block'
            }}>
              {server.command ? `${server.command} ${(server.args || []).slice(0, 2).join(' ')}...` : server.url}
            </code>
          </div>
        )}

        {/* Tool Tags Preview */}
        {server.tools && server.tools.length > 0 && (
          <div style={{
            marginTop: 'var(--space-3)',
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            {server.tools.slice(0, 3).map(tool => (
              <span
                key={tool.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onInspectTools(server, tool.name);
                }}
                title={`Inspect tool: ${tool.name}`}
                style={{
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border-subtle)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <Wrench size={10} style={{ opacity: 0.7 }} />
                <span>{tool.name}</span>
              </span>
            ))}
            {server.tools.length > 3 && (
              <span style={{
                fontSize: '0.6875rem',
                color: 'var(--color-brand-primary)',
                fontWeight: 600,
                padding: '2px 4px'
              }}>
                +{server.tools.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Connected Agents, Test Ping, and Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 'var(--space-3)',
        borderTop: '1px solid var(--color-border-subtle)',
        marginTop: 'var(--space-3)',
        gap: 'var(--space-2)'
      }}>
        {/* Left: Connected Agents & Tools count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <span style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--color-brand-primary)',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <Wrench size={11} />
            <span>{toolsCount} {toolsCount === 1 ? 'Tool' : 'Tools'}</span>
          </span>

          {server.agents && server.agents.length > 0 && (
            <span
              title={`Assigned to ${server.agents.map(a => a.name).join(', ')}`}
              style={{
                fontSize: '0.6875rem',
                color: 'var(--color-text-tertiary)',
                backgroundColor: 'var(--color-bg-surface-active)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <Terminal size={11} />
              <span>{server.agents.length}</span>
            </span>
          )}
        </div>

        {/* Right: Test Ping Button & Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleTestPing}
            disabled={isTesting}
            title="Probe connection and test latency"
            style={{
              background: testResult?.success ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              border: testResult?.success ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--color-border-subtle)',
              color: testResult?.success ? 'var(--color-status-success-text)' : 'var(--color-text-secondary)',
              cursor: isTesting ? 'not-allowed' : 'pointer',
              padding: '3px 8px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.6875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 500,
              transition: 'all var(--duration-fast) ease'
            }}
          >
            {isTesting ? (
              <>
                <RefreshCw size={11} className="animate-spin" />
                <span>Testing...</span>
              </>
            ) : testResult ? (
              <>
                <CheckCircle2 size={11} />
                <span>{testResult.latencyMs}ms</span>
              </>
            ) : (
              <>
                <Activity size={11} />
                <span>Ping</span>
              </>
            )}
          </button>

          {!isBuiltin && (
            <button
              onClick={handleToggle}
              title={server.enabled ? 'Disable MCP Server' : 'Enable MCP Server'}
              style={{
                background: server.enabled ? 'rgba(59, 130, 246, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                border: '1px solid var(--color-border-subtle)',
                color: server.enabled ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)',
                cursor: 'pointer',
                padding: '3px 6px',
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--duration-fast) ease'
              }}
            >
              <Power size={13} />
            </button>
          )}

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
            color: 'var(--color-text-tertiary)',
            fontSize: '0.6875rem',
            fontWeight: 500
          }}>
            <span>Inspect</span>
            <ArrowUpRight size={12} />
          </div>
        </div>
      </div>
    </div>
  );
};
