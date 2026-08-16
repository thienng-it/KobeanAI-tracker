import React, { useState } from 'react';
import { useLocation } from 'react-router';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { DateRangeToolbar } from '../dashboard/DateRangeToolbar';
import { ModelFilterToolbar } from '../dashboard/ModelFilterToolbar';
import { WorkspaceSelector } from '../dashboard/WorkspaceSelector';
import { AutoSyncPicker } from '../dashboard/AutoSyncPicker';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();
  const { dateRange, setDateRange, syncAllLatest, isSyncing, isLoading } = useDashboardStore();
  const [syncSuccess, setSyncSuccess] = useState(false);
  const isDashboard = location.pathname === '/' || location.pathname.startsWith('/dashboard');

  const handleSync = async () => {
    if (isSyncing || isLoading) return;
    await syncAllLatest();
    setSyncSuccess(true);
    setTimeout(() => {
      setSyncSuccess(false);
    }, 3500);
  };

  // Basic route to title mapping
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/sessions')) return 'Sessions';
    if (path.startsWith('/skills')) return 'Skills Registry';
    if (path.startsWith('/mcps')) return 'MCP Servers & Tools';
    if (path.startsWith('/plugins')) return 'Plugins & Extensions';
    if (path.startsWith('/hooks')) return 'Lifecycle Hooks & Guards';
    if (path.startsWith('/memory')) return 'Agent Memory & Knowledge Bank';
    if (path.startsWith('/commands')) return 'Commands';
    if (path.startsWith('/rules')) return 'Rules Engine';
    if (path.startsWith('/settings/agents')) return 'Agents Configuration';
    if (path.startsWith('/docs')) return 'Documentation';
    if (path.startsWith('/wiki')) return 'Knowledge Base & Wiki';
    if (path.startsWith('/setup')) return 'Setup Wizard';
    return 'KobeanAI Tracker';
  };

  return (
    <header 
      className="app-header"
      style={{ 
        height: '56px',
        minHeight: '56px',
        maxHeight: '56px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 var(--space-6)', 
        borderBottom: '1px solid var(--color-border-subtle)',
        backgroundColor: 'var(--color-bg-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        flexWrap: 'nowrap',
        gap: 'var(--space-4)',
        transition: 'background-color var(--duration-normal) ease, border-color var(--duration-normal) ease'
      }}
    >
      {/* Route Title */}
      <div className="app-no-drag" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.0625rem', 
          fontWeight: 700, 
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap',
          color: 'var(--color-text-primary)'
        }}>
          {getPageTitle()}
        </h2>
      </div>

      {/* Global Toolbar Cluster (All on single row) */}
      <div 
        className="app-no-drag" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          flexWrap: 'nowrap', 
          justifyContent: 'flex-end',
          flexShrink: 0
        }}
      >
        {isDashboard && (
          <>
            {/* Primary Filter Group */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <WorkspaceSelector disabled={isLoading || isSyncing} />
              <ModelFilterToolbar disabled={isLoading || isSyncing} />
              <DateRangeToolbar
                activeRange={dateRange}
                onChange={setDateRange}
                disabled={isLoading || isSyncing}
              />
            </div>

            <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--color-border-subtle)', margin: '0 2px' }} />

            {/* Sync & Auto-Refresh Group */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={handleSync}
                disabled={isSyncing || isLoading}
                title="Sync latest session logs manually"
                className="btn-secondary"
                style={{
                  height: '32px',
                  padding: '0 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: (isSyncing || isLoading) ? 'not-allowed' : 'pointer',
                  transition: 'all var(--duration-fast) var(--ease-spring-smooth)',
                  backgroundColor: syncSuccess ? 'rgba(16, 185, 129, 0.15)' : undefined,
                  borderColor: syncSuccess ? 'rgba(16, 185, 129, 0.35)' : undefined,
                  color: syncSuccess ? 'var(--color-status-success-text)' : undefined,
                  boxShadow: syncSuccess ? '0 0 10px rgba(16, 185, 129, 0.2)' : undefined
                }}
              >
                {isSyncing ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : syncSuccess ? (
                  <>
                    <CheckCircle2 size={12} color="var(--color-status-success-text)" />
                    <span>Synced</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={12} />
                    <span>Sync</span>
                  </>
                )}
              </button>

              <AutoSyncPicker disabled={isLoading} />
            </div>

            <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--color-border-subtle)', margin: '0 2px' }} />
          </>
        )}

        {/* Live Telemetry Status Pill */}
        <div 
          title="Telemetry service actively monitoring local AI logs"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            height: '32px',
            padding: '0 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '0.6875rem',
            color: 'var(--color-status-success-text)',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            userSelect: 'none'
          }}
        >
          <div className="live-dot" />
          <span>Active</span>
        </div>
      </div>
    </header>
  );
};

