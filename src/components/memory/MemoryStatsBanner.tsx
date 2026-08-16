import React from 'react';
import { useMemoryStore } from '../../stores/useMemoryStore';
import { Brain, Pin, Zap, Layers } from 'lucide-react';

export const MemoryStatsBanner: React.FC = () => {
  const { stats, memories } = useMemoryStore();

  if (!stats) return null;

  const totalMemories = stats.totalMemories || memories.length;
  const pinnedCount = stats.pinnedCount || memories.filter(m => m.pinned).length;
  const totalTokens = stats.totalTokens || 0;
  const budgetLimit = stats.budgetLimit || 16000;
  const utilization = stats.budgetUtilizationPercent || Math.min(100, Number(((totalTokens / budgetLimit) * 100).toFixed(1)));

  // Color for budget bar
  const budgetColor = utilization > 80 ? '#ef4444' : utilization > 50 ? '#f59e0b' : '#10b981';

  return (
    <div 
      className="glass-panel animate-slide-up"
      style={{
        padding: 'var(--space-6)',
        borderRadius: 'var(--radius-xl)',
        marginBottom: 'var(--space-6)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--space-6)',
        alignItems: 'center'
      }}
    >
      {/* 1. Total Active Memories */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div 
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-brand-primary)',
            flexShrink: 0
          }}
        >
          <Brain size={24} />
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Total Memories
          </span>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
            {totalMemories}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            Knowledge Bank facts
          </span>
        </div>
      </div>

      {/* 2. Pinned Always-Injected Memories */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div 
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'rgba(236, 72, 153, 0.12)',
            border: '1px solid rgba(236, 72, 153, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ec4899',
            flexShrink: 0
          }}
        >
          <Pin size={24} />
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Pinned Directives
          </span>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ec4899', lineHeight: 1.2 }}>
            {pinnedCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            Always in agent context
          </span>
        </div>
      </div>

      {/* 3. Context Window Token Budget */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={13} color={budgetColor} />
            Context Memory Budget
          </span>
          <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {totalTokens.toLocaleString()} / {budgetLimit.toLocaleString()} tok ({utilization}%)
          </span>
        </div>

        {/* Progress bar */}
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
              width: `${Math.max(utilization, 2)}%`, 
              background: `linear-gradient(90deg, ${budgetColor}, ${budgetColor}cc)`, 
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: `0 0 10px ${budgetColor}55`
            }} 
          />
        </div>
        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)' }}>
          {utilization < 50 ? 'Optimal context budget headroom' : utilization < 80 ? 'Moderate context load' : 'High context load - consider unpinning'}
        </span>
      </div>

      {/* 4. Category Diversity Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Layers size={13} color="#8b5cf6" />
          Categories Distribution
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {Object.entries(stats.categories || {}).slice(0, 4).map(([cat, count]) => (
            <span
              key={cat}
              style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{ textTransform: 'capitalize' }}>{cat}</span>: <strong>{count}</strong>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
