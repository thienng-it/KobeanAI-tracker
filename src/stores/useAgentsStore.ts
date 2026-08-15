import { create } from 'zustand';
import { api } from '../lib/api';
import type { Agent } from './useSkillsStore';

// We extend the basic Agent type with config fields
export interface AgentConfig {
  authType?: 'api_key' | 'local_log';
  apiKey?: string;
  logPath?: string;
  [key: string]: any;
}

export interface DetailedAgent extends Agent {
  config: string | AgentConfig | null;
}

interface AgentsState {
  agents: DetailedAgent[];
  isLoading: boolean;
  error: string | null;
  
  fetchAgents: () => Promise<void>;
  createAgent: (agent: Partial<DetailedAgent>) => Promise<void>;
  updateAgent: (id: string, agent: Partial<DetailedAgent>) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  testConnection: (id: string, config: AgentConfig) => Promise<{ success: boolean; message?: string; error?: string; latencyMs?: number }>;
}

export const useAgentsStore = create<AgentsState>((set, get) => ({
  agents: [],
  isLoading: false,
  error: null,

  fetchAgents: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<{ data: DetailedAgent[] }>('/agents');
      
      // Parse the JSON string config from the DB
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
