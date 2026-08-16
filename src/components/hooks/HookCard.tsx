import React, { useState } from 'react';
import { Hook, useHookStore } from '../../stores/useHookStore';
import { 
  Zap, 
  Play, 
  Trash2, 
  Edit3, 
  Power, 
  Clock, 
  Activity, 
  Terminal, 
  Filter
} from 'lucide-react';

interface HookCardProps {
  hook: Hook;
  onSimulate: (hook: Hook) => void;
  onEdit: (hook: Hook) => void;
  onDelete: (id: string) => void;
}

export const HookCard: React.FC<HookCardProps> = ({
  hook,
  onSimulate,
  onEdit,
  onDelete
}) => {
  const { toggleHook } = useHookStore();
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isToggling) return;
    setIsToggling(true);
    await toggleHook(hook.id);
    setIsToggling(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete hook "${hook.name}"?`)) {
      setIsDeleting(true);
      await onDelete(hook.id);
    }
  };

  const handleCopyCommand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hook.command) {
      navigator.clipboard.writeText(hook.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getEventBadgeStyle = (event: string) => {
    switch (event) {
      case 'PreToolUse':
        return { bg: 'rgba(245, 158, 11, 0.12)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
      case 'PostToolUse':
        return { bg: 'rgba(59, 130, 246, 0.12)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
      case 'SessionStart':
        return { bg: 'rgba(139, 92, 246, 0.12)', text: '#c084fc', border: 'rgba(139, 92, 246, 0.3)' };
      case 'PreCommit':
        return { bg: 'rgba(16, 185, 129, 0.12)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      case 'UserPrompt':
        return { bg: 'rgba(6, 182, 212, 0.12)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.12)', text: '#9ca3af', border: 'rgba(107, 114, 128, 0.3)' };
    }
  };

  const eventStyle = getEventBadgeStyle(hook.event);

  return (
    <div
      className="glass-panel"
      style={{
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        border: hook.enabled 
          ? '1px solid var(--color-border-subtle)' 
          : '1px dashed rgba(107, 114, 128, 0.3)',
        opacity: hook.enabled ? 1 : 0.7,
        position: 'relative',
        minHeight: '260px',
        backgroundColor: 'var(--color-bg-surface)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = hook.enabled ? 'var(--color-border-default)' : 'rgba(107, 114, 128, 0.5)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = hook.enabled ? 'var(--color-border-subtle)' : 'rgba(107, 114, 128, 0.3)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div>
        {/* Header Row */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: eventStyle.bg,
              color: eventStyle.text,
              border: `1px solid ${eventStyle.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Zap size={18} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  letterSpacing: '-0.01em'
                }}>
                  {hook.name}
                </h3>

                {/* Glowing status dot */}
                <span
                  title={hook.enabled ? 'Active Hook' : 'Disabled Hook'}
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: hook.enabled ? '#10b981' : '#6b7280',
                    boxShadow: hook.enabled ? '0 0 6px rgba(16, 185, 129, 0.8)' : 'none',
                    display: 'inline-block'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-tertiary)'
                }}>
                  slug: {hook.slug || hook.id.slice(0, 8)}
                </span>

                <span style={{
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: hook.scope === 'workspace' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                  color: hook.scope === 'workspace' ? '#c4b5fd' : '#93c5fd',
                  border: `1px solid ${hook.scope === 'workspace' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                }}>
                  {hook.scope}
                </span>
              </div>
            </div>
          </div>

          {/* Event Trigger Badge */}
          <span style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: eventStyle.bg,
            color: eventStyle.text,
            border: `1px solid ${eventStyle.border}`,
            flexShrink: 0
          }}>
            {hook.event}
          </span>
        </div>

        {/* Description */}
        <p style={{
          margin: '0 0 var(--space-3) 0',
          fontSize: '0.8125rem',
          color: 'var(--color-text-secondary)',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '36px'
        }}>
          {hook.description || 'Lifecycle execution guard.'}
        </p>

        {/* Capabilities & Metadata Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
          marginBottom: 'var(--space-3)'
        }}>
          {/* Matcher Badge */}
          <span style={{
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            color: 'var(--color-brand-primary)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            padding: '2px 7px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Filter size={10} />
            <span>matcher: {hook.matcher || '*'}</span>
          </span>

          {/* Timeout */}
          <span style={{
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-tertiary)',
            backgroundColor: 'var(--color-bg-surface-active)',
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <Clock size={10} />
            <span>{hook.timeout || 5}s timeout</span>
          </span>

          {/* Executions */}
          {hook.executionCount > 0 && (
            <span style={{
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-status-success-text)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <Activity size={10} />
              <span>{hook.executionCount} runs</span>
            </span>
          )}
        </div>

        {/* Script Command Preview Box */}
        {hook.command && (
          <div 
            onClick={handleCopyCommand}
            title="Click to copy command script"
            style={{
              padding: '8px 10px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-surface-hover)',
              border: '1px solid var(--color-border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
              <Terminal size={12} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
              <span style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {hook.command}
              </span>
            </div>

            <span style={{
              fontSize: '0.625rem',
              color: copied ? 'var(--color-status-success-text)' : 'var(--color-text-tertiary)',
              flexShrink: 0
            }}>
              {copied ? 'Copied' : 'Copy'}
            </span>
          </div>
        )}
      </div>

      {/* Footer Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 'var(--space-3)',
        borderTop: '1px solid var(--color-border-subtle)',
        marginTop: 'var(--space-3)',
        gap: 'var(--space-2)'
      }}>
        {/* Simulate Action Button */}
        <button
          onClick={() => onSimulate(hook)}
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '5px 10px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--color-brand-primary)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all var(--duration-fast) var(--ease-spring-smooth)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
          }}
        >
          <Play size={12} fill="currentColor" />
          <span>Simulate Test</span>
        </button>

        {/* Action icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Toggle Power */}
          <button
            onClick={handleToggle}
            title={hook.enabled ? 'Disable Hook' : 'Enable Hook'}
            style={{
              background: hook.enabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 114, 128, 0.15)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: hook.enabled ? 'var(--color-status-success-text)' : 'var(--color-text-tertiary)',
              cursor: isToggling ? 'not-allowed' : 'pointer'
            }}
          >
            <Power size={13} />
          </button>

          {/* Edit */}
          {hook.scope !== 'git' && (
            <button
              onClick={() => onEdit(hook)}
              title="Edit Hook Configuration"
              style={{
                background: 'transparent',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-md)',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer'
              }}
            >
              <Edit3 size={13} />
            </button>
          )}

          {/* Delete */}
          {hook.scope !== 'git' && (
            <button
              onClick={handleDelete}
              title="Delete Hook"
              disabled={isDeleting}
              style={{
                background: 'transparent',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-md)',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-status-error-text)',
                cursor: isDeleting ? 'not-allowed' : 'pointer'
              }}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
