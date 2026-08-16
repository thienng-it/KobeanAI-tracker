import React from 'react';
import { IntentDistributionData } from '../../stores/useDashboardStore';
import { Tag, Sparkles } from 'lucide-react';

interface IntentDistributionChartProps {
  data: IntentDistributionData[];
}

export const IntentDistributionChart: React.FC<IntentDistributionChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div 
        className="glass-panel" 
        style={{ 
          height: '370px', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)'
        }}
      >
        <Tag size={24} style={{ color: 'var(--color-text-tertiary)', marginBottom: '8px', opacity: 0.5 }} />
        <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>No task intent data available.</p>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
          Intent tags will appear as turns execute
        </span>
      </div>
    );
  }

  // Format token counts compactly
  const formatTokens = (tokens: number) => {
    if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
    if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}k`;
    return tokens.toLocaleString();
  };

  const totalTurns = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div 
      className="glass-panel animate-slide-up" 
      style={{ 
        height: '370px', 
        padding: 'var(--space-6)', 
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--color-brand-primary)" />
            Task Intent & Workload
          </h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
            Engineering effort by canonical activity ({totalTurns} total classified turns)
          </p>
        </div>
      </div>

      <div 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          paddingRight: '4px'
        }}
      >
        {data.slice(0, 7).map((item, index) => {
          const barWidth = Math.max(item.percentage, 4);
          const tagColor = item.color || '#3b82f6';

          return (
            <div 
              key={item.id || item.name || index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              {/* Intent Label Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      color: tagColor,
                      backgroundColor: `${tagColor}18`,
                      border: `1px solid ${tagColor}40`,
                      padding: '1px 8px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    {item.tag || `[${item.name}]`}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                    {formatTokens(item.totalTokens)} tok • ${item.totalCost.toFixed(3)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {item.count} {item.count === 1 ? 'turn' : 'turns'}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', minWidth: '38px', textAlign: 'right' }}>
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div 
                style={{ 
                  height: '8px', 
                  width: '100%', 
                  backgroundColor: 'rgba(255, 255, 255, 0.06)', 
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${barWidth}%`, 
                    background: `linear-gradient(90deg, ${tagColor}, ${tagColor}cc)`, 
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: `0 0 8px ${tagColor}44`
                  }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
