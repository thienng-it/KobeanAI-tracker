import React, { useState, useMemo } from 'react';
import type { Session, Tag } from '../../stores/useDashboardStore';
import { TagBadge } from '../tags/TagBadge';
import { ModelBadge } from '../common/ModelBadge';
import { SessionDetailModal } from '../sessions/SessionDetailModal';
import { 
  Clock, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  ExternalLink, 
  FolderGit2, 
  Flame, 
  Zap, 
  Sparkles,
  Layers,
  Wrench,
  X
} from 'lucide-react';
import { Link } from 'react-router';

interface ActivityFeedProps {
  sessions: Session[];
}

// Helper to determine AI effort level from real telemetry
function getEffortLevel(session: Session) {
  const effort = (session as any).effortLevel || (session as any).metadata?.effortLevel;
  const model = (session.model || '').toLowerCase();
  const isThinkingModel = model.includes('3.7') || model.includes('3.1') || model.includes('r1') || model.includes('o1') || model.includes('o3') || model.includes('thinking');

  if (effort === 'High' || (!effort && isThinkingModel)) {
    return {
      level: 'High',
      label: 'High (1.0)',
      icon: <Flame size={11} />,
      bg: 'rgba(168, 85, 247, 0.12)',
      border: '1px solid rgba(168, 85, 247, 0.3)',
      color: '#a855f7'
    };
  } else if (effort === 'Medium') {
    return {
      level: 'Medium',
      label: 'Med (0.5)',
      icon: <Zap size={11} />,
      bg: 'rgba(245, 158, 11, 0.12)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      color: '#f59e0b'
    };
  } else {
    return {
      level: 'Low',
      label: 'Fast',
      icon: <Sparkles size={11} />,
      bg: 'rgba(16, 185, 129, 0.12)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      color: '#10b981'
    };
  }
}

// Helper to infer or provide default tags
function getSessionTags(session: Session): Tag[] {
  if (session.tags && session.tags.length > 0) {
    return session.tags;
  }

  const prompt = (session.summary || '').toLowerCase();
  let action = 'Unknown';
  let color = '#64748b';

  if (/\b(fix|bug|issue|error|fail|broken|crash|wrong|duplicate|duplicated|inverted)\b/.test(prompt)) {
    action = 'Fix';
    color = '#ef4444';
  } else if (/\b(refactor|clean|cleanup|dedup|reorganize|structure)\b/.test(prompt)) {
    action = 'Refactor';
    color = '#8b5cf6';
  } else if (/\b(implement|feature|add|create|build|support|new|enhance|toolbar|picker)\b/.test(prompt)) {
    action = 'Implement';
    color = '#10b981';
  } else if (/\b(ui|ux|theme|dark|light|style|color|css|layout|motion|button|contrast)\b/.test(prompt)) {
    action = 'UI/UX';
    color = '#3b82f6';
  } else if (/\b(doc|docs|documentation|guide|readme|help|explain|how to)\b/.test(prompt)) {
    action = 'Docs';
    color = '#06b6d4';
  } else if (/\b(test|validate|verify|check|audit|benchmark|correct|static)\b/.test(prompt)) {
    action = 'Validate';
    color = '#f59e0b';
  } else if (/\b(config|rule|skill|agent|model|token|price|env|key|codegraph)\b/.test(prompt)) {
    action = 'Config';
    color = '#ec4899';
  }

  return [
    {
      id: `derived-${action.toLowerCase()}`,
      raw: `[${action}]`,
      prefix: 'intent',
      identifier: action.toLowerCase(),
      action,
      color
    }
  ];
}

const CANONICAL_TAG_FILTERS = [
  { name: 'Implement', color: '#10b981' },
  { name: 'Fix', color: '#ef4444' },
  { name: 'UI/UX', color: '#3b82f6' },
  { name: 'Validate', color: '#f59e0b' },
  { name: 'Config', color: '#ec4899' },
  { name: 'Docs', color: '#06b6d4' },
  { name: 'Refactor', color: '#8b5cf6' },
  { name: 'Unknown', color: '#64748b' }
];

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ sessions }) => {
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState(10);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Compute tag counts across available sessions
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = { all: sessions.length };
    for (const session of sessions) {
      const tags = getSessionTags(session);
      for (const tag of tags) {
        const key = tag.action || 'Unknown';
        counts[key] = (counts[key] || 0) + 1;
      }
    }
    return counts;
  }, [sessions]);

  // Filtered session stream
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // Filter by tag
      if (selectedTagFilter !== 'all') {
        const tags = getSessionTags(session);
        const match = tags.some(t => (t.action || '').toLowerCase() === selectedTagFilter.toLowerCase());
        if (!match) return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const text = `${session.summary || ''} ${session.agentName || ''} ${session.workspaceName || ''} ${session.model || ''}`.toLowerCase();
        if (!text.includes(query)) return false;
      }

      return true;
    });
  }, [sessions, selectedTagFilter, searchQuery]);

  const displayedSessions = filteredSessions.slice(0, visibleCount);
  const hasMore = visibleCount < filteredSessions.length;
  const isExpanded = visibleCount > 10;

  const formatTokens = (tokens?: number | null) => {
    if (!tokens) return '0';
    if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
    if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}k`;
    return tokens.toLocaleString();
  };

  const formatDuration = (ms?: number | null) => {
    if (!ms || ms <= 0) return '0s';
    if (ms >= 60000) {
      const mins = Math.floor(ms / 60000);
      const secs = Math.round((ms % 60000) / 1000);
      return `${mins}m ${secs}s`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTime = (startedAt: string) => {
    try {
      const d = new Date(startedAt);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return startedAt;
    }
  };

  return (
    <>
      <div className="glass-panel animate-slide-up" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        {/* Stream Header & Search Toolbar */}
        <div style={{ 
          padding: 'var(--space-4) var(--space-6)', 
          borderBottom: '1px solid var(--color-border-subtle)', 
          backgroundColor: 'var(--color-bg-surface)',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--color-brand-primary)" />
              <h3 className="text-lg" style={{ margin: 0, letterSpacing: '-0.01em', fontWeight: 600 }}>
                Recent Activity Stream
              </h3>
            </div>
            <span style={{ 
              fontSize: '0.75rem', 
              fontFamily: 'var(--font-mono)',
              padding: '2px 8px', 
              borderRadius: 'var(--radius-full)', 
              backgroundColor: 'var(--color-bg-surface-hover)', 
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-subtle)',
              fontWeight: 600
            }}>
              {filteredSessions.length} {filteredSessions.length === 1 ? 'turn' : 'turns'}
            </span>
          </div>

          {/* Quick Search Box & View All Link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompt or task..."
                style={{
                  width: '100%',
                  padding: '5px 28px 5px 30px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.75rem',
                  outline: 'none',
                  transition: 'all var(--duration-fast) ease'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
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

            <Link
              to="/sessions"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-brand-primary)',
                textDecoration: 'none',
                padding: '5px 10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                transition: 'all var(--duration-fast) ease'
              }}
            >
              <span>View All</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>

        {/* Inline Intent Tag Filter Bar */}
        <div style={{
          padding: '8px var(--space-6)',
          backgroundColor: 'rgba(0, 0, 0, 0.12)',
          borderBottom: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontWeight: 600, marginRight: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Intent:
          </span>

          <button
            onClick={() => setSelectedTagFilter('all')}
            style={{
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              border: selectedTagFilter === 'all' ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border-subtle)',
              backgroundColor: selectedTagFilter === 'all' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              color: selectedTagFilter === 'all' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all var(--duration-fast) ease'
            }}
          >
            <span>All</span>
            <span style={{ opacity: 0.6 }}>({tagCounts['all'] || 0})</span>
          </button>

          {CANONICAL_TAG_FILTERS.map(tagDef => {
            const count = tagCounts[tagDef.name] || 0;
            if (count === 0 && selectedTagFilter !== tagDef.name) return null;
            const isSelected = selectedTagFilter.toLowerCase() === tagDef.name.toLowerCase();

            return (
              <button
                key={tagDef.name}
                onClick={() => setSelectedTagFilter(isSelected ? 'all' : tagDef.name)}
                style={{
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  border: `1px solid ${isSelected ? tagDef.color : `${tagDef.color}40`}`,
                  backgroundColor: isSelected ? `${tagDef.color}30` : 'transparent',
                  color: isSelected ? 'var(--color-text-primary)' : tagDef.color,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all var(--duration-fast) ease'
                }}
              >
                <span>[{tagDef.name}]</span>
                <span style={{ opacity: 0.75 }}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Telemetry Stream Column Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '90px 140px 180px 1fr 140px 120px 40px',
          padding: '8px var(--space-6)',
          borderBottom: '1px solid var(--color-border-subtle)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: 'var(--color-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          alignItems: 'center'
        }}>
          <div>Time</div>
          <div>Intent</div>
          <div>Model & Workspace</div>
          <div>Prompt / Task Summary</div>
          <div style={{ textAlign: 'right' }}>Tokens & Cost</div>
          <div style={{ textAlign: 'right' }}>Speed & Tools</div>
          <div style={{ textAlign: 'center' }}></div>
        </div>
        
        {/* Stream Rows */}
        {displayedSessions.length === 0 ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            No sessions match the selected filter or search query.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {displayedSessions.map((session, index) => {
              const effort = getEffortLevel(session);
              const allTags = getSessionTags(session);
              // Sort tags so that the active filter tag appears first
              const sortedTags = [...allTags].sort((a, b) => {
                if (selectedTagFilter === 'all') return 0;
                const aMatch = (a.action || '').toLowerCase() === selectedTagFilter.toLowerCase();
                const bMatch = (b.action || '').toLowerCase() === selectedTagFilter.toLowerCase();
                if (aMatch && !bMatch) return -1;
                if (!aMatch && bMatch) return 1;
                return 0;
              });
              const sessionAny = session as any;
              const promptText = session.summary || 'User session turn request';
              const toolCallsCount = sessionAny.toolCalls || sessionAny.metadata?.toolCalls || 0;

              return (
                <div 
                  key={session.id} 
                  onClick={() => setSelectedSession(session)}
                  title="Click to view full prompt & telemetry inspector"
                  style={{ 
                    display: 'grid',
                    gridTemplateColumns: '90px 140px 180px 1fr 140px 120px 40px',
                    alignItems: 'center',
                    padding: '10px var(--space-6)',
                    borderBottom: index < displayedSessions.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                    transition: 'background-color var(--duration-fast) ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Time & Agent */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      <Clock size={11} color="var(--color-text-tertiary)" />
                      <span>{formatTime(session.startedAt)}</span>
                    </div>
                    <span style={{ fontSize: '0.625rem', color: 'var(--color-text-tertiary)' }}>
                      {session.agentName.replace(/agent/i, '').trim()}
                    </span>
                  </div>

                  {/* Intent Tags */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                    {sortedTags.map(tag => (
                      <span
                        key={tag.id || tag.action}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTagFilter(tag.action || 'Unknown');
                        }}
                        title={`Click to filter by ${tag.raw || tag.action}`}
                        style={{ cursor: 'pointer' }}
                      >
                        <TagBadge tag={tag} size="sm" />
                      </span>
                    ))}
                  </div>

                  {/* Model & Workspace */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                      <ModelBadge 
                        model={session.model} 
                        modelName={sessionAny.modelName} 
                        provider={sessionAny.provider}
                        modelColor={sessionAny.modelColor}
                        modelBg={sessionAny.modelBg}
                        size="sm"
                      />
                      <span 
                        title={`Reasoning effort: ${effort.label}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          padding: '1px 5px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: effort.bg,
                          border: effort.border,
                          color: effort.color,
                          fontSize: '0.625rem',
                          fontWeight: 600
                        }}
                      >
                        {effort.icon}
                        <span>{effort.label}</span>
                      </span>
                    </div>
                    {session.workspaceName && (
                      <div 
                        style={{
                          fontSize: '0.625rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-brand-primary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={session.workspacePath || session.workspaceName}
                      >
                        <FolderGit2 size={10} /> {session.workspaceName}
                      </div>
                    )}
                  </div>

                  {/* Prompt Text / Summary */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '16px', overflow: 'hidden' }}>
                    <MessageSquare size={13} style={{ flexShrink: 0, color: 'var(--color-brand-primary)', opacity: 0.8 }} />
                    <span 
                      style={{ 
                        fontSize: '0.8125rem', 
                        color: 'var(--color-text-primary)', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap' 
                      }}
                      title={promptText}
                    >
                      {promptText}
                    </span>
                  </div>

                  {/* Tokens & Cost */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                      {formatTokens(session.totalTokens)} tok
                    </span>
                    <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-status-warning-text)' }}>
                      ${(session.estimatedCost || 0).toFixed(4)}
                    </span>
                  </div>

                  {/* Speed & Tools */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: '#8b5cf6' }}>
                      {formatDuration(session.durationMs)}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.625rem', color: 'var(--color-text-tertiary)' }}>
                      <Wrench size={10} />
                      <span>{toolCallsCount} {toolCallsCount === 1 ? 'call' : 'calls'}</span>
                    </div>
                  </div>

                  {/* Action */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <ExternalLink size={13} style={{ color: 'var(--color-text-tertiary)', opacity: 0.6 }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Toolbar */}
        {filteredSessions.length > 10 && (
          <div style={{ 
            padding: 'var(--space-3) var(--space-6)', 
            borderTop: '1px solid var(--color-border-subtle)', 
            backgroundColor: 'var(--color-bg-surface)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'var(--space-3)',
            flexWrap: 'wrap'
          }}>
            {hasMore && (
              <>
                <button
                  onClick={() => setVisibleCount(prev => Math.min(prev + 10, filteredSessions.length))}
                  className="interactive-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-surface-hover)',
                    border: '1px solid var(--color-border-subtle)',
                    color: 'var(--color-brand-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <ChevronDown size={13} />
                  <span>Load More (+10)</span>
                </button>

                <button
                  onClick={() => setVisibleCount(filteredSessions.length)}
                  className="interactive-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    color: 'var(--color-brand-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <span>Show All ({filteredSessions.length})</span>
                </button>
              </>
            )}

            {isExpanded && (
              <button
                onClick={() => setVisibleCount(10)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <ChevronUp size={13} />
                <span>Show Less (10)</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Full Prompt & Telemetry Inspector Modal */}
      <SessionDetailModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </>
  );
};
