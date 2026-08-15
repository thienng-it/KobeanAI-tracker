import React from 'react';
import { Sparkles, Bot, Cpu, Zap, Flame } from 'lucide-react';

interface ModelBadgeProps {
  model: string;
  modelName?: string;
  provider?: string;
  modelColor?: string;
  modelBg?: string;
  size?: 'sm' | 'md';
}

export const ModelBadge: React.FC<ModelBadgeProps> = ({
  model,
  modelName,
  provider,
  modelColor,
  modelBg,
  size = 'md'
}) => {
  const isSm = size === 'sm';
  const cleanModel = (model || '').toLowerCase();
  
  // Format clean display name if not explicitly provided
  let displayName = modelName || model;
  if (!modelName) {
    if (cleanModel.includes('3.1') && cleanModel.includes('pro')) displayName = 'Gemini 3.1 Pro';
    else if (cleanModel.includes('3.7') && cleanModel.includes('flash')) displayName = 'Gemini 3.7 Flash';
    else if (cleanModel.includes('2.0') && cleanModel.includes('flash')) displayName = 'Gemini 2.0 Flash';
    else if (cleanModel.includes('1.5') && cleanModel.includes('pro')) displayName = 'Gemini 1.5 Pro';
    else if (cleanModel.includes('claude-3-7') || (cleanModel.includes('claude') && cleanModel.includes('3.7'))) displayName = 'Claude 3.7 Sonnet';
    else if (cleanModel.includes('claude-3-5') || (cleanModel.includes('claude') && cleanModel.includes('3.5'))) displayName = 'Claude 3.5 Sonnet';
    else if (cleanModel.includes('gpt-4o')) displayName = 'GPT-4o';
    else if (cleanModel.includes('o3-mini')) displayName = 'OpenAI o3-mini';
    else if (cleanModel.includes('o1')) displayName = 'OpenAI o1';
    else if (cleanModel.includes('deepseek-r1') || cleanModel.includes('r1')) displayName = 'DeepSeek R1';
  }

  // Determine provider color and background
  let color = modelColor || '#3b82f6';
  let bg = modelBg || 'rgba(59, 130, 246, 0.12)';
  let Icon = Sparkles;

  if (cleanModel.includes('claude') || provider === 'Anthropic') {
    color = '#d97757';
    bg = 'rgba(217, 119, 87, 0.12)';
    Icon = Bot;
  } else if (cleanModel.includes('gpt') || cleanModel.includes('o1') || cleanModel.includes('o3') || provider === 'OpenAI') {
    color = '#10a37f';
    bg = 'rgba(16, 163, 127, 0.12)';
    Icon = Zap;
  } else if (cleanModel.includes('deepseek') || provider === 'DeepSeek') {
    color = '#06b6d4';
    bg = 'rgba(6, 182, 212, 0.12)';
    Icon = Flame;
  } else if (cleanModel.includes('gemini') || provider === 'Google') {
    color = '#3b82f6';
    bg = 'rgba(59, 130, 246, 0.12)';
    Icon = Sparkles;
  } else {
    color = '#8b5cf6';
    bg = 'rgba(139, 92, 246, 0.12)';
    Icon = Cpu;
  }

  return (
    <span
      title={`Model: ${displayName} (${model})`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: isSm ? '2px 6px' : '3px 8px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${color}35`,
        fontSize: isSm ? '0.6875rem' : '0.75rem',
        fontWeight: 600,
        fontFamily: 'var(--font-mono)'
      }}
    >
      <Icon size={isSm ? 10 : 12} />
      <span>{displayName}</span>
    </span>
  );
};
