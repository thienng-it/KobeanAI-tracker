import { useSessionsStore } from '../../stores/useSessionsStore';
import { useDashboardStore, WorkspaceOption } from '../../stores/useDashboardStore';
import { CustomSelect, CustomSelectOption } from '../common/CustomSelect';
import { Filter, X, Search, Calendar, Cpu, Tag as TagIcon, RotateCcw, FolderGit2 } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

export const SessionsFilterBar = () => {
  const { filters, setFilters, resetFilters, meta } = useSessionsStore();
  
  // Local state for debouncing search input
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Re-using dashboard store to get the list of available tags, models, and workspaces
  const { recentTags, availableModels, workspacesList, fetchDashboardData } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (filters.search !== (searchTerm.trim() || null)) {
        setFilters({ search: searchTerm.trim() || null });
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [searchTerm, filters.search, setFilters]);

  // Sync back local state if filters are reset externally
  useEffect(() => {
    if (filters.search === null && searchTerm !== '') {
      setSearchTerm('');
    }
  }, [filters.search]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.agentId) count++;
    if (filters.workspaceId) count++;
    if (filters.tagId) count++;
    if (filters.model) count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.search) count++;
    return count;
  }, [filters]);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }, []);

  const selectedWorkspaceName = useMemo(() => {
    if (!filters.workspaceId) return null;
    const found = workspacesList.find((w: WorkspaceOption) => w.id === filters.workspaceId);
    return found ? found.name : filters.workspaceId;
  }, [filters.workspaceId, workspacesList]);

  const selectedModelName = useMemo(() => {
    if (!filters.model) return null;
    const found = availableModels.find(m => m.id === filters.model);
    return found ? found.name : filters.model;
  }, [filters.model, availableModels]);

  const selectedTagName = useMemo(() => {
    if (!filters.tagId) return null;
    const found = recentTags.find(t => t.id === filters.tagId);
    return found ? found.raw : filters.tagId;
  }, [filters.tagId, recentTags]);

  const selectedDateLabel = useMemo(() => {
    switch (filters.dateRange) {
      case '1d':
      case 'today':
        return `Today (${todayFormatted})`;
      case '7d':
        return 'Past 7 Days';
      case '30d':
        return 'Past 30 Days';
      case '90d':
        return 'Past 90 Days';
      case '180d':
        return 'Past 180 Days';
      case '365d':
        return 'Past 1 Year';
      case 'all':
      default:
        return null;
    }
  }, [filters.dateRange, todayFormatted]);

  // Transform workspace options
  const workspaceOptions: CustomSelectOption[] = useMemo(() => [
    { value: '', label: 'All Repositories', count: workspacesList.reduce((acc, w) => acc + w.sessionCount, 0) },
    ...workspacesList.map((w: WorkspaceOption) => ({
      value: w.id,
      label: w.name,
      sublabel: w.path,
      count: w.sessionCount,
      icon: <FolderGit2 size={13} color="var(--color-brand-primary)" />
    }))
  ], [workspacesList]);

  // Transform model options
  const modelOptions: CustomSelectOption[] = useMemo(() => [
    { value: '', label: 'All Models', count: availableModels.reduce((acc, m) => acc + m.sessionCount, 0) },
    ...availableModels.map(m => ({
      value: m.id,
      label: m.name,
      sublabel: m.provider,
      count: m.sessionCount,
      icon: <Cpu size={13} color="var(--color-brand-primary)" />
    }))
  ], [availableModels]);

  // Transform date range options
  const dateOptions: CustomSelectOption[] = useMemo(() => [
    { value: 'all', label: 'All Time' },
    { value: '1d', label: `Today (${todayFormatted})` },
    { value: '7d', label: 'Past 7 Days' },
    { value: '30d', label: 'Past 30 Days' },
    { value: '90d', label: 'Past 90 Days' },
    { value: '180d', label: 'Past 180 Days' },
    { value: '365d', label: 'Past 1 Year' },
  ], [todayFormatted]);

  // Transform tag options
  const tagOptions: CustomSelectOption[] = useMemo(() => [
    { value: '', label: 'All Tags' },
    ...recentTags.map(t => ({
      value: t.id,
      label: t.raw,
      count: t.usageCount,
      color: t.color || undefined,
      icon: <TagIcon size={13} color={t.color || 'var(--color-brand-primary)'} />
    }))
  ], [recentTags]);

  return (
    <div style={{ marginBottom: 'var(--space-6)', position: 'relative', zIndex: 30 }}>
      <div 
        className="glass-panel animate-slide-up" 
        style={{ 
          padding: 'var(--space-3) var(--space-4)', 
          borderRadius: 'var(--radius-xl)', 
          display: 'flex', 
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'wrap',
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative',
          zIndex: 30
        }}
      >
        {/* Filter Title & Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', paddingRight: '4px' }}>
          <Filter size={15} color="var(--color-brand-primary)" />
          <span style={{ fontWeight: 600, fontSize: '0.8125rem', letterSpacing: '-0.01em' }}>Filters</span>
          {activeFilterCount > 0 && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--color-brand-primary)',
              color: '#ffffff',
              fontSize: '0.6875rem',
              fontWeight: 700,
              width: '18px',
              height: '18px',
              borderRadius: 'var(--radius-full)'
            }}>
              {activeFilterCount}
            </span>
          )}
        </div>
        
        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-border-subtle)' }} />

        {/* Search Input Box */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: '1 1 200px', minWidth: '180px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
          <input 
            type="text" 
            placeholder="Search prompt, model, summary..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'var(--color-bg-surface-hover)',
              border: '1px solid var(--color-border-default)',
              color: 'var(--color-text-primary)',
              padding: '6px 28px 6px 30px',
              borderRadius: 'var(--radius-lg)',
              fontSize: '0.75rem',
              outline: 'none',
              transition: 'border-color var(--duration-fast) ease, box-shadow var(--duration-fast) ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-brand-primary)';
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.2)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-default)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '8px',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-tertiary)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Custom Glassmorphic Selects */}
        <CustomSelect
          icon={<FolderGit2 size={13} color="var(--color-brand-primary)" />}
          value={filters.workspaceId || ''}
          options={workspaceOptions}
          onChange={(val) => setFilters({ workspaceId: val || null })}
          placeholder="All Repositories"
          minWidth="150px"
          align="left"
        />

        <CustomSelect
          icon={<Cpu size={13} color="var(--color-brand-primary)" />}
          value={filters.model || ''}
          options={modelOptions}
          onChange={(val) => setFilters({ model: val || null })}
          placeholder="All Models"
          minWidth="140px"
          align="left"
        />

        <CustomSelect
          icon={<Calendar size={13} color="var(--color-brand-primary)" />}
          value={filters.dateRange || 'all'}
          options={dateOptions}
          onChange={(val) => setFilters({ dateRange: val || 'all' })}
          placeholder="All Time"
          minWidth="125px"
          align="right"
        />

        <CustomSelect
          icon={<TagIcon size={13} color="var(--color-brand-primary)" />}
          value={filters.tagId || ''}
          options={tagOptions}
          onChange={(val) => setFilters({ tagId: val || null })}
          placeholder="All Tags"
          minWidth="120px"
          align="right"
        />

        {/* Reset All Filters Button */}
        {activeFilterCount > 0 && (
          <button 
            onClick={resetFilters}
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--color-status-error-text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '5px 10px',
              borderRadius: 'var(--radius-lg)',
              transition: 'all var(--duration-fast) ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <RotateCcw size={12} /> Reset Filters
          </button>
        )}
      </div>

      {/* Active Filter Chips Sub-bar */}
      {activeFilterCount > 0 && (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginTop: 'var(--space-2)', paddingLeft: '4px' }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
            Active Filters ({meta.total} matches):
          </span>

          {filters.search && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '2px 8px',
              fontSize: '0.75rem',
              color: 'var(--color-text-primary)'
            }}>
              Search: <strong style={{ color: 'var(--color-brand-primary)' }}>"{filters.search}"</strong>
              <button 
                onClick={() => setFilters({ search: null })} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 0, display: 'flex' }}
              >
                <X size={12} />
              </button>
            </span>
          )}

          {selectedWorkspaceName && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: 'var(--radius-full)',
              padding: '2px 8px',
              fontSize: '0.75rem',
              color: 'var(--color-brand-primary)'
            }}>
              Repo: <strong style={{ color: 'var(--color-brand-primary)' }}>{selectedWorkspaceName}</strong>
              <button 
                onClick={() => setFilters({ workspaceId: null })} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 0, display: 'flex' }}
              >
                <X size={12} />
              </button>
            </span>
          )}

          {selectedModelName && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '2px 8px',
              fontSize: '0.75rem',
              color: 'var(--color-text-primary)'
            }}>
              Model: <strong style={{ color: 'var(--color-brand-primary)' }}>{selectedModelName}</strong>
              <button 
                onClick={() => setFilters({ model: null })} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 0, display: 'flex' }}
              >
                <X size={12} />
              </button>
            </span>
          )}

          {selectedDateLabel && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '2px 8px',
              fontSize: '0.75rem',
              color: 'var(--color-text-primary)'
            }}>
              Date: <strong style={{ color: 'var(--color-brand-primary)' }}>{selectedDateLabel}</strong>
              <button 
                onClick={() => setFilters({ dateRange: 'all' })} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 0, display: 'flex' }}
              >
                <X size={12} />
              </button>
            </span>
          )}

          {selectedTagName && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '2px 8px',
              fontSize: '0.75rem',
              color: 'var(--color-text-primary)'
            }}>
              Tag: <strong style={{ color: 'var(--color-brand-primary)' }}>{selectedTagName}</strong>
              <button 
                onClick={() => setFilters({ tagId: null })} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 0, display: 'flex' }}
              >
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
