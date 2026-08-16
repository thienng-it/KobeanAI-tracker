import React, { useState } from 'react';
import { Hook, useHookStore } from '../../stores/useHookStore';
import { 
  X, 
  Save, 
  Zap, 
  Plus
} from 'lucide-react';

interface HookEditorModalProps {
  hook?: Hook | null;
  onClose: () => void;
  onSaved: () => void;
}

export const HookEditorModal: React.FC<HookEditorModalProps> = ({
  hook,
  onClose,
  onSaved
}) => {
  const { createHook, updateHook } = useHookStore();

  const isEditing = !!hook;

  const [name, setName] = useState(hook?.name || '');
  const [event, setEvent] = useState(hook?.event || 'PreToolUse');
  const [matcher, setMatcher] = useState(hook?.matcher || 'run_command');
  const [timeout, setTimeoutVal] = useState(hook?.timeout || 5);
  const [description, setDescription] = useState(hook?.description || '');
  const [command, setCommand] = useState(hook?.command || '');
  const [enabled, setEnabled] = useState(hook ? hook.enabled : true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matcherPresets = ['run_command', 'write_to_file', 'replace_file_content', 'view_file', '*'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !command.trim()) {
      setError('Please fill in hook name and command script.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    if (isEditing && hook) {
      const res = await updateHook(hook.id, {
        name,
        event: event as any,
        matcher,
        timeout: Number(timeout) || 5,
        description,
        command,
        enabled
      });

      if (res.success) {
        onSaved();
        onClose();
      } else {
        setError(res.error || 'Failed to update hook');
      }
    } else {
      const res = await createHook({
        name,
        event: event as any,
        matcher,
        timeout: Number(timeout) || 5,
        description,
        command
      });

      if (res.success) {
        onSaved();
        onClose();
      } else {
        setError(res.error || 'Failed to create hook');
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div 
      className="animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: 'var(--space-4)',
          borderBottom: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: 'var(--color-brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={18} />
            </div>

            <div>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {isEditing ? 'Edit Lifecycle Hook' : 'Create Custom Hook'}
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                Configure event intercept and execution script for `.agents/hooks.json`.
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
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: 'var(--space-4)', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {error && (
              <div style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--color-status-error-text)',
                fontSize: '0.8125rem'
              }}>
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Hook Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Safety Gate, Auto Prettier, Branch Context"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-surface-hover)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            {/* Event & Timeout Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Lifecycle Event Trigger *
                </label>
                <select
                  value={event}
                  onChange={(e) => setEvent(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-surface-hover)',
                    border: '1px solid var(--color-border-subtle)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="PreToolUse">PreToolUse (Before Tool Execution)</option>
                  <option value="PostToolUse">PostToolUse (After Tool Execution)</option>
                  <option value="SessionStart">SessionStart (On Chat Session Init)</option>
                  <option value="SessionEnd">SessionEnd (On Chat Session Completion)</option>
                  <option value="UserPrompt">UserPrompt (On User Prompt Submission)</option>
                  <option value="PreCommit">PreCommit (Before Git Commit)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Execution Timeout (seconds)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={timeout}
                  onChange={(e) => setTimeoutVal(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-surface-hover)',
                    border: '1px solid var(--color-border-subtle)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            {/* Matcher Field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Tool Matcher (e.g. run_command, write_to_file, or *)
              </label>
              <input
                type="text"
                value={matcher}
                onChange={(e) => setMatcher(e.target.value)}
                placeholder="run_command"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-surface-hover)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.875rem'
                }}
              />
              <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', alignSelf: 'center' }}>Presets:</span>
                {matcherPresets.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setMatcher(p)}
                    style={{
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-mono)',
                      border: '1px solid var(--color-border-subtle)',
                      backgroundColor: matcher === p ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      color: matcher === p ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)',
                      cursor: 'pointer'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of the safety or validation rules enforced by this hook..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-surface-hover)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.8125rem',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Command Script */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Command Script (receives tool payload on stdin) *
              </label>
              <textarea
                rows={4}
                required
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="node -e &quot;const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(JSON.stringify({ decision: 'allow' }));&quot;"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-surface-hover)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  lineHeight: '1.4'
                }}
              />
            </div>

            {/* Active Toggle if editing */}
            {isEditing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="hook-enabled"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <label htmlFor="hook-enabled" style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
                  Enable this hook immediately
                </label>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div style={{
            padding: 'var(--space-3) var(--space-4)',
            borderTop: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 'var(--space-2)'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-brand-primary)',
                color: '#fff',
                border: 'none',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isEditing ? <Save size={14} /> : <Plus size={14} />}
              <span>{isEditing ? 'Save Changes' : 'Create Hook'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
