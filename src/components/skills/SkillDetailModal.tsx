import React, { useEffect, useState } from 'react';
import { type Skill } from '../../stores/useSkillsStore';
import { 
  X, 
  Copy, 
  Check, 
  Pencil, 
  Trash2, 
  Command, 
  Terminal, 
  BookOpen, 
  Sparkles, 
  Code2, 
  User,
  Hash
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { CommandBadge } from '../common/CommandBadge';

interface SkillDetailModalProps {
  skill: Skill | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const SkillDetailModal: React.FC<SkillDetailModalProps> = ({ skill, onClose, onDelete }) => {
  const navigate = useNavigate();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!skill) return null;

  const handleCopy = async (text: string, sectionKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionKey);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (e) {
      console.error('Failed to copy text:', e);
    }
  };

  const handleEdit = () => {
    onClose();
    navigate(`/skills/${skill.id}/edit`);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${skill.name}"?`)) {
      onDelete(skill.id);
      onClose();
    }
  };

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
          maxWidth: '780px',
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
              <BookOpen size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {skill.name}
                </h2>
                <span style={{
                  fontSize: 'var(--text-xs)',
                  backgroundColor: 'var(--color-bg-surface-active)',
                  color: 'var(--color-text-secondary)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 500,
                  border: '1px solid var(--color-border-subtle)'
                }}>
                  v{skill.version || '1.0.0'}
                </span>
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
                  <Sparkles size={11} /> Active
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: '3px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <User size={12} /> {skill.author || 'Workspace'}
                </span>
                {skill.triggerCommand && (
                  <>
                    <span>•</span>
                    <CommandBadge command={skill.triggerCommand} size="xs" maxWidth="220px" />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <button
              onClick={handleEdit}
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
              onClick={handleDelete}
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
                Full Description
              </div>
              {skill.description && (
                <button
                  onClick={() => handleCopy(skill.description, 'description')}
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
              {skill.description || 'No description provided for this skill.'}
            </div>
          </div>

          {/* Command & Metadata Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
            {/* Trigger Command */}
            <div style={{ 
              padding: 'var(--space-3)', 
              backgroundColor: 'var(--color-bg-surface-hover)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--color-border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Trigger Command
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  marginTop: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: skill.triggerCommand ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)'
                }}>
                  <Command size={14} />
                  <span>{skill.triggerCommand || 'None (Automatic / Natural Language)'}</span>
                </div>
              </div>

              {skill.triggerCommand && (
                <button
                  onClick={() => handleCopy(skill.triggerCommand, 'trigger')}
                  title="Copy trigger command"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '4px 6px',
                    color: copiedSection === 'trigger' ? 'var(--color-status-success-text)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.6875rem'
                  }}
                >
                  {copiedSection === 'trigger' ? <Check size={12} /> : <Copy size={12} />}
                </button>
              )}
            </div>

            {/* Assigned Agents */}
            <div style={{ 
              padding: 'var(--space-3)', 
              backgroundColor: 'var(--color-bg-surface-hover)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--color-border-subtle)'
            }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Compatible Agents
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                <Terminal size={14} color="var(--color-brand-primary)" />
                <span style={{ fontWeight: 600 }}>{skill.agents?.length || 0} Connected Agents</span>
              </div>
            </div>
          </div>

          {/* System Instructions / Prompt Rules Section */}
          {skill.instructions && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Code2 size={13} />
                  <span>System Instructions & Rules</span>
                </div>
                <button
                  onClick={() => handleCopy(skill.instructions, 'instructions')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: copiedSection === 'instructions' ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-bg-surface-hover)',
                    border: copiedSection === 'instructions' ? '1px solid #10b981' : '1px solid var(--color-border-subtle)',
                    color: copiedSection === 'instructions' ? '#10b981' : 'var(--color-text-secondary)',
                    fontSize: 'var(--text-xs)',
                    cursor: 'pointer'
                  }}
                >
                  {copiedSection === 'instructions' ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedSection === 'instructions' ? 'Copied Instructions' : 'Copy Instructions'}</span>
                </button>
              </div>

              <div style={{
                backgroundColor: 'var(--color-bg-surface-hover)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-mono)',
                lineHeight: 1.6,
                color: 'var(--color-text-primary)',
                maxHeight: '280px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                userSelect: 'text'
              }}>
                {skill.instructions}
              </div>
            </div>
          )}

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
              <span>ID: {skill.id}</span>
            </div>
            <div>
              <span>Author: <strong style={{ color: 'var(--color-text-primary)' }}>{skill.author || 'Workspace'}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
