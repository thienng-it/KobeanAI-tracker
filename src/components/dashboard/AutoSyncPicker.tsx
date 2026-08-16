import React, { useState, useRef, useEffect } from 'react';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { Timer, Check, ChevronDown, X } from 'lucide-react';

interface AutoSyncPickerProps {
  disabled?: boolean;
}

const PRESET_INTERVALS = [
  { label: 'Off', seconds: 0, desc: 'Manual sync only' },
  { label: '5s', seconds: 5, desc: 'Real-time telemetry' },
  { label: '10s', seconds: 10, desc: 'Fast & responsive (Recommended)' },
  { label: '30s', seconds: 30, desc: 'Standard background refresh' },
  { label: '60s', seconds: 60, desc: 'Every 1 minute' },
  { label: '300s', seconds: 300, desc: 'Every 5 minutes' },
];

export const AutoSyncPicker: React.FC<AutoSyncPickerProps> = ({ disabled = false }) => {
  const { autoRefreshInterval, setAutoRefreshInterval, syncAllLatest, isSyncing } = useDashboardStore();
  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [countdown, setCountdown] = useState<number>(autoRefreshInterval);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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

  // Sync countdown timer & trigger
  useEffect(() => {
    if (autoRefreshInterval <= 0) {
      setCountdown(0);
      return;
    }

    setCountdown(autoRefreshInterval);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Trigger sync if not already syncing
          if (!isSyncing) {
            syncAllLatest();
          }
          return autoRefreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshInterval, syncAllLatest, isSyncing]);

  const handleSelectInterval = (sec: number) => {
    setAutoRefreshInterval(sec);
    setCountdown(sec);
    setIsOpen(false);
    setCustomInput('');
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      handleSelectInterval(parsed);
    }
  };

  const isCustomActive = autoRefreshInterval > 0 && !PRESET_INTERVALS.some(p => p.seconds === autoRefreshInterval);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        title={autoRefreshInterval > 0 ? `Auto-syncing every ${autoRefreshInterval}s (Next in ${countdown}s)` : 'Set auto-sync & refresh interval'}
        className="interactive-card"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          height: '32px',
          padding: '0 12px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: autoRefreshInterval > 0 ? 'rgba(59, 130, 246, 0.12)' : 'var(--color-bg-surface)',
          border: `1px solid ${autoRefreshInterval > 0 ? 'rgba(59, 130, 246, 0.35)' : 'var(--color-border-subtle)'}`,
          color: autoRefreshInterval > 0 ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all var(--duration-fast) var(--ease-spring-smooth)',
          userSelect: 'none'
        }}
      >
        <Timer size={13} color={autoRefreshInterval > 0 ? 'var(--color-brand-primary)' : 'currentColor'} />
        <span>
          {autoRefreshInterval > 0 ? (
            <>
              Auto: {autoRefreshInterval}s{' '}
              <span style={{ fontSize: '0.6875rem', opacity: 0.85, fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
                ({countdown}s)
              </span>
            </>
          ) : (
            'Auto: Off'
          )}
        </span>
        <ChevronDown size={11} style={{ opacity: 0.7 }} />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className="glass-panel animate-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            zIndex: 100,
            width: '260px',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--color-border-default)',
            backgroundColor: 'var(--color-bg-surface)',
            userSelect: 'none'
          }}
        >
          {/* Popover Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Timer size={14} color="var(--color-brand-primary)" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Auto-Refresh Interval
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: 2 }}
            >
              <X size={14} />
            </button>
          </div>

          <p style={{ margin: '0 0 var(--space-3)', fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
            Automatically sync new session logs and refresh telemetry cards.
          </p>

          {/* Presets List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: 'var(--space-3)' }}>
            {PRESET_INTERVALS.map((preset) => {
              const isSelected = autoRefreshInterval === preset.seconds;
              return (
                <button
                  key={preset.seconds}
                  type="button"
                  onClick={() => handleSelectInterval(preset.seconds)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.14)' : 'transparent',
                    border: `1px solid ${isSelected ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}`,
                    color: isSelected ? 'var(--color-brand-primary)' : 'var(--color-text-primary)',
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{preset.label}</span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontWeight: 400 }}>
                      {preset.desc}
                    </span>
                  </div>
                  {isSelected && <Check size={14} color="var(--color-brand-primary)" />}
                </button>
              );
            })}
          </div>

          {/* Custom Seconds Input */}
          <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-3)' }}>
            <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>
              Custom Interval:
            </span>
            <form onSubmit={handleApplyCustom} style={{ display: 'flex', gap: '6px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="number"
                  min="1"
                  max="3600"
                  placeholder={isCustomActive ? `${autoRefreshInterval}` : 'e.g. 15'}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 24px 6px 8px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-surface-hover)',
                    border: '1px solid var(--color-border-default)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    outline: 'none'
                  }}
                />
                <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                  s
                </span>
              </div>
              <button
                type="submit"
                disabled={!customInput || parseInt(customInput, 10) <= 0}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: customInput && parseInt(customInput, 10) > 0 ? 'var(--color-brand-primary)' : 'var(--color-bg-surface-hover)',
                  color: customInput && parseInt(customInput, 10) > 0 ? '#fff' : 'var(--color-text-tertiary)',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: customInput && parseInt(customInput, 10) > 0 ? 'pointer' : 'default'
                }}
              >
                Set
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
