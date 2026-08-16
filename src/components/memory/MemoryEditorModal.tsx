import React, { useState, useEffect } from 'react';
import { useMemoryStore, Memory } from '../../stores/useMemoryStore';
import { X, Brain, Save, Pin, Zap, AlertCircle } from 'lucide-react';

export const MemoryEditorModal: React.FC = () => {
  const { isEditorOpen, editingMemory, closeEditor, createMemory, updateMemory } = useMemoryStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Memory['category']>('architecture');
  const [priority, setPriority] = useState<Memory['priority']>('normal');
  const [pinned, setPinned] = useState(false);
  const [scope, setScope] = useState<'workspace' | 'global'>('workspace');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editingMemory) {
      setTitle(editingMemory.title);
      setContent(editingMemory.content);
      setCategory(editingMemory.category);
      setPriority(editingMemory.priority);
      setPinned(editingMemory.pinned);
      setScope(editingMemory.scope);
      setTagsInput(editingMemory.tags ? editingMemory.tags.join(', ') : '');
    } else {
      setTitle('');
      setContent('');
      setCategory('architecture');
      setPriority('normal');
      setPinned(false);
      setScope('workspace');
      setTagsInput('');
    }
    setErrorMessage(null);
  }, [editingMemory, isEditorOpen]);

  if (!isEditorOpen) return null;

  const estimatedTokens = Math.max(1, Math.ceil(content.trim().length / 3.8));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMessage('Title and content are required');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase().replace(/^#/, ''))
      .filter(Boolean);

    try {
      let success = false;
      if (editingMemory) {
        success = await updateMemory(editingMemory.id, {
          title,
          content,
          category,
          priority,
          pinned,
          scope,
          tags
        });
      } else {
        success = await createMemory({
          title,
          content,
          category,
          priority,
          pinned,
          scope,
          tags
        });
      }

      if (success) {
        closeEditor();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save memory item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)'
      }}
      onClick={closeEditor}
    >
      <div
        className="glass-panel animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-2xl)',
          backgroundColor: '#0d1117',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--space-5)',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-brand-primary)'
              }}
            >
              <Brain size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {editingMemory ? 'Edit Memory Directive' : 'Create Knowledge Directive'}
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                Persisted to .agents/memory/MEMORY.md and loaded into agent context
              </span>
            </div>
          </div>

          <button
            onClick={closeEditor}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-tertiary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', padding: 'var(--space-5)', gap: 'var(--space-4)' }}>
          {errorMessage && (
            <div
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              Memory Title / Directive Headline *
            </label>
            <input
              type="text"
              className="glass-panel"
              placeholder="e.g. Gitleaks CI Secret Scanning Compliance"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-subtle)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--color-text-primary)',
                fontSize: '0.875rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Category & Priority Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                  backgroundColor: '#161b22',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box'
                }}
              >
                <option value="architecture">Architecture Standard</option>
                <option value="gotchas">Gotchas & Failure Avoidance</option>
                <option value="user-preference">User Preference & UI/UX</option>
                <option value="workflow">Workflow & Decision Ladder</option>
                <option value="api-conventions">API Conventions & Schema</option>
                <option value="learned-pattern">Learned Pattern & Feedback</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Priority Level
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                  backgroundColor: '#161b22',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box'
                }}
              >
                <option value="critical">Critical (Mandatory Directive)</option>
                <option value="high">High (Strong Preference)</option>
                <option value="normal">Normal (Standard Context)</option>
                <option value="low">Low (Background Knowledge)</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Directive Content / Fact (Markdown) *
              </label>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={11} color="#f59e0b" />
                ~{estimatedTokens} tokens
              </span>
            </div>
            <textarea
              className="glass-panel"
              placeholder="Detailed fact, failure mode to avoid, or architectural rule..."
              rows={6}
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-subtle)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                color: '#e6edf3',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                lineHeight: 1.5,
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Tags */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              Tags (comma separated)
            </label>
            <input
              type="text"
              className="glass-panel"
              placeholder="e.g. gitleaks, secrets, testing, ci"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-subtle)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--color-text-primary)',
                fontSize: '0.8125rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Scope & Pin Options */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', padding: 'var(--space-3)', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--color-text-primary)' }}>
              <input
                type="checkbox"
                checked={pinned}
                onChange={e => setPinned(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: pinned ? '#ec4899' : 'inherit' }}>
                <Pin size={14} />
                Pin to Active Context (Always inject into agent prompts)
              </span>
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Scope:</span>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="scope"
                  value="workspace"
                  checked={scope === 'workspace'}
                  onChange={() => setScope('workspace')}
                />
                <span>Workspace</span>
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="scope"
                  value="global"
                  checked={scope === 'global'}
                  onChange={() => setScope('global')}
                />
                <span>Global</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: 'var(--space-2)' }}>
            <button
              type="button"
              onClick={closeEditor}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.875rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ padding: '8px 20px', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={15} />
              <span>{isSubmitting ? 'Saving...' : editingMemory ? 'Update Directive' : 'Create Directive'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
