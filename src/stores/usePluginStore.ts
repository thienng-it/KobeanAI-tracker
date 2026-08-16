import { create } from 'zustand';

export interface Plugin {
  id: string;
  workspaceId: string;
  name: string;
  slug: string | null;
  version: string;
  description: string | null;
  author: string | null;
  scope: 'workspace' | 'global';
  path: string | null;
  repository: string | null;
  license: string | null;
  keywords: string[];
  skillsCount: number;
  agentsCount: number;
  hasMcp: boolean;
  hasHooks: boolean;
  enabled: boolean;
  status: 'active' | 'installed' | 'disabled';
  readme: string | null;
  manifest: any;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface CuratedPluginTemplate {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  category: 'science' | 'devtools' | 'cloud' | 'frontend' | 'ai' | 'security';
  repository?: string;
  skills: string[];
  agents?: string[];
  hasMcp?: boolean;
  hasHooks?: boolean;
  icon?: string;
  featured?: boolean;
}

export interface BundledSkillDetail {
  name: string;
  slug: string;
  description: string;
  path: string;
  instructionsPreview: string;
}

export interface PluginFileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  sizeBytes?: number;
  children?: PluginFileNode[];
}

export interface PluginDetailResponse {
  plugin: Plugin;
  bundledSkills: BundledSkillDetail[];
  fileTree: PluginFileNode;
  rawManifest: string;
}

interface PluginState {
  plugins: Plugin[];
  catalog: CuratedPluginTemplate[];
  selectedScope: 'all' | 'workspace' | 'global';
  selectedStatus: 'all' | 'active' | 'disabled';
  searchQuery: string;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;

  // Actions
  fetchPlugins: () => Promise<void>;
  syncPlugins: () => Promise<{ success: boolean; pluginsCount?: number; skillsCount?: number }>;
  fetchCatalog: () => Promise<CuratedPluginTemplate[]>;
  createPlugin: (data: {
    name: string;
    slug?: string;
    description: string;
    author?: string;
    version?: string;
    repository?: string;
    license?: string;
    keywords?: string[];
    initialSkill?: { name: string; description: string; instructions: string };
    hasHooks?: boolean;
  }) => Promise<{ success: boolean; id?: string; error?: string }>;
  updatePlugin: (id: string, data: Partial<Plugin>) => Promise<{ success: boolean; error?: string }>;
  deletePlugin: (id: string) => Promise<{ success: boolean; error?: string }>;
  togglePlugin: (id: string) => Promise<{ success: boolean; enabled?: boolean }>;
  installFromCatalog: (templateId: string) => Promise<{ success: boolean; id?: string; error?: string }>;
  getPluginDetail: (id: string) => Promise<PluginDetailResponse | null>;
  
  setSelectedScope: (scope: 'all' | 'workspace' | 'global') => void;
  setSelectedStatus: (status: 'all' | 'active' | 'disabled') => void;
  setSearchQuery: (query: string) => void;
}

export const usePluginStore = create<PluginState>((set, get) => ({
  plugins: [],
  catalog: [],
  selectedScope: 'all',
  selectedStatus: 'all',
  searchQuery: '',
  isLoading: false,
  isSyncing: false,
  error: null,

  fetchPlugins: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/plugins');
      const data = await res.json();
      if (data.data) {
        set({ plugins: data.data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  syncPlugins: async () => {
    set({ isSyncing: true, error: null });
    try {
      const res = await fetch('/api/plugins/sync', { method: 'POST' });
      const data = await res.json();
      await get().fetchPlugins();
      set({ isSyncing: false });
      return data;
    } catch (err: any) {
      set({ error: err.message, isSyncing: false });
      return { success: false };
    }
  },

  fetchCatalog: async () => {
    try {
      const res = await fetch('/api/plugins/catalog');
      const data = await res.json();
      if (data.data) {
        set({ catalog: data.data });
        return data.data;
      }
      return [];
    } catch (err: any) {
      return [];
    }
  },

  createPlugin: async (params) => {
    try {
      const res = await fetch('/api/plugins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchPlugins();
        return { success: true, id: data.id };
      }
      return { success: false, error: data.error || 'Failed to create plugin' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  updatePlugin: async (id, params) => {
    try {
      const res = await fetch(`/api/plugins/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchPlugins();
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to update plugin' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  deletePlugin: async (id) => {
    try {
      const res = await fetch(`/api/plugins/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        set((state) => ({
          plugins: state.plugins.filter((p) => p.id !== id)
        }));
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to delete plugin' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  togglePlugin: async (id) => {
    try {
      const res = await fetch(`/api/plugins/${id}/toggle`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        set((state) => ({
          plugins: state.plugins.map((p) =>
            p.id === id ? { ...p, enabled: data.enabled, status: data.enabled ? 'active' : 'disabled' } : p
          )
        }));
        return { success: true, enabled: data.enabled };
      }
      return { success: false };
    } catch (err: any) {
      return { success: false };
    }
  },

  installFromCatalog: async (templateId) => {
    try {
      const res = await fetch('/api/plugins/install-catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchPlugins();
        return { success: true, id: data.id };
      }
      return { success: false, error: data.error || 'Installation failed' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  getPluginDetail: async (id) => {
    try {
      const res = await fetch(`/api/plugins/${id}`);
      const data = await res.json();
      if (data.data) {
        return data.data;
      }
      return null;
    } catch (err: any) {
      return null;
    }
  },

  setSelectedScope: (selectedScope) => set({ selectedScope }),
  setSelectedStatus: (selectedStatus) => set({ selectedStatus }),
  setSearchQuery: (searchQuery) => set({ searchQuery })
}));
