import { useEffect } from 'react';
import { useDashboardStore } from '../stores/useDashboardStore';
import { StatCard } from '../components/dashboard/StatCard';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { QuickActions } from '../components/dashboard/QuickActions';
import { TagBadge } from '../components/tags/TagBadge';
import { TrendsChart } from '../components/dashboard/TrendsChart';
import { AgentDistributionChart } from '../components/dashboard/AgentDistributionChart';
import { Activity, Coins, Database, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const { summary, recentSessions, recentTags, trends, agentDistribution, isLoading, error, fetchDashboardData } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="text-2xl" style={{ margin: 0 }}>Dashboard</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Overview of your AI agent activities.</p>
        </div>
        <button 
          onClick={() => fetchDashboardData()}
          style={{ 
            background: 'transparent', 
            border: '1px solid var(--color-border-subtle)', 
            padding: 'var(--space-2)', 
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)'
          }}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: 'var(--space-6)',
        marginBottom: 'var(--space-6)'
      }}>
        <StatCard 
          title="Total Sessions" 
          value={summary?.totalSessions?.toLocaleString() || 0} 
          icon={<Activity size={20} />}
          trend={{ value: 12, isPositive: true }}
          description="vs last week"
        />
        <StatCard 
          title="Tokens Processed" 
          value={summary?.totalTokens?.toLocaleString() || 0} 
          icon={<Database size={20} />}
          trend={{ value: 5, isPositive: true }}
          description="vs last week"
        />
        <StatCard 
          title="Estimated Cost" 
          value={`$${summary?.totalCost?.toFixed(4) || '0.0000'}`} 
          icon={<Coins size={20} />}
          trend={{ value: 2, isPositive: false }}
          description="vs last week"
        />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: 'var(--space-6)',
        marginBottom: 'var(--space-6)'
      }}>
        <TrendsChart data={trends} />
        <AgentDistributionChart data={agentDistribution} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <ActivityFeed sessions={recentSessions} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <QuickActions />
          
          <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }}>
            <h3 className="text-lg" style={{ marginBottom: 'var(--space-4)' }}>Frequent Tags</h3>
            {recentTags && recentTags.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {recentTags.map(tag => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>No tags used yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
