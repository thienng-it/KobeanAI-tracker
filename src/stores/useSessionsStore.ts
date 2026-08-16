import { create } from 'zustand';
import { api } from '../lib/api';
import type { Session } from './useDashboardStore';

export interface SessionsFilters {
  agentId: string | null;
  tagId: string | null;
  model: string | null;
  workspaceId: string | null;
  dateRange: string; // 'all', '1d', '7d', '30d', etc.
  search: string | null;
}

export interface SessionsMeta {
  total: number;
  totalTokens: number;
  totalCost: number;
  limit: number;
  offset: number;
}

interface SessionsState {
  sessions: Session[];
  filters: SessionsFilters;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  meta: SessionsMeta;
  
  setFilters: (filters: Partial<SessionsFilters>) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  fetchSessions: () => Promise<void>;
  syncSessions: () => Promise<{ success: boolean; syncedCount: number }>;
  resetFilters: () => void;
}

export const useSessionsStore = create<SessionsState>((set, get) => ({
  sessions: [],
  filters: {
    agentId: null,
    tagId: null,
    model: null,
    workspaceId: null,
    dateRange: 'all',
    search: null
  },
  isLoading: false,
  isSyncing: false,
  error: null,
  meta: { 
    total: 0, 
    totalTokens: 0, 
    totalCost: 0, 
    limit: 50, 
    offset: 0 
  },

  setFilters: (newFilters) => {
    set((state) => ({ 
      filters: { ...state.filters, ...newFilters },
      meta: { ...state.meta, offset: 0 } // Reset to page 1 on filter change
    }));
    get().fetchSessions();
  },

  setPage: (page: number) => {
    const { meta } = get();
    const newOffset = Math.max(0, (page - 1) * meta.limit);
    set((state) => ({ meta: { ...state.meta, offset: newOffset } }));
    get().fetchSessions();
  },

  setLimit: (newLimit: number) => {
    set((state) => ({ meta: { ...state.meta, limit: newLimit, offset: 0 } }));
    get().fetchSessions();
  },

  resetFilters: () => {
    set({ 
      filters: { agentId: null, tagId: null, model: null, workspaceId: null, dateRange: 'all', search: null },
      meta: { ...get().meta, offset: 0 }
    });
    get().fetchSessions();
  },

  syncSessions: async () => {
    set({ isSyncing: true, error: null });
    try {
      const res = await api.post<{ success: boolean; syncedCount: number; message: string }>('/sessions/sync');
      await get().fetchSessions();
      set({ isSyncing: false });
      return { success: true, syncedCount: res.syncedCount || 0 };
    } catch (error: any) {
      console.error('Failed to sync sessions:', error);
      set({ error: error.message, isSyncing: false });
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
      if (filters.model) params.append('model', filters.model);
      if (filters.workspaceId) params.append('workspaceId', filters.workspaceId);
      if (filters.dateRange) params.append('dateRange', filters.dateRange);
      if (filters.search) params.append('search', filters.search);
      
      params.append('limit', meta.limit.toString());
      params.append('offset', meta.offset.toString());
      params.append('tzOffset', new Date().getTimezoneOffset().toString());

      const res = await api.get<{ data: Session[], meta: SessionsMeta }>(`/sessions?${params.toString()}`);

      set({
        sessions: res.data,
        meta: {
          total: res.meta.total || 0,
          totalTokens: res.meta.totalTokens || 0,
          totalCost: res.meta.totalCost || 0,
          limit: res.meta.limit || meta.limit,
          offset: res.meta.offset || meta.offset
        },
        isLoading: false
      });
    } catch (error: any) {
      console.error('Failed to fetch sessions:', error);
      set({ error: error.message, isLoading: false });
    }
  }
}));
