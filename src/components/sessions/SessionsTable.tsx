import { useSessionsStore } from '../../stores/useSessionsStore';
import { TagBadge } from '../tags/TagBadge';
import { Terminal } from 'lucide-react';

export const SessionsTable = () => {
  const { sessions, isLoading } = useSessionsStore();

  if (isLoading && sessions.length === 0) {
    return <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading sessions...</div>;
  }

  if (sessions.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: 'var(--space-8)', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>No sessions found matching these filters.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel animate-slide-up" style={{ borderRadius: 'var(--radius-xl)', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
            <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
            <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agent</th>
            <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Summary</th>
            <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tags</th>
            <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tokens</th>
            <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cost</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(session => (
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
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginLeft: '32px', fontFamily: 'var(--font-mono)' }}>{session.model}</div>
              </td>
              <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {session.summary || '-'}
              </td>
              <td style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                  {session.tags?.map(tag => (
                    <TagBadge key={tag.id} tag={tag} size="sm" />
                  ))}
                </div>
              </td>
              <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                {session.totalTokens?.toLocaleString() || 0}
              </td>
              <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-status-warning-text)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                ${session.estimatedCost ? (session.estimatedCost < 0.01 ? session.estimatedCost.toFixed(5) : session.estimatedCost.toFixed(4)) : '0.0000'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
