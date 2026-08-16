import React from 'react';
import { type Skill } from '../../stores/useSkillsStore';
import { Pencil, Trash2, Terminal, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { CommandBadge } from '../common/CommandBadge';

interface SkillCardProps {
  skill: Skill;
  onDelete: (id: string) => void;
  onSelect?: (skill: Skill) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({ skill, onDelete, onSelect }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(skill);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/skills/${skill.id}/edit`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${skill.name}"?`)) {
      onDelete(skill.id);
    }
  };

  const agentCount = skill.agents?.length || 0;

  return (
    <div 
      className="glass-panel interactive-card" 
      onClick={handleCardClick}
      style={{ 
        padding: 'var(--space-5)', 
        borderRadius: 'var(--radius-xl)', 
        display: 'flex', 
        flexDirection: 'column',
        gap: 'var(--space-3)',
        position: 'relative',
        cursor: 'pointer',
        minHeight: '185px',
        justifyContent: 'space-between',
        userSelect: 'none'
      }}
      title="Click to view full skill details and instructions"
    >
      {/* Card Top Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '1rem', 
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {skill.name}
              </h3>
              <span style={{
                fontSize: '0.6875rem',
                color: 'var(--color-text-tertiary)',
                backgroundColor: 'var(--color-bg-surface-active)',
                padding: '1px 5px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 500,
                flexShrink: 0
              }}>
                v{skill.version || '1.0'}
              </span>
            </div>
            
            <p style={{ 
              margin: '2px 0 0 0', 
              color: 'var(--color-text-tertiary)', 
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              by {skill.author || 'Workspace'}
            </p>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={handleEdit}
              title="Edit skill"
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--color-text-secondary)', 
                cursor: 'pointer', 
                padding: '4px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color var(--duration-fast) ease, background-color var(--duration-fast) ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-active)';
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              <Pencil size={15} />
            </button>
            <button 
              onClick={handleDelete}
              title="Delete skill"
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--color-status-error-text)', 
                cursor: 'pointer', 
                padding: '4px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.85,
                transition: 'opacity var(--duration-fast) ease, background-color var(--duration-fast) ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.opacity = '0.85';
              }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Shortened Description (Clamped to 2 lines) */}
        <div style={{ marginTop: 'var(--space-3)' }}>
          <p 
            style={{ 
              margin: 0, 
              color: 'var(--color-text-secondary)', 
              fontSize: '0.8125rem',
              lineHeight: '1.45',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word'
            }}
          >
            {skill.description || 'No description provided.'}
          </p>
        </div>
      </div>

      {/* Card Footer: Clean single-row pill badges */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingTop: 'var(--space-3)', 
        borderTop: '1px solid var(--color-border-subtle)',
        marginTop: 'var(--space-2)',
        gap: 'var(--space-2)',
        minWidth: 0
      }}>
        {/* Left Side: Command Badge + Agent Badge */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          minWidth: 0,
          flex: '1 1 auto',
          overflow: 'hidden'
        }}>
          <CommandBadge 
            command={skill.triggerCommand} 
            size="sm" 
            maxWidth="155px" 
          />
          
          <span 
            title={`${agentCount} Compatible Agent${agentCount === 1 ? '' : 's'}`}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '4px', 
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-bg-surface-active)',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-tertiary)', 
              fontSize: '0.6875rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Terminal size={11} style={{ opacity: 0.75 }} /> 
            <span>{agentCount}</span>
          </span>
        </div>

        {/* Right Side: Details Cue */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2px',
          color: 'var(--color-text-tertiary)',
          fontSize: '0.6875rem',
          fontWeight: 500,
          flexShrink: 0
        }}>
          <span>Details</span>
          <ArrowUpRight size={12} />
        </div>
      </div>
    </div>
  );
};
