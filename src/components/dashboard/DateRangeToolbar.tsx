import React from 'react';
import { DateRange } from '../../stores/useDashboardStore';
import { Calendar, Clock } from 'lucide-react';

interface DateRangeToolbarProps {
  activeRange: DateRange;
  onChange: (range: DateRange) => void;
  disabled?: boolean;
}

const RANGES: Array<{ id: DateRange; label: string; fullLabel: string; badge?: string }> = [
  { id: '1d', label: '1D', fullLabel: 'Past 24 Hours', badge: 'Live' },
  { id: '7d', label: '7D', fullLabel: 'Past 7 Days (1 Week)' },
  { id: '30d', label: '1M', fullLabel: 'Past 30 Days (1 Month)' },
  { id: '90d', label: '1Q', fullLabel: 'Past 90 Days (1 Quarter)' },
  { id: '180d', label: '6M', fullLabel: 'Past 180 Days (Half Year)' },
  { id: '365d', label: '1Y', fullLabel: 'Past 365 Days (1 Year)' },
  { id: 'all', label: 'ALL', fullLabel: 'All Historical Sessions' },
];

export const DateRangeToolbar: React.FC<DateRangeToolbarProps> = ({
  activeRange,
  onChange,
  disabled = false
}) => {
  return (
    <div
      className="glass-panel"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px',
        borderRadius: 'var(--radius-lg)',
        gap: '2px',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        border: '1px solid var(--color-border-subtle)',
        userSelect: 'none'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          padding: '0 var(--space-2)',
          color: 'var(--color-text-tertiary)',
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        <Calendar size={13} style={{ color: 'var(--color-brand-primary)' }} />
        <span style={{ display: 'none' /* Responsive hide text if compact */ }}>Range:</span>
      </div>

      {RANGES.map((r) => {
        const isActive = activeRange === r.id;
        return (
          <button
            key={r.id}
            onClick={() => onChange(r.id)}
            disabled={disabled}
            title={r.fullLabel}
            style={{
              background: isActive ? 'var(--color-brand-primary)' : 'transparent',
              color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
              border: 'none',
              padding: '5px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              fontWeight: isActive ? 600 : 500,
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all var(--duration-fast) var(--ease-spring-smooth)',
              boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {r.id === '1d' && <Clock size={11} style={{ opacity: isActive ? 1 : 0.7 }} />}
            {r.label}
          </button>
        );
      })}
    </div>
  );
};
