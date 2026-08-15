export interface ModelInfo {
  id: string;
  name: string;
  provider: 'Google' | 'Anthropic' | 'OpenAI' | 'DeepSeek' | 'Meta' | 'Mistral' | 'Local' | 'Custom';
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  thinkingPricePerMillion?: number;
  contextWindow: number;
  supportsThinking: boolean;
  color: string;
  badgeBg: string;
}

export const KNOWN_MODELS: Record<string, ModelInfo> = {
  // Google Gemini Models
  'gemini-3.1-pro': {
    id: 'gemini-3.1-pro',
    name: 'Gemini 3.1 Pro',
    provider: 'Google',
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 5.00,
    thinkingPricePerMillion: 5.00,
    contextWindow: 2000000,
    supportsThinking: true,
    color: '#3b82f6',
    badgeBg: 'rgba(59, 130, 246, 0.12)'
  },
  'gemini-3.1-pro-thinking': {
    id: 'gemini-3.1-pro-thinking',
    name: 'Gemini 3.1 Pro (Thinking)',
    provider: 'Google',
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 5.00,
    thinkingPricePerMillion: 5.00,
    contextWindow: 2000000,
    supportsThinking: true,
    color: '#3b82f6',
    badgeBg: 'rgba(59, 130, 246, 0.15)'
  },
  'gemini-3.7-flash': {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    provider: 'Google',
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.60,
    thinkingPricePerMillion: 0.60,
    contextWindow: 1000000,
    supportsThinking: true,
    color: '#2563eb',
    badgeBg: 'rgba(37, 99, 235, 0.12)'
  },
  'gemini-3.7-flash-thinking': {
    id: 'gemini-3.7-flash-thinking',
    name: 'Gemini 3.7 Flash (Thinking)',
    provider: 'Google',
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.60,
    thinkingPricePerMillion: 0.60,
    contextWindow: 1000000,
    supportsThinking: true,
    color: '#6366f1',
    badgeBg: 'rgba(99, 102, 241, 0.15)'
  },
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    inputPricePerMillion: 0.10,
    outputPricePerMillion: 0.40,
    contextWindow: 1000000,
    supportsThinking: true,
    color: '#0284c7',
    badgeBg: 'rgba(2, 132, 199, 0.12)'
  },
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 5.00,
    contextWindow: 2000000,
    supportsThinking: false,
    color: '#4f46e5',
    badgeBg: 'rgba(79, 70, 229, 0.12)'
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    inputPricePerMillion: 0.075,
    outputPricePerMillion: 0.30,
    contextWindow: 1000000,
    supportsThinking: false,
    color: '#0ea5e9',
    badgeBg: 'rgba(14, 165, 233, 0.12)'
  },

  // Anthropic Claude Models
  'claude-3-7-sonnet': {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 15.00,
    thinkingPricePerMillion: 15.00,
    contextWindow: 200000,
    supportsThinking: true,
    color: '#d97757',
    badgeBg: 'rgba(217, 119, 87, 0.12)'
  },
  'claude-3-5-sonnet': {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 15.00,
    contextWindow: 200000,
    supportsThinking: false,
    color: '#ea580c',
    badgeBg: 'rgba(234, 88, 12, 0.12)'
  },
  'claude-3-5-haiku': {
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    inputPricePerMillion: 0.80,
    outputPricePerMillion: 4.00,
    contextWindow: 200000,
    supportsThinking: false,
    color: '#f97316',
    badgeBg: 'rgba(249, 115, 22, 0.12)'
  },
  'claude-3-opus': {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    inputPricePerMillion: 15.00,
    outputPricePerMillion: 75.00,
    contextWindow: 200000,
    supportsThinking: false,
    color: '#c2410c',
    badgeBg: 'rgba(194, 65, 12, 0.12)'
  },

  // OpenAI Models
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    inputPricePerMillion: 2.50,
    outputPricePerMillion: 10.00,
    contextWindow: 128000,
    supportsThinking: false,
    color: '#10a37f',
    badgeBg: 'rgba(16, 163, 127, 0.12)'
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.60,
    contextWindow: 128000,
    supportsThinking: false,
    color: '#059669',
    badgeBg: 'rgba(5, 150, 105, 0.12)'
  },
  'o1': {
    id: 'o1',
    name: 'OpenAI o1',
    provider: 'OpenAI',
    inputPricePerMillion: 15.00,
    outputPricePerMillion: 60.00,
    thinkingPricePerMillion: 60.00,
    contextWindow: 200000,
    supportsThinking: true,
    color: '#047857',
    badgeBg: 'rgba(4, 120, 87, 0.15)'
  },
  'o3-mini': {
    id: 'o3-mini',
    name: 'OpenAI o3-mini',
    provider: 'OpenAI',
    inputPricePerMillion: 1.10,
    outputPricePerMillion: 4.40,
    thinkingPricePerMillion: 4.40,
    contextWindow: 200000,
    supportsThinking: true,
    color: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.15)'
  },
  'o1-mini': {
    id: 'o1-mini',
    name: 'OpenAI o1-mini',
    provider: 'OpenAI',
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 12.00,
    thinkingPricePerMillion: 12.00,
    contextWindow: 128000,
    supportsThinking: true,
    color: '#34d399',
    badgeBg: 'rgba(52, 211, 153, 0.12)'
  },

  // DeepSeek & Open Source Models
  'deepseek-r1': {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    inputPricePerMillion: 0.55,
    outputPricePerMillion: 2.19,
    thinkingPricePerMillion: 2.19,
    contextWindow: 64000,
    supportsThinking: true,
    color: '#06b6d4',
    badgeBg: 'rgba(6, 182, 212, 0.15)'
  },
  'deepseek-v3': {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    inputPricePerMillion: 0.14,
    outputPricePerMillion: 0.28,
    contextWindow: 64000,
    supportsThinking: false,
    color: '#0891b2',
    badgeBg: 'rgba(8, 145, 178, 0.12)'
  },
  'qwen-2.5-coder': {
    id: 'qwen-2.5-coder',
    name: 'Qwen 2.5 Coder 32B',
    provider: 'Custom',
    inputPricePerMillion: 0.20,
    outputPricePerMillion: 0.60,
    contextWindow: 128000,
    supportsThinking: false,
    color: '#8b5cf6',
    badgeBg: 'rgba(139, 92, 246, 0.12)'
  },
  'llama-3.3-70b': {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    provider: 'Meta',
    inputPricePerMillion: 0.50,
    outputPricePerMillion: 1.50,
    contextWindow: 128000,
    supportsThinking: false,
    color: '#ec4899',
    badgeBg: 'rgba(236, 72, 153, 0.12)'
  },
  'ollama-local': {
    id: 'ollama-local',
    name: 'Local Ollama Model',
    provider: 'Local',
    inputPricePerMillion: 0.00,
    outputPricePerMillion: 0.00,
    contextWindow: 32000,
    supportsThinking: false,
    color: '#94a3b8',
    badgeBg: 'rgba(148, 163, 184, 0.12)'
  }
};

export class ModelRegistry {
  /**
   * Intelligently resolves any model name or prompt hint into normalized ModelInfo.
   */
  public static resolve(rawNameOrHint?: string): ModelInfo {
    if (!rawNameOrHint) {
      return KNOWN_MODELS['gemini-3.7-flash'];
    }

    const clean = rawNameOrHint.toLowerCase().trim();

    // Exact lookup
    if (KNOWN_MODELS[clean]) {
      return KNOWN_MODELS[clean];
    }

    // Heuristic & Pattern matching
    // Gemini 3.1 Pro
    if (clean.includes('3.1') && (clean.includes('pro') || clean.includes('gemini'))) {
      return KNOWN_MODELS['gemini-3.1-pro'];
    }

    // Gemini 3.7 Flash
    if (clean.includes('3.7') && clean.includes('flash')) {
      return KNOWN_MODELS['gemini-3.7-flash'];
    }

    // Gemini 2.0 Flash
    if (clean.includes('2.0') && clean.includes('flash')) {
      return KNOWN_MODELS['gemini-2.0-flash'];
    }

    // Gemini 1.5 Pro
    if (clean.includes('1.5') && clean.includes('pro')) {
      return KNOWN_MODELS['gemini-1.5-pro'];
    }

    // Gemini 1.5 Flash
    if (clean.includes('1.5') && clean.includes('flash')) {
      return KNOWN_MODELS['gemini-1.5-flash'];
    }

    // Claude 3.7 Sonnet
    if (clean.includes('3.7') && clean.includes('sonnet') || clean.includes('claude-3-7')) {
      return KNOWN_MODELS['claude-3-7-sonnet'];
    }

    // Claude 3.5 Sonnet
    if (clean.includes('3.5') && clean.includes('sonnet') || clean.includes('claude-3-5')) {
      return KNOWN_MODELS['claude-3-5-sonnet'];
    }

    // Claude 3.5 Haiku
    if (clean.includes('haiku')) {
      return KNOWN_MODELS['claude-3-5-haiku'];
    }

    // Claude 3 Opus
    if (clean.includes('opus')) {
      return KNOWN_MODELS['claude-3-opus'];
    }

    // OpenAI o3-mini
    if (clean.includes('o3-mini') || clean.includes('o3')) {
      return KNOWN_MODELS['o3-mini'];
    }

    // OpenAI o1
    if (clean === 'o1' || clean.includes('o1-preview') || (clean.includes('o1') && !clean.includes('mini'))) {
      return KNOWN_MODELS['o1'];
    }

    // OpenAI o1-mini
    if (clean.includes('o1-mini')) {
      return KNOWN_MODELS['o1-mini'];
    }

    // GPT-4o Mini
    if (clean.includes('4o-mini') || clean.includes('gpt-4o-mini')) {
      return KNOWN_MODELS['gpt-4o-mini'];
    }

    // GPT-4o
    if (clean.includes('4o') || clean.includes('gpt-4o')) {
      return KNOWN_MODELS['gpt-4o'];
    }

    // DeepSeek R1
    if (clean.includes('deepseek-r1') || clean.includes('r1') || clean.includes('reasoner')) {
      return KNOWN_MODELS['deepseek-r1'];
    }

    // DeepSeek V3
    if (clean.includes('deepseek-v3') || clean.includes('deepseek-chat')) {
      return KNOWN_MODELS['deepseek-v3'];
    }

    // Qwen Coder
    if (clean.includes('qwen')) {
      return KNOWN_MODELS['qwen-2.5-coder'];
    }

    // Llama
    if (clean.includes('llama')) {
      return KNOWN_MODELS['llama-3.3-70b'];
    }

    // Local Ollama
    if (clean.includes('ollama') || clean.includes('local') || clean.includes('localhost')) {
      return KNOWN_MODELS['ollama-local'];
    }

    // General fallback for unspecified custom models
    return {
      id: clean.replace(/[^a-z0-9\-_.]/g, '-'),
      name: clean.toUpperCase(),
      provider: 'Custom',
      inputPricePerMillion: 0.15,
      outputPricePerMillion: 0.60,
      contextWindow: 128000,
      supportsThinking: clean.includes('think') || clean.includes('reason'),
      color: '#a855f7',
      badgeBg: 'rgba(168, 85, 247, 0.12)'
    };
  }

  /**
   * Calculates accurate cost in USD for given token usages.
   */
  public static calculateCost(
    modelId: string, 
    inputTokens: number, 
    outputTokens: number, 
    thinkingTokens: number = 0,
    customInputPrice?: number,
    customOutputPrice?: number
  ): number {
    const info = this.resolve(modelId);
    const inRate = customInputPrice !== undefined ? customInputPrice : info.inputPricePerMillion;
    const outRate = customOutputPrice !== undefined ? customOutputPrice : info.outputPricePerMillion;
    const thinkRate = info.thinkingPricePerMillion || outRate;

    // Normal output tokens (excluding thinking tokens)
    const normalOutputTokens = Math.max(0, outputTokens - thinkingTokens);

    const inputCost = (inputTokens / 1_000_000) * inRate;
    const outputCost = (normalOutputTokens / 1_000_000) * outRate;
    const thinkingCost = (thinkingTokens / 1_000_000) * thinkRate;

    const total = inputCost + outputCost + thinkingCost;
    return Number(total.toFixed(5));
  }
}
