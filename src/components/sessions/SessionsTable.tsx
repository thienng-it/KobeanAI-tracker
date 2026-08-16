import React, { useState } from 'react';
import { useSessionsStore } from '../../stores/useSessionsStore';
import { TagBadge } from '../tags/TagBadge';
import { ModelBadge } from '../common/ModelBadge';
import { SessionDetailModal } from './SessionDetailModal';
import { 
  Terminal, 
  Flame, 
  Zap, 
  Sparkles, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Inbox, 
  RotateCcw, 
  Clock, 
  ArrowUpRight,
  FolderGit2
} from 'lucide-react';

// Helper to determine AI effort level from real telemetry
function getEffortLevel(session: any) {
  const effort = session.effortLevel || session.metadata?.effortLevel;
  const model = (session.model || '').toLowerCase();
  const isThinkingModel = model.includes('3.7') || model.includes('3.1') || model.includes('r1') || model.includes('o1') || model.includes('o3') || model.includes('thinking');

  if (effort === 'High' || (!effort && isThinkingModel)) {
    return {
      level: 'High (1.00)',
      icon: <Flame size={12} />,
      bg: 'rgba(168, 85, 247, 0.12)',
      border: '1px solid rgba(168, 85, 247, 0.3)',
      color: '#a855f7'
    };
  } else if (effort === 'Medium') {
    return {
      level: 'Med (0.50)',
      icon: <Zap size={12} />,
      bg: 'rgba(245, 158, 11, 0.12)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      color: '#f59e0b'
    };
  } else {
    return {
      level: 'Low / Fast',
      icon: <Sparkles size={12} />,
      bg: 'rgba(16, 185, 129, 0.12)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      color: '#10b981'
    };
  }
}

// Helper to infer or provide default tags
function getSessionTags(session: any) {
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

// Helper to format relative time
function formatRelativeTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  const days = Math.floor(diffSec / 86400);
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

export const SessionsTable: React.FC = () => {
  const { sessions, isLoading, error, meta, setPage, setLimit, resetFilters } = useSessionsStore();
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const handleCopyPrompt = (e: React.MouseEvent, session: any) => {
    e.stopPropagation();
    const prompt = session.summary || session.metadata?.fullPrompt || '';
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      setCopiedPromptId(session.id);
      setTimeout(() => setCopiedPromptId(null), 1800);
    }
  };

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || 50)));
  const currentPage = Math.floor((meta.offset || 0) / (meta.limit || 50)) + 1;
  const startItem = meta.total === 0 ? 0 : meta.offset + 1;
  const endItem = Math.min(meta.offset + meta.limit, meta.total);

  if (isLoading && sessions.length === 0) {
    return (
      <div 
        className="glass-panel" 
        style={{ 
          padding: 'var(--space-12)', 
          textAlign: 'center', 
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)'
        }}
      >
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div className="animate-spin" style={{ width: '28px', height: '28px', border: '3px solid var(--color-brand-primary)', borderTopColor: 'transparent', borderRadius: '50%' }} />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
            Fetching real session transcripts...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="glass-panel" 
        style={{ 
          padding: 'var(--space-8)', 
          textAlign: 'center', 
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}
      >
        <p style={{ color: 'var(--color-status-error-text)', fontWeight: 600, fontSize: '0.875rem' }}>Failed to load sessions: {error}</p>
        <button 
          onClick={resetFilters}
          className="btn-primary"
          style={{ marginTop: 'var(--space-3)', padding: '6px 14px', fontSize: '0.75rem' }}
        >
          Reset Filters & Retry
        </button>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div 
        className="glass-panel animate-slide-up" 
        style={{ 
          padding: 'var(--space-12)', 
          textAlign: 'center', 
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)'
        }}
      >
        <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-bg-surface-hover)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-3)' }}>
          <Inbox size={26} />
        </div>
        <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          No AI sessions match your filter criteria
        </h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem', maxWidth: '400px', margin: '0 auto var(--space-4) auto' }}>
          Try clearing your search query, switching models, or expanding your date range to view historical sessions.
        </p>
        <button 
          onClick={resetFilters}
          style={{
            background: 'var(--color-brand-primary)',
            color: '#ffffff',
            border: 'none',
            padding: '7px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RotateCcw size={14} /> Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <>
      <div 
        className="glass-panel animate-slide-up" 
        style={{ 
          borderRadius: 'var(--radius-xl)', 
          overflow: 'hidden', 
          border: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '960px' }}>
            <thead>
              <tr style={{ 
                borderBottom: '1px solid var(--color-border-subtle)', 
                backgroundColor: 'var(--color-bg-surface-hover)'
              }}>
                <th style={{ padding: '12px 14px', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', width: '130px' }}>
                  Time
                </th>
                <th style={{ padding: '12px 14px', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', width: '165px' }}>
                  Agent & Model
                </th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Prompt / Task Request
                </th>
                <th style={{ padding: '12px 14px', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', width: '130px' }}>
                  Intent Tags
                </th>
                <th style={{ padding: '12px 14px', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', width: '150px' }}>
                  Effort & Tokens
                </th>
                <th style={{ padding: '12px 14px', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', width: '90px', textAlign: 'right' }}>
                  Cost ($)
                </th>
                <th style={{ padding: '12px 8px', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', width: '36px', textAlign: 'center' }}>
                </th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session, idx) => {
                const effort = getEffortLevel(session);
                const tags = getSessionTags(session);
                const sessionAny = session as any;
                const dateObj = new Date(session.startedAt);
                const formattedDate = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                const formattedTime = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                const relativeTime = formatRelativeTime(session.startedAt);
                const isCopied = copiedPromptId === session.id;

                return (
                  <tr 
                    key={session.id} 
                    onClick={() => setSelectedSession(session)}
                    style={{ 
                      borderBottom: idx === sessions.length - 1 ? 'none' : '1px solid var(--color-border-subtle)', 
                      transition: 'all var(--duration-fast) var(--ease-spring-smooth)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {/* Time Column */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
                          {formattedDate}, {formattedTime}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={10} /> {relativeTime}
                        </span>
                      </div>
                    </td>

                    {/* Agent & Model Column */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <div style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-bg-surface-active)',
                          border: '1px solid var(--color-border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Terminal size={11} color="var(--color-brand-primary)" />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {session.agentName}
                        </span>
                        {session.workspaceName && (
                          <span 
                            style={{
                              fontSize: '0.6875rem',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              color: 'var(--color-brand-primary)',
                              padding: '1px 6px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid rgba(59, 130, 246, 0.2)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontWeight: 500,
                              maxWidth: '130px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={session.workspacePath || session.workspaceName}
                          >
                            <FolderGit2 size={10} /> {session.workspaceName}
                          </span>
                        )}
                      </div>
                      <div>
                        <ModelBadge 
                          model={session.model} 
                          modelName={sessionAny.modelName} 
                          provider={sessionAny.provider}
                          modelColor={sessionAny.modelColor}
                          modelBg={sessionAny.modelBg}
                          size="sm"
                        />
                      </div>
                    </td>

                    {/* Prompt / Task Request Column (Expanded & Prominent) */}
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: '8px', 
                          position: 'relative',
                          width: '100%',
                          minWidth: 0
                        }}
                      >
                        <span style={{ color: 'var(--color-brand-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, marginTop: '1px', flexShrink: 0 }}>
                          ❯
                        </span>
                        
                        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                          <p 
                            style={{ 
                              margin: 0,
                              fontSize: '0.8125rem', 
                              color: 'var(--color-text-primary)',
                              lineHeight: 1.45,
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              wordBreak: 'break-word',
                              overflowWrap: 'anywhere',
                              fontWeight: 450
                            }}
                          >
                            {session.summary || 'Session trace with no user prompt description'}
                          </p>
                        </div>
                        
                        {/* Quick Copy Button */}
                        <button
                          onClick={(e) => handleCopyPrompt(e, session)}
                          title={isCopied ? 'Copied prompt!' : 'Copy full prompt to clipboard'}
                          style={{
                            background: isCopied ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-bg-surface)',
                            border: '1px solid ' + (isCopied ? 'var(--color-status-success-text)' : 'var(--color-border-subtle)'),
                            color: isCopied ? 'var(--color-status-success-text)' : 'var(--color-text-tertiary)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '3px 6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '0.6875rem',
                            flexShrink: 0,
                            marginLeft: '4px',
                            transition: 'all var(--duration-fast) ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!isCopied) {
                              e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-active)';
                              e.currentTarget.style.color = 'var(--color-text-primary)';
                              e.currentTarget.style.borderColor = 'var(--color-border-default)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isCopied) {
                              e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)';
                              e.currentTarget.style.color = 'var(--color-text-tertiary)';
                              e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                            }
                          }}
                        >
                          {isCopied ? <Check size={11} /> : <Copy size={11} />}
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </td>

                    {/* Intent Tags Column */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {tags.map((tag: any) => (
                          <TagBadge key={tag.id} tag={tag} size="sm" />
                        ))}
                      </div>
                    </td>

                    {/* Effort & Tokens Column */}
                    <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span 
                            title={`Reasoning effort: ${effort.level}`}
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '3px',
                              padding: '2px 7px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: effort.bg,
                              border: effort.border,
                              color: effort.color,
                              fontSize: '0.6875rem',
                              fontWeight: 600
                            }}
                          >
                            {effort.icon}
                            {effort.level}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--color-text-primary)' }}>
                            {session.totalTokens?.toLocaleString() || 0}
                          </span>
                        </div>

                        {(session.inputTokens || session.outputTokens) && (
                          <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                            {session.inputTokens ? `${(session.inputTokens / 1000).toFixed(1)}k in` : ''} 
                            {session.inputTokens && session.outputTokens ? ' • ' : ''}
                            {session.outputTokens ? `${(session.outputTokens / 1000).toFixed(1)}k out` : ''}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Cost Column */}
                    <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: 700, 
                          fontFamily: 'var(--font-mono)', 
                          color: 'var(--color-status-warning-text)',
                          backgroundColor: 'rgba(245, 158, 11, 0.08)',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid rgba(245, 158, 11, 0.2)'
                        }}>
                          ${session.estimatedCost?.toFixed(4) || '0.0000'}
                        </span>
                      </div>
                    </td>

                    {/* Action Column */}
                    <td style={{ padding: '14px 12px', verticalAlign: 'middle', textAlign: 'center' }}>
                      <div 
                        title="Inspect full session telemetry"
                        style={{ 
                          color: 'var(--color-text-tertiary)',
                          padding: '4px',
                          borderRadius: 'var(--radius-sm)',
                          display: 'inline-flex'
                        }}
                      >
                        <ArrowUpRight size={15} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination & Results Controls Bar */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface-hover)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            <span>
              Showing <strong style={{ color: 'var(--color-text-primary)' }}>{startItem}–{endItem}</strong> of <strong style={{ color: 'var(--color-text-primary)' }}>{meta.total}</strong> sessions
            </span>
            <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--color-border-subtle)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Per page:</span>
              <select
                value={meta.limit}
                onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border-default)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.75rem',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Page Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
              style={{
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-default)',
                color: currentPage <= 1 ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-md)',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                fontSize: '0.75rem',
                fontWeight: 500,
                opacity: currentPage <= 1 ? 0.5 : 1
              }}
            >
              <ChevronLeft size={13} /> Prev
            </button>

            <span style={{ fontSize: '0.75rem', padding: '0 8px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Page <strong style={{ color: 'var(--color-text-primary)' }}>{currentPage}</strong> of <strong style={{ color: 'var(--color-text-primary)' }}>{totalPages}</strong>
            </span>

            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              style={{
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-default)',
                color: currentPage >= totalPages ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-md)',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                fontSize: '0.75rem',
                fontWeight: 500,
                opacity: currentPage >= totalPages ? 0.5 : 1
              }}
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Full Prompt & Telemetry Inspection Modal */}
      <SessionDetailModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </>
  );
};
