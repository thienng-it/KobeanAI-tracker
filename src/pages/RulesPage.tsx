import React, { useEffect, useState } from 'react';
import { useRulesStore, type Rule } from '../stores/useRulesStore';
import { RuleDetailModal } from '../components/rules/RuleDetailModal';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Sparkles, 
  Search, 
  Clock, 
  AlertCircle, 
  FolderGit2, 
  Globe, 
  Bot, 
  ArrowUpRight
} from 'lucide-react';

export default function RulesPage() {
  const { rules, isLoading, error, fetchRules, syncRules, createRule, updateRule, deleteRule } = useRulesStore();

  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScope, setSelectedScope] = useState<string>('all');

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncedCount, setSyncedCount] = useState<number | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    scope: 'workspace',
    target: '*',
    priority: 100,
    instruction: '',
    condition: '',
    enabled: true
  });

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleSync = async () => {
    if (isLoading || syncStatus === 'syncing') return;
    setSyncStatus('syncing');
    const result = await syncRules();
    if (result.success) {
      const timeStr = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      setSyncedCount(result.count ?? rules.length);
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

  const openEditorModal = (rule?: Rule) => {
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
        scope: 'workspace',
        target: '*',
        priority: 100,
        instruction: '',
        condition: '',
        enabled: true
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
      await updateRule(editingId, formData);
    } else {
      await createRule(formData);
    }
    closeEditorModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      await deleteRule(id);
      if (selectedRule?.id === id) {
        setSelectedRule(null);
      }
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await updateRule(id, { enabled: !currentStatus });
    if (selectedRule?.id === id) {
      setSelectedRule({ ...selectedRule, enabled: !currentStatus });
    }
  };

  const filteredRules = rules.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.instruction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.condition && r.condition.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesScope = selectedScope === 'all' || r.scope.toLowerCase() === selectedScope.toLowerCase();

    return matchesSearch && matchesScope;
  });

  const getScopeBadge = (scope: string) => {
    const s = scope.toLowerCase();
    if (s === 'workspace') {
      return {
        label: 'WORKSPACE',
        icon: <FolderGit2 size={10} />,
        bg: 'rgba(59, 130, 246, 0.1)',
        color: 'var(--color-brand-primary)',
        border: '1px solid rgba(59, 130, 246, 0.25)'
      };
    }
    if (s === 'global') {
      return {
        label: 'GLOBAL',
        icon: <Globe size={10} />,
        bg: 'rgba(16, 185, 129, 0.1)',
        color: 'var(--color-status-success-text)',
        border: '1px solid rgba(16, 185, 129, 0.25)'
      };
    }
    return {
      label: 'AGENT',
      icon: <Bot size={10} />,
      bg: 'rgba(168, 85, 247, 0.1)',
      color: '#a855f7',
      border: '1px solid rgba(168, 85, 247, 0.25)'
    };
  };

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
              <ShieldAlert size={22} color="var(--color-brand-primary)" />
              Rules Engine
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
              <Sparkles size={11} /> {rules.length} Rules
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
            Define behavioral boundaries, instructions, and guardrails for your AI agents. Click any rule to view full directives.
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
                <span>Syncing Rules...</span>
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
                <span>Sync System Rules</span>
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
            <span>New Rule</span>
          </button>
        </div>
      </header>

      {error && (
        <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-status-error-bg)', color: 'var(--color-status-error-text)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)' }}>
          {error}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
          <input 
            type="text" 
            placeholder="Search rules by name, instructions, or condition..." 
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

        {/* Scope Filter Chips */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {['all', 'workspace', 'global', 'agent'].map((sc) => {
            const isActive = selectedScope === sc;
            return (
              <button
                key={sc}
                onClick={() => setSelectedScope(sc)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${isActive ? 'var(--color-brand-primary)' : 'var(--color-border-subtle)'}`,
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.12)' : 'var(--color-bg-surface)',
                  color: isActive ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all var(--duration-fast) ease'
                }}
              >
                {sc === 'all' ? 'All Scopes' : sc}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rules Table */}
      {isLoading && rules.length === 0 ? (
        <div className="glass-panel" style={{ padding: 'var(--space-12)', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div className="animate-spin" style={{ width: '28px', height: '28px', border: '3px solid var(--color-brand-primary)', borderTopColor: 'transparent', borderRadius: '50%' }} />
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
              Loading rules engine...
            </p>
          </div>
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="glass-panel animate-slide-up" style={{ padding: 'var(--space-12)', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-bg-surface-hover)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-3)' }}>
            <ShieldCheck size={24} />
          </div>
          <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            No rules found
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem', maxWidth: '400px', margin: '0 auto' }}>
            {searchQuery || selectedScope !== 'all' ? 'No rules match your filter criteria.' : 'No behavioral rules configured yet. Create a rule or sync system rules.'}
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
                <th style={{ padding: '12px 14px', width: '70px', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)' }}>Status</th>
                <th style={{ padding: '12px 16px', width: '200px', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)' }}>Rule Name</th>
                <th style={{ padding: '12px 14px', width: '130px', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)' }}>Scope</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)' }}>Instruction Directive</th>
                <th style={{ padding: '12px 14px', width: '80px', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', textAlign: 'center' }}>Priority</th>
                <th style={{ padding: '12px 16px', width: '100px', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.map((rule) => {
                const scopeBadge = getScopeBadge(rule.scope);
                return (
                  <tr 
                    key={rule.id} 
                    onClick={() => setSelectedRule(rule)}
                    style={{ 
                      borderBottom: '1px solid var(--color-border-subtle)', 
                      opacity: rule.enabled ? 1 : 0.65,
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
                    {/* Status Toggle */}
                    <td style={{ padding: '12px 14px' }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(rule.id, rule.enabled);
                        }}
                        title={rule.enabled ? 'Click to disable rule' : 'Click to enable rule'}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                      >
                        {rule.enabled ? 
                          <CheckCircle2 size={18} color="var(--color-status-success-text)" /> : 
                          <XCircle size={18} color="var(--color-text-tertiary)" />
                        }
                      </button>
                    </td>

                    {/* Rule Name */}
                    <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{rule.name}</span>
                      </div>
                    </td>

                    {/* Scope Badge */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: scopeBadge.bg, 
                        color: scopeBadge.color,
                        border: scopeBadge.border,
                        padding: '2px 7px', 
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        letterSpacing: '0.04em'
                      }}>
                        {scopeBadge.icon}
                        <span>{scopeBadge.label}</span>
                      </span>
                    </td>

                    {/* Instruction Preview (Clamped) */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ 
                        color: 'var(--color-text-secondary)', 
                        fontSize: '0.8125rem', 
                        lineHeight: 1.45,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordBreak: 'break-word'
                      }}>
                        {rule.instruction}
                      </div>
                    </td>

                    {/* Priority Badge */}
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: '0.6875rem', 
                        fontWeight: 600,
                        backgroundColor: 'var(--color-bg-surface-active)',
                        color: 'var(--color-text-secondary)',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        P{rule.priority}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 16px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <button 
                          onClick={() => openEditorModal(rule)}
                          title="Edit rule"
                          style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '4px', borderRadius: 'var(--radius-sm)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                        >
                          <Edit size={15} />
                        </button>
                        <button 
                          onClick={() => handleDelete(rule.id)}
                          title="Delete rule"
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Rule Detail Deep Inspection Modal */}
      <RuleDetailModal
        rule={selectedRule}
        onClose={() => setSelectedRule(null)}
        onEdit={(rule) => openEditorModal(rule)}
        onDelete={(id) => handleDelete(id)}
        onToggle={(id, cur) => toggleStatus(id, cur)}
      />

      {/* Create / Edit Rule Form Modal */}
      {isEditorModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
          padding: 'var(--space-4)',
          animation: 'fadeIn var(--duration-fast) ease'
        }}>
          <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '640px', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'var(--color-bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 'var(--space-4)' }}>
              <h2 className="text-xl" style={{ margin: 0, fontWeight: 700, color: 'var(--color-text-primary)' }}>{editingId ? 'Edit Rule' : 'Create New Rule'}</h2>
              <button onClick={closeEditorModal} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Rule Name *</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Always Use Strict Typing"
                    required
                    style={{ width: '100%', padding: 'var(--space-3)', background: 'var(--color-bg-surface-hover)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Priority (0-100)</label>
                  <input 
                    type="number" 
                    value={formData.priority} 
                    onChange={e => setFormData({...formData, priority: parseInt(e.target.value) || 100})}
                    required
                    min={0}
                    max={100}
                    style={{ width: '100%', padding: 'var(--space-3)', background: 'var(--color-bg-surface-hover)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Scope</label>
                  <select 
                    value={formData.scope} 
                    onChange={e => setFormData({...formData, scope: e.target.value})}
                    style={{ width: '100%', padding: 'var(--space-3)', background: 'var(--color-bg-surface-hover)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', outline: 'none' }}
                  >
                    <option value="workspace">Workspace Specific</option>
                    <option value="global">Global (All Repos & Agents)</option>
                    <option value="agent">Agent Specific</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Target Specifier</label>
                  <input 
                    type="text" 
                    value={formData.target} 
                    onChange={e => setFormData({...formData, target: e.target.value})}
                    placeholder="*"
                    required
                    style={{ width: '100%', padding: 'var(--space-3)', background: 'var(--color-bg-surface-hover)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Activation Condition (Optional)</label>
                <input 
                  type="text" 
                  value={formData.condition} 
                  onChange={e => setFormData({...formData, condition: e.target.value})}
                  placeholder="e.g. When editing TypeScript components (*.tsx)"
                  style={{ width: '100%', padding: 'var(--space-3)', background: 'var(--color-bg-surface-hover)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Instruction Directive *</label>
                <textarea 
                  value={formData.instruction} 
                  onChange={e => setFormData({...formData, instruction: e.target.value})}
                  placeholder="The exact architectural rules, constraints, and behavior you want to enforce..."
                  rows={5}
                  required
                  style={{ width: '100%', padding: 'var(--space-3)', background: 'var(--color-bg-surface-hover)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <input 
                  type="checkbox" 
                  id="enabledCheckbox"
                  checked={formData.enabled} 
                  onChange={e => setFormData({...formData, enabled: e.target.checked})}
                />
                <label htmlFor="enabledCheckbox" style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>Rule is active and enforced</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-3)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-4)' }}>
                <button type="button" onClick={closeEditorModal} className="btn-secondary" style={{ padding: '7px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '7px 18px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
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
