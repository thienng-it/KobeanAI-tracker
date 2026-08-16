import { create } from 'zustand';
import { api } from '../lib/api';

export interface McpTool {
  id: string;
  serverId: string;
  name: string;
  description: string | null;
  parameters: Record<string, any>;
  isLazy: boolean;
  usageCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface McpServer {
  id: string;
  workspaceId: string;
  name: string;
  slug: string | null;
  description: string | null;
  transport: 'stdio' | 'sse' | 'http' | 'builtin';
  command: string | null;
  args: string[];
  env: Record<string, string>;
  url: string | null;
  headers: Record<string, string>;
  scope: 'workspace' | 'global' | 'builtin';
  status: 'active' | 'configured' | 'error' | 'disabled';
  enabled: boolean;
  toolsCount: number;
  metadata: Record<string, any>;
  tools: McpTool[];
  agents: Array<{ id: string; name: string; type: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CuratedMcpTemplate {
  id: string;
  name: string;
  category: 'database' | 'devtools' | 'productivity' | 'search' | 'cloud' | 'monitoring';
  description: string;
  author: string;
  transport: 'stdio' | 'sse' | 'http';
  command: string;
  defaultArgs: string[];
  requiredEnv: Array<{ key: string; label: string; description: string; placeholder: string; secret: boolean }>;
  docsUrl: string;
  icon: string;
  featuredTools: string[];
}

export interface MultiAgentExportConfig {
  antigravity: { filename: string; content: string };
  claude: { filename: string; content: string };
  cursor: { filename: string; content: string };
  windsurf: { filename: string; content: string };
}

interface McpState {
  servers: McpServer[];
  catalog: CuratedMcpTemplate[];
  selectedServer: McpServer | null;
  searchQuery: string;
  selectedScope: 'all' | 'workspace' | 'global' | 'builtin';
  selectedTransport: 'all' | 'stdio' | 'sse' | 'http' | 'builtin';
  selectedStatus: 'all' | 'active' | 'configured' | 'disabled';
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;

  setSearchQuery: (query: string) => void;
  setSelectedScope: (scope: 'all' | 'workspace' | 'global' | 'builtin') => void;
  setSelectedTransport: (transport: 'all' | 'stdio' | 'sse' | 'http' | 'builtin') => void;
  setSelectedStatus: (status: 'all' | 'active' | 'configured' | 'disabled') => void;
  setSelectedServer: (server: McpServer | null) => void;

  fetchServers: () => Promise<void>;
  syncServers: () => Promise<{ success: boolean; serversCount?: number; toolsCount?: number; error?: string }>;
  fetchCatalog: () => Promise<void>;
  installTemplate: (params: { templateId: string; customName?: string; args?: string[]; env?: Record<string, string>; agentIds?: string[] }) => Promise<string>;
  createServer: (serverData: Partial<McpServer> & { agentIds?: string[] }) => Promise<string>;
  updateServer: (id: string, serverData: Partial<McpServer> & { agentIds?: string[] }) => Promise<void>;
  deleteServer: (id: string) => Promise<void>;
  toggleServer: (id: string) => Promise<boolean>;
  testConnection: (id: string) => Promise<{ success: boolean; latencyMs: number; message: string; error?: string }>;
  exportConfigs: () => Promise<MultiAgentExportConfig | null>;
}

export const useMcpStore = create<McpState>((set, get) => ({
  servers: [],
  catalog: [],
  selectedServer: null,
  searchQuery: '',
  selectedScope: 'all',
  selectedTransport: 'all',
  selectedStatus: 'all',
  isLoading: false,
  isSyncing: false,
  error: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedScope: (scope) => set({ selectedScope: scope }),
  setSelectedTransport: (transport) => set({ selectedTransport: transport }),
  setSelectedStatus: (status) => set({ selectedStatus: status }),
  setSelectedServer: (server) => set({ selectedServer: server }),

  fetchServers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<{ data: McpServer[] }>('/mcps');
      set({ servers: res.data, isLoading: false });
    } catch (err: any) {
      console.error('Failed to fetch MCP servers:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  syncServers: async () => {
    set({ isSyncing: true, error: null });
    try {
      const syncRes = await api.post<{ success: boolean; serversCount?: number; toolsCount?: number }>('/mcps/sync', {});
      const res = await api.get<{ data: McpServer[] }>('/mcps');
      set({ servers: res.data, isSyncing: false });
      return {
        success: true,
        serversCount: syncRes.serversCount ?? res.data.length,
        toolsCount: syncRes.toolsCount
      };
    } catch (err: any) {
      console.error('Failed to sync MCP servers:', err);
      set({ error: err.message, isSyncing: false });
      return { success: false, error: err.message };
    }
  },

  fetchCatalog: async () => {
    try {
      const res = await api.get<{ data: CuratedMcpTemplate[] }>('/mcps/catalog');
      set({ catalog: res.data });
    } catch (err: any) {
      console.error('Failed to fetch MCP catalog:', err);
    }
  },

  installTemplate: async (params) => {
    const res = await api.post<{ success: boolean; id: string }>('/mcps/install-template', params);
    await get().fetchServers();
    return res.id;
  },

  createServer: async (serverData) => {
    const res = await api.post<{ success: boolean; id: string }>('/mcps', serverData);
    await get().fetchServers();
    return res.id;
  },

  updateServer: async (id, serverData) => {
    await api.put(`/mcps/${id}`, serverData);
    await get().fetchServers();
  },

  deleteServer: async (id) => {
    await api.delete(`/mcps/${id}`);
    await get().fetchServers();
  },

  toggleServer: async (id) => {
    const res = await api.post<{ success: boolean; enabled: boolean }>(`/mcps/${id}/toggle`, {});
    await get().fetchServers();
    return res.enabled;
  },

  testConnection: async (id) => {
    try {
      const res = await api.post<{ success: boolean; latencyMs: number; message: string; error?: string }>(`/mcps/${id}/test`, {});
      await get().fetchServers();
      return res;
    } catch (err: any) {
      return { success: false, latencyMs: 0, message: err.message || 'Test failed', error: err.message };
    }
  },

  exportConfigs: async () => {
    try {
      const res = await api.get<{ data: MultiAgentExportConfig }>('/mcps/export-config');
      return res.data;
    } catch (err: any) {
      console.error('Failed to export MCP configs:', err);
      return null;
    }
  }
}));
