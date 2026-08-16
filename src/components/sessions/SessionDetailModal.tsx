import React, { useEffect, useState } from 'react';
import type { Session } from '../../stores/useDashboardStore';
import { ModelBadge } from '../common/ModelBadge';
import { TagBadge } from '../tags/TagBadge';
import { 
  X, 
  Copy, 
  Check, 
  MessageSquare, 
  Terminal, 
  Clock, 
  Database, 
  Coins, 
  Flame, 
  Zap, 
  Sparkles, 
  Timer,
  Hash,
  ShieldCheck,
  FolderGit2
} from 'lucide-react';

interface SessionDetailModalProps {
  session: Session | null;
  onClose: () => void;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({ session, onClose }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!session) return null;

  const sessionAny = session as any;
  const metadata = sessionAny.metadata || {};
  const fullPrompt = session.summary || metadata.fullPrompt || 'No prompt content available.';

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(fullPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy prompt:', e);
    }
  };

  const getEffortLevel = () => {
    const effort = sessionAny.effortLevel || metadata.effortLevel;
    const model = (session.model || '').toLowerCase();
    const isThinking = model.includes('3.7') || model.includes('3.1') || model.includes('r1') || model.includes('o1') || model.includes('o3') || model.includes('thinking');

    if (effort === 'High' || (!effort && isThinking)) {
      return {
        level: 'High Effort (1.00)',
        icon: <Flame size={13} />,
        bg: 'rgba(168, 85, 247, 0.15)',
        border: '1px solid rgba(168, 85, 247, 0.35)',
        color: '#a855f7'
      };
    } else if (effort === 'Medium') {
      return {
        level: 'Medium Effort (0.50)',
        icon: <Zap size={13} />,
        bg: 'rgba(245, 158, 11, 0.15)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        color: '#f59e0b'
      };
    }
    return {
      level: 'Low / Fast',
      icon: <Sparkles size={13} />,
      bg: 'rgba(16, 185, 129, 0.15)',
      border: '1px solid rgba(16, 185, 129, 0.35)',
      color: '#10b981'
    };
  };

  const effort = getEffortLevel();
  const tagsList = session.tags || [];

  const formatDuration = (ms?: number | null) => {
    if (!ms || ms <= 0) return '< 1s';
    if (ms < 1000) return `${ms}ms`;
    const sec = (ms / 1000).toFixed(1);
    if (Number(sec) < 60) return `${sec}s`;
    const min = Math.floor(Number(sec) / 60);
    const remSec = (Number(sec) % 60).toFixed(0);
    return `${min}m ${remSec}s`;
  };

  const inputTokens = sessionAny.inputTokens || metadata.inputTokens || 0;
  const outputTokens = sessionAny.outputTokens || metadata.outputTokens || 0;
  const thinkingTokens = metadata.thinkingTokens || 0;
  const totalTokens = session.totalTokens || (inputTokens + outputTokens);

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        animation: 'fadeIn var(--duration-fast) ease'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '760px',
          maxHeight: '90vh',
          backgroundColor: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-2xl)',
          border: '1px solid var(--color-border-default)',
          boxShadow: 'var(--shadow-2xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: 'var(--space-5) var(--space-6)',
          borderBottom: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--color-bg-surface-hover)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-surface-active)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-brand-primary)'
            }}>
              <Terminal size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {session.agentName || 'Agent Session'}
                </h3>
                <ModelBadge
                  model={session.model}
                  modelName={sessionAny.modelName}
                  provider={sessionAny.provider}
                  modelColor={sessionAny.modelColor}
                  modelBg={sessionAny.modelBg}
                  size="sm"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '2px', flexWrap: 'wrap' }}>
                <Clock size={12} />
                <span>{new Date(session.startedAt).toLocaleString()}</span>
                {session.workspaceName && (
                  <>
                    <span>•</span>
                    <span 
                      style={{ 
                        color: 'var(--color-brand-primary)', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '3px', 
                        fontWeight: 600,
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                      }}
                      title={session.workspacePath || session.workspaceName}
                    >
                      <FolderGit2 size={11} /> {session.workspaceName}
                    </span>
                  </>
                )}
                <span>•</span>
                <span style={{ color: 'var(--color-status-success-text)', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                  <ShieldCheck size={12} /> Completed
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            title="Close modal (Esc)"
            className="interactive-card"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: 'var(--space-6)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Full Prompt Display Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                <MessageSquare size={15} color="var(--color-brand-primary)" />
                <span>Full User Request & Prompt</span>
              </div>

              <button
                onClick={handleCopyPrompt}
                className="interactive-card"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: copied ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-bg-surface-hover)',
                  border: copied ? '1px solid #10b981' : '1px solid var(--color-border-subtle)',
                  color: copied ? '#10b981' : 'var(--color-text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--duration-fast) ease'
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
              </button>
            </div>

            <div 
              style={{
                backgroundColor: 'var(--color-bg-surface-hover)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                fontSize: '0.875rem',
                lineHeight: '1.6',
                color: 'var(--color-text-primary)',
                maxHeight: '260px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                userSelect: 'text'
              }}
            >
              {fullPrompt}
            </div>
          </div>

          {/* Tags & Intent Section */}
          {tagsList.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
                Intent Classification Tags
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {tagsList.map(t => (
                  <TagBadge key={t.id} tag={t} size="md" />
                ))}
              </div>
            </div>
          )}

          {/* Telemetry & Metrics Grid */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
              Session Telemetry & Resource Consumption
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-3)' }}>
              {/* Total Tokens */}
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
                  <Database size={12} /> Total Tokens
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                  {totalTokens.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  In: {inputTokens.toLocaleString()} • Out: {outputTokens.toLocaleString()}
                </div>
              </div>

              {/* Estimated Cost */}
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
                  <Coins size={12} /> Calculated Cost
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-status-warning-text)', marginTop: '2px' }}>
                  ${(session.estimatedCost || 0).toFixed(4)}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Retail API rate
                </div>
              </div>

              {/* Execution Latency / Duration */}
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
                  <Timer size={12} /> Session Duration
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                  {formatDuration(session.durationMs)}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Active processing time
                </div>
              </div>

              {/* Effort & Reasoning Level */}
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
                  {effort.icon} Effort Configuration
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: effort.color, marginTop: '4px' }}>
                  {effort.level}
                </div>
                {thinkingTokens > 0 && (
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {thinkingTokens.toLocaleString()} think tokens
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Session Identification */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', paddingTop: 'var(--space-2)', borderTop: '1px dashed var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Hash size={11} />
              <span style={{ fontFamily: 'var(--font-mono)' }}>ID: {session.id}</span>
            </div>
            <div>
              <span>Model: <strong style={{ color: 'var(--color-text-primary)' }}>{session.model}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
