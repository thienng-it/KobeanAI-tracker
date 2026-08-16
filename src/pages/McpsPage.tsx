import { useEffect, useState, useMemo } from 'react';
import { useMcpStore, McpServer } from '../stores/useMcpStore';
import { McpServerCard } from '../components/mcps/McpServerCard';
import { McpToolInspectorModal } from '../components/mcps/McpToolInspectorModal';
import { McpEditorModal } from '../components/mcps/McpEditorModal';
import { McpCatalogModal } from '../components/mcps/McpCatalogModal';
import { McpExportConfigModal } from '../components/mcps/McpExportConfigModal';
import { 
  Boxes, 
  Plus, 
  RefreshCw, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Share2, 
  Wrench
} from 'lucide-react';

export default function McpsPage() {
  const {
    servers,
    fetchServers,
    syncServers,
    deleteServer,
    isLoading,
    isSyncing,
    searchQuery,
    setSearchQuery,
    selectedScope,
    setSelectedScope,
    selectedTransport,
    setSelectedTransport,
    selectedStatus,
    setSelectedStatus
  } = useMcpStore();

  const [inspectingServer, setInspectingServer] = useState<McpServer | null>(null);
  const [inspectingToolName, setInspectingToolName] = useState<string | undefined>(undefined);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<McpServer | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncedCount, setSyncedCount] = useState<number | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  const handleSync = async () => {
    if (isLoading || isSyncing || syncStatus === 'syncing') return;
    setSyncStatus('syncing');
    const result = await syncServers();
    if (result.success) {
      const timeStr = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      setSyncedCount(result.serversCount ?? servers.length);
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

  const totalToolsCount = useMemo(() => {
    return servers.reduce((acc, s) => acc + (s.tools?.length || s.toolsCount || 0), 0);
  }, [servers]);

  const filteredServers = useMemo(() => {
    return servers.filter(s => {
      // Search query filter
      const matchesSearch = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.command && s.command.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.url && s.url.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.tools && s.tools.some(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())));

      // Scope filter
      const matchesScope = selectedScope === 'all' || s.scope === selectedScope;

      // Transport filter
      const matchesTransport = selectedTransport === 'all' || s.transport === selectedTransport;

      // Status filter
      const matchesStatus = 
        selectedStatus === 'all' ||
        (selectedStatus === 'active' && s.enabled && s.status === 'active') ||
        (selectedStatus === 'configured' && s.enabled && s.status === 'configured') ||
        (selectedStatus === 'disabled' && !s.enabled);

      return matchesSearch && matchesScope && matchesTransport && matchesStatus;
    });
  }, [servers, searchQuery, selectedScope, selectedTransport, selectedStatus]);

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
              <span>MCP Management</span>
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
              <Boxes size={11} /> {servers.length} Servers
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
              <Wrench size={11} /> {totalToolsCount} Tools
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
            Model Context Protocol tools, local stdio subprocesses, and streaming endpoints across Antigravity, Claude, and Cursor.
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
                <span>Sync Servers</span>
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

          {/* Export Config Button */}
          <button
            onClick={() => setIsExportOpen(true)}
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
            <Share2 size={14} />
            <span>Export Config</span>
          </button>

          {/* Add Custom MCP Button */}
          <button
            onClick={() => {
              setEditingServer(null);
              setIsEditorOpen(true);
            }}
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
            <span>Add MCP Server</span>
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
            placeholder="Search MCP servers, tools, commands, or parameters..."
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
              { id: 'workspace', label: 'Workspace' },
              { id: 'global', label: 'Global IDE' },
              { id: 'builtin', label: 'Built-in' },
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

          {/* Transport & Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Transport */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Transport:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'stdio', label: 'stdio' },
                { id: 'sse', label: 'sse' },
                { id: 'builtin', label: 'builtin' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTransport(t.id as any)}
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: selectedTransport === t.id ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border-subtle)',
                    backgroundColor: selectedTransport === t.id ? 'var(--color-bg-surface-active)' : 'transparent',
                    color: selectedTransport === t.id ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)',
                    fontSize: '0.6875rem',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Status */}
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
      </div>

      {/* MCP Server Cards Grid */}
      {filteredServers.length === 0 ? (
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
            <Boxes size={24} />
          </div>

          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
            No MCP Servers found
          </h3>

          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)', maxWidth: '400px' }}>
            {searchQuery ? `No servers matched "${searchQuery}". Try clearing your search or filters.` : 'Discover local IDE tools or install curated community MCP servers with 1-click.'}
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
          {filteredServers.map(server => (
            <McpServerCard
              key={server.id}
              server={server}
              onEdit={(s) => {
                setEditingServer(s);
                setIsEditorOpen(true);
              }}
              onDelete={deleteServer}
              onInspectTools={(s, toolName) => {
                setInspectingServer(s);
                setInspectingToolName(toolName);
              }}
            />
          ))}
        </div>
      )}

      {/* Tool Inspector Modal */}
      {inspectingServer && (
        <McpToolInspectorModal
          server={inspectingServer}
          initialToolName={inspectingToolName}
          onClose={() => {
            setInspectingServer(null);
            setInspectingToolName(undefined);
          }}
        />
      )}

      {/* Editor Modal (Add / Edit) */}
      {isEditorOpen && (
        <McpEditorModal
          server={editingServer}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingServer(null);
          }}
        />
      )}

      {/* Curated Catalog Modal */}
      {isCatalogOpen && (
        <McpCatalogModal
          onClose={() => setIsCatalogOpen(false)}
          onInstalled={() => {
            fetchServers();
          }}
        />
      )}

      {/* Export Config Modal */}
      {isExportOpen && (
        <McpExportConfigModal
          onClose={() => setIsExportOpen(false)}
        />
      )}
    </div>
  );
}
