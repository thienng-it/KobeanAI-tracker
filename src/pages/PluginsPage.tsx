import { useEffect, useState, useMemo } from 'react';
import { usePluginStore, Plugin } from '../stores/usePluginStore';
import { PluginCard } from '../components/plugins/PluginCard';
import { PluginInspectorModal } from '../components/plugins/PluginInspectorModal';
import { PluginCatalogModal } from '../components/plugins/PluginCatalogModal';
import { PluginCreatorModal } from '../components/plugins/PluginCreatorModal';
import { 
  Puzzle, 
  Plus, 
  RefreshCw, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  BrainCircuit
} from 'lucide-react';

export default function PluginsPage() {
  const {
    plugins,
    fetchPlugins,
    syncPlugins,
    deletePlugin,
    isLoading,
    isSyncing,
    searchQuery,
    setSearchQuery,
    selectedScope,
    setSelectedScope,
    selectedStatus,
    setSelectedStatus
  } = usePluginStore();

  const [inspectingPlugin, setInspectingPlugin] = useState<Plugin | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncedCount, setSyncedCount] = useState<number | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);

  useEffect(() => {
    fetchPlugins();
  }, [fetchPlugins]);

  const handleSync = async () => {
    if (isLoading || isSyncing || syncStatus === 'syncing') return;
    setSyncStatus('syncing');
    const result = await syncPlugins();
    if (result.success) {
      const timeStr = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      setSyncedCount(result.pluginsCount ?? plugins.length);
      setSyncStatus('success');
      setLastSyncedTime(timeStr);
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3500);
    } else {
      setSyncStatus('error');
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3500);
    }
  };

  const workspaceCount = useMemo(() => {
    return plugins.filter(p => p.scope === 'workspace').length;
  }, [plugins]);

  const globalCount = useMemo(() => {
    return plugins.filter(p => p.scope === 'global').length;
  }, [plugins]);

  const totalBundledSkills = useMemo(() => {
    return plugins.reduce((acc, p) => acc + (p.skillsCount || 0), 0);
  }, [plugins]);

  const filteredPlugins = useMemo(() => {
    return plugins.filter(p => {
      // Search query filter
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.author && p.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.keywords && p.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())));

      // Scope filter
      const matchesScope = selectedScope === 'all' || p.scope === selectedScope;

      // Status filter
      const matchesStatus = 
        selectedStatus === 'all' ||
        (selectedStatus === 'active' && p.enabled) ||
        (selectedStatus === 'disabled' && !p.enabled);

      return matchesSearch && matchesScope && matchesStatus;
    });
  }, [plugins, searchQuery, selectedScope, selectedStatus]);

  const isSyncActive = isLoading || isSyncing || syncStatus === 'syncing';
  const isSyncSuccess = syncStatus === 'success';
  const isSyncError = syncStatus === 'error';

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Page Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 'var(--space-6)',
        gap: 'var(--space-4)',
        flexWrap: 'wrap'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h1 className="text-2xl" style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Plugins & Extensions</span>
            </h1>

            {/* Live Count Badges */}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              color: 'var(--color-brand-primary)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)'
            }}>
              <Puzzle size={11} /> {plugins.length} Plugins
            </span>

            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(139, 92, 246, 0.12)',
              color: '#c4b5fd',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)'
            }}>
              {workspaceCount} Workspace
            </span>

            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              color: 'var(--color-brand-primary)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)'
            }}>
              {globalCount} Global
            </span>

            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--color-status-success-text)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)'
            }}>
              <BrainCircuit size={11} /> {totalBundledSkills} Bundled Skills
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

          <p className="text-sm" style={{ color: 'var(--color-text-secondary)', margin: 'var(--space-1) 0 0 0' }}>
            Modular bundles of skills, subagents, MCP tools, and lifecycle hooks across workspace and global roots.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', flexShrink: 0 }}>
          {/* Sync Button */}
          <button 
            onClick={handleSync}
            disabled={isSyncActive}
            className="btn-secondary"
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '7px 14px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              height: '34px',
              borderRadius: 'var(--radius-md)',
              cursor: isSyncActive ? 'not-allowed' : 'pointer',
              transition: 'all var(--duration-fast) var(--ease-spring-smooth)',
              backgroundColor: isSyncSuccess ? 'rgba(16, 185, 129, 0.15)' : isSyncError ? 'rgba(239, 68, 68, 0.15)' : undefined,
              borderColor: isSyncSuccess ? 'rgba(16, 185, 129, 0.35)' : isSyncError ? 'rgba(239, 68, 68, 0.35)' : undefined,
              color: isSyncSuccess ? 'var(--color-status-success-text)' : isSyncError ? 'var(--color-status-error-text)' : undefined
            }}
          >
            {isSyncActive ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Syncing...</span>
              </>
            ) : isSyncSuccess ? (
              <>
                <CheckCircle2 size={13} color="var(--color-status-success-text)" />
                <span>Synced {syncedCount ? `(${syncedCount})` : 'Done'}</span>
              </>
            ) : isSyncError ? (
              <>
                <AlertCircle size={13} color="var(--color-status-error-text)" />
                <span>Sync Failed</span>
              </>
            ) : (
              <>
                <RefreshCw size={13} />
                <span>Sync Plugins</span>
              </>
            )}
          </button>

          {/* 1-Click Catalog Button */}
          <button
            onClick={() => setIsCatalogOpen(true)}
            className="btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              height: '34px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <Sparkles size={14} color="var(--color-status-warning-text)" />
            <span>1-Click Catalog</span>
          </button>

          {/* Scaffold Custom Plugin Button */}
          <button
            onClick={() => setIsCreatorOpen(true)}
            style={{
              background: 'var(--color-brand-primary)',
              border: 'none',
              padding: '7px 16px',
              borderRadius: 'var(--radius-md)',
              color: '#fff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              height: '34px',
              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.25)',
              transition: 'background var(--duration-fast) ease'
            }}
          >
            <Plus size={15} />
            <span>Scaffold Plugin</span>
          </button>
        </div>
      </header>

      {/* Filter & Search Toolbar Cluster */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-6)',
        backgroundColor: 'var(--color-bg-surface)',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border-subtle)'
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-bg-surface-hover)',
          border: '1px solid var(--color-border-subtle)'
        }}>
          <Search size={16} style={{ color: 'var(--color-text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search plugins by name, author, keywords, or bundled skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--color-text-primary)',
              fontSize: '0.875rem',
              width: '100%'
            }}
          />
        </div>

        {/* Filter Pills Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-3)'
        }}>
          {/* Scope Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginRight: '2px' }}>Scope:</span>
            {[
              { id: 'all', label: 'All Scopes' },
              { id: 'workspace', label: 'Workspace (.agents/plugins)' },
              { id: 'global', label: 'Global (~/.gemini/config/plugins)' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedScope(tab.id as any)}
                style={{
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: selectedScope === tab.id ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border-subtle)',
                  backgroundColor: selectedScope === tab.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: selectedScope === tab.id ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all var(--duration-fast) ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Status:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active' },
              { id: 'disabled', label: 'Disabled' },
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id as any)}
                style={{
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: selectedStatus === st.id ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border-subtle)',
                  backgroundColor: selectedStatus === st.id ? 'var(--color-bg-surface-active)' : 'transparent',
                  color: selectedStatus === st.id ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)',
                  fontSize: '0.6875rem',
                  cursor: 'pointer'
                }}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plugins Grid */}
      {filteredPlugins.length === 0 ? (
        <div className="glass-panel" style={{
          padding: 'var(--space-12)',
          textAlign: 'center',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-3)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-bg-surface-active)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-tertiary)'
          }}>
            <Puzzle size={24} />
          </div>

          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
            No Plugins found
          </h3>

          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)', maxWidth: '400px' }}>
            {searchQuery ? `No plugins matched "${searchQuery}". Try clearing your search or filters.` : 'Discover curated multi-agent capabilities or scaffold custom plugins for your workspace.'}
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            <button
              onClick={() => setIsCatalogOpen(true)}
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-brand-primary)',
                color: '#fff',
                border: 'none',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={14} />
              <span>Explore 1-Click Catalog</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 'var(--space-4)'
        }}>
          {filteredPlugins.map(plugin => (
            <PluginCard
              key={plugin.id}
              plugin={plugin}
              onDelete={deletePlugin}
              onInspect={(p) => setInspectingPlugin(p)}
            />
          ))}
        </div>
      )}

      {/* Inspector Modal */}
      {inspectingPlugin && (
        <PluginInspectorModal
          plugin={inspectingPlugin}
          onClose={() => setInspectingPlugin(null)}
        />
      )}

      {/* 1-Click Catalog Modal */}
      {isCatalogOpen && (
        <PluginCatalogModal
          onClose={() => setIsCatalogOpen(false)}
          onInstalled={() => {
            fetchPlugins();
          }}
        />
      )}

      {/* Creator Modal */}
      {isCreatorOpen && (
        <PluginCreatorModal
          onClose={() => setIsCreatorOpen(false)}
          onCreated={() => {
            fetchPlugins();
          }}
        />
      )}
    </div>
  );
}
