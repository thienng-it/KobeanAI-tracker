import { useEffect, useState } from 'react';
import { useSessionsStore } from '../stores/useSessionsStore';
import { SessionStatsStrip } from '../components/sessions/SessionStatsStrip';
import { SessionsFilterBar } from '../components/sessions/SessionsFilterBar';
import { SessionsTable } from '../components/sessions/SessionsTable';
import { RefreshCw, CheckCircle2, Sparkles, Clock } from 'lucide-react';

export default function SessionsPage() {
  const { fetchSessions, syncSessions, isSyncing } = useSessionsStore();
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncedCount, setSyncedCount] = useState<number | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSync = async () => {
    if (isSyncing) return;
    const res = await syncSessions();
    if (res.success) {
      const timeStr = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      setSyncedCount(res.syncedCount);
      setSyncSuccess(true);
      setLastSyncedTime(timeStr);
      setTimeout(() => {
        setSyncSuccess(false);
      }, 3500);
    }
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Stable Header Layout with Zero Layout Shift */}
      <header 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)'
        }}
      >
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h1 className="text-2xl" style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>
              AI Usage Tracker
            </h1>
            
            <span 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '4px',
                backgroundColor: 'rgba(37, 99, 235, 0.1)', 
                color: 'var(--color-brand-primary)',
                border: '1px solid rgba(37, 99, 235, 0.2)',
                fontSize: '0.6875rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                flexShrink: 0
              }}
            >
              <Sparkles size={11} /> Live Telemetry
            </span>

            {lastSyncedTime && (
              <span 
                className="animate-fade-in"
                style={{ 
                  fontSize: '0.6875rem', 
                  color: 'var(--color-text-tertiary)', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '3px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <Clock size={10} /> Synced {lastSyncedTime}
              </span>
            )}
          </div>

          <p className="text-sm" style={{ color: 'var(--color-text-secondary)', margin: 'var(--space-1) 0 0 0', maxWidth: '650px' }}>
            Browse, filter, and inspect detailed prompt transcripts with exact token calculations and cost figures.
          </p>
        </div>
        
        {/* Action Button Container with Fixed Anchor Position */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="btn-primary"
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '7px 16px',
              fontSize: '0.75rem',
              fontWeight: 600,
              minWidth: '142px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              transition: 'all var(--duration-fast) var(--ease-spring-smooth)',
              backgroundColor: syncSuccess ? 'rgba(16, 185, 129, 0.15)' : undefined,
              borderColor: syncSuccess ? 'rgba(16, 185, 129, 0.35)' : undefined,
              color: syncSuccess ? 'var(--color-status-success-text)' : undefined,
              boxShadow: syncSuccess ? '0 0 12px rgba(16, 185, 129, 0.2)' : undefined
            }}
          >
            {isSyncing ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Syncing Logs...</span>
              </>
            ) : syncSuccess ? (
              <>
                <CheckCircle2 size={13} color="var(--color-status-success-text)" />
                <span>Synced {syncedCount ? `(${syncedCount})` : 'Done'}</span>
              </>
            ) : (
              <>
                <RefreshCw size={13} />
                <span>Sync & Refresh</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* KPI Stats Strip */}
      <SessionStatsStrip />

      {/* Filters Toolbar */}
      <SessionsFilterBar />

      {/* Enhanced Sessions Data Table */}
      <SessionsTable />
    </div>
  );
}
