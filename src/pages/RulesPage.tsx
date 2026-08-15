import React, { useEffect, useState } from 'react';
import { useRulesStore } from '../stores/useRulesStore';
import { ShieldAlert, Plus, Edit, Trash2, X, CheckCircle, XCircle } from 'lucide-react';

export default function RulesPage() {
  const { rules, isLoading, error, fetchRules, createRule, updateRule, deleteRule } = useRulesStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    scope: 'global',
    target: '*',
    priority: 100,
    instruction: '',
    condition: '',
    enabled: true
  });

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const openModal = (rule?: any) => {
    if (rule) {
      setEditingId(rule.id);
      setFormData({
        name: rule.name,
        scope: rule.scope,
        target: rule.target,
        priority: rule.priority,
        instruction: rule.instruction,
        condition: rule.condition || '',
        enabled: rule.enabled
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        scope: 'global',
        target: '*',
        priority: 100,
        instruction: '',
        condition: '',
        enabled: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateRule(editingId, formData);
    } else {
      await createRule(formData);
    }
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      await deleteRule(id);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await updateRule(id, { enabled: !currentStatus });
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="text-2xl" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <ShieldAlert size={24} color="var(--color-primary)" />
            Rules Engine
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)', margin: 0, marginTop: 'var(--space-1)' }}>
            Define behavioral boundaries, instructions, and guardrails for your AI agents.
          </p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => openModal()}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <Plus size={16} />
          New Rule
        </button>
      </header>

      {error && (
        <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-status-error-bg)', color: 'var(--color-status-error-text)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)' }}>
          {error}
        </div>
      )}

      {isLoading && rules.length === 0 ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading rules...</p>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <th style={{ padding: 'var(--space-4)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: 'var(--space-4)', fontWeight: 600 }}>Name</th>
                <th style={{ padding: 'var(--space-4)', fontWeight: 600 }}>Scope</th>
                <th style={{ padding: 'var(--space-4)', fontWeight: 600 }}>Instruction</th>
                <th style={{ padding: 'var(--space-4)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                    No rules defined yet.
                  </td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', opacity: rule.enabled ? 1 : 0.6 }}>
                    <td style={{ padding: 'var(--space-4)' }}>
                      <button 
                        onClick={() => toggleStatus(rule.id, rule.enabled)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        {rule.enabled ? 
                          <CheckCircle size={20} color="var(--color-status-success-text)" /> : 
                          <XCircle size={20} color="var(--color-text-tertiary)" />
                        }
                      </button>
                    </td>
                    <td style={{ padding: 'var(--space-4)', fontWeight: 500 }}>
                      {rule.name}
                    </td>
                    <td style={{ padding: 'var(--space-4)' }}>
                      <span style={{ 
                        background: 'var(--color-bg-secondary)', 
                        padding: '2px 8px', 
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {rule.scope}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {rule.instruction}
                    </td>
                    <td style={{ padding: 'var(--space-4)', textAlign: 'right' }}>
                      <button 
                        onClick={() => openModal(rule)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', marginRight: 'var(--space-2)' }}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(rule.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-status-error-text)', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <h2 className="text-xl" style={{ margin: 0 }}>{editingId ? 'Edit Rule' : 'Create Rule'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.875rem' }}>Rule Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Always Use Strict Typing"
                    required
                    style={{ width: '100%', padding: 'var(--space-3)', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.875rem' }}>Priority (0-100)</label>
                  <input 
                    type="number" 
                    value={formData.priority} 
                    onChange={e => setFormData({...formData, priority: parseInt(e.target.value) || 100})}
                    required
                    min={0}
                    max={100}
                    style={{ width: '100%', padding: 'var(--space-3)', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.875rem' }}>Scope</label>
                  <select 
                    value={formData.scope} 
                    onChange={e => setFormData({...formData, scope: e.target.value})}
                    style={{ width: '100%', padding: 'var(--space-3)', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)' }}
                  >
                    <option value="global">Global (All Agents)</option>
                    <option value="workspace">Workspace Specific</option>
                    <option value="agent">Agent Specific</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.875rem' }}>Target ID</label>
                  <input 
                    type="text" 
                    value={formData.target} 
                    onChange={e => setFormData({...formData, target: e.target.value})}
                    placeholder="*"
                    required
                    style={{ width: '100%', padding: 'var(--space-3)', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.875rem' }}>Condition (Optional)</label>
                <input 
                  type="text" 
                  value={formData.condition} 
                  onChange={e => setFormData({...formData, condition: e.target.value})}
                  placeholder="e.g. When editing Python files"
                  style={{ width: '100%', padding: 'var(--space-3)', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.875rem' }}>Instruction</label>
                <textarea 
                  value={formData.instruction} 
                  onChange={e => setFormData({...formData, instruction: e.target.value})}
                  placeholder="The exact behavior rule you want to enforce."
                  rows={5}
                  required
                  style={{ width: '100%', padding: 'var(--space-3)', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                <input 
                  type="checkbox" 
                  id="enabledCheckbox"
                  checked={formData.enabled} 
                  onChange={e => setFormData({...formData, enabled: e.target.checked})}
                />
                <label htmlFor="enabledCheckbox" style={{ fontSize: '0.875rem' }}>Rule is active</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                <button type="button" onClick={closeModal} style={{ padding: 'var(--space-2) var(--space-4)', background: 'transparent', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Save Changes' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
