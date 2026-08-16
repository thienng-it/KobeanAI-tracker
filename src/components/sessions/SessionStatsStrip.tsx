import React from 'react';
import { useSessionsStore } from '../../stores/useSessionsStore';
import { Database, Coins, Activity, Zap } from 'lucide-react';

export const SessionStatsStrip: React.FC = () => {
  const { meta, isLoading } = useSessionsStore();

  const total = meta.total || 0;
  const totalTokens = meta.totalTokens || 0;
  const totalCost = meta.totalCost || 0;
  const avgTokens = total > 0 ? Math.round(totalTokens / total) : 0;
  const avgCost = total > 0 ? (totalCost / total).toFixed(4) : '0.0000';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)'
      }}
    >
      {/* Total Filtered Sessions */}
      <div
        className="glass-panel animate-slide-up"
        style={{
          padding: 'var(--space-4) var(--space-5)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          border: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface)'
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-brand-primary)',
            flexShrink: 0
          }}
        >
          <Activity size={20} />
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Sessions in View
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
            {isLoading ? '...' : total.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Total Tokens in View */}
      <div
        className="glass-panel animate-slide-up"
        style={{
          padding: 'var(--space-4) var(--space-5)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          border: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface)'
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6366f1',
            flexShrink: 0
          }}
        >
          <Database size={20} />
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Tokens in View
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
            {isLoading ? '...' : totalTokens.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Total Cost in View */}
      <div
        className="glass-panel animate-slide-up"
        style={{
          padding: 'var(--space-4) var(--space-5)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          border: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface)'
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-status-warning-text)',
            flexShrink: 0
          }}
        >
          <Coins size={20} />
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Expenditure in View
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-status-warning-text)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
            {isLoading ? '...' : `$${totalCost.toFixed(4)}`}
          </div>
        </div>
      </div>

      {/* Average Intensity */}
      <div
        className="glass-panel animate-slide-up"
        style={{
          padding: 'var(--space-4) var(--space-5)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          border: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface)'
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-status-success-text)',
            flexShrink: 0
          }}
        >
          <Zap size={20} />
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Avg / Session
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
            {isLoading ? '...' : `${avgTokens.toLocaleString()} tks • $${avgCost}`}
          </div>
        </div>
      </div>
    </div>
  );
};
