import { useSessionsStore } from '../../stores/useSessionsStore';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { Filter, X, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export const SessionsFilterBar = () => {
  const { filters, setFilters, resetFilters } = useSessionsStore();
  
  // Local state for debouncing search input
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Re-using dashboard store to get the list of available agents and tags for the dropdowns.
  const { recentTags, fetchDashboardData } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (filters.search !== searchTerm) {
        setFilters({ search: searchTerm || null });
      }
    }, 400); // 400ms delay

    return () => clearTimeout(handler);
  }, [searchTerm, filters.search, setFilters]);

  // Sync back local state if filters are reset externally
  useEffect(() => {
    if (filters.search === null && searchTerm !== '') {
      setSearchTerm('');
    }
  }, [filters.search]);

  const activeFilterCount = (filters.agentId ? 1 : 0) + (filters.tagId ? 1 : 0) + (filters.dateRange !== 'all' ? 1 : 0) + (filters.search ? 1 : 0);

  return (
    <div className="glass-panel" style={{ 
      padding: 'var(--space-4) var(--space-6)', 
      borderRadius: 'var(--radius-lg)', 
      display: 'flex', 
      gap: 'var(--space-4)',
      alignItems: 'center',
      marginBottom: 'var(--space-6)',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
        <Filter size={18} />
        <span style={{ fontWeight: 500 }}>Filters</span>
      </div>
      
      <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border-subtle)' }} />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.5rem', color: 'var(--color-text-tertiary)' }} />
        <input 
          type="text" 
          placeholder="Search sessions..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            background: 'var(--color-bg-surface-hover)',
            border: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-primary)',
            padding: '0.25rem 0.5rem 0.25rem 2rem',
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            minWidth: '200px'
          }}
        />
      </div>

      <select 
        value={filters.dateRange} 
        onChange={(e) => setFilters({ dateRange: e.target.value })}
        style={{
          background: 'var(--color-bg-surface-hover)',
          border: '1px solid var(--color-border-subtle)',
          color: 'var(--color-text-primary)',
          padding: '0.25rem 0.5rem',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <option value="all">All Time</option>
        <option value="7d">Last 7 Days</option>
        <option value="30d">Last 30 Days</option>
      </select>

      <select 
        value={filters.tagId || ''} 
        onChange={(e) => setFilters({ tagId: e.target.value || null })}
        style={{
          background: 'var(--color-bg-surface-hover)',
          border: '1px solid var(--color-border-subtle)',
          color: 'var(--color-text-primary)',
          padding: '0.25rem 0.5rem',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <option value="">All Tags</option>
        {recentTags.map(t => (
          <option key={t.id} value={t.id}>{t.raw}</option>
        ))}
      </select>

      {activeFilterCount > 0 && (
        <button 
          onClick={resetFilters}
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-status-error-text)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            fontSize: 'var(--text-sm)',
            fontWeight: 500
          }}
        >
          <X size={16} /> Clear Filters
        </button>
      )}
    </div>
  );
};
