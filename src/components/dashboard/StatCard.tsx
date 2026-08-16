import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  subDetail?: string;
  badge?: {
    text: string;
    color?: string;
    bg?: string;
  };
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  description, 
  subDetail,
  badge,
  trend 
}) => {
  return (
    <div className="glass-panel interactive-card animate-slide-up" style={{
      padding: 'var(--space-6)',
      borderRadius: 'var(--radius-xl)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="text-sm" style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          {title}
        </span>
        {icon && (
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-surface-hover)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-brand-primary)',
            transition: 'transform var(--duration-fast) var(--ease-spring-snappy)'
          }}>
            {icon}
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
        <span className="text-3xl" style={{ fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
          {value}
        </span>
        {badge && (
          <span style={{
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            color: badge.color || 'var(--color-brand-primary)',
            backgroundColor: badge.bg || 'rgba(59, 130, 246, 0.12)',
            border: `1px solid ${badge.color ? `${badge.color}33` : 'rgba(59, 130, 246, 0.25)'}`
          }}>
            {badge.text}
          </span>
        )}
      </div>

      {subDetail && (
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
          {subDetail}
        </div>
      )}
      
      {(description || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'auto', paddingTop: 'var(--space-3)' }}>
          {trend && (
            <span className="text-xs" style={{ 
              color: trend.isPositive ? 'var(--color-status-success-text)' : 'var(--color-status-error-text)',
              backgroundColor: trend.isPositive ? 'var(--color-status-success-bg)' : 'var(--color-status-error-bg)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center'
            }}>
              {trend.isPositive ? '↑ +' : '↓ -'}{Math.abs(trend.value)}%
            </span>
          )}
          {description && (
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

