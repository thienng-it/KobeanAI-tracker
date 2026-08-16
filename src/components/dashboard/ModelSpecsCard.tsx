import React from 'react';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { 
  Sparkles, 
  Bot, 
  Zap, 
  Flame, 
  Cpu, 
  Maximize2, 
  X,
  Gauge
} from 'lucide-react';

export const ModelSpecsCard: React.FC = () => {
  const { modelSpecsData, selectedModel, setSelectedModel, dateRange } = useDashboardStore();

  if (!modelSpecsData || selectedModel === 'all') {
    return null;
  }

  const { specs, statistics } = modelSpecsData;

  const getProviderIcon = (provider: string) => {
    const p = (provider || '').toLowerCase();
    if (p.includes('anthropic')) return <Bot size={18} />;
    if (p.includes('openai')) return <Zap size={18} />;
    if (p.includes('deepseek')) return <Flame size={18} />;
    if (p.includes('google')) return <Sparkles size={18} />;
    return <Cpu size={18} />;
  };

  const getProviderColor = (provider: string) => {
    const p = (provider || '').toLowerCase();
    if (p.includes('anthropic')) return '#ea580c';
    if (p.includes('openai')) return '#10b981';
    if (p.includes('deepseek')) return '#06b6d4';
    if (p.includes('google')) return '#3b82f6';
    return '#8b5cf6';
  };

  const providerColor = specs.color || getProviderColor(specs.provider);

  const formatTokens = (num: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
    return num.toLocaleString();
  };

  const totalInputTokens = statistics.inputTokens || 0;
  const totalOutputTokens = statistics.outputTokens || 0;
  const totalTokens = statistics.totalTokens || 1;
  const inputRatio = Math.min(100, Math.max(0, Math.round((totalInputTokens / totalTokens) * 100)));
  const outputRatio = 100 - inputRatio;

  const formatDuration = (ms: number) => {
    if (!ms || ms <= 0) return '<1s';
    if (ms < 1000) return `${ms}ms`;
    const sec = (ms / 1000).toFixed(1);
    return `${sec}s`;
  };

  return (
    <div 
      className="glass-panel animate-slide-up"
      style={{
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        marginBottom: 'var(--space-6)',
        border: `1px solid ${providerColor}40`,
        background: `linear-gradient(135deg, var(--color-bg-surface) 0%, ${providerColor}08 100%)`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative background glow */}
      <div 
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${providerColor}20 0%, transparent 70%)`,
          pointerEvents: 'none'
        }}
      />

      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div 
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: specs.badgeBg || `${providerColor}18`,
              border: `1px solid ${providerColor}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: providerColor
            }}
          >
            {getProviderIcon(specs.provider)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
                {specs.name}
              </h2>
              <span 
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-bg-surface-hover)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-secondary)'
                }}
              >
                {specs.id}
              </span>
              {specs.tier && (
                <span 
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: `${providerColor}15`,
                    color: providerColor,
                    border: `1px solid ${providerColor}30`
                  }}
                >
                  {specs.tier}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: '4px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              <span>Provider: <strong style={{ color: 'var(--color-text-primary)' }}>{specs.provider}</strong></span>
              <span>•</span>
              <span>Workload Share: <strong style={{ color: providerColor }}>{statistics.workloadSharePercentage}%</strong></span>
              {dateRange && (
                <>
                  <span>•</span>
                  <span>Range: <strong>{dateRange}</strong></span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Active Filter & Clear button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: `${providerColor}15`,
              border: `1px solid ${providerColor}35`,
              color: providerColor,
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: providerColor }} />
            <span>Active Model Filter</span>
          </div>

          <button
            onClick={() => setSelectedModel('all')}
            className="interactive-card"
            title="Clear model filter and return to all models view"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-surface-hover)',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <X size={13} />
            <span>Reset Filter</span>
          </button>
        </div>
      </div>

      {/* Model Description */}
      {specs.description && (
        <p style={{ margin: '0 0 var(--space-5) 0', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          {specs.description}
        </p>
      )}

      {/* Two Column Grid: Specifications vs. Model Telemetry Statistics */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-4)'
        }}
      >
        {/* Left Box: Model Hardware & Pricing Specs */}
        <div 
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-brand-primary)', fontWeight: 600, fontSize: '0.8125rem' }}>
            <Maximize2 size={14} />
            <span>Model Specifications & Pricing</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            {/* Context Window */}
            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Context Window
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                {formatTokens(specs.contextWindow)} tokens
              </div>
              {specs.maxOutputTokens && (
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', marginTop: '1px' }}>
                  Max output: {formatTokens(specs.maxOutputTokens)}
                </div>
              )}
            </div>

            {/* Input Pricing */}
            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Input Price / 1M
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                ${specs.inputPricePerMillion.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', marginTop: '1px' }}>
                Prompt tokens
              </div>
            </div>

            {/* Output Pricing */}
            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Output Price / 1M
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                ${specs.outputPricePerMillion.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', marginTop: '1px' }}>
                Completion tokens
              </div>
            </div>

            {/* Thinking / Reasoning Capability */}
            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Thinking / Reasoning
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: specs.supportsThinking ? '#a855f7' : 'var(--color-text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {specs.supportsThinking ? (
                  <>
                    <Flame size={13} />
                    <span>Adaptive Thinking</span>
                  </>
                ) : (
                  <span>Standard Execution</span>
                )}
              </div>
              {specs.thinkingPricePerMillion !== undefined && (
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', marginTop: '1px' }}>
                  ${specs.thinkingPricePerMillion.toFixed(2)} / 1M think tokens
                </div>
              )}
            </div>
          </div>

          {/* Supported Modalities */}
          {specs.modalities && specs.modalities.length > 0 && (
            <div style={{ paddingTop: 'var(--space-2)', borderTop: '1px dashed var(--color-border-subtle)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>Modalities:</span>
              {specs.modalities.map(mod => (
                <span
                  key={mod}
                  style={{
                    fontSize: '0.6875rem',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-bg-surface-hover)',
                    color: 'var(--color-text-secondary)',
                    fontWeight: 500
                  }}
                >
                  {mod}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right Box: Real Telemetry Statistics for this Model */}
        <div 
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-status-success-text)', fontWeight: 600, fontSize: '0.8125rem' }}>
              <Gauge size={14} />
              <span>Model Telemetry Statistics</span>
            </div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)' }}>
              {statistics.totalSessions} Recorded Sessions
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
            <div style={{ backgroundColor: 'var(--color-bg-surface-hover)', padding: '8px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>Total Tokens</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                {statistics.totalTokens.toLocaleString()}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--color-bg-surface-hover)', padding: '8px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>Total Cost</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-status-warning-text)', marginTop: '2px' }}>
                ${statistics.totalCost.toFixed(4)}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--color-bg-surface-hover)', padding: '8px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>Avg / Session</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                {formatTokens(statistics.avgTokensPerSession)} tok
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--color-text-secondary)' }}>
                ${statistics.avgCostPerSession.toFixed(4)}
              </div>
            </div>
          </div>

          {/* Token Breakdown Bar (Input vs Output) */}
          <div style={{ marginTop: 'auto', paddingTop: 'var(--space-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
              <span>Input: <strong>{totalInputTokens.toLocaleString()}</strong> ({inputRatio}%)</span>
              <span>Output: <strong>{totalOutputTokens.toLocaleString()}</strong> ({outputRatio}%)</span>
            </div>
            <div style={{ height: '6px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-bg-surface-hover)', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${inputRatio}%`, backgroundColor: providerColor, transition: 'width 0.4s ease' }} title={`Input Tokens: ${totalInputTokens.toLocaleString()}`} />
              <div style={{ width: `${outputRatio}%`, backgroundColor: '#ec4899', transition: 'width 0.4s ease' }} title={`Output Tokens: ${totalOutputTokens.toLocaleString()}`} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
              <span>Peak Session: {statistics.maxTokensSingleSession.toLocaleString()} tokens</span>
              <span>Avg Latency: {formatDuration(statistics.avgDurationMs)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
