import React from 'react';
import { useLocation } from 'react-router';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { DateRangeToolbar } from '../dashboard/DateRangeToolbar';
import { RefreshCw } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();
  const { dateRange, setDateRange, syncAllLatest, isSyncing, isLoading } = useDashboardStore();
  const isDashboard = location.pathname === '/' || location.pathname.startsWith('/dashboard');

  // Basic route to title mapping
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/sessions')) return 'Sessions';
    if (path.startsWith('/skills')) return 'Skills Registry';
    if (path.startsWith('/commands')) return 'Commands';
    if (path.startsWith('/rules')) return 'Rules Engine';
    if (path.startsWith('/settings/agents')) return 'Agents Configuration';
    if (path.startsWith('/docs')) return 'Documentation';
    if (path.startsWith('/setup')) return 'Setup Wizard';
    return 'KobeanAI Tracker';
  };

  return (
    <header style={{ 
      height: '73px',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '0 var(--space-8)', 
      borderBottom: '1px solid var(--color-border-subtle)',
      backgroundColor: 'var(--color-bg-glass)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      transition: 'background-color var(--duration-normal) ease, border-color var(--duration-normal) ease'
    }}>
      <h2 style={{ 
        margin: 0, 
        fontSize: '1.25rem', 
        fontWeight: 600, 
        letterSpacing: '-0.02em',
        animation: 'slideIn var(--duration-normal) var(--ease-spring-smooth)'
      }}>
        {getPageTitle()}
      </h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {isDashboard && (
          <>
            <DateRangeToolbar
              activeRange={dateRange}
              onChange={setDateRange}
              disabled={isLoading || isSyncing}
            />
            <button
              onClick={() => syncAllLatest()}
              disabled={isSyncing || isLoading}
              title="Sync latest session logs and refresh"
              className="interactive-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                cursor: (isSyncing || isLoading) ? 'not-allowed' : 'pointer'
              }}
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
            </button>
          </>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-status-success-text)',
          fontWeight: 500
        }}>
          <div className="live-dot" />
          <span>Telemetry Active</span>
        </div>
      </div>
    </header>
  );
};
