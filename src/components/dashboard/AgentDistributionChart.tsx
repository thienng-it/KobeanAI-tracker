import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AgentDistributionData {
  name: string;
  value: number;
}

interface AgentDistributionChartProps {
  data: AgentDistributionData[];
}

const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444'];

export const AgentDistributionChart: React.FC<AgentDistributionChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="glass-panel" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>No agent data available.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel animate-slide-up" style={{ height: '350px', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
      <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.01em' }}>Sessions by Agent</h3>
      <ResponsiveContainer width="100%" height="88%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--color-bg-surface)', 
              borderColor: 'var(--color-border-subtle)', 
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)'
            }}
            itemStyle={{ color: 'var(--color-text-primary)', fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
