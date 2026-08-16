import React from 'react';
import { Command } from 'lucide-react';

interface CommandBadgeProps {
  command?: string | null;
  size?: 'xs' | 'sm' | 'md';
  maxWidth?: string | number;
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const CommandBadge: React.FC<CommandBadgeProps> = ({
  command,
  size = 'sm',
  maxWidth = '160px',
  interactive = false,
  className = '',
  style = {}
}) => {
  const hasCommand = Boolean(command && command.trim() && command.toLowerCase() !== 'none');
  const displayCommand = hasCommand ? command!.trim() : 'None';

  const isXs = size === 'xs';
  const isSm = size === 'sm';

  const padding = isXs ? '1px 5px' : isSm ? '2px 7px' : '3px 9px';
  const fontSize = isXs ? '0.625rem' : isSm ? '0.6875rem' : '0.75rem';
  const iconSize = isXs ? 9 : isSm ? 11 : 12;

  if (!hasCommand) {
    return (
      <span
        title="No trigger command assigned"
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          padding,
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--color-bg-surface-active)',
          border: '1px solid var(--color-border-subtle)',
          color: 'var(--color-text-tertiary)',
          fontSize,
          fontWeight: 500,
          fontFamily: 'var(--font-mono)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          userSelect: 'none',
          ...style
        }}
      >
        <span style={{ opacity: 0.7 }}>/</span>
        <span>None</span>
      </span>
    );
  }

  return (
    <span
      title={`Trigger Command: ${displayCommand}`}
      className={`${interactive ? 'interactive-card' : ''} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding,
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'rgba(59, 130, 246, 0.09)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        color: 'var(--color-brand-primary)',
        fontSize,
        fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth,
        minWidth: 0,
        flexShrink: 1,
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        transition: 'all var(--duration-fast) ease',
        ...style
      }}
    >
      <Command size={iconSize} style={{ flexShrink: 0, opacity: 0.85 }} />
      <span 
        style={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap', 
          minWidth: 0 
        }}
      >
        {displayCommand}
      </span>
    </span>
  );
};
