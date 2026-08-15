import React from 'react';
import type { Session } from '../../stores/useDashboardStore';
import { TagBadge } from '../tags/TagBadge';
import { Clock, MessageSquare, Terminal } from 'lucide-react';

interface ActivityFeedProps {
  sessions: Session[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ sessions }) => {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: 'var(--space-8)', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>No recent sessions found.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
      <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="text-lg" style={{ margin: 0, letterSpacing: '-0.01em' }}>Recent Activity</h3>
        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{sessions.length} sessions</span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {sessions.map((session, index) => (
          <div 
            key={session.id} 
            style={{ 
              padding: 'var(--space-4) var(--space-6)',
              borderBottom: index < sessions.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              transition: 'background-color var(--duration-fast) ease, transform var(--duration-normal) var(--ease-spring-smooth)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ 
                  width: '34px', height: '34px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--color-bg-surface-active)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid var(--color-border-subtle)',
                  transition: 'transform var(--duration-fast) var(--ease-spring-snappy)'
                }}>
                  <Terminal size={16} color="var(--color-brand-primary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{session.agentName}</div>
                  <div className="text-xs" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>{session.model}</div>
                </div>
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} />
                {new Date(session.startedAt).toLocaleString()}
              </div>
            </div>
            
            {session.summary && (
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                <MessageSquare size={14} style={{ marginTop: '2px', flexShrink: 0, color: 'var(--color-brand-primary)' }} />
                <span style={{ lineHeight: '1.4' }}>{session.summary}</span>
              </div>
            )}
            
            {session.tags && session.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-1)' }}>
                {session.tags.map(tag => (
                  <TagBadge key={tag.id} tag={tag} size="sm" />
                ))}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-1)', paddingTop: 'var(--space-2)', borderTop: '1px dashed var(--color-border-subtle)' }}>
              <div className="text-xs">
                <span style={{ color: 'var(--color-text-tertiary)' }}>Tokens: </span>
                <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{session.totalTokens?.toLocaleString() || 0}</span>
              </div>
              <div className="text-xs">
                <span style={{ color: 'var(--color-text-tertiary)' }}>Cost: </span>
                <span style={{ fontWeight: 600, color: 'var(--color-status-warning-text)', fontFamily: 'var(--font-mono)' }}>
                  ${session.estimatedCost?.toFixed(4) || '0.0000'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
