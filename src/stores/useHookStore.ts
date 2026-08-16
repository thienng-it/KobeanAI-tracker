import { create } from 'zustand';

export interface Hook {
  id: string;
  workspaceId: string;
  name: string;
  slug: string | null;
  description: string | null;
  event: 'PreToolUse' | 'PostToolUse' | 'SessionStart' | 'SessionEnd' | 'UserPrompt' | 'PreCommit';
  matcher: string | null;
  type: 'command' | 'script' | 'http';
  command: string | null;
  timeout: number;
  scope: 'workspace' | 'git' | 'global';
  enabled: boolean;
  status: 'active' | 'disabled';
  executionCount: number;
  lastExecutedAt: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface CuratedHookTemplate {
  id: string;
  name: string;
  description: string;
  event: 'PreToolUse' | 'PostToolUse' | 'SessionStart' | 'SessionEnd' | 'UserPrompt' | 'PreCommit';
  matcher: string;
  command: string;
  timeout: number;
  icon: string;
  category: 'safety' | 'lint' | 'security' | 'workflow' | 'observability';
}

export interface HookTestResult {
  success: boolean;
  decision: 'allow' | 'deny' | 'modify' | 'executed';
  reason?: string;
  stdout: string;
  stderr: string;
  latencyMs: number;
  exitCode: number | null;
}

interface HookState {
  hooks: Hook[];
  gitHookInstalled: boolean;
  catalog: CuratedHookTemplate[];
  isLoading: boolean;
  isSyncing: boolean;
  searchQuery: string;
  selectedEvent: string;
  selectedScope: string;
  selectedStatus: string;

  setSearchQuery: (query: string) => void;
  setSelectedEvent: (event: string) => void;
  setSelectedScope: (scope: string) => void;
  setSelectedStatus: (status: string) => void;

  fetchHooks: () => Promise<void>;
  syncHooks: () => Promise<{ success: boolean; hooksCount?: number; gitHookInstalled?: boolean }>;
  fetchCatalog: () => Promise<CuratedHookTemplate[]>;
  createHook: (params: {
    name: string;
    slug?: string;
    description?: string;
    event: string;
    matcher?: string;
    type?: 'command' | 'script' | 'http';
    command: string;
    timeout?: number;
    scope?: 'workspace' | 'git';
  }) => Promise<{ success: boolean; data?: Hook; error?: string }>;
  updateHook: (id: string, params: Partial<Hook>) => Promise<{ success: boolean; data?: Hook; error?: string }>;
  deleteHook: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleHook: (id: string) => Promise<{ success: boolean; enabled?: boolean; error?: string }>;
  installFromCatalog: (templateId: string) => Promise<{ success: boolean; id?: string; error?: string }>;
  testHook: (params: {
    command: string;
    mockPayload?: any;
    timeoutSeconds?: number;
    hookId?: string;
  }) => Promise<{ success: boolean; result?: HookTestResult; error?: string }>;
  toggleGitHook: () => Promise<{ success: boolean; gitHookInstalled?: boolean }>;
}

export const useHookStore = create<HookState>((set, get) => ({
  hooks: [],
  gitHookInstalled: false,
  catalog: [],
  isLoading: false,
  isSyncing: false,
  searchQuery: '',
  selectedEvent: 'all',
  selectedScope: 'all',
  selectedStatus: 'all',

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),
  setSelectedScope: (selectedScope) => set({ selectedScope }),
  setSelectedStatus: (selectedStatus) => set({ selectedStatus }),

  fetchHooks: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/hooks');
      if (res.ok) {
        const json = await res.json();
        set({ 
          hooks: json.data || [], 
          gitHookInstalled: !!json.gitHookInstalled,
          isLoading: false 
        });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      console.error('Failed to fetch hooks:', e);
      set({ isLoading: false });
    }
  },

  syncHooks: async () => {
    set({ isSyncing: true });
    try {
      const res = await fetch('/api/hooks/sync', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        await get().fetchHooks();
        set({ isSyncing: false });
        return { success: true, hooksCount: json.hooksCount, gitHookInstalled: json.gitHookInstalled };
      }
      set({ isSyncing: false });
      return { success: false };
    } catch (e) {
      console.error('Failed to sync hooks:', e);
      set({ isSyncing: false });
      return { success: false };
    }
  },

  fetchCatalog: async () => {
    try {
      const res = await fetch('/api/hooks/catalog');
      if (res.ok) {
        const json = await res.json();
        set({ catalog: json.data || [] });
        return json.data || [];
      }
      return [];
    } catch (e) {
      console.error('Failed to fetch hook catalog:', e);
      return [];
    }
  },

  createHook: async (params) => {
    try {
      const res = await fetch('/api/hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const json = await res.json();
      if (res.ok) {
        await get().fetchHooks();
        return { success: true, data: json.data };
      }
      return { success: false, error: json.error || 'Failed to create hook' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  updateHook: async (id, params) => {
    try {
      const res = await fetch(`/api/hooks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const json = await res.json();
      if (res.ok) {
        await get().fetchHooks();
        return { success: true, data: json.data };
      }
      return { success: false, error: json.error || 'Failed to update hook' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  deleteHook: async (id) => {
    try {
      const res = await fetch(`/api/hooks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        set(state => ({ hooks: state.hooks.filter(h => h.id !== id) }));
        return { success: true };
      }
      const json = await res.json();
      return { success: false, error: json.error || 'Failed to delete hook' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  toggleHook: async (id) => {
    try {
      const res = await fetch(`/api/hooks/${id}/toggle`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        set(state => ({
          hooks: state.hooks.map(h => h.id === id ? { ...h, enabled: json.enabled, status: json.enabled ? 'active' : 'disabled' } : h)
        }));
        return { success: true, enabled: json.enabled };
      }
      return { success: false };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  installFromCatalog: async (templateId) => {
    try {
      const res = await fetch('/api/hooks/install-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      });
      const json = await res.json();
      if (res.ok) {
        await get().fetchHooks();
        return { success: true, id: json.id };
      }
      return { success: false, error: json.error || 'Failed to install template' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  testHook: async (params) => {
    try {
      const res = await fetch('/api/hooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const json = await res.json();
      if (res.ok) {
        return { success: true, result: json.data };
      }
      return { success: false, error: json.error || 'Hook test failed' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  toggleGitHook: async () => {
    try {
      const res = await fetch('/api/hooks/git/toggle', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        set({ gitHookInstalled: json.gitHookInstalled });
        await get().fetchHooks();
        return { success: true, gitHookInstalled: json.gitHookInstalled };
      }
      return { success: false };
    } catch (e) {
      return { success: false };
    }
  }
}));
