import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  count?: number;
  icon?: React.ReactNode;
  color?: string;
  badge?: string;
}

interface CustomSelectProps {
  value: string | null;
  options: CustomSelectOption[];
  onChange: (value: string | null) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  searchable?: boolean;
  align?: 'left' | 'right';
  maxWidth?: string | number;
  minWidth?: string | number;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  options,
  onChange,
  placeholder = 'Select option...',
  icon,
  searchable,
  align = 'left',
  maxWidth,
  minWidth = '140px',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-enable search if there are more than 5 options
  const showSearch = searchable ?? options.length > 5;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const selectedOption = options.find(o => o.value === value || (value === null && o.value === ''));
  const isFiltered = value !== null && value !== '' && value !== 'all';

  const filteredOptions = options.filter(opt => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      opt.label.toLowerCase().includes(q) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    );
  });

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'relative', 
        display: 'inline-flex', 
        alignItems: 'center',
        zIndex: isOpen ? 60 : 1
      }}
    >
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="glass-panel"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 10px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: isFiltered ? 'var(--color-bg-surface-active)' : 'var(--color-bg-surface)',
          border: isFiltered 
            ? '1px solid rgba(59, 130, 246, 0.4)' 
            : '1px solid var(--color-border-subtle)',
          color: isFiltered ? 'var(--color-brand-primary)' : 'var(--color-text-primary)',
          fontSize: '0.75rem',
          fontWeight: isFiltered ? 600 : 500,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all var(--duration-fast) var(--ease-spring-smooth)',
          boxShadow: isFiltered ? '0 1px 4px rgba(59, 130, 246, 0.15)' : 'none',
          userSelect: 'none',
          maxWidth: maxWidth || '220px',
          minWidth
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)';
            e.currentTarget.style.borderColor = isFiltered ? 'rgba(59, 130, 246, 0.6)' : 'var(--color-border-default)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = isFiltered ? 'var(--color-bg-surface-active)' : 'var(--color-bg-surface)';
            e.currentTarget.style.borderColor = isFiltered ? 'rgba(59, 130, 246, 0.4)' : 'var(--color-border-subtle)';
          }
        }}
      >
        {icon && (
          <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
            {icon}
          </span>
        )}

        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {selectedOption?.count !== undefined && selectedOption.count > 0 && (
          <span 
            style={{ 
              fontSize: '0.625rem',
              backgroundColor: isFiltered ? 'rgba(59, 130, 246, 0.15)' : 'var(--color-bg-surface-hover)',
              color: isFiltered ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)',
              padding: '1px 5px',
              borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              flexShrink: 0
            }}
          >
            {selectedOption.count}
          </span>
        )}

        <ChevronDown 
          size={12} 
          style={{ 
            opacity: 0.7, 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform var(--duration-fast) ease',
            flexShrink: 0,
            marginLeft: 'auto'
          }} 
        />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div
          className="glass-panel animate-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            [align]: 0,
            zIndex: 150,
            minWidth: '220px',
            maxWidth: '320px',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--color-border-default)',
            backgroundColor: 'var(--color-bg-surface)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '6px'
          }}
        >
          {/* Search Box if needed */}
          {showSearch && (
            <div style={{ padding: '2px 2px 6px', borderBottom: '1px solid var(--color-border-subtle)', marginBottom: '4px' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={13} style={{ position: 'absolute', left: '8px', color: 'var(--color-text-tertiary)' }} />
                <input
                  type="text"
                  placeholder="Search options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '5px 8px 5px 26px',
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
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {filteredOptions.map((opt) => {
              const isSelected = (value === null && opt.value === '') || value === opt.value;
              return (
                <button
                  key={opt.value || '__all'}
                  type="button"
                  onClick={() => {
                    onChange(opt.value === '' ? null : opt.value);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                    border: isSelected ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid transparent',
                    color: isSelected ? 'var(--color-brand-primary)' : 'var(--color-text-primary)',
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 600 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color var(--duration-fast) ease',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
                    {opt.icon && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, color: opt.color || 'inherit' }}>
                        {opt.icon}
                      </span>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {opt.label}
                      </span>
                      {opt.sublabel && (
                        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {opt.count !== undefined && (
                      <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                        {opt.count}
                      </span>
                    )}
                    {isSelected && <Check size={13} color="var(--color-brand-primary)" />}
                  </div>
                </button>
              );
            })}

            {filteredOptions.length === 0 && (
              <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                No options match "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
