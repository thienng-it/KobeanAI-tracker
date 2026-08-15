import { create } from 'zustand';
import { api } from '../lib/api';
import type { Session } from './useDashboardStore';

export interface SessionsFilters {
  agentId: string | null;
  tagId: string | null;
  dateRange: string; // 'all', '7d', '30d'
  search: string | null;
}

interface SessionsState {
  sessions: Session[];
  filters: SessionsFilters;
  isLoading: boolean;
  error: string | null;
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
  
  setFilters: (filters: Partial<SessionsFilters>) => void;
  fetchSessions: () => Promise<void>;
  syncSessions: () => Promise<{ success: boolean; syncedCount: number }>;
  resetFilters: () => void;
}

export const useSessionsStore = create<SessionsState>((set, get) => ({
  sessions: [],
  filters: {
    agentId: null,
    tagId: null,
    dateRange: 'all',
    search: null
  },
  isLoading: false,
  error: null,
  meta: { total: 0, limit: 50, offset: 0 },

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
    get().fetchSessions();
  },

  resetFilters: () => {
    set({ filters: { agentId: null, tagId: null, dateRange: 'all', search: null } });
    get().fetchSessions();
  },

  syncSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<{ success: boolean; syncedCount: number; message: string }>('/sessions/sync');
      await get().fetchSessions();
      set({ isLoading: false });
      return { success: true, syncedCount: res.syncedCount };
    } catch (error: any) {
      console.error('Failed to sync sessions:', error);
      set({ error: error.message, isLoading: false });
      return { success: false, syncedCount: 0 };
    }
  },

  fetchSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters, meta } = get();
      const params = new URLSearchParams();
      
      if (filters.agentId) params.append('agentId', filters.agentId);
      if (filters.tagId) params.append('tagId', filters.tagId);
      if (filters.dateRange) params.append('dateRange', filters.dateRange);
      if (filters.search) params.append('search', filters.search);
      
      params.append('limit', meta.limit.toString());
      params.append('offset', meta.offset.toString());

      const res = await api.get<{ data: Session[], meta: any }>(`/sessions?${params.toString()}`);

      set({
        sessions: res.data,
        meta: res.meta,
        isLoading: false
      });
    } catch (error: any) {
      console.error('Failed to fetch sessions:', error);
      set({ error: error.message, isLoading: false });
    }
  }
}));
