import React, { useState } from 'react';
import { Memory, useMemoryStore } from '../../stores/useMemoryStore';
import { 
  Pin, 
  Sparkles, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  Zap, 
  Globe, 
  FolderGit2
} from 'lucide-react';

interface MemoryCardProps {
  memory: Memory;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory }) => {
  const { togglePin, deleteMemory, openEditor, openSimulator, simulateContext } = useMemoryStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(memory.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSimulate = (e: React.MouseEvent) => {
    e.stopPropagation();
    openSimulator();
    simulateContext(memory.title);
  };

  // Category Color Scheme
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'architecture': return '#3b82f6';
      case 'gotchas': return '#ef4444';
      case 'user-preference': return '#ec4899';
      case 'workflow': return '#f59e0b';
      case 'api-conventions': return '#10b981';
      case 'learned-pattern': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  // Priority Color Scheme
  const getPriorityStyle = (prio: string) => {
    switch (prio) {
      case 'critical':
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' };
      case 'high':
        return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' };
      case 'normal':
        return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)' };
      default:
        return { color: '#64748b', bg: 'rgba(100, 116, 139, 0.12)', border: 'rgba(100, 116, 139, 0.3)' };
    }
  };

  const categoryColor = getCategoryColor(memory.category);
  const prioStyle = getPriorityStyle(memory.priority);

  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        border: memory.pinned 
          ? '1px solid rgba(236, 72, 153, 0.4)' 
          : '1px solid var(--color-border-subtle)',
        boxShadow: memory.pinned ? '0 0 16px rgba(236, 72, 153, 0.1)' : 'none'
      }}
    >
      <div>
        {/* Header: Badges & Pin action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)', gap: '8px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            {/* Category Badge */}
            <span
              style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                color: categoryColor,
                backgroundColor: `${categoryColor}15`,
                border: `1px solid ${categoryColor}40`,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                textTransform: 'capitalize'
              }}
            >
              {memory.category.replace('-', ' ')}
            </span>

            {/* Priority Badge */}
            <span
              style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: prioStyle.color,
                backgroundColor: prioStyle.bg,
                border: `1px solid ${prioStyle.border}`,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase'
              }}
            >
              {memory.priority}
            </span>

            {/* Scope Badge */}
            <span
              style={{
                fontSize: '0.6875rem',
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-bg-surface-hover)',
                border: '1px solid var(--color-border-subtle)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              {memory.scope === 'global' ? <Globe size={11} /> : <FolderGit2 size={11} />}
              <span>{memory.scope === 'global' ? 'Global' : 'Workspace'}</span>
            </span>
          </div>

          {/* Pin Button */}
          <button
            onClick={() => togglePin(memory.id)}
            title={memory.pinned ? 'Pinned (Always in agent context)' : 'Pin memory'}
            style={{
              background: memory.pinned ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
              border: memory.pinned ? '1px solid rgba(236, 72, 153, 0.5)' : '1px solid transparent',
              color: memory.pinned ? '#ec4899' : 'var(--color-text-tertiary)',
              padding: '5px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <Pin size={15} style={{ transform: memory.pinned ? 'rotate(45deg)' : 'none' }} />
          </button>
        </div>

        {/* Title */}
        <h3 style={{ margin: '0 0 var(--space-2)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
          {memory.title}
        </h3>

        {/* Content Box */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-surface-hover)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-subtle)',
            padding: 'var(--space-3)',
            marginBottom: 'var(--space-3)',
            fontSize: '0.8125rem',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-mono)',
            lineHeight: 1.5,
            maxHeight: '120px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {memory.content}
        </div>

        {/* Tags */}
        {memory.tags && memory.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: 'var(--space-3)' }}>
            {memory.tags.map((tag, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border-subtle)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Metrics & Actions */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          paddingTop: 'var(--space-3)',
          borderTop: '1px solid var(--color-border-subtle)',
          marginTop: 'var(--space-2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={12} color="#f59e0b" />
            {memory.tokens} tok
          </span>
          {memory.recallCount > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
              {memory.recallCount} recalls
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={handleCopy}
            title="Copy content"
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border-subtle)',
              color: copied ? 'var(--color-status-success)' : 'var(--color-text-secondary)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleSimulate}
            title="Test retrieval in simulator"
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: 'var(--color-brand-primary)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Sparkles size={12} />
            <span>Simulate</span>
          </button>

          <button
            onClick={() => openEditor(memory)}
            title="Edit memory"
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-secondary)',
              padding: '4px 6px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            <Edit3 size={13} />
          </button>

          <button
            onClick={() => deleteMemory(memory.id)}
            title="Delete memory"
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-status-error)',
              padding: '4px 6px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
