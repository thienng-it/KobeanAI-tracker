import { create } from 'zustand';
import { api } from '../lib/api';

export interface Memory {
  id: string;
  workspaceId: string | null;
  title: string;
  content: string;
  category: 'architecture' | 'gotchas' | 'user-preference' | 'workflow' | 'api-conventions' | 'learned-pattern';
  scope: 'workspace' | 'global';
  pinned: boolean;
  priority: 'critical' | 'high' | 'normal' | 'low';
  tokens: number;
  recallCount: number;
  lastRecalledAt: string | null;
  source: 'manual' | 'learned' | 'conversation' | 'file';
  sourceReference: string | null;
  tags: string[];
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface MemoryStats {
  totalMemories: number;
  pinnedCount: number;
  totalTokens: number;
  pinnedTokens: number;
  budgetLimit: number;
  budgetUtilizationPercent: number;
  categories: Record<string, number>;
  priorities: Record<string, number>;
}

export interface MemoryTemplate {
  id: string;
  title: string;
  category: 'architecture' | 'gotchas' | 'user-preference' | 'workflow' | 'api-conventions' | 'learned-pattern';
  priority: 'critical' | 'high' | 'normal' | 'low';
  pinned: boolean;
  content: string;
  tags: string[];
  description: string;
}

export interface ContextSearchResult {
  memory: Memory;
  relevanceScore: number;
  matchedTerms: string[];
  tokenCost: number;
}

interface MemoryStoreState {
  memories: Memory[];
  stats: MemoryStats | null;
  templates: MemoryTemplate[];
  searchQuery: string;
  selectedCategory: string;
  selectedScope: string;
  selectedPriority: string;
  showPinnedOnly: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;

  // Modals
  isEditorOpen: boolean;
  editingMemory: Memory | null;
  isCatalogOpen: boolean;
  isSimulatorOpen: boolean;

  // Simulator State
  simulatorPrompt: string;
  simulatorResults: ContextSearchResult[];
  simulatorTotalTokens: number;
  isSimulating: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string) => void;
  setSelectedScope: (scope: string) => void;
  setSelectedPriority: (prio: string) => void;
  setShowPinnedOnly: (pinned: boolean) => void;

  fetchMemories: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
  createMemory: (data: Partial<Memory>) => Promise<boolean>;
  updateMemory: (id: string, data: Partial<Memory>) => Promise<boolean>;
  togglePin: (id: string) => Promise<boolean>;
  archiveMemory: (id: string) => Promise<boolean>;
  deleteMemory: (id: string) => Promise<boolean>;
  installTemplate: (templateId: string, workspaceId?: string) => Promise<boolean>;
  syncMemories: () => Promise<void>;
  simulateContext: (prompt: string, workspaceId?: string) => Promise<void>;

  openEditor: (memory?: Memory) => void;
  closeEditor: () => void;
  openCatalog: () => void;
  closeCatalog: () => void;
  openSimulator: () => void;
  closeSimulator: () => void;
}

export const useMemoryStore = create<MemoryStoreState>((set, get) => ({
  memories: [],
  stats: null,
  templates: [],
  searchQuery: '',
  selectedCategory: 'all',
  selectedScope: 'all',
  selectedPriority: 'all',
  showPinnedOnly: false,
  isLoading: false,
  isSyncing: false,
  error: null,

  isEditorOpen: false,
  editingMemory: null,
  isCatalogOpen: false,
  isSimulatorOpen: false,

  simulatorPrompt: '',
  simulatorResults: [],
  simulatorTotalTokens: 0,
  isSimulating: false,

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedCategory: (cat: string) => set({ selectedCategory: cat }),
  setSelectedScope: (scope: string) => set({ selectedScope: scope }),
  setSelectedPriority: (prio: string) => set({ selectedPriority: prio }),
  setShowPinnedOnly: (pinned: boolean) => set({ showPinnedOnly: pinned }),

  fetchMemories: async () => {
    set({ isLoading: true, error: null });
    try {
      const { searchQuery, selectedCategory, selectedScope, selectedPriority, showPinnedOnly } = get();
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedScope !== 'all') params.set('scope', selectedScope);
      if (selectedPriority !== 'all') params.set('priority', selectedPriority);
      if (showPinnedOnly) params.set('pinned', 'true');

      const res = await api.get<{ data: Memory[] }>(`/memories?${params.toString()}`);
      set({ memories: res.data || [], isLoading: false });
    } catch (err: any) {
      console.error('Error fetching memories:', err);
      set({ error: err.message || 'Failed to load memories', isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const res = await api.get<{ data: MemoryStats }>('/memories/stats');
      set({ stats: res.data || null });
    } catch (err) {
      console.error('Error fetching memory stats:', err);
    }
  },

  fetchTemplates: async () => {
    try {
      const res = await api.get<{ data: MemoryTemplate[] }>('/memories/templates');
      set({ templates: res.data || [] });
    } catch (err) {
      console.error('Error fetching memory templates:', err);
    }
  },

  createMemory: async (data: Partial<Memory>) => {
    try {
      await api.post('/memories', data);
      await get().fetchMemories();
      await get().fetchStats();
      return true;
    } catch (err: any) {
      console.error('Error creating memory:', err);
      set({ error: err.message || 'Failed to create memory' });
      return false;
    }
  },

  updateMemory: async (id: string, data: Partial<Memory>) => {
    try {
      await api.put(`/memories/${id}`, data);
      await get().fetchMemories();
      await get().fetchStats();
      return true;
    } catch (err: any) {
      console.error('Error updating memory:', err);
      set({ error: err.message || 'Failed to update memory' });
      return false;
    }
  },

  togglePin: async (id: string) => {
    try {
      await api.post(`/memories/${id}/pin`, {});
      await get().fetchMemories();
      await get().fetchStats();
      return true;
    } catch (err: any) {
      console.error('Error toggling memory pin:', err);
      return false;
    }
  },

  archiveMemory: async (id: string) => {
    try {
      await api.post(`/memories/${id}/archive`, {});
      await get().fetchMemories();
      await get().fetchStats();
      return true;
    } catch (err: any) {
      console.error('Error archiving memory:', err);
      return false;
    }
  },

  deleteMemory: async (id: string) => {
    try {
      await api.delete(`/memories/${id}`);
      await get().fetchMemories();
      await get().fetchStats();
      return true;
    } catch (err: any) {
      console.error('Error deleting memory:', err);
      return false;
    }
  },

  installTemplate: async (templateId: string, workspaceId?: string) => {
    try {
      await api.post('/memories/install-template', { templateId, workspaceId });
      await get().fetchMemories();
      await get().fetchStats();
      return true;
    } catch (err: any) {
      console.error('Error installing memory template:', err);
      return false;
    }
  },

  syncMemories: async () => {
    set({ isSyncing: true });
    try {
      await api.post('/memories/sync', {});
      await get().fetchMemories();
      await get().fetchStats();
    } catch (err) {
      console.error('Error syncing memories:', err);
    } finally {
      set({ isSyncing: false });
    }
  },

  simulateContext: async (prompt: string, workspaceId?: string) => {
    if (!prompt.trim()) return;
    set({ isSimulating: true, simulatorPrompt: prompt });
    try {
      const res = await api.post<{ data: { results: ContextSearchResult[]; totalTokens: number } }>('/memories/search-context', {
        prompt,
        workspaceId
      });
      set({
        simulatorResults: res.data?.results || [],
        simulatorTotalTokens: res.data?.totalTokens || 0,
        isSimulating: false
      });
    } catch (err: any) {
      console.error('Error simulating context retrieval:', err);
      set({ isSimulating: false, simulatorResults: [] });
    }
  },

  openEditor: (memory?: Memory) => set({ isEditorOpen: true, editingMemory: memory || null }),
  closeEditor: () => set({ isEditorOpen: false, editingMemory: null }),
  openCatalog: () => {
    get().fetchTemplates();
    set({ isCatalogOpen: true });
  },
  closeCatalog: () => set({ isCatalogOpen: false }),
  openSimulator: () => set({ isSimulatorOpen: true }),
  closeSimulator: () => set({ isSimulatorOpen: false })
}));
