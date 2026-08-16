import React, { useEffect, useState } from 'react';
import { type Rule } from '../../stores/useRulesStore';
import { 
  X, 
  Copy, 
  Check, 
  Pencil, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  Globe, 
  FolderGit2, 
  Bot, 
  Layers, 
  CheckCircle2, 
  XCircle,
  Hash
} from 'lucide-react';

interface RuleDetailModalProps {
  rule: Rule | null;
  onClose: () => void;
  onEdit: (rule: Rule) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, currentEnabled: boolean) => void;
}

export const RuleDetailModal: React.FC<RuleDetailModalProps> = ({
  rule,
  onClose,
  onEdit,
  onDelete,
  onToggle
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!rule) return null;

  const handleCopyInstruction = async () => {
    try {
      await navigator.clipboard.writeText(rule.instruction);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy rule instruction:', e);
    }
  };

  const getScopeBadge = (scope: string) => {
    const s = scope.toLowerCase();
    if (s === 'workspace') {
      return {
        label: 'WORKSPACE',
        icon: <FolderGit2 size={11} />,
        bg: 'rgba(59, 130, 246, 0.1)',
        color: 'var(--color-brand-primary)',
        border: '1px solid rgba(59, 130, 246, 0.25)'
      };
    }
    if (s === 'global') {
      return {
        label: 'GLOBAL',
        icon: <Globe size={11} />,
        bg: 'rgba(16, 185, 129, 0.1)',
        color: 'var(--color-status-success-text)',
        border: '1px solid rgba(16, 185, 129, 0.25)'
      };
    }
    return {
      label: 'AGENT',
      icon: <Bot size={11} />,
      bg: 'rgba(168, 85, 247, 0.1)',
      color: '#a855f7',
      border: '1px solid rgba(168, 85, 247, 0.25)'
    };
  };

  const scopeInfo = getScopeBadge(rule.scope);

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
              backgroundColor: rule.enabled ? 'rgba(16, 185, 129, 0.12)' : 'var(--color-bg-surface-active)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${rule.enabled ? 'rgba(16, 185, 129, 0.3)' : 'var(--color-border-subtle)'}`,
              color: rule.enabled ? 'var(--color-status-success-text)' : 'var(--color-text-tertiary)',
              flexShrink: 0
            }}>
              {rule.enabled ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {rule.name}
                </h2>

                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: scopeInfo.bg,
                  color: scopeInfo.color,
                  border: scopeInfo.border,
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em'
                }}>
                  {scopeInfo.icon} {scopeInfo.label}
                </span>

                <button
                  onClick={() => onToggle(rule.id, rule.enabled)}
                  title="Click to toggle rule status"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: rule.enabled ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-bg-surface-active)',
                    color: rule.enabled ? 'var(--color-status-success-text)' : 'var(--color-text-tertiary)',
                    border: `1px solid ${rule.enabled ? 'rgba(16, 185, 129, 0.3)' : 'var(--color-border-subtle)'}`,
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all var(--duration-fast) ease'
                  }}
                >
                  {rule.enabled ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                  <span>{rule.enabled ? 'Active' : 'Inactive'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: '3px' }}>
                <span>Priority: <strong style={{ color: 'var(--color-text-primary)' }}>P{rule.priority}</strong></span>
                <span>•</span>
                <span>Target: <strong style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>{rule.target || '*'}</strong></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <button
              onClick={() => {
                onClose();
                onEdit(rule);
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
                if (window.confirm(`Are you sure you want to delete "${rule.name}"?`)) {
                  onDelete(rule.id);
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
          {/* Instruction & Guardrail Content */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Layers size={13} />
                <span>Rule Directives & Instructions</span>
              </div>
              <button
                onClick={handleCopyInstruction}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: copied ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-bg-surface-hover)',
                  border: copied ? '1px solid #10b981' : '1px solid var(--color-border-subtle)',
                  color: copied ? '#10b981' : 'var(--color-text-secondary)',
                  fontSize: 'var(--text-xs)',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy Directives'}</span>
              </button>
            </div>

            <div style={{
              backgroundColor: 'var(--color-bg-surface-hover)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.65,
              color: 'var(--color-text-primary)',
              maxHeight: '320px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              userSelect: 'text'
            }}>
              {rule.instruction || 'No instruction directives provided.'}
            </div>
          </div>

          {/* Condition Card (if specified) */}
          {rule.condition && (
            <div style={{
              backgroundColor: 'var(--color-bg-surface-hover)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3) var(--space-4)'
            }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Activation Condition
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', marginTop: '2px', fontWeight: 500 }}>
                {rule.condition}
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
              <span>ID: {rule.id}</span>
            </div>
            <div>
              <span>Status: <strong style={{ color: rule.enabled ? 'var(--color-status-success-text)' : 'var(--color-text-tertiary)' }}>{rule.enabled ? 'Enforced' : 'Disabled'}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
