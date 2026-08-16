import React, { useEffect } from 'react';
import { useMemoryStore } from '../stores/useMemoryStore';
import { MemoryStatsBanner } from '../components/memory/MemoryStatsBanner';
import { MemoryCard } from '../components/memory/MemoryCard';
import { MemoryEditorModal } from '../components/memory/MemoryEditorModal';
import { MemoryCatalogModal } from '../components/memory/MemoryCatalogModal';
import { MemoryContextSimulatorModal } from '../components/memory/MemoryContextSimulatorModal';
import { 
  Brain, 
  Search, 
  Plus, 
  Sparkles, 
  RotateCw, 
  Pin, 
  HelpCircle
} from 'lucide-react';

export const MemoryPage: React.FC = () => {
  const {
    memories,
    isLoading,
    isSyncing,
    searchQuery,
    selectedCategory,
    selectedScope,
    selectedPriority,
    showPinnedOnly,
    setSearchQuery,
    setSelectedCategory,
    setSelectedScope,
    setSelectedPriority,
    setShowPinnedOnly,
    fetchMemories,
    fetchStats,
    syncMemories,
    openEditor,
    openCatalog,
    openSimulator
  } = useMemoryStore();

  useEffect(() => {
    fetchMemories();
    fetchStats();
  }, [fetchMemories, fetchStats, searchQuery, selectedCategory, selectedScope, selectedPriority, showPinnedOnly]);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'gotchas', label: 'Gotchas & Safety' },
    { id: 'user-preference', label: 'User Preferences' },
    { id: 'workflow', label: 'Workflow & Decisions' },
    { id: 'api-conventions', label: 'API Conventions' },
    { id: 'learned-pattern', label: 'Learned Patterns' },
  ];

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Header */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: 'var(--space-6)',
          flexWrap: 'wrap',
          gap: 'var(--space-4)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 className="text-2xl" style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Brain size={26} color="var(--color-brand-primary)" />
              Agent Memory & Knowledge Bank
            </h1>
            <span
              style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                color: 'var(--color-brand-primary)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}
            >
              {memories.length} Directives
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Manage long-term knowledge, failure avoidance rules, architecture decisions, and context window budgets.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => syncMemories()}
            disabled={isSyncing}
            className="btn-secondary"
            title="Rescan memories from disk (.agents/memory/ and global knowledge)"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Disk'}</span>
          </button>

          <button
            onClick={openSimulator}
            className="btn-secondary"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              borderColor: 'rgba(59, 130, 246, 0.3)',
              color: 'var(--color-brand-primary)'
            }}
          >
            <Sparkles size={14} />
            <span>Context Simulator</span>
          </button>

          <button
            onClick={openCatalog}
            className="btn-secondary"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px',
              backgroundColor: 'rgba(236, 72, 153, 0.12)',
              borderColor: 'rgba(236, 72, 153, 0.3)',
              color: '#ec4899'
            }}
          >
            <Sparkles size={14} />
            <span>Curated Catalog</span>
          </button>

          <button
            onClick={() => openEditor()}
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} />
            <span>Add Directive</span>
          </button>
        </div>
      </div>

      {/* Memory Stats Banner */}
      <MemoryStatsBanner />

      {/* Search & Filter Toolbar */}
      <div 
        className="glass-panel"
        style={{
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-xl)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)'
        }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search 
              size={15} 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} 
            />
            <input
              type="text"
              placeholder="Search memories by title, content, or #tags..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-subtle)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--color-text-primary)',
                fontSize: '0.8125rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Scope Tab Pill Group */}
          <div style={{ display: 'flex', backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '2px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            {[
              { id: 'all', label: 'All Scopes' },
              { id: 'workspace', label: 'Workspace' },
              { id: 'global', label: 'Global' }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedScope(s.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  backgroundColor: selectedScope === s.id ? 'var(--color-bg-surface-active)' : 'transparent',
                  color: selectedScope === s.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  fontWeight: selectedScope === s.id ? 600 : 400,
                  transition: 'all 0.2s ease'
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              backgroundColor: '#161b22',
              color: 'var(--color-text-primary)',
              fontSize: '0.8125rem'
            }}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>

          {/* Pinned Only Toggle Button */}
          <button
            onClick={() => setShowPinnedOnly(!showPinnedOnly)}
            style={{
              padding: '7px 12px',
              borderRadius: 'var(--radius-md)',
              border: showPinnedOnly ? '1px solid rgba(236, 72, 153, 0.5)' : '1px solid var(--color-border-subtle)',
              backgroundColor: showPinnedOnly ? 'rgba(236, 72, 153, 0.15)' : 'transparent',
              color: showPinnedOnly ? '#ec4899' : 'var(--color-text-secondary)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: showPinnedOnly ? 600 : 400
            }}
          >
            <Pin size={13} style={{ transform: showPinnedOnly ? 'rotate(45deg)' : 'none' }} />
            <span>Pinned Only</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                border: selectedCategory === cat.id ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid var(--color-border-subtle)',
                backgroundColor: selectedCategory === cat.id ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                color: selectedCategory === cat.id ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: selectedCategory === cat.id ? 600 : 400,
                transition: 'all 0.2s ease'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Memories Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12) 0', color: 'var(--color-text-secondary)' }}>
          <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '8px' }}>
            <RotateCw size={24} color="var(--color-brand-primary)" />
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>Loading Knowledge Bank directives...</p>
        </div>
      ) : memories.length === 0 ? (
        <div 
          className="glass-panel" 
          style={{ 
            padding: 'var(--space-12) var(--space-6)', 
            borderRadius: 'var(--radius-xl)', 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-3)'
          }}
        >
          <HelpCircle size={36} style={{ color: 'var(--color-text-tertiary)', opacity: 0.5 }} />
          <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--color-text-primary)' }}>
            No Memory Directives Found
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', maxWidth: '450px' }}>
            No memory directives match your active search filters. You can install curated templates or create your own.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: 'var(--space-2)' }}>
            <button onClick={openCatalog} className="btn-secondary" style={{ fontSize: '0.8125rem' }}>
              Browse Catalog
            </button>
            <button onClick={() => openEditor()} className="btn-primary" style={{ fontSize: '0.8125rem' }}>
              Create Directive
            </button>
          </div>
        </div>
      ) : (
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', 
            gap: 'var(--space-4)' 
          }}
        >
          {memories.map(mem => (
            <MemoryCard key={mem.id} memory={mem} />
          ))}
        </div>
      )}

      {/* Modals */}
      <MemoryEditorModal />
      <MemoryCatalogModal />
      <MemoryContextSimulatorModal />
    </div>
  );
};

export default MemoryPage;
