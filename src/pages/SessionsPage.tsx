import { useEffect, useState } from 'react';
import { useSessionsStore } from '../stores/useSessionsStore';
import { SessionsFilterBar } from '../components/sessions/SessionsFilterBar';
import { SessionsTable } from '../components/sessions/SessionsTable';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

export default function SessionsPage() {
  const { fetchSessions, syncSessions, isLoading } = useSessionsStore();
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSync = async () => {
    const res = await syncSessions();
    if (res.success) {
      setSyncMessage(`Synced ${res.syncedCount} real session transcripts!`);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '1280px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="text-2xl" style={{ margin: 0 }}>AI Usage Tracker</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Browse, filter, and analyze all captured AI sessions with real token & cost figures.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {syncMessage && (
            <div className="animate-slide-up" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', color: 'var(--color-status-success-text)', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <CheckCircle2 size={14} />
              <span>{syncMessage}</span>
            </div>
          )}
          <button 
            onClick={handleSync}
            disabled={isLoading}
            className="btn-primary"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Syncing...' : 'Sync & Refresh'}
          </button>
        </div>
      </header>

      <SessionsFilterBar />
      <SessionsTable />
    </div>
  );
}
