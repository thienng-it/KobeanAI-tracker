import React, { useEffect, useState } from 'react';
import { useCommandsStore } from '../stores/useCommandsStore';
import { useSkillsStore } from '../stores/useSkillsStore';
import { Terminal, Plus, Edit, Trash2, X } from 'lucide-react';

export default function CommandsPage() {
  const { commands, isLoading, error, fetchCommands, createCommand, updateCommand, deleteCommand } = useCommandsStore();
  const { skills, fetchSkills } = useSkillsStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    skillId: '',
  });

  useEffect(() => {
    fetchCommands();
    fetchSkills();
  }, [fetchCommands, fetchSkills]);

  const openModal = (command?: any) => {
    if (command) {
      setEditingId(command.id);
      setFormData({
        name: command.name,
        description: command.description || '',
        skillId: command.skillId,
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', description: '', skillId: '' });
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
      await updateCommand(editingId, formData);
    } else {
      await createCommand(formData);
    }
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this command?')) {
      await deleteCommand(id);
    }
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="text-2xl" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Terminal size={24} color="var(--color-primary)" />
            Command Registry
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)', margin: 0, marginTop: 'var(--space-1)' }}>
            Manage shortcuts and commands that trigger skills.
          </p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => openModal()}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <Plus size={16} />
          New Command
        </button>
      </header>

      {error && (
        <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-status-error-bg)', color: 'var(--color-status-error-text)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)' }}>
          {error}
        </div>
      )}

      {isLoading && commands.length === 0 ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading commands...</p>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <th style={{ padding: 'var(--space-4)', fontWeight: 600 }}>Command</th>
                <th style={{ padding: 'var(--space-4)', fontWeight: 600 }}>Description</th>
                <th style={{ padding: 'var(--space-4)', fontWeight: 600 }}>Linked Skill</th>
                <th style={{ padding: 'var(--space-4)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {commands.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                    No commands configured yet.
                  </td>
                </tr>
              ) : (
                commands.map((cmd) => (
                  <tr key={cmd.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: 'var(--space-4)' }}>
                      <code style={{ background: 'var(--color-bg-secondary)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                        {cmd.name}
                      </code>
                    </td>
                    <td style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
                      {cmd.description || '-'}
                    </td>
                    <td style={{ padding: 'var(--space-4)' }}>
                      {cmd.skill ? cmd.skill.name : <span style={{ color: 'var(--color-status-error-text)' }}>Unknown Skill</span>}
                    </td>
                    <td style={{ padding: 'var(--space-4)', textAlign: 'right' }}>
                      <button 
                        onClick={() => openModal(cmd)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', marginRight: 'var(--space-2)' }}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cmd.id)}
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <h2 className="text-xl" style={{ margin: 0 }}>{editingId ? 'Edit Command' : 'Create Command'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.875rem' }}>Command Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="/review"
                  required
                  style={{ width: '100%', padding: 'var(--space-3)', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.875rem' }}>Linked Skill</label>
                <select 
                  value={formData.skillId} 
                  onChange={e => setFormData({...formData, skillId: e.target.value})}
                  required
                  style={{ width: '100%', padding: 'var(--space-3)', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)' }}
                >
                  <option value="">Select a skill...</option>
                  {skills.map(skill => (
                    <option key={skill.id} value={skill.id}>{skill.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.875rem' }}>Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="What does this command do?"
                  rows={3}
                  style={{ width: '100%', padding: 'var(--space-3)', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                <button type="button" onClick={closeModal} style={{ padding: 'var(--space-2) var(--space-4)', background: 'transparent', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Save Changes' : 'Create Command'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
