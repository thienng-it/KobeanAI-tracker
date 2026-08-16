import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendData } from '../../stores/useDashboardStore';
import { Layers, Coins, Gauge } from 'lucide-react';

interface TrendsChartProps {
  data: TrendData[];
}

type ViewMode = 'tokens' | 'cost' | 'latency';

export const TrendsChart: React.FC<TrendsChartProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('tokens');

  if (!data || data.length === 0) {
    return (
      <div className="glass-panel" style={{ height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-xl)' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>No telemetry trend data available.</p>
      </div>
    );
  }

  // Formatting date for XAxis
  const formatXAxis = (tickItem: string) => {
    if (!tickItem) return '';
    if (tickItem.includes(':')) {
      return tickItem;
    }
    const d = new Date(tickItem.includes('T') ? tickItem : `${tickItem}T00:00:00`);
    if (isNaN(d.getTime())) {
      return tickItem;
    }
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // Compact number formatter for large token counts
  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
    return num.toLocaleString();
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ height: '370px', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column' }}>
      {/* Header with Title and Mode Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {viewMode === 'tokens' && <Layers size={18} color="var(--color-brand-primary)" />}
            {viewMode === 'cost' && <Coins size={18} color="var(--color-status-warning-text)" />}
            {viewMode === 'latency' && <Gauge size={18} color="#8b5cf6" />}
            {viewMode === 'tokens' && 'Token Dynamics (Input Context vs Output)'}
            {viewMode === 'cost' && 'Cost Expenditure Trend'}
            {viewMode === 'latency' && 'Turnaround Latency & Tool Call Velocity'}
          </h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
            {viewMode === 'tokens' && 'Stacked breakdown of prompt context vs generated reasoning tokens'}
            {viewMode === 'cost' && 'Estimated USD expenditure over selected time intervals'}
            {viewMode === 'latency' && 'Average response time (seconds) and tool executions per turn'}
          </p>
        </div>

        {/* View Mode Segmented Controls */}
        <div style={{
          display: 'inline-flex',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          padding: '2px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-subtle)'
        }}>
          <button
            onClick={() => setViewMode('tokens')}
            style={{
              background: viewMode === 'tokens' ? 'var(--color-bg-surface)' : 'transparent',
              color: viewMode === 'tokens' ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
              boxShadow: viewMode === 'tokens' ? 'var(--shadow-sm)' : 'none',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all var(--duration-fast) var(--ease-spring-snappy)'
            }}
          >
            <Layers size={13} /> Tokens
          </button>
          <button
            onClick={() => setViewMode('cost')}
            style={{
              background: viewMode === 'cost' ? 'var(--color-bg-surface)' : 'transparent',
              color: viewMode === 'cost' ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
              boxShadow: viewMode === 'cost' ? 'var(--shadow-sm)' : 'none',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all var(--duration-fast) var(--ease-spring-snappy)'
            }}
          >
            <Coins size={13} /> Cost
          </button>
          <button
            onClick={() => setViewMode('latency')}
            style={{
              background: viewMode === 'latency' ? 'var(--color-bg-surface)' : 'transparent',
              color: viewMode === 'latency' ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
              boxShadow: viewMode === 'latency' ? 'var(--shadow-sm)' : 'none',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all var(--duration-fast) var(--ease-spring-snappy)'
            }}
          >
            <Gauge size={13} /> Speed
          </button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'tokens' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="inputTokensGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="outputTokensGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" opacity={0.4} vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatXAxis} stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tickFormatter={formatNumber} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-bg-surface)', 
                  borderColor: 'var(--color-border-subtle)', 
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  fontSize: '12px'
                }}
                formatter={(value: any, name: any) => {
                  const num = Number(value) || 0;
                  return [`${num.toLocaleString()} tokens`, name];
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '4px', fontSize: '12px' }} />
              <Area 
                type="monotone" 
                dataKey="inputTokens" 
                stackId="1" 
                name="Input Context Tokens" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#inputTokensGrad)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="outputTokens" 
                stackId="1" 
                name="Output Generation Tokens" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#outputTokensGrad)" 
                strokeWidth={2}
              />
            </AreaChart>
          ) : viewMode === 'cost' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" opacity={0.4} vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatXAxis} stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tickFormatter={(v) => `$${Number(v).toFixed(2)}`} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-bg-surface)', 
                  borderColor: 'var(--color-border-subtle)', 
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  fontSize: '12px'
                }}
                formatter={(value: any) => [`$${Number(value).toFixed(4)}`, 'Estimated Cost']}
              />
              <Legend wrapperStyle={{ paddingTop: '4px', fontSize: '12px' }} />
              <Area 
                type="monotone" 
                dataKey="cost" 
                name="Estimated Cost ($)" 
                stroke="#f59e0b" 
                fillOpacity={1} 
                fill="url(#costGrad)" 
                strokeWidth={2.5}
              />
            </AreaChart>
          ) : (
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" opacity={0.4} vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatXAxis} stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" stroke="#8b5cf6" fontSize={11} tickFormatter={(v) => `${v}s`} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#ec4899" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-bg-surface)', 
                  borderColor: 'var(--color-border-subtle)', 
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  fontSize: '12px'
                }}
                formatter={(value: any, name: any) => {
                  if (name === 'Avg Latency (s)') return [`${value}s`, name];
                  return [`${value} calls`, name];
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '4px', fontSize: '12px' }} />
              <Bar 
                yAxisId="right" 
                dataKey="toolCalls" 
                name="Tool Calls" 
                fill="#ec4899" 
                opacity={0.45} 
                radius={[4, 4, 0, 0]} 
                maxBarSize={30}
              />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="avgDurationSec" 
                name="Avg Latency (s)" 
                stroke="#8b5cf6" 
                strokeWidth={2.5} 
                dot={{ r: 3 }} 
                activeDot={{ r: 6 }} 
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

