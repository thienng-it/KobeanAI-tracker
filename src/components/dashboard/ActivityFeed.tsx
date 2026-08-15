import React, { useState } from 'react';
import type { Session } from '../../stores/useDashboardStore';
import { TagBadge } from '../tags/TagBadge';
import { Clock, MessageSquare, Terminal, ChevronDown, ChevronUp, Zap, Sparkles, Flame, Tag as TagIcon } from 'lucide-react';

interface ActivityFeedProps {
  sessions: Session[];
}

// Helper to determine AI effort level (High / Medium / Low) from real telemetry
function getEffortLevel(session: Session) {
  const effort = (session as any).effortLevel || (session as any).metadata?.effortLevel || (session.model?.includes('3.7') ? 'High' : 'Medium');

  if (effort === 'High' || session.model?.includes('3.7')) {
    return {
      level: 'High',
      label: 'High Effort (1.00)',
      icon: <Flame size={12} />,
      bg: 'rgba(168, 85, 247, 0.12)',
      border: '1px solid rgba(168, 85, 247, 0.3)',
      color: '#a855f7'
    };
  } else if (effort === 'Medium') {
    return {
      level: 'Medium',
      label: 'Medium Effort (0.50)',
      icon: <Zap size={12} />,
      bg: 'rgba(245, 158, 11, 0.12)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      color: '#f59e0b'
    };
  } else {
    return {
      level: 'Low',
      label: 'Low Effort',
      icon: <Sparkles size={12} />,
      bg: 'rgba(16, 185, 129, 0.12)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      color: '#10b981'
    };
  }
}

// Helper to infer or provide default tags (e.g. [Fix], [Refactor], [Implement], [Unknown])
function getSessionTags(session: Session) {
  if (session.tags && session.tags.length > 0) {
    return session.tags;
  }

  const prompt = (session.summary || '').toLowerCase();
  let action = 'Unknown';
  let color = '#64748b';

  if (/\b(fix|bug|issue|error|fail|broken|crash|wrong|duplicate|duplicated|inverted)\b/.test(prompt)) {
    action = 'Fix';
    color = '#ef4444';
  } else if (/\b(refactor|clean|cleanup|dedup|reorganize|structure)\b/.test(prompt)) {
    action = 'Refactor';
    color = '#8b5cf6';
  } else if (/\b(implement|feature|add|create|build|support|new|enhance|toolbar|picker)\b/.test(prompt)) {
    action = 'Implement';
    color = '#10b981';
  } else if (/\b(ui|ux|theme|dark|light|style|color|css|layout|motion|button|contrast)\b/.test(prompt)) {
    action = 'UI/UX';
    color = '#3b82f6';
  } else if (/\b(doc|docs|documentation|guide|readme|help|explain|how to)\b/.test(prompt)) {
    action = 'Docs';
    color = '#06b6d4';
  } else if (/\b(test|validate|verify|check|audit|benchmark|correct|static)\b/.test(prompt)) {
    action = 'Validate';
    color = '#f59e0b';
  } else if (/\b(config|rule|skill|agent|model|token|price|env|key|codegraph)\b/.test(prompt)) {
    action = 'Config';
    color = '#ec4899';
  }

  return [
    {
      id: `derived-${action.toLowerCase()}`,
      raw: `[${action}]`,
      prefix: 'intent',
      identifier: action.toLowerCase(),
      action,
      color
    }
  ];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ sessions }) => {
  const [visibleCount, setVisibleCount] = useState(5);

  if (!sessions || sessions.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: 'var(--space-8)', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>No recent sessions found.</p>
      </div>
    );
  }

  const displayedSessions = sessions.slice(0, visibleCount);
  const hasMore = visibleCount < sessions.length;
  const isExpanded = visibleCount > 5;

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 5, sessions.length));
  };

  const handleShowLess = () => {
    setVisibleCount(5);
  };

  return (
    <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
      <div style={{ 
        padding: 'var(--space-4) var(--space-6)', 
        borderBottom: '1px solid var(--color-border-subtle)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: 'var(--color-bg-surface)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <h3 className="text-lg" style={{ margin: 0, letterSpacing: '-0.01em', fontWeight: 600 }}>Recent Activity</h3>
          <span style={{ 
            fontSize: '0.75rem', 
            padding: '2px 8px', 
            borderRadius: 'var(--radius-full)', 
            backgroundColor: 'var(--color-bg-surface-hover)', 
            color: 'var(--color-text-secondary)',
            fontWeight: 500
          }}>
            Showing {displayedSessions.length} of {sessions.length}
          </span>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {displayedSessions.map((session, index) => {
          const effort = getEffortLevel(session);
          const tags = getSessionTags(session);

          return (
            <div 
              key={session.id} 
              className="animate-slide-up"
              style={{ 
                padding: 'var(--space-4) var(--space-6)',
                borderBottom: index < displayedSessions.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                transition: 'background-color var(--duration-fast) ease, transform var(--duration-normal) var(--ease-spring-smooth)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)';
                e.currentTarget.style.transform = 'translateX(3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              {/* Header: Agent + Model + Effort Badge + Time */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ 
                    width: '32px', height: '32px', 
                    borderRadius: 'var(--radius-md)', 
                    backgroundColor: 'var(--color-bg-surface-active)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--color-border-subtle)'
                  }}>
                    <Terminal size={15} color="var(--color-brand-primary)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{session.agentName}</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>{session.model}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  {/* Real Effort Level Badge */}
                  <div 
                    title={`AI reasoning & thinking configuration: ${effort.label}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: effort.bg,
                      border: effort.border,
                      color: effort.color,
                      fontSize: '0.6875rem',
                      fontWeight: 600
                    }}
                  >
                    {effort.icon}
                    <span>{effort.label}</span>
                  </div>

                  <div className="text-xs" style={{ color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    {new Date(session.startedAt).toLocaleString()}
                  </div>
                </div>
              </div>
              
              {/* Prompt Text with Intent Tags */}
              {session.summary && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                    <MessageSquare size={14} style={{ marginTop: '3px', flexShrink: 0, color: 'var(--color-brand-primary)' }} />
                    <span style={{ lineHeight: '1.45', color: 'var(--color-text-primary)' }}>{session.summary}</span>
                  </div>

                  {/* Intent Tags Display */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginLeft: '22px' }}>
                    <TagIcon size={12} style={{ color: 'var(--color-text-tertiary)' }} />
                    {tags.map(tag => (
                      <TagBadge key={tag.id} tag={tag} size="sm" />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Footer: Tokens & Cost Figures */}
              <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-1)', paddingTop: 'var(--space-2)', borderTop: '1px dashed var(--color-border-subtle)' }}>
                <div className="text-xs">
                  <span style={{ color: 'var(--color-text-tertiary)' }}>Tokens: </span>
                  <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                    {session.totalTokens?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="text-xs">
                  <span style={{ color: 'var(--color-text-tertiary)' }}>Cost: </span>
                  <span style={{ fontWeight: 600, color: 'var(--color-status-warning-text)', fontFamily: 'var(--font-mono)' }}>
                    ${session.estimatedCost?.toFixed(4) || '0.0000'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More / Show Less Pagination Toolbar */}
      {sessions.length > 5 && (
        <div style={{ 
          padding: 'var(--space-3) var(--space-6)', 
          borderTop: '1px solid var(--color-border-subtle)', 
          backgroundColor: 'var(--color-bg-surface)',
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--space-3)'
        }}>
          {hasMore && (
            <button
              onClick={handleLoadMore}
              className="interactive-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-surface-hover)',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-brand-primary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <ChevronDown size={14} />
              <span>Load More (+5 Sessions)</span>
            </button>
          )}

          {isExpanded && (
            <button
              onClick={handleShowLess}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-secondary)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <ChevronUp size={14} />
              <span>Show Less (5)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
