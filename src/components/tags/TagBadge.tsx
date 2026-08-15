import React from 'react';
import type { Tag } from '../../stores/useDashboardStore';

interface TagBadgeProps {
  tag: Tag;
  size?: 'sm' | 'md';
}

export const TagBadge: React.FC<TagBadgeProps> = ({ tag, size = 'md' }) => {
  const isSm = size === 'sm';
  const label = tag.action ? `[${tag.action}]` : (tag.raw || `[${tag.identifier}]`);
  const color = tag.color || '#3b82f6';
  
  return (
    <span
      title={tag.raw}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: isSm ? '2px 8px' : '3px 10px',
        borderRadius: 'var(--radius-md)',
        fontSize: isSm ? '0.6875rem' : '0.75rem',
        fontWeight: 600,
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}45`,
        fontFamily: 'var(--font-mono)'
      }}
    >
      {label}
    </span>
  );
};
