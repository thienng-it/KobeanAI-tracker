import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description, trend }) => {
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
      
      <div className="text-3xl" style={{ marginTop: 'var(--space-2)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
        {value}
      </div>
      
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
