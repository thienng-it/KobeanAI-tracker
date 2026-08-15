import React from 'react';
import type { Tag } from '../../stores/useDashboardStore';

interface TagBadgeProps {
  tag: Tag;
  size?: 'sm' | 'md';
}

export const TagBadge: React.FC<TagBadgeProps> = ({ tag, size = 'md' }) => {
  const isSm = size === 'sm';
  
  return (
    <span
      title={tag.raw}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: isSm ? '2px 6px' : '4px 10px',
        borderRadius: 'var(--radius-sm)',
        fontSize: isSm ? 'var(--text-xs)' : 'var(--text-sm)',
        fontWeight: 500,
        backgroundColor: tag.color || 'var(--color-bg-surface-hover)',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-border-subtle)',
        fontFamily: 'var(--font-mono)'
      }}
    >
      <span style={{ opacity: 0.7, marginRight: '4px' }}>[{tag.prefix}-{tag.identifier}]</span>
      <span>{tag.action}</span>
    </span>
  );
};
