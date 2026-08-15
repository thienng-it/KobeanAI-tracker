import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface TrendData {
  date: string;
  tokens: number;
  cost: number;
}

interface TrendsChartProps {
  data: TrendData[];
}

export const TrendsChart: React.FC<TrendsChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="glass-panel" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>No trend data available.</p>
      </div>
    );
  }

  // Formatting date for XAxis
  const formatXAxis = (tickItem: string) => {
    const d = new Date(tickItem);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ height: '350px', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
      <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.01em' }}>Token & Cost Trends</h3>
      <ResponsiveContainer width="100%" height="88%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" opacity={0.6} />
          <XAxis dataKey="date" tickFormatter={formatXAxis} stroke="var(--color-text-tertiary)" fontSize={12} />
          <YAxis yAxisId="left" stroke="var(--color-brand-primary)" fontSize={12} />
          <YAxis yAxisId="right" orientation="right" stroke="var(--color-status-warning-text)" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--color-bg-surface)', 
              borderColor: 'var(--color-border-subtle)', 
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)'
            }}
            itemStyle={{ color: 'var(--color-text-primary)', fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ paddingTop: '8px', fontSize: '12px' }} />
          <Line yAxisId="left" type="monotone" dataKey="tokens" name="Tokens" stroke="var(--color-brand-primary)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
          <Line yAxisId="right" type="monotone" dataKey="cost" name="Cost ($)" stroke="var(--color-status-warning-text)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
