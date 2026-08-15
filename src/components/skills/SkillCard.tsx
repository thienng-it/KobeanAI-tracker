import { type Skill } from '../../stores/useSkillsStore';
import { Pencil, Trash2, Command, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router';

export const SkillCard = ({ skill, onDelete }: { skill: Skill, onDelete: (id: string) => void }) => {
  const navigate = useNavigate();

  return (
    <div className="glass-panel" style={{ 
      padding: 'var(--space-6)', 
      borderRadius: 'var(--radius-lg)', 
      display: 'flex', 
      flexDirection: 'column',
      gap: 'var(--space-4)',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>{skill.name}</h3>
          <p style={{ margin: 'var(--space-1) 0 0 0', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-xs)' }}>v{skill.version} by {skill.author}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button 
            onClick={() => navigate(`/skills/${skill.id}/edit`)}
            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 'var(--space-1)' }}
          >
            <Pencil size={16} />
          </button>
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this skill?')) {
                onDelete(skill.id);
              }
            }}
            style={{ background: 'transparent', border: 'none', color: 'var(--color-status-error-text)', cursor: 'pointer', padding: 'var(--space-1)' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', flex: 1 }}>
        {skill.description || 'No description provided.'}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginTop: 'auto', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--color-brand-primary)', fontSize: 'var(--text-xs)', fontWeight: 500 }}>
          <Command size={14} /> {skill.triggerCommand || 'None'}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-xs)' }}>
          <Terminal size={14} /> {skill.agents?.length || 0} Agents
        </div>
      </div>
    </div>
  );
};
