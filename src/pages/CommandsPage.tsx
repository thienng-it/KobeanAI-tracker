import React, { useEffect, useState } from 'react';
import { useCommandsStore, type Command } from '../stores/useCommandsStore';
import { useSkillsStore } from '../stores/useSkillsStore';
import { CommandDetailModal } from '../components/commands/CommandDetailModal';
import { 
  Terminal, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  RefreshCw, 
  Sparkles, 
  Search, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  ArrowUpRight 
} from 'lucide-react';
import { CommandBadge } from '../components/common/CommandBadge';

export default function CommandsPage() {
  const { commands, isLoading, error, fetchCommands, syncCommands, createCommand, updateCommand, deleteCommand } = useCommandsStore();
  const { skills, fetchSkills } = useSkillsStore();

  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncedCount, setSyncedCount] = useState<number | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    skillId: '',
  });

  useEffect(() => {
    fetchCommands();
    fetchSkills();
  }, [fetchCommands, fetchSkills]);

  const handleSync = async () => {
    if (isLoading || syncStatus === 'syncing') return;
    setSyncStatus('syncing');
    const result = await syncCommands();
    if (result.success) {
      const timeStr = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      setSyncedCount(result.count ?? commands.length);
      setSyncStatus('success');
      setLastSyncedTime(timeStr);
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3500);
    } else {
      setSyncStatus('error');
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3500);
    }
  };

  const openEditorModal = (command?: Command) => {
    if (command) {
      setEditingId(command.id);
      setFormData({
        name: command.name,
        description: command.description || '',
        skillId: command.skillId,
      });
    } else {
      setEditingId(null);
      setFormData({ 
        name: '', 
        description: '', 
        skillId: skills.length > 0 ? skills[0].id : '' 
      });
    }
    setIsEditorModalOpen(true);
  };

  const closeEditorModal = () => {
    setIsEditorModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateCommand(editingId, formData);
    } else {
      await createCommand(formData);
    }
    closeEditorModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this command?')) {
      await deleteCommand(id);
      if (selectedCommand?.id === id) {
        setSelectedCommand(null);
      }
    }
  };

  const filteredCommands = commands.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.skill?.name && c.skill.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isSyncing = isLoading || syncStatus === 'syncing';
  const isSuccess = syncStatus === 'success';
  const isError = syncStatus === 'error';

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h1 className="text-2xl" style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={22} color="var(--color-brand-primary)" />
              Command Registry
            </h1>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: 'var(--color-brand-primary)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)'
            }}>
              <Sparkles size={11} /> {commands.length} Commands
            </span>

            {lastSyncedTime && (
              <span 
                className="animate-fade-in"
                style={{ 
                  fontSize: '0.6875rem', 
                  color: 'var(--color-text-tertiary)', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '3px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <Clock size={10} /> Synced {lastSyncedTime}
              </span>
            )}
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)', margin: 'var(--space-1) 0 0 0' }}>
            Manage shortcuts and slash commands that trigger prompt skills. Click any row to inspect execution syntax.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', flexShrink: 0 }}>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="btn-secondary"
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '7px 16px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              minWidth: '160px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              transition: 'all var(--duration-fast) var(--ease-spring-smooth)',
              backgroundColor: isSuccess ? 'rgba(16, 185, 129, 0.15)' : isError ? 'rgba(239, 68, 68, 0.15)' : undefined,
              borderColor: isSuccess ? 'rgba(16, 185, 129, 0.35)' : isError ? 'rgba(239, 68, 68, 0.35)' : undefined,
              color: isSuccess ? 'var(--color-status-success-text)' : isError ? 'var(--color-status-error-text)' : undefined,
              boxShadow: isSuccess ? '0 0 12px rgba(16, 185, 129, 0.2)' : undefined
            }}
          >
            {isSyncing ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Syncing Commands...</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 size={13} color="var(--color-status-success-text)" />
                <span>Synced {syncedCount ? `(${syncedCount})` : 'Done'}</span>
              </>
            ) : isError ? (
              <>
                <AlertCircle size={13} color="var(--color-status-error-text)" />
                <span>Sync Failed</span>
              </>
            ) : (
              <>
                <RefreshCw size={13} />
                <span>Sync System Commands</span>
              </>
            )}
          </button>
          
          <button 
            onClick={() => openEditorModal()}
            style={{ 
              background: 'var(--color-brand-primary)', 
              border: 'none', 
              padding: '7px 16px', 
              borderRadius: 'var(--radius-md)',
              color: '#fff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              boxShadow: 'var(--shadow-sm)',
              height: '34px'
            }}
          >
            <Plus size={15} /> 
            <span>New Command</span>
          </button>
        </div>
      </header>

      {error && (
        <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-status-error-bg)', color: 'var(--color-status-error-text)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)' }}>
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: 'var(--space-6)', position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
        <input 
          type="text" 
          placeholder="Search commands by name, linked skill, or description..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            padding: '9px 14px 9px 40px',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--color-text-primary)',
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'border-color var(--duration-fast) ease'
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-brand-primary)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-subtle)'; }}
        />
      </div>

      {/* Commands Table */}
      {isLoading && commands.length === 0 ? (
        <div className="glass-panel" style={{ padding: 'var(--space-12)', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div className="animate-spin" style={{ width: '28px', height: '28px', border: '3px solid var(--color-brand-primary)', borderTopColor: 'transparent', borderRadius: '50%' }} />
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
              Loading command registry...
            </p>
          </div>
        </div>
      ) : filteredCommands.length === 0 ? (
        <div className="glass-panel animate-slide-up" style={{ padding: 'var(--space-12)', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-bg-surface-hover)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-3)' }}>
            <Terminal size={24} />
          </div>
          <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            No commands found
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem', maxWidth: '400px', margin: '0 auto' }}>
            {searchQuery ? `No commands match "${searchQuery}". Try clearing your search.` : 'No slash commands configured yet. Create a command or sync system commands.'}
          </p>
        </div>
      ) : (
        <div 
          className="glass-panel animate-slide-up" 
          style={{ 
            borderRadius: 'var(--radius-xl)', 
            overflow: 'hidden', 
            border: '1px solid var(--color-border-subtle)',
            backgroundColor: 'var(--color-bg-surface)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-surface-hover)' }}>
                <th style={{ padding: '12px 16px', width: '180px', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)' }}>Command Trigger</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)' }}>Description</th>
                <th style={{ padding: '12px 16px', width: '220px', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)' }}>Linked Skill</th>
                <th style={{ padding: '12px 16px', width: '100px', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCommands.map((cmd) => (
                <tr 
                  key={cmd.id} 
                  onClick={() => setSelectedCommand(cmd)}
                  style={{ 
                    borderBottom: '1px solid var(--color-border-subtle)', 
                    cursor: 'pointer',
                    transition: 'background-color var(--duration-fast) ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Command Badge */}
                  <td style={{ padding: '12px 16px' }}>
                    <CommandBadge command={cmd.name} size="sm" maxWidth="170px" />
                  </td>

                  {/* Description */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.8125rem',
                      lineHeight: 1.45,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {cmd.description || 'No description provided'}
                    </div>
                  </td>

                  {/* Linked Skill */}
                  <td style={{ padding: '12px 16px' }}>
                    {cmd.skill ? (
                      <span style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: 'var(--color-bg-surface-hover)',
                        border: '1px solid var(--color-border-subtle)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)'
                      }}>
                        <BookOpen size={12} color="var(--color-brand-primary)" />
                        <span>{cmd.skill.name}</span>
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-status-error-text)', fontSize: '0.75rem' }}>Unknown Skill</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '12px 16px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <button 
                        onClick={() => openEditorModal(cmd)}
                        title="Edit command"
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '4px', borderRadius: 'var(--radius-sm)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                      >
                        <Edit size={15} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cmd.id)}
                        title="Delete command"
                        style={{ background: 'none', border: 'none', color: 'var(--color-status-error-text)', cursor: 'pointer', padding: '4px', borderRadius: 'var(--radius-sm)', opacity: 0.85 }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                      >
                        <Trash2 size={15} />
                      </button>
                      <div 
                        title="Click row to inspect"
                        style={{ color: 'var(--color-text-tertiary)', padding: '4px', display: 'inline-flex', marginLeft: '2px' }}
                      >
                        <ArrowUpRight size={14} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Command Detail Inspection Modal */}
      <CommandDetailModal
        command={selectedCommand}
        onClose={() => setSelectedCommand(null)}
        onEdit={(cmd) => openEditorModal(cmd)}
        onDelete={(id) => handleDelete(id)}
      />

      {/* Create / Edit Command Form Modal */}
      {isEditorModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
          padding: 'var(--space-4)',
          animation: 'fadeIn var(--duration-fast) ease'
        }}>
          <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '540px', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'var(--color-bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 'var(--space-4)' }}>
              <h2 className="text-xl" style={{ margin: 0, fontWeight: 700, color: 'var(--color-text-primary)' }}>{editingId ? 'Edit Command' : 'Create Slash Command'}</h2>
              <button onClick={closeEditorModal} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Command Name *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="/review"
                  required
                  style={{ width: '100%', padding: 'var(--space-3)', background: 'var(--color-bg-surface-hover)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', outline: 'none', fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Linked Prompt Skill *</label>
                <select 
                  value={formData.skillId} 
                  onChange={e => setFormData({...formData, skillId: e.target.value})}
                  required
                  style={{ width: '100%', padding: 'var(--space-3)', background: 'var(--color-bg-surface-hover)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', outline: 'none' }}
                >
                  <option value="">Select a skill...</option>
                  {skills.map(skill => (
                    <option key={skill.id} value={skill.id}>{skill.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Description & Purpose</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="What does this slash command automate or trigger?"
                  rows={3}
                  style={{ width: '100%', padding: 'var(--space-3)', background: 'var(--color-bg-surface-hover)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', resize: 'vertical', outline: 'none', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-3)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-4)' }}>
                <button type="button" onClick={closeEditorModal} className="btn-secondary" style={{ padding: '7px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '7px 18px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
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
