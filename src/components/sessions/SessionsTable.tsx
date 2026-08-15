import React from 'react';
import { useSessionsStore } from '../../stores/useSessionsStore';
import { TagBadge } from '../tags/TagBadge';
import { ModelBadge } from '../common/ModelBadge';
import { Terminal, Flame, Zap, Sparkles } from 'lucide-react';

// Helper to determine AI effort level from real telemetry
function getEffortLevel(session: any) {
  const effort = session.effortLevel || session.metadata?.effortLevel;
  const model = (session.model || '').toLowerCase();
  const isThinkingModel = model.includes('3.7') || model.includes('3.1') || model.includes('r1') || model.includes('o1') || model.includes('o3') || model.includes('thinking');

  if (effort === 'High' || (!effort && isThinkingModel)) {
    return {
      level: 'High (1.00)',
      icon: <Flame size={11} />,
      bg: 'rgba(168, 85, 247, 0.12)',
      border: '1px solid rgba(168, 85, 247, 0.25)',
      color: '#a855f7'
    };
  } else if (effort === 'Medium') {
    return {
      level: 'Med (0.50)',
      icon: <Zap size={11} />,
      bg: 'rgba(245, 158, 11, 0.12)',
      border: '1px solid rgba(245, 158, 11, 0.25)',
      color: '#f59e0b'
    };
  } else {
    return {
      level: 'Low',
      icon: <Sparkles size={11} />,
      bg: 'rgba(16, 185, 129, 0.12)',
      border: '1px solid rgba(16, 185, 129, 0.25)',
      color: '#10b981'
    };
  }
}

// Helper to infer or provide default tags
function getSessionTags(session: any) {
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

export const SessionsTable: React.FC = () => {
  const { sessions, isLoading, error } = useSessionsStore();

  if (isLoading) {
    return (
      <div className="glass-panel" style={{ padding: 'var(--space-8)', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading session traces...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: 'var(--space-8)', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
        <p style={{ color: 'var(--color-status-error-text)' }}>Failed to load sessions: {error}</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: 'var(--space-8)', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>No sessions found matching criteria.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-surface-hover)' }}>
            <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</th>
            <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agent & Model</th>
            <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prompt / Task Summary</th>
            <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tags</th>
            <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Effort / Tokens</th>
            <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cost</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(session => {
            const effort = getEffortLevel(session);
            const tags = getSessionTags(session);
            const sessionAny = session as any;

            return (
              <tr 
                key={session.id} 
                style={{ 
                  borderBottom: '1px solid var(--color-border-subtle)', 
                  transition: 'background-color var(--duration-fast) ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', whiteSpace: 'nowrap', color: 'var(--color-text-secondary)' }}>
                  {new Date(session.startedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td style={{ padding: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-bg-surface-active)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Terminal size={12} color="var(--color-brand-primary)" />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{session.agentName}</span>
                  </div>
                  <div style={{ marginTop: '4px', marginLeft: '32px' }}>
                    <ModelBadge 
                      model={session.model} 
                      modelName={sessionAny.modelName} 
                      provider={sessionAny.provider}
                      modelColor={sessionAny.modelColor}
                      modelBg={sessionAny.modelBg}
                      size="sm"
                    />
                  </div>
                </td>
                <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-text-primary)' }}>
                  {session.summary || '-'}
                </td>
                <td style={{ padding: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                    {tags.map((tag: any) => (
                      <TagBadge key={tag.id} tag={tag} size="sm" />
                    ))}
                  </div>
                </td>
                <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span 
                      title={`Effort level: ${effort.level}`}
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '3px',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: effort.bg,
                        border: effort.border,
                        color: effort.color,
                        fontSize: '0.6875rem',
                        fontWeight: 600
                      }}
                    >
                      {effort.icon}
                      {effort.level}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                      {session.totalTokens?.toLocaleString() || 0}
                    </span>
                  </div>
                </td>
                <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--color-status-warning-text)' }}>
                  ${session.estimatedCost?.toFixed(4) || '0.0000'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
