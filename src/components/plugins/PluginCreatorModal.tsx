import React, { useState } from 'react';
import { usePluginStore } from '../../stores/usePluginStore';
import { 
  X, 
  Plus, 
  Save, 
  BrainCircuit, 
  Zap
} from 'lucide-react';

interface PluginCreatorModalProps {
  onClose: () => void;
  onCreated?: (pluginId: string) => void;
}

export const PluginCreatorModal: React.FC<PluginCreatorModalProps> = ({
  onClose,
  onCreated
}) => {
  const { createPlugin } = usePluginStore();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('Workspace');
  const [license, setLicense] = useState('MIT');
  const [repository, setRepository] = useState('');
  const [keywords, setKeywords] = useState('kobean-plugin, custom-tools');

  // Initial Skill Toggle & Fields
  const [includeInitialSkill, setIncludeInitialSkill] = useState(true);
  const [skillName, setSkillName] = useState('');
  const [skillDescription, setSkillDescription] = useState('');
  const [skillInstructions, setSkillInstructions] = useState('');

  // Hooks Toggle
  const [includeHooks, setIncludeHooks] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    const derivedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setSlug(derivedSlug);
    if (!skillName) {
      setSkillName(val);
      setSkillDescription(`${val} specialized assistant capabilities`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Plugin name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const kwArray = keywords.split(',').map(k => k.trim()).filter(Boolean);

    const result = await createPlugin({
      name: name.trim(),
      slug: slug.trim() || undefined,
      version: version.trim() || '1.0.0',
      description: description.trim() || 'Custom AI agent plugin',
      author: author.trim() || 'Workspace',
      license: license.trim() || 'MIT',
      repository: repository.trim() || undefined,
      keywords: kwArray,
      initialSkill: includeInitialSkill && skillName.trim() ? {
        name: skillName.trim(),
        description: skillDescription.trim() || `${name} core skill`,
        instructions: skillInstructions.trim() || '## Instructions\nProvide workflow steps for this skill.'
      } : undefined,
      hasHooks: includeHooks
    });

    setIsSubmitting(false);

    if (result.success) {
      if (onCreated && result.id) {
        onCreated(result.id);
      }
      onClose();
    } else {
      setError(result.error || 'Failed to create plugin');
    }
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
          maxWidth: '740px',
          maxHeight: '90vh',
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
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a78bfa'
            }}>
              <Plus size={18} />
            </div>

            <div>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Scaffold Workspace Plugin
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Create a new modular AI plugin in <code style={{ fontFamily: 'var(--font-mono)' }}>.agents/plugins/</code>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {error && (
            <div style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-status-error-bg)',
              color: 'var(--color-status-error-text)',
              fontSize: '0.8125rem'
            }}>
              {error}
            </div>
          )}

          {/* Plugin Metadata Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Plugin Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Data Analytics Suite"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
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

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Directory Slug (.agents/plugins/...)
              </label>
              <input
                type="text"
                placeholder="e.g. data-analytics-suite"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
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

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief summary of what this plugin and its bundled tools do..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-surface-hover)',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-primary)',
                fontSize: '0.875rem',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-surface-hover)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.8125rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Version
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-surface-hover)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                License
              </label>
              <select
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-surface-hover)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.8125rem'
                }}
              >
                <option value="MIT">MIT</option>
                <option value="Apache-2.0">Apache-2.0</option>
                <option value="GPL-3.0">GPL-3.0</option>
                <option value="Proprietary">Proprietary</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Repository URL (optional)
              </label>
              <input
                type="text"
                value={repository}
                onChange={(e) => setRepository(e.target.value)}
                placeholder="https://github.com/org/repo"
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-surface-hover)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.8125rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Keywords / Tags (comma separated)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. data, analytics, python, charts"
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-surface-hover)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.8125rem'
                }}
              />
            </div>
          </div>

          {/* Initial Skill Section */}
          <div style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-bg-surface-hover)',
            border: '1px solid var(--color-border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BrainCircuit size={16} color="var(--color-brand-primary)" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Scaffold Starter Skill in <code style={{ fontFamily: 'var(--font-mono)' }}>skills/</code>
                </span>
              </div>

              <input
                type="checkbox"
                checked={includeInitialSkill}
                onChange={(e) => setIncludeInitialSkill(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
            </div>

            {includeInitialSkill && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: '4px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', marginBottom: '2px' }}>
                      Skill Name
                    </label>
                    <input
                      type="text"
                      value={skillName}
                      onChange={(e) => setSkillName(e.target.value)}
                      placeholder="e.g. data-analyzer"
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg-surface)',
                        border: '1px solid var(--color-border-subtle)',
                        color: 'var(--color-text-primary)',
                        fontSize: '0.8125rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', marginBottom: '2px' }}>
                      Skill Description
                    </label>
                    <input
                      type="text"
                      value={skillDescription}
                      onChange={(e) => setSkillDescription(e.target.value)}
                      placeholder="e.g. Analyzes tabular datasets and SQL dumps"
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg-surface)',
                        border: '1px solid var(--color-border-subtle)',
                        color: 'var(--color-text-primary)',
                        fontSize: '0.8125rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', marginBottom: '2px' }}>
                    Skill Instructions (SKILL.md prompt)
                  </label>
                  <textarea
                    rows={3}
                    value={skillInstructions}
                    onChange={(e) => setSkillInstructions(e.target.value)}
                    placeholder="## Workflow Instructions..."
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-bg-surface)',
                      border: '1px solid var(--color-border-subtle)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Hooks configuration checkbox */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-bg-surface-hover)',
            border: '1px solid var(--color-border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={16} color="#f472b6" />
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Scaffold <code style={{ fontFamily: 'var(--font-mono)' }}>hooks.json</code>
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)' }}>
                  Enable lifecycle hooks (onSessionStart, onToolCall)
                </div>
              </div>
            </div>

            <input
              type="checkbox"
              checked={includeHooks}
              onChange={(e) => setIncludeHooks(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-3)',
            paddingTop: 'var(--space-2)',
            borderTop: '1px solid var(--color-border-subtle)'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.8125rem' }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 20px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-brand-primary)',
                color: '#fff',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              <Save size={14} />
              <span>{isSubmitting ? 'Creating Plugin...' : 'Scaffold Plugin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
