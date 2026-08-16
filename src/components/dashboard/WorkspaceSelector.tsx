import React, { useState, useRef, useEffect } from 'react';
import { useDashboardStore, WorkspaceOption } from '../../stores/useDashboardStore';
import { FolderGit2, ChevronDown, Check, Search, Layers, X } from 'lucide-react';

interface WorkspaceSelectorProps {
  disabled?: boolean;
}

export const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({ disabled = false }) => {
  const { selectedWorkspace, workspacesList, setSelectedWorkspace, fetchWorkspaces } = useDashboardStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activeWorkspace = workspacesList.find(w => w.id === selectedWorkspace);

  const filteredWorkspaces = workspacesList.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAllSessions = workspacesList.reduce((acc, w) => acc + w.sessionCount, 0);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="glass-panel"
        title="Filter dashboard and statistics by Workspace or Repository"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          height: '32px',
          padding: '0 12px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: selectedWorkspace !== 'all' ? 'var(--color-bg-surface-active)' : 'var(--color-bg-surface)',
          border: selectedWorkspace !== 'all' 
            ? '1px solid rgba(59, 130, 246, 0.4)' 
            : '1px solid var(--color-border-subtle)',
          color: selectedWorkspace !== 'all' ? 'var(--color-brand-primary)' : 'var(--color-text-primary)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all var(--duration-fast) var(--ease-spring-smooth)',
          boxShadow: selectedWorkspace !== 'all' ? '0 1px 4px rgba(59, 130, 246, 0.15)' : 'none',
          userSelect: 'none'
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = selectedWorkspace !== 'all' ? 'var(--color-bg-surface-active)' : 'var(--color-bg-surface)';
            e.currentTarget.style.borderColor = selectedWorkspace !== 'all' ? 'rgba(59, 130, 246, 0.4)' : 'var(--color-border-subtle)';
          }
        }}
      >
        <FolderGit2 size={13} color="var(--color-brand-primary)" />
        
        <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedWorkspace === 'all' ? 'All Repositories' : (activeWorkspace?.name || 'Workspace')}
        </span>

        {selectedWorkspace !== 'all' && activeWorkspace && (
          <span 
            style={{ 
              fontSize: '0.625rem',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: 'var(--color-brand-primary)',
              padding: '1px 5px',
              borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700
            }}
          >
            ${activeWorkspace.totalCost.toFixed(2)}
          </span>
        )}

        <ChevronDown 
          size={12} 
          style={{ 
            opacity: 0.7, 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform var(--duration-fast) ease'
          }} 
        />
      </button>

      {/* Clear Button when filtered */}
      {selectedWorkspace !== 'all' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedWorkspace('all');
          }}
          title="Reset to all repositories"
          style={{
            marginLeft: '4px',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-tertiary)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 'var(--radius-full)'
          }}
        >
          <X size={12} />
        </button>
      )}

      {isOpen && (
        <div
          className="glass-panel animate-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 100,
            width: '320px',
            maxHeight: '420px',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--color-border-default)',
            backgroundColor: 'var(--color-bg-surface)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header & Search */}
          <div style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-tertiary)' }}>
                Select Workspace / Repo
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                {workspacesList.length} Repos
              </span>
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: '8px', color: 'var(--color-text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '6px 8px 6px 28px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-surface-hover)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.75rem',
                  outline: 'none'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-tertiary)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {/* All Repositories Option */}
            <button
              type="button"
              onClick={() => {
                setSelectedWorkspace('all');
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: selectedWorkspace === 'all' ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                border: selectedWorkspace === 'all' ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid transparent',
                color: selectedWorkspace === 'all' ? 'var(--color-brand-primary)' : 'var(--color-text-primary)',
                fontSize: '0.75rem',
                fontWeight: selectedWorkspace === 'all' ? 600 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color var(--duration-fast) ease'
              }}
              onMouseEnter={(e) => {
                if (selectedWorkspace !== 'all') e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)';
              }}
              onMouseLeave={(e) => {
                if (selectedWorkspace !== 'all') e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={14} color="var(--color-brand-primary)" />
                <span>All Repositories</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  {totalAllSessions} turns
                </span>
                {selectedWorkspace === 'all' && <Check size={13} color="var(--color-brand-primary)" />}
              </div>
            </button>

            {/* Individual Workspace Items */}
            {filteredWorkspaces.map((ws: WorkspaceOption) => {
              const isSelected = selectedWorkspace === ws.id;
              return (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => {
                    setSelectedWorkspace(ws.id);
                    setIsOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                    border: isSelected ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid transparent',
                    color: isSelected ? 'var(--color-brand-primary)' : 'var(--color-text-primary)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color var(--duration-fast) ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <FolderGit2 size={13} color={isSelected ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)'} style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: isSelected ? 600 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ws.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: isSelected ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)', fontWeight: 600 }}>
                        ${ws.totalCost.toFixed(2)}
                      </span>
                      {isSelected && <Check size={13} color="var(--color-brand-primary)" />}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingLeft: '21px' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                      {ws.path}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                      {ws.sessionCount} turns
                    </span>
                  </div>
                </button>
              );
            })}

            {filteredWorkspaces.length === 0 && (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                No repositories match "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
