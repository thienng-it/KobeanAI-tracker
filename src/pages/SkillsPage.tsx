import { useEffect, useState } from 'react';
import { useSkillsStore, type Skill } from '../stores/useSkillsStore';
import { SkillCard } from '../components/skills/SkillCard';
import { SkillDetailModal } from '../components/skills/SkillDetailModal';
import { Search, Plus, RefreshCw, Sparkles, BookOpen, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function SkillsPage() {
  const { skills, fetchSkills, syncSkills, searchQuery, setSearchQuery, deleteSkill, isLoading } = useSkillsStore();
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncedCount, setSyncedCount] = useState<number | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleSync = async () => {
    if (isLoading || syncStatus === 'syncing') return;
    setSyncStatus('syncing');
    const result = await syncSkills();
    if (result.success) {
      const timeStr = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      setSyncedCount(result.skillsCount ?? skills.length);
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

  const filteredSkills = skills.filter(skill => 
    skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (skill.description && skill.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (skill.triggerCommand && skill.triggerCommand.toLowerCase().includes(searchQuery.toLowerCase()))
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
            <h1 className="text-2xl" style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>
              Skill Manager
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
              <Sparkles size={11} /> {skills.length} Skills
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
            Browse prompt skills discovered across your workspace & plugins. Click any card to inspect full instructions.
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
                <span>Syncing Skills...</span>
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
                <span>Sync System Skills</span>
              </>
            )}
          </button>
          <button 
            onClick={() => navigate('/skills/new')}
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
            <span>Create Skill</span>
          </button>
        </div>
      </header>

      {/* Search Filter Input */}
      <div style={{ marginBottom: 'var(--space-6)', position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
        <input 
          type="text" 
          placeholder="Search skills by name, trigger command, or keywords..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            padding: '10px 14px 10px 40px',
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

      {/* Grid of Skill Cards */}
      {isLoading && skills.length === 0 ? (
        <div 
          className="glass-panel" 
          style={{ 
            padding: 'var(--space-12)', 
            textAlign: 'center', 
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)'
          }}
        >
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div className="animate-spin" style={{ width: '28px', height: '28px', border: '3px solid var(--color-brand-primary)', borderTopColor: 'transparent', borderRadius: '50%' }} />
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
              Loading skills registry...
            </p>
          </div>
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="glass-panel animate-slide-up" style={{ padding: 'var(--space-12)', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-bg-surface-hover)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-3)' }}>
            <BookOpen size={24} />
          </div>
          <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            No skills found
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem', maxWidth: '400px', margin: '0 auto' }}>
            {searchQuery ? `No skills match "${searchQuery}". Try clearing your search.` : 'No skills available yet. Create your first skill or sync system skills.'}
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: 'var(--space-5)' 
        }}>
          {filteredSkills.map(skill => (
            <SkillCard 
              key={skill.id} 
              skill={skill} 
              onDelete={deleteSkill}
              onSelect={(s) => setSelectedSkill(s)}
            />
          ))}
        </div>
      )}

      {/* Skill Detail Inspection Modal */}
      <SkillDetailModal
        skill={selectedSkill}
        onClose={() => setSelectedSkill(null)}
        onDelete={deleteSkill}
      />
    </div>
  );
}
