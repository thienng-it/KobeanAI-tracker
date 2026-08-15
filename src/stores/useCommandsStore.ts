import { create } from 'zustand';
import { api } from '../lib/api';

export interface Command {
  id: string;
  name: string;
  description: string | null;
  skillId: string;
  aliases: string[] | null;
  parameters: any | null;
  agents: string[] | null;
  autoTags: string[] | null;
  usageCount: number;
  createdAt: string;
  skill?: {
    id: string;
    name: string;
  };
}

interface CommandsState {
  commands: Command[];
  isLoading: boolean;
  error: string | null;
  fetchCommands: () => Promise<void>;
  createCommand: (data: Partial<Command>) => Promise<void>;
  updateCommand: (id: string, data: Partial<Command>) => Promise<void>;
  deleteCommand: (id: string) => Promise<void>;
}

export const useCommandsStore = create<CommandsState>((set, get) => ({
  commands: [],
  isLoading: false,
  error: null,

  fetchCommands: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get<Command[]>('/commands');
      set({ commands: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createCommand: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post<Command>('/commands', data);
      await get().fetchCommands();
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateCommand: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await api.put<Command>(`/commands/${id}`, data);
      await get().fetchCommands();
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  deleteCommand: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete<{success: boolean}>(`/commands/${id}`);
      await get().fetchCommands();
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
