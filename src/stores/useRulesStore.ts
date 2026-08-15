import { create } from 'zustand';
import { api } from '../lib/api';

export interface Rule {
  id: string;
  name: string;
  scope: string; // 'global', 'workspace', 'agent'
  target: string;
  priority: number;
  enabled: boolean;
  condition: string | null;
  instruction: string;
  createdAt: string;
  updatedAt: string;
}

interface RulesState {
  rules: Rule[];
  isLoading: boolean;
  error: string | null;
  fetchRules: () => Promise<void>;
  createRule: (data: Partial<Rule>) => Promise<void>;
  updateRule: (id: string, data: Partial<Rule>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
}

export const useRulesStore = create<RulesState>((set, get) => ({
  rules: [],
  isLoading: false,
  error: null,

  fetchRules: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get<Rule[]>('/rules');
      set({ rules: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createRule: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post<Rule>('/rules', data);
      await get().fetchRules();
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateRule: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await api.put<Rule>(`/rules/${id}`, data);
      await get().fetchRules();
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  deleteRule: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete<{success: boolean}>(`/rules/${id}`);
      await get().fetchRules();
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
