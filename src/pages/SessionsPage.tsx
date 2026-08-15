import { useEffect, useState } from 'react';
import { useSessionsStore } from '../stores/useSessionsStore';
import { SessionsFilterBar } from '../components/sessions/SessionsFilterBar';
import { SessionsTable } from '../components/sessions/SessionsTable';
import { RefreshCw, Zap, CheckCircle2 } from 'lucide-react';

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
            className="interactive-card"
            style={{ 
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 
              border: 'none', 
              padding: 'var(--space-2) var(--space-4)', 
              borderRadius: 'var(--radius-md)',
              color: '#ffffff',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontWeight: 600,
              fontSize: 'var(--text-xs)',
              boxShadow: '0 2px 10px rgba(59, 130, 246, 0.3)'
            }}
          >
            <Zap size={14} className={isLoading ? 'animate-spin' : ''} />
            Sync Real Logs
          </button>
          <button 
            onClick={() => fetchSessions()}
            disabled={isLoading}
            style={{ 
              background: 'transparent', 
              border: '1px solid var(--color-border-subtle)', 
              padding: 'var(--space-2) var(--space-3)', 
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-secondary)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: 'var(--text-xs)'
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </header>

      <SessionsFilterBar />
      <SessionsTable />
    </div>
  );
}
