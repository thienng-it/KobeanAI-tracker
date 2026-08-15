import { create } from 'zustand';
import { api } from '../lib/api';
import type { Tag } from './useDashboardStore';

export interface Agent {
  id: string;
  name: string;
  type: string;
  status: string;
}

export interface Skill {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  triggerCommand: string;
  instructions: string;
  usageCount: number;
  enabled: boolean;
  agents: Agent[];
  tags: Tag[];
}

interface SkillsState {
  skills: Skill[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  
  setSearchQuery: (query: string) => void;
  fetchSkills: () => Promise<void>;
  getSkill: (id: string) => Promise<Skill | null>;
  createSkill: (skillData: Partial<Skill> & { agentIds?: string[] }) => Promise<string>;
  updateSkill: (id: string, skillData: Partial<Skill> & { agentIds?: string[] }) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
}

export const useSkillsStore = create<SkillsState>((set, get) => ({
  skills: [],
  searchQuery: '',
  isLoading: false,
  error: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchSkills: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<{ data: Skill[] }>('/skills');
      set({ skills: res.data, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch skills:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  getSkill: async (id) => {
    try {
      const res = await api.get<{ data: Skill }>(`/skills/${id}`);
      return res.data;
    } catch (error: any) {
      console.error('Failed to fetch skill:', error);
      return null;
    }
  },

  createSkill: async (skillData) => {
    const res = await api.post<{ success: boolean, id: string }>('/skills', skillData);
    await get().fetchSkills(); // refresh list
    return res.id;
  },

  updateSkill: async (id, skillData) => {
    await api.put(`/skills/${id}`, skillData);
    await get().fetchSkills();
  },

  deleteSkill: async (id) => {
    await api.delete(`/skills/${id}`);
    await get().fetchSkills();
  }
}));
