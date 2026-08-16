import React, { useState } from 'react';
import { useHookStore } from '../../stores/useHookStore';
import { ShieldCheck, ShieldAlert, GitCommit, RefreshCw, Power } from 'lucide-react';

export const GitHookBanner: React.FC = () => {
  const { gitHookInstalled, toggleGitHook } = useHookStore();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    await toggleGitHook();
    setIsToggling(false);
  };

  return (
    <div 
      className="glass-panel"
      style={{
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-xl)',
        marginBottom: 'var(--space-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        border: gitHookInstalled 
          ? '1px solid rgba(16, 185, 129, 0.3)' 
          : '1px solid rgba(245, 158, 11, 0.3)',
        background: gitHookInstalled
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)'
          : 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', zIndex: 1 }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: gitHookInstalled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: gitHookInstalled ? 'var(--color-status-success-text)' : 'var(--color-status-warning-text)',
          border: gitHookInstalled ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
        }}>
          {gitHookInstalled ? <ShieldCheck size={22} /> : <ShieldAlert size={22} />}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Git Pre-Commit Secret Scanner Guard
            </h3>
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: gitHookInstalled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: gitHookInstalled ? 'var(--color-status-success-text)' : 'var(--color-status-warning-text)',
              border: gitHookInstalled ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <GitCommit size={11} /> {gitHookInstalled ? 'Active in .git/hooks/pre-commit' : 'Inactive / Not Installed'}
            </span>
          </div>

          <p style={{ margin: '3px 0 0 0', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            {gitHookInstalled 
              ? 'Local commits are automatically scanned against .betterleak regexes to prevent accidental credential and API key leaks.'
              : 'Protect your repo by installing the local pre-commit hook to scan staged files before every git commit.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 1 }}>
        <button
          onClick={handleToggle}
          disabled={isToggling}
          style={{
            padding: '7px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: isToggling ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all var(--duration-fast) var(--ease-spring-smooth)',
            backgroundColor: gitHookInstalled ? 'rgba(239, 68, 68, 0.15)' : 'var(--color-brand-primary)',
            color: gitHookInstalled ? 'var(--color-status-error-text)' : '#fff',
            border: gitHookInstalled ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
            boxShadow: gitHookInstalled ? 'none' : '0 2px 4px rgba(59, 130, 246, 0.25)'
          }}
        >
          {isToggling ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              <span>Updating...</span>
            </>
          ) : gitHookInstalled ? (
            <>
              <Power size={13} />
              <span>Disable Pre-Commit Hook</span>
            </>
          ) : (
            <>
              <ShieldCheck size={14} />
              <span>Enable Pre-Commit Hook</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
