import { useEffect } from 'react';
import { useDashboardStore } from '../stores/useDashboardStore';
import { StatCard } from '../components/dashboard/StatCard';
import { ModelSpecsCard } from '../components/dashboard/ModelSpecsCard';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { QuickActions } from '../components/dashboard/QuickActions';
import { TrendsChart } from '../components/dashboard/TrendsChart';
import { IntentDistributionChart } from '../components/dashboard/IntentDistributionChart';
import { Activity, Coins, Database, RefreshCw, FolderGit2, X, Zap } from 'lucide-react';

export default function DashboardPage() {
  const {
    summary,
    recentSessions,
    trends,
    intentDistribution,
    selectedWorkspace,
    workspacesList,
    setSelectedWorkspace,
    isLoading,
    lastSyncedAt,
    error,
    fetchDashboardData
  } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const activeWorkspace = workspacesList.find(w => w.id === selectedWorkspace);

  if (isLoading && !summary) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <RefreshCw className="animate-spin" size={24} color="var(--color-text-secondary)" />
        <span style={{ marginLeft: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 'var(--space-6)', color: 'var(--color-status-error-text)' }}>
        Error loading dashboard: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header with Title on Left and Quick Actions in Right Corner */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)' 
      }}>
        <div>
          <h1 className="text-2xl" style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>Dashboard</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)', margin: 'var(--space-1) 0 0 0' }}>
            Real-time telemetry, session analytics & token expenditure.
            {lastSyncedAt && <span style={{ color: 'var(--color-text-tertiary)', marginLeft: 'var(--space-2)' }}>(Updated {lastSyncedAt})</span>}
          </p>
        </div>

        {/* Quick Actions in Right Corner */}
        <QuickActions />
      </header>

      {/* Active Workspace Focus Banner (when a single repository is selected from dropdown) */}
      {selectedWorkspace !== 'all' && activeWorkspace && (
        <div 
          className="glass-panel animate-slide-up"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            marginBottom: 'var(--space-6)',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-brand-primary)'
              }}
            >
              <FolderGit2 size={16} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                  {activeWorkspace.name}
                </span>
                <span 
                  style={{ 
                    fontSize: '0.6875rem', 
                    fontFamily: 'var(--font-mono)', 
                    color: 'var(--color-brand-primary)',
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  {activeWorkspace.sessionCount} turns • ${(activeWorkspace.totalCost || 0).toFixed(3)}
                </span>
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                {activeWorkspace.path}
              </span>
            </div>
          </div>

          <button
            onClick={() => setSelectedWorkspace('all')}
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all var(--duration-fast) ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            <X size={13} /> Clear Repo Filter
          </button>
        </div>
      )}

      {/* Model Specifications & Statistics Inspector (Renders when a specific model is filtered) */}
      <ModelSpecsCard />

      {/* Summary 4-Card High-Signal KPI Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)'
      }}>
        <StatCard 
          title="Total Activity" 
          value={summary?.totalSessions?.toLocaleString() || 0} 
          icon={<Activity size={20} />}
          badge={summary?.successRate !== undefined ? {
            text: `${summary.successRate}% success`,
            color: 'var(--color-status-success-text)',
            bg: 'var(--color-status-success-bg)'
          } : undefined}
          trend={summary?.sessionTrend ? { value: summary.sessionTrend.value, isPositive: summary.sessionTrend.isPositive } : undefined}
          description={summary?.sessionTrend?.label || 'vs previous period'}
        />
        <StatCard 
          title="Tokens Processed" 
          value={summary?.totalTokens?.toLocaleString() || 0} 
          icon={<Database size={20} />}
          badge={summary?.inputRatio !== undefined && summary?.totalTokens ? {
            text: `${summary.inputRatio}% In / ${summary.outputRatio}% Out`,
            color: 'var(--color-brand-primary)',
            bg: 'rgba(59, 130, 246, 0.12)'
          } : undefined}
          trend={summary?.tokenTrend ? { value: summary.tokenTrend.value, isPositive: summary.tokenTrend.isPositive } : undefined}
          description={summary?.tokenTrend?.label || 'vs previous period'}
        />
        <StatCard 
          title="Estimated Cost" 
          value={`$${summary?.totalCost?.toFixed(4) || '0.0000'}`} 
          icon={<Coins size={20} />}
          badge={summary?.avgCostPerSession ? {
            text: `~$${summary.avgCostPerSession.toFixed(4)}/turn`,
            color: 'var(--color-status-warning-text)',
            bg: 'var(--color-status-warning-bg)'
          } : undefined}
          trend={summary?.costTrend ? { value: summary.costTrend.value, isPositive: summary.costTrend.isPositive } : undefined}
          description={summary?.costTrend?.label || 'vs previous period'}
        />
        <StatCard 
          title="Turnaround Speed" 
          value={`${summary?.avgDurationSec !== undefined ? summary.avgDurationSec : '0.0'}s`} 
          icon={<Zap size={20} />}
          badge={summary?.avgToolCalls !== undefined ? {
            text: `${summary.avgToolCalls} tools/turn`,
            color: '#8b5cf6',
            bg: 'rgba(139, 92, 246, 0.12)'
          } : undefined}
          description="Avg turnaround latency"
        />
      </div>

      {/* Charts Section: Token Dynamics & Intent Breakdown */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', 
        gap: 'var(--space-6)',
        marginBottom: 'var(--space-6)'
      }}>
        <TrendsChart data={trends} />
        <IntentDistributionChart data={intentDistribution} />
      </div>

      {/* Recent Telemetry Stream (Full Width) */}
      <div style={{ width: '100%' }}>
        <ActivityFeed sessions={recentSessions} />
      </div>
    </div>
  );
}

