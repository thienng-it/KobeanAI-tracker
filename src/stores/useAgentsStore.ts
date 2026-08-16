import { create } from 'zustand';
import { api } from '../lib/api';
import type { Agent } from './useSkillsStore';

export interface AgentConfig {
  authType?: 'api_key' | 'local_log';
  apiKey?: string;
  logPath?: string;
  [key: string]: any;
}

export interface DetailedAgent extends Agent {
  config: string | AgentConfig | null;
}

export interface ProviderKeyInfo {
  isConfigured: boolean;
  maskedKey: string;
  source: 'db' | 'env' | 'none';
}

export interface ProviderKeysState {
  gemini: ProviderKeyInfo;
  claude: ProviderKeyInfo;
  openai: ProviderKeyInfo;
  openrouter: ProviderKeyInfo;
}

interface AgentsState {
  agents: DetailedAgent[];
  providerKeys: ProviderKeysState;
  isLoading: boolean;
  error: string | null;
  
  fetchAgents: () => Promise<void>;
  fetchProviderKeys: () => Promise<void>;
  saveProviderKey: (provider: string, apiKey: string) => Promise<{ success: boolean; message?: string }>;
  testProviderKey: (provider: string, apiKey: string) => Promise<{ success: boolean; message?: string; error?: string; latencyMs?: number }>;
  createAgent: (agent: Partial<DetailedAgent>) => Promise<void>;
  updateAgent: (id: string, agent: Partial<DetailedAgent>) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  testConnection: (id: string, config: AgentConfig) => Promise<{ success: boolean; message?: string; error?: string; latencyMs?: number }>;
}

export const useAgentsStore = create<AgentsState>((set, get) => ({
  agents: [],
  providerKeys: {
    gemini: { isConfigured: false, maskedKey: '', source: 'none' },
    claude: { isConfigured: false, maskedKey: '', source: 'none' },
    openai: { isConfigured: false, maskedKey: '', source: 'none' },
    openrouter: { isConfigured: false, maskedKey: '', source: 'none' }
  },
  isLoading: false,
  error: null,

  fetchAgents: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<{ data: DetailedAgent[] }>('/agents');
      
      const parsedAgents = res.data.map(agent => {
        let parsedConfig = {};
        if (typeof agent.config === 'string') {
          try {
            parsedConfig = JSON.parse(agent.config);
          } catch (e) {
            console.error('Failed to parse agent config', e);
          }
        } else if (agent.config) {
          parsedConfig = agent.config;
        }
        return { ...agent, config: parsedConfig };
      });

      set({ agents: parsedAgents, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch agents:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  fetchProviderKeys: async () => {
    try {
      const res = await api.get<ProviderKeysState>('/agents/provider-keys');
      set({ providerKeys: res });
    } catch (err) {
      console.error('Failed to fetch provider keys:', err);
    }
  },

  saveProviderKey: async (provider, apiKey) => {
    try {
      const res = await api.post<{ success: boolean; message?: string }>('/agents/provider-keys', { provider, apiKey });
      await get().fetchProviderKeys();
      await get().fetchAgents();
      return res;
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to save API key' };
    }
  },

  testProviderKey: async (provider, apiKey) => {
    try {
      const res = await api.post<{ success: boolean; message?: string; error?: string; latencyMs?: number }>('/agents/test-provider-key', { provider, apiKey });
      return res;
    } catch (err: any) {
      return { success: false, error: err.message || 'Verification failed' };
    }
  },

  createAgent: async (agent) => {
    await api.post('/agents', agent);
    await get().fetchAgents();
  },

  updateAgent: async (id, agent) => {
    await api.put(`/agents/${id}`, agent);
    await get().fetchAgents();
  },

  deleteAgent: async (id) => {
    await api.delete(`/agents/${id}`);
    await get().fetchAgents();
  },

  testConnection: async (id, config) => {
    try {
      const res = await api.post<{ success: boolean; message?: string; error?: string; latencyMs?: number }>(`/agents/${id}/test`, { config });
      return res;
    } catch (error: any) {
      return { success: false, error: error.message || 'Connection failed' };
    }
  }
}));
