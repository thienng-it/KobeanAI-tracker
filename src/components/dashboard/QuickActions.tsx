import { Play, Search, Settings, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';

export const QuickActions = () => {
  const navigate = useNavigate();
  
  const actions = [
    { icon: <Play size={20} />, label: 'New Session', color: 'var(--color-brand-primary)' },
    { icon: <Search size={20} />, label: 'Browse History', color: 'var(--color-agent-codex)', onClick: () => navigate('/sessions') },
    { icon: <Plus size={20} />, label: 'Create Skill', color: 'var(--color-agent-cursor)', onClick: () => navigate('/skills/new') },
    { icon: <Settings size={20} />, label: 'Workspace Settings', color: 'var(--color-text-tertiary)', onClick: () => navigate('/settings/agents') },
  ];

  return (
    <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
      <h3 className="text-lg" style={{ marginBottom: 'var(--space-4)', letterSpacing: '-0.01em' }}>Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)' }}>
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-bg-surface-hover)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              transition: 'transform var(--duration-fast) var(--ease-spring-snappy), border-color var(--duration-fast) ease, box-shadow var(--duration-fast) ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = action.color;
              e.currentTarget.style.boxShadow = `0 4px 12px ${action.color}22`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ color: action.color, transition: 'transform var(--duration-fast) var(--ease-spring-snappy)' }}>
              {action.icon}
            </div>
            <span className="text-sm" style={{ fontWeight: 500 }}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
