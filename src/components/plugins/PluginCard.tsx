import React from 'react';
import { Plugin, usePluginStore } from '../../stores/usePluginStore';
import { 
  Puzzle, 
  BrainCircuit, 
  Cpu, 
  Boxes, 
  Zap, 
  Trash2, 
  ArrowUpRight, 
  Power, 
  GitBranch,
  Globe
} from 'lucide-react';

interface PluginCardProps {
  plugin: Plugin;
  onInspect: (plugin: Plugin) => void;
  onDelete: (id: string) => void;
}

export const PluginCard: React.FC<PluginCardProps> = ({
  plugin,
  onInspect,
  onDelete
}) => {
  const { togglePlugin } = usePluginStore();

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await togglePlugin(plugin.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove workspace plugin "${plugin.name}"?`)) {
      onDelete(plugin.id);
    }
  };

  const isWorkspace = plugin.scope === 'workspace';

  const getStatusIndicator = () => {
    if (!plugin.enabled) {
      return {
        color: 'var(--color-text-tertiary)',
        bg: 'rgba(107, 114, 128, 0.1)',
        label: 'Disabled',
        dotClass: ''
      };
    }
    return {
      color: 'var(--color-status-success-text)',
      bg: 'var(--color-status-success-bg)',
      label: 'Active',
      dotClass: 'live-dot'
    };
  };

  const statusInfo = getStatusIndicator();

  return (
    <div
      className="glass-panel interactive-card"
      onClick={() => onInspect(plugin)}
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
        opacity: plugin.enabled ? 1 : 0.65,
        transition: 'all var(--duration-normal) var(--ease-spring-smooth)'
      }}
      title="Click to inspect plugin documentation, bundled skills, and manifest"
    >
      {/* Top Header */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isWorkspace ? 'rgba(139, 92, 246, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                color: isWorkspace ? '#a78bfa' : 'var(--color-brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Puzzle size={16} />
              </div>

              <h3 style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {plugin.name}
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
                backgroundColor: isWorkspace ? 'rgba(139, 92, 246, 0.12)' : 'var(--color-bg-surface-active)',
                color: isWorkspace ? '#c4b5fd' : 'var(--color-text-tertiary)',
                fontWeight: 600,
                textTransform: 'capitalize'
              }}>
                {plugin.scope}
              </span>
            </div>

            {/* Subtitle with Version & Author */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-tertiary)',
                backgroundColor: 'var(--color-bg-surface-hover)',
                padding: '1px 5px',
                borderRadius: 'var(--radius-sm)'
              }}>
                v{plugin.version}
              </span>

              {plugin.author && (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                  by {plugin.author}
                </span>
              )}
            </div>
          </div>

          {/* Delete Action (Workspace only) */}
          {isWorkspace && (
            <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleDelete}
                title="Delete Workspace Plugin"
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
          {plugin.description || 'AI agent customization plugin bundle'}
        </p>

        {/* Capabilities Row */}
        <div style={{
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginTop: 'var(--space-3)'
        }}>
          {plugin.skillsCount > 0 && (
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--color-brand-primary)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              padding: '2px 7px',
              borderRadius: 'var(--radius-sm)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <BrainCircuit size={11} />
              <span>{plugin.skillsCount} {plugin.skillsCount === 1 ? 'Skill' : 'Skills'}</span>
            </span>
          )}

          {plugin.agentsCount > 0 && (
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: '#34d399',
              backgroundColor: 'rgba(52, 211, 153, 0.1)',
              padding: '2px 7px',
              borderRadius: 'var(--radius-sm)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Cpu size={11} />
              <span>{plugin.agentsCount} {plugin.agentsCount === 1 ? 'Agent' : 'Agents'}</span>
            </span>
          )}

          {plugin.hasMcp && (
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: '#fbbf24',
              backgroundColor: 'rgba(251, 191, 36, 0.1)',
              padding: '2px 7px',
              borderRadius: 'var(--radius-sm)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Boxes size={11} />
              <span>MCP</span>
            </span>
          )}

          {plugin.hasHooks && (
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: '#f472b6',
              backgroundColor: 'rgba(244, 114, 182, 0.1)',
              padding: '2px 7px',
              borderRadius: 'var(--radius-sm)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Zap size={11} />
              <span>Hooks</span>
            </span>
          )}
        </div>

        {/* Keywords */}
        {plugin.keywords && plugin.keywords.length > 0 && (
          <div style={{
            marginTop: 'var(--space-2)',
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap'
          }}>
            {plugin.keywords.slice(0, 3).map((kw, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.625rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-tertiary)',
                  backgroundColor: 'var(--color-bg-surface-active)',
                  padding: '1px 5px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                #{kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 'var(--space-3)',
        borderTop: '1px solid var(--color-border-subtle)',
        marginTop: 'var(--space-3)',
        gap: 'var(--space-2)'
      }}>
        {/* Repo link if available */}
        <div>
          {plugin.repository ? (
            <a
              href={plugin.repository}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.6875rem',
                color: 'var(--color-text-tertiary)',
                textDecoration: 'none'
              }}
            >
              {plugin.repository.includes('github.com') ? <GitBranch size={12} /> : <Globe size={12} />}
              <span>Repo</span>
            </a>
          ) : (
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)' }}>
              License: {plugin.license || 'MIT'}
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleToggle}
            title={plugin.enabled ? 'Disable Plugin' : 'Enable Plugin'}
            style={{
              background: plugin.enabled ? 'rgba(59, 130, 246, 0.15)' : 'rgba(107, 114, 128, 0.15)',
              border: '1px solid var(--color-border-subtle)',
              color: plugin.enabled ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)',
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

          <div
            onClick={() => onInspect(plugin)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              color: 'var(--color-brand-primary)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <span>Inspect</span>
            <ArrowUpRight size={12} />
          </div>
        </div>
      </div>
    </div>
  );
};
