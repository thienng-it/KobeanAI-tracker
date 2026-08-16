import React, { useEffect, useState } from 'react';
import { type Command } from '../../stores/useCommandsStore';
import { 
  X, 
  Copy, 
  Check, 
  Pencil, 
  Trash2, 
  Terminal, 
  BookOpen, 
  Sparkles, 
  Hash,
  ExternalLink,
  Code2
} from 'lucide-react';
import { CommandBadge } from '../common/CommandBadge';
import { useNavigate } from 'react-router';

interface CommandDetailModalProps {
  command: Command | null;
  onClose: () => void;
  onEdit: (command: Command) => void;
  onDelete: (id: string) => void;
}

export const CommandDetailModal: React.FC<CommandDetailModalProps> = ({
  command,
  onClose,
  onEdit,
  onDelete
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!command) return null;

  const handleCopy = async (text: string, sectionKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionKey);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (e) {
      console.error('Failed to copy command text:', e);
    }
  };

  const parsedAliases: string[] = Array.isArray(command.aliases) 
    ? command.aliases 
    : typeof command.aliases === 'string' 
      ? JSON.parse(command.aliases || '[]') 
      : [];

  const parsedAgents: string[] = Array.isArray(command.agents) 
    ? command.agents 
    : typeof command.agents === 'string' 
      ? JSON.parse(command.agents || '[]') 
      : [];

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        animation: 'fadeIn var(--duration-fast) ease'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          backgroundColor: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border-default)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: 'var(--space-5) var(--space-6)',
          borderBottom: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--color-bg-surface-hover)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              color: 'var(--color-brand-primary)',
              flexShrink: 0
            }}>
              <Terminal size={20} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <CommandBadge command={command.name} size="md" maxWidth="260px" />
                <span style={{
                  fontSize: 'var(--text-xs)',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: 'var(--color-status-success-text)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Sparkles size={11} /> Ready
                </span>
              </div>

              {command.skill && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: '3px' }}>
                  <span>Triggers skill:</span>
                  <strong style={{ color: 'var(--color-text-primary)' }}>{command.skill.name}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <button
              onClick={() => {
                onClose();
                onEdit(command);
              }}
              className="btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer'
              }}
            >
              <Pencil size={13} /> Edit
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${command.name}"?`)) {
                  onDelete(command.id);
                  onClose();
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--color-status-error-text)',
                cursor: 'pointer',
                transition: 'all var(--duration-fast) ease'
              }}
            >
              <Trash2 size={13} /> Delete
            </button>
            <button
              onClick={onClose}
              title="Close (Esc)"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '4px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ 
          padding: 'var(--space-6)', 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 'var(--space-5)' 
        }}>
          {/* Full Description Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Command Purpose & Description
              </div>
              {command.description && (
                <button
                  onClick={() => handleCopy(command.description || '', 'description')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: copiedSection === 'description' ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-bg-surface-hover)',
                    border: copiedSection === 'description' ? '1px solid #10b981' : '1px solid var(--color-border-subtle)',
                    color: copiedSection === 'description' ? '#10b981' : 'var(--color-text-secondary)',
                    fontSize: 'var(--text-xs)',
                    cursor: 'pointer'
                  }}
                >
                  {copiedSection === 'description' ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedSection === 'description' ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            <div style={{
              backgroundColor: 'var(--color-bg-surface-hover)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              fontSize: 'var(--text-sm)',
              lineHeight: 1.6,
              color: 'var(--color-text-primary)',
              whiteSpace: 'pre-wrap'
            }}>
              {command.description || 'No description specified for this command.'}
            </div>
          </div>

          {/* Quick Invocation & Syntax Block */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Code2 size={13} />
                <span>Chat Slash Command Invocation</span>
              </div>
              <button
                onClick={() => handleCopy(command.name, 'syntax')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: copiedSection === 'syntax' ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-bg-surface-hover)',
                  border: copiedSection === 'syntax' ? '1px solid #10b981' : '1px solid var(--color-border-subtle)',
                  color: copiedSection === 'syntax' ? '#10b981' : 'var(--color-text-secondary)',
                  fontSize: 'var(--text-xs)',
                  cursor: 'pointer'
                }}
              >
                {copiedSection === 'syntax' ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedSection === 'syntax' ? 'Copied Command' : 'Copy Command'}</span>
              </button>
            </div>

            <div style={{
              backgroundColor: 'var(--color-bg-surface-hover)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3) var(--space-4)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-brand-primary)',
              fontWeight: 600
            }}>
              {command.name} [optional task arguments]
            </div>
          </div>

          {/* Linked Skill Card */}
          {command.skill && (
            <div style={{
              backgroundColor: 'var(--color-bg-surface-hover)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-brand-primary)'
                }}>
                  <BookOpen size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Linked Prompt Skill
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '1px' }}>
                    {command.skill.name}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  navigate('/skills');
                }}
                className="btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <span>View Skills</span>
                <ExternalLink size={12} />
              </button>
            </div>
          )}

          {/* Aliases & Compatible Agents */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
            {/* Aliases */}
            <div style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-bg-surface-hover)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)'
            }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
                Command Aliases
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {parsedAliases.length > 0 ? (
                  parsedAliases.map((al, idx) => (
                    <span 
                      key={idx}
                      style={{
                        fontSize: '0.6875rem',
                        fontFamily: 'var(--font-mono)',
                        backgroundColor: 'var(--color-bg-surface-active)',
                        color: 'var(--color-text-secondary)',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border-subtle)'
                      }}
                    >
                      /{al}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>No aliases configured</span>
                )}
              </div>
            </div>

            {/* Compatible Agents */}
            <div style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-bg-surface-hover)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)'
            }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
                Assigned Agents
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {parsedAgents.length > 0 ? (
                  parsedAgents.map((ag, idx) => (
                    <span 
                      key={idx}
                      style={{
                        fontSize: '0.6875rem',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: 'var(--color-brand-primary)',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        fontWeight: 500
                      }}
                    >
                      {ag}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>All connected agents</span>
                )}
              </div>
            </div>
          </div>

          {/* Footer Metadata */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            fontSize: '0.6875rem', 
            color: 'var(--color-text-tertiary)', 
            paddingTop: 'var(--space-3)', 
            borderTop: '1px dashed var(--color-border-subtle)' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)' }}>
              <Hash size={11} />
              <span>ID: {command.id}</span>
            </div>
            <div>
              <span>Usage count: <strong style={{ color: 'var(--color-text-primary)' }}>{command.usageCount || 0} times</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
