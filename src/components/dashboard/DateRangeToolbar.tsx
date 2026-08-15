import React, { useState, useRef, useEffect } from 'react';
import { DateRange } from '../../stores/useDashboardStore';
import { Calendar, Clock, ChevronDown, Check, X } from 'lucide-react';

interface DateRangeToolbarProps {
  activeRange: DateRange;
  onChange: (range: DateRange) => void;
  disabled?: boolean;
}

const PRESET_RANGES: Array<{ id: string; label: string; fullLabel: string }> = [
  { id: '1d', label: '1D', fullLabel: 'Past 24 Hours' },
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
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedCustomDate, setSelectedCustomDate] = useState(() => {
    if (activeRange.includes('-') && activeRange.length >= 10) {
      return activeRange.replace('date:', '');
    }
    return new Date().toISOString().slice(0, 10);
  });

  const pickerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    if (isPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPickerOpen]);

  const isCustomDateActive = activeRange.includes('-') || (!PRESET_RANGES.some(r => r.id === activeRange));

  const formatCustomLabel = (dateStr: string) => {
    try {
      const clean = dateStr.replace('date:', '');
      const parts = clean.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }
      return clean;
    } catch {
      return 'Date';
    }
  };

  const handleApplyCustomDate = (dateVal: string) => {
    if (dateVal) {
      onChange(`date:${dateVal}`);
      setIsPickerOpen(false);
    }
  };

  return (
    <div
      ref={pickerRef}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
    >
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
        {/* Specific Date Picker Trigger Button */}
        <button
          onClick={() => setIsPickerOpen(!isPickerOpen)}
          disabled={disabled}
          title="Pick any specific date from calendar"
          style={{
            background: isCustomDateActive ? 'var(--color-brand-primary)' : 'transparent',
            color: isCustomDateActive ? '#ffffff' : 'var(--color-text-secondary)',
            border: isCustomDateActive ? 'none' : '1px dashed var(--color-border-subtle)',
            padding: '5px 10px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.75rem',
            fontWeight: isCustomDateActive ? 600 : 500,
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all var(--duration-fast) var(--ease-spring-smooth)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            marginRight: '2px'
          }}
        >
          <Calendar size={13} style={{ color: isCustomDateActive ? '#ffffff' : 'var(--color-brand-primary)' }} />
          <span>{isCustomDateActive ? formatCustomLabel(activeRange) : 'Pick Date'}</span>
          <ChevronDown size={11} style={{ opacity: 0.7 }} />
        </button>

        <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--color-border-subtle)', margin: '0 2px' }} />

        {/* Preset Range Pills */}
        {PRESET_RANGES.map((r) => {
          const isActive = activeRange === r.id;
          return (
            <button
              key={r.id}
              onClick={() => {
                setIsPickerOpen(false);
                onChange(r.id);
              }}
              disabled={disabled}
              title={r.fullLabel}
              style={{
                background: isActive ? 'var(--color-brand-primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
                border: 'none',
                padding: '5px 11px',
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

      {/* Interactive Date Picker Popover */}
      {isPickerOpen && (
        <div
          className="glass-panel animate-slide-up"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            zIndex: 100,
            width: '260px',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
            border: '1px solid var(--color-border-subtle)',
            backgroundColor: '#0f172a'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="var(--color-brand-primary)" />
              Select Specific Date
            </span>
            <button
              onClick={() => setIsPickerOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: 2 }}
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ marginBottom: 'var(--space-3)' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
              Choose Date:
            </label>
            <input
              type="date"
              value={selectedCustomDate}
              onChange={(e) => setSelectedCustomDate(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid var(--color-border-subtle)',
                color: '#ffffff',
                fontSize: '0.8125rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Quick Date Chips */}
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', marginBottom: '4px', textTransform: 'uppercase' }}>
              Quick Presets:
            </span>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {[
                { label: 'Today (Aug 15)', value: '2026-08-15' },
                { label: 'Aug 14', value: '2026-08-14' },
                { label: 'Aug 13', value: '2026-08-13' }
              ].map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => {
                    setSelectedCustomDate(chip.value);
                    handleApplyCustomDate(chip.value);
                  }}
                  style={{
                    background: selectedCustomDate === chip.value ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid ' + (selectedCustomDate === chip.value ? 'var(--color-brand-primary)' : 'rgba(255, 255, 255, 0.1)'),
                    color: selectedCustomDate === chip.value ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                    padding: '3px 7px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.6875rem',
                    cursor: 'pointer'
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleApplyCustomDate(selectedCustomDate)}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '6px 0',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <Check size={13} /> Apply Selected Date
          </button>
        </div>
      )}
    </div>
  );
};
