import { useEffect } from 'react';
import { useSkillsStore } from '../stores/useSkillsStore';
import { SkillCard } from '../components/skills/SkillCard';
import { Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function SkillsPage() {
  const { skills, fetchSkills, searchQuery, setSearchQuery, deleteSkill, isLoading } = useSkillsStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const filteredSkills = skills.filter(skill => 
    skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (skill.description && skill.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '1280px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="text-2xl" style={{ margin: 0 }}>Skill Manager</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Create and manage reusable prompt instructions.</p>
        </div>
        <button 
          onClick={() => navigate('/skills/new')}
          style={{ 
            background: 'var(--color-brand-primary)', 
            border: 'none', 
            padding: 'var(--space-2) var(--space-4)', 
            borderRadius: 'var(--radius-md)',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontWeight: 500
          }}
        >
          <Plus size={16} /> Create Skill
        </button>
      </header>

      <div style={{ marginBottom: 'var(--space-6)', position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
        <input 
          type="text" 
          placeholder="Search skills..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            padding: 'var(--space-3) var(--space-3) var(--space-3) 40px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)'
          }}
        />
      </div>

      {isLoading && skills.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--space-8)' }}>Loading skills...</div>
      ) : filteredSkills.length === 0 ? (
        <div className="glass-panel" style={{ padding: 'var(--space-8)', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>No skills found. Create your first one!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
          {filteredSkills.map(skill => (
            <SkillCard key={skill.id} skill={skill} onDelete={deleteSkill} />
          ))}
        </div>
      )}
    </div>
  );
}
