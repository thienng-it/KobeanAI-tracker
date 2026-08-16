import React, { useState, useRef, useEffect, useMemo } from 'react';
import { DateRange } from '../../stores/useDashboardStore';
import { Calendar, ChevronDown, Check, X } from 'lucide-react';

interface DateRangeToolbarProps {
  activeRange: DateRange;
  onChange: (range: DateRange) => void;
  disabled?: boolean;
}

export const DateRangeToolbar: React.FC<DateRangeToolbarProps> = ({
  activeRange,
  onChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Compute dynamic system dates based on current machine local clock
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const todayFormatted = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const PRESET_RANGES = useMemo(() => [
    { id: '1d', label: '1D', title: `Today (${todayFormatted})`, desc: 'Today only' },
    { id: '7d', label: '7D', title: 'Past 7 Days', desc: 'Last 1 week' },
    { id: '30d', label: '1M', title: 'Past 30 Days', desc: 'Last 1 month' },
    { id: '90d', label: '1Q', title: 'Past 90 Days', desc: 'Last 1 quarter' },
    { id: '180d', label: '6M', title: 'Past 180 Days', desc: 'Last 6 months' },
    { id: '365d', label: '1Y', title: 'Past 1 Year', desc: 'Last 12 months' },
    { id: 'all', label: 'ALL', title: 'All Time', desc: 'Full history' },
  ], [todayFormatted]);

  const [customDateInput, setCustomDateInput] = useState(() => {
    if (activeRange.startsWith('date:')) {
      return activeRange.replace('date:', '');
    }
    return todayStr;
  });

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

  const currentActiveLabel = useMemo(() => {
    if (activeRange.startsWith('date:')) {
      const datePart = activeRange.replace('date:', '');
      try {
        const [y, m, d] = datePart.split('-').map(Number);
        const parsed = new Date(y, m - 1, d);
        return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      } catch {
        return datePart;
      }
    }
    const found = PRESET_RANGES.find(r => r.id === activeRange);
    return found ? found.title : activeRange;
  }, [activeRange, PRESET_RANGES]);

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customDateInput) {
      onChange(`date:${customDateInput}`);
      setIsOpen(false);
    }
  };

  const isCustomActive = activeRange.startsWith('date:');

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="glass-panel"
        title="Filter dashboard by time range or specific date"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          height: '32px',
          padding: '0 12px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: activeRange !== 'all' ? 'var(--color-bg-surface-active)' : 'var(--color-bg-surface)',
          border: activeRange !== 'all'
            ? '1px solid rgba(59, 130, 246, 0.4)'
            : '1px solid var(--color-border-subtle)',
          color: activeRange !== 'all' ? 'var(--color-brand-primary)' : 'var(--color-text-primary)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all var(--duration-fast) var(--ease-spring-smooth)',
          boxShadow: activeRange !== 'all' ? '0 1px 4px rgba(59, 130, 246, 0.15)' : 'none',
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
            e.currentTarget.style.backgroundColor = activeRange !== 'all' ? 'var(--color-bg-surface-active)' : 'var(--color-bg-surface)';
            e.currentTarget.style.borderColor = activeRange !== 'all' ? 'rgba(59, 130, 246, 0.4)' : 'var(--color-border-subtle)';
          }
        }}
      >
        <Calendar size={13} color="var(--color-brand-primary)" />
        
        <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {currentActiveLabel}
        </span>

        <ChevronDown 
          size={12} 
          style={{ 
            opacity: 0.7, 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform var(--duration-fast) ease'
          }} 
        />
      </button>

      {/* Clear/Reset button when not All */}
      {activeRange !== 'all' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange('all');
          }}
          title="Reset to all historical sessions"
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

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className="glass-panel animate-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            zIndex: 100,
            width: '280px',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--color-border-default)',
            backgroundColor: 'var(--color-bg-surface)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '8px'
          }}
        >
          {/* Popover Header */}
          <div style={{ padding: '6px 8px 10px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-tertiary)' }}>
              Select Time Range
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              Presets & Custom
            </span>
          </div>

          {/* Presets List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '6px 0' }}>
            {PRESET_RANGES.map((preset) => {
              const isSelected = activeRange === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    onChange(preset.id);
                    setIsOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                    border: isSelected ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid transparent',
                    color: isSelected ? 'var(--color-brand-primary)' : 'var(--color-text-primary)',
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 600 : 500,
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span 
                      style={{ 
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        padding: '1px 5px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'var(--color-bg-surface-hover)',
                        color: isSelected ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                        minWidth: '28px',
                        textAlign: 'center'
                      }}
                    >
                      {preset.label}
                    </span>
                    <span>{preset.title}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)' }}>
                      {preset.desc}
                    </span>
                    {isSelected && <Check size={13} color="var(--color-brand-primary)" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Date Section */}
          <div style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px solid var(--color-border-subtle)', padding: '8px' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
              Specific Single Day
            </span>
            <form onSubmit={handleApplyCustom} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="date"
                value={customDateInput}
                onChange={(e) => setCustomDateInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '5px 8px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-surface-hover)',
                  border: isCustomActive ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.75rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{
                  padding: '5px 10px',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Apply
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
