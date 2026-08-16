import React from 'react';
import { useNavigate } from 'react-router';
import { 
  Search, 
  Plus, 
  Settings, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'browse-sessions',
      icon: <Search size={14} />,
      label: 'Browse Sessions',
      tooltip: 'Browse recorded session history, tokens & traces',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
      onClick: () => navigate('/sessions')
    },
    {
      id: 'create-skill',
      icon: <Plus size={14} />,
      label: 'Create Skill',
      tooltip: 'Create or explore custom agent skills & tools',
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.12)',
      onClick: () => navigate('/skills')
    },
    {
      id: 'rules-engine',
      icon: <ShieldAlert size={14} />,
      label: 'Rules Engine',
      tooltip: 'View and manage system directives & workspace rules',
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.12)',
      onClick: () => navigate('/rules')
    },
    {
      id: 'agents-settings',
      icon: <Settings size={14} />,
      label: 'Workspace Settings',
      tooltip: 'Configure agent log paths, watchers & pricing models',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)',
      onClick: () => navigate('/settings/agents')
    }
  ];

  return (
    <div 
      className="glass-panel animate-slide-up"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 8px',
        borderRadius: 'var(--radius-xl)',
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        flexWrap: 'wrap'
      }}
    >
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.6875rem', 
        fontWeight: 600, 
        color: 'var(--color-text-tertiary)', 
        textTransform: 'uppercase', 
        letterSpacing: '0.05em',
        padding: '0 8px 0 4px',
        borderRight: '1px solid var(--color-border-subtle)',
        marginRight: '2px'
      }}>
        <Sparkles size={12} color="var(--color-brand-primary)" />
        <span>Quick Actions</span>
      </div>

      {actions.map(action => (
        <button
          key={action.id}
          onClick={action.onClick}
          title={action.tooltip}
          className="interactive-card"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-bg-surface-hover)',
            border: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-primary)',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all var(--duration-fast) var(--ease-spring-smooth)',
            userSelect: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = `${action.color}70`;
            e.currentTarget.style.backgroundColor = action.bg;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
            e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span style={{ color: action.color, display: 'flex', alignItems: 'center' }}>
            {action.icon}
          </span>
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
};
