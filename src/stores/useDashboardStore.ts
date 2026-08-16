import { create } from 'zustand';
import { api } from '../lib/api';

export type DateRange = '1d' | '7d' | '30d' | '90d' | '180d' | '365d' | 'all' | (string & {});

export interface TrendMetric {
  value: number;
  isPositive: boolean;
  label: string;
}

export interface DashboardSummary {
  totalSessions: number;
  totalTokens: number;
  inputTokens?: number;
  outputTokens?: number;
  inputRatio?: number;
  outputRatio?: number;
  totalCost: number;
  avgCostPerSession?: number;
  avgTokensPerSession?: number;
  avgDurationMs?: number;
  avgDurationSec?: number;
  avgToolCalls?: number;
  successRate?: number;
  sessionTrend?: TrendMetric;
  tokenTrend?: TrendMetric;
  costTrend?: TrendMetric;
  dateRange?: string;
  model?: string;
  workspaceId?: string;
}

export interface WorkspaceOption {
  id: string;
  name: string;
  path: string;
  description?: string | null;
  sessionCount: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  lastActive: string | null;
}

export interface Session {
  id: string;
  agentName: string;
  agentId?: string;
  workspaceId?: string;
  workspaceName?: string;
  workspacePath?: string;
  model: string;
  modelName?: string;
  provider?: string;
  modelColor?: string;
  modelBg?: string;
  startedAt: string;
  durationMs: number | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens: number | null;
  estimatedCost: number | null;
  status: string;
  summary: string | null;
  metadata?: any;
  effortLevel?: string;
  tags: Tag[];
}

export interface Tag {
  id: string;
  prefix: string;
  identifier: string;
  action: string;
  raw: string;
  color: string | null;
  usageCount?: number;
}

export interface TrendData {
  date: string;
  tokens: number;
  inputTokens?: number;
  outputTokens?: number;
  cost: number;
  avgDurationMs?: number;
  avgDurationSec?: number;
  toolCalls?: number;
  sessionCount?: number;
}

export interface AgentDistributionData {
  name: string;
  value: number;
}

export interface IntentDistributionData {
  id: string;
  tag: string;
  name: string;
  color: string;
  count: number;
  percentage: number;
  totalTokens: number;
  totalCost: number;
  avgDurationMs: number;
  avgDurationSec: number;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: 'Google' | 'Anthropic' | 'OpenAI' | 'DeepSeek' | 'Meta' | 'Mistral' | 'Local' | 'Custom';
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  thinkingPricePerMillion?: number;
  contextWindow: number;
  maxOutputTokens?: number;
  supportsThinking: boolean;
  color: string;
  badgeBg: string;
  description?: string;
  modalities?: string[];
  tier?: string;
}

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  rawModels: string[];
  sessionCount: number;
  totalTokens: number;
  totalCost: number;
  specs: ModelInfo;
}

export interface ModelStatistics {
  totalSessions: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  avgTokensPerSession: number;
  avgCostPerSession: number;
  avgDurationMs: number;
  maxTokensSingleSession: number;
  workloadSharePercentage: number;
  dateRange?: string;
}

export interface ModelSpecsResponse {
  specs: ModelInfo;
  statistics: ModelStatistics;
}

interface DashboardState {
  summary: DashboardSummary | null;
  recentSessions: Session[];
  recentTags: Tag[];
  trends: TrendData[];
  agentDistribution: AgentDistributionData[];
  intentDistribution: IntentDistributionData[];
  dateRange: DateRange;
  selectedModel: string;
  availableModels: ModelOption[];
  modelSpecsData: ModelSpecsResponse | null;
  selectedWorkspace: string; // 'all' or workspace id
  workspacesList: WorkspaceOption[];
  autoRefreshInterval: number; // 0 = off, >0 = seconds
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
  
  setDateRange: (range: DateRange) => Promise<void>;
  setSelectedModel: (model: string) => Promise<void>;
  setSelectedWorkspace: (workspaceId: string) => Promise<void>;
  setAutoRefreshInterval: (seconds: number) => void;
  fetchDashboardData: (range?: DateRange, model?: string, workspace?: string) => Promise<void>;
  fetchAvailableModels: () => Promise<void>;
  fetchWorkspaces: () => Promise<void>;
  fetchModelSpecs: (modelId: string, range?: DateRange, workspace?: string) => Promise<void>;
  syncAllLatest: () => Promise<{ success: boolean; message: string }>;
}

const getInitialInterval = () => {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem('kobeanai-auto-refresh-sec');
  return stored !== null ? parseInt(stored, 10) : 0;
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  summary: null,
  recentSessions: [],
  recentTags: [],
  trends: [],
  agentDistribution: [],
  intentDistribution: [],
  dateRange: '1d',
  selectedModel: 'all',
  availableModels: [],
  modelSpecsData: null,
  selectedWorkspace: 'all',
  workspacesList: [],
  autoRefreshInterval: getInitialInterval(),
  isLoading: false,
  isSyncing: false,
  lastSyncedAt: null,
  error: null,

  setAutoRefreshInterval: (seconds: number) => {
    const sanitized = Math.max(0, Math.floor(seconds));
    set({ autoRefreshInterval: sanitized });
    if (typeof window !== 'undefined') {
      localStorage.setItem('kobeanai-auto-refresh-sec', sanitized.toString());
    }
  },

  setDateRange: async (range: DateRange) => {
    set({ dateRange: range });
    await get().fetchDashboardData(range, get().selectedModel, get().selectedWorkspace);
  },

  setSelectedModel: async (model: string) => {
    set({ selectedModel: model });
    await Promise.all([
      get().fetchDashboardData(get().dateRange, model, get().selectedWorkspace),
      model !== 'all' ? get().fetchModelSpecs(model, get().dateRange, get().selectedWorkspace) : Promise.resolve()
    ]);
  },

  setSelectedWorkspace: async (workspaceId: string) => {
    set({ selectedWorkspace: workspaceId });
    await Promise.all([
      get().fetchDashboardData(get().dateRange, get().selectedModel, workspaceId),
      get().selectedModel !== 'all' ? get().fetchModelSpecs(get().selectedModel, get().dateRange, workspaceId) : Promise.resolve()
    ]);
  },

  fetchWorkspaces: async () => {
    try {
      const res = await api.get<{ data: WorkspaceOption[] }>('/dashboard/workspaces');
      set({ workspacesList: res.data || [] });
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    }
  },

  fetchAvailableModels: async () => {
    try {
      const wsParam = get().selectedWorkspace !== 'all' ? `?workspaceId=${encodeURIComponent(get().selectedWorkspace)}` : '';
      const res = await api.get<{ data: ModelOption[] }>(`/dashboard/models${wsParam}`);
      set({ availableModels: res.data });
    } catch (error) {
      console.error('Failed to fetch available models:', error);
    }
  },

  fetchModelSpecs: async (modelId: string, range?: DateRange, workspace?: string) => {
    if (!modelId || modelId === 'all') {
      set({ modelSpecsData: null });
      return;
    }
    const currentRange = range || get().dateRange;
    const currentWs = workspace !== undefined ? workspace : get().selectedWorkspace;
    const wsParam = currentWs && currentWs !== 'all' ? `&workspaceId=${encodeURIComponent(currentWs)}` : '';

    try {
      const res = await api.get<ModelSpecsResponse>(`/dashboard/model-specs?model=${modelId}&dateRange=${currentRange}${wsParam}`);
      set({ modelSpecsData: res });
    } catch (error) {
      console.error('Failed to fetch model specs:', error);
    }
  },

  fetchDashboardData: async (customRange?: DateRange, customModel?: string, customWorkspace?: string) => {
    const range = customRange || get().dateRange;
    const model = customModel !== undefined ? customModel : get().selectedModel;
    const workspace = customWorkspace !== undefined ? customWorkspace : get().selectedWorkspace;

    set({ isLoading: true, error: null });

    const modelParam = model && model !== 'all' ? `&model=${encodeURIComponent(model)}` : '';
    const wsParam = workspace && workspace !== 'all' ? `&workspaceId=${encodeURIComponent(workspace)}` : '';
    const queryParams = `?dateRange=${range}${modelParam}${wsParam}`;

    try {
      const [summaryRes, sessionsRes, tagsRes, trendsRes, distributionRes, intentRes, modelsRes, workspacesRes] = await Promise.all([
        api.get<DashboardSummary>(`/dashboard/summary${queryParams}`),
        api.get<{ data: Session[] }>(`/dashboard/recent-sessions${queryParams}`),
        api.get<{ data: Tag[] }>(`/dashboard/recent-tags${wsParam ? `?${wsParam.slice(1)}` : ''}`),
        api.get<{ data: TrendData[] }>(`/dashboard/trends${queryParams}`),
        api.get<{ data: AgentDistributionData[] }>(`/dashboard/agent-distribution${queryParams}`),
        api.get<{ data: IntentDistributionData[] }>(`/dashboard/intent-distribution${queryParams}`),
        api.get<{ data: ModelOption[] }>(`/dashboard/models${wsParam ? `?${wsParam.slice(1)}` : ''}`),
        api.get<{ data: WorkspaceOption[] }>('/dashboard/workspaces')
      ]);

      set({
        summary: summaryRes,
        recentSessions: sessionsRes.data,
        recentTags: tagsRes.data,
        trends: trendsRes.data,
        agentDistribution: distributionRes.data,
        intentDistribution: intentRes.data || [],
        availableModels: modelsRes.data,
        workspacesList: workspacesRes.data || [],
        isLoading: false
      });

      // If a model is active, also refresh its specs
      if (model && model !== 'all') {
        await get().fetchModelSpecs(model, range, workspace);
      } else {
        set({ modelSpecsData: null });
      }
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  syncAllLatest: async () => {
    set({ isSyncing: true });
    try {
      const [sessionSyncRes] = await Promise.all([
        api.post<{ success: boolean; syncedCount?: number }>('/sessions/sync', {}).catch(() => ({ success: true, syncedCount: 0 })),
        api.post<{ success: boolean }>('/skills/sync', {}).catch(() => ({ success: true }))
      ]);

      await get().fetchDashboardData();

      const syncedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      set({ isSyncing: false, lastSyncedAt: syncedAt });

      return {
        success: true,
        message: `Synced ${sessionSyncRes.syncedCount || 0} sessions and refreshed metrics at ${syncedAt}`
      };
    } catch (error: any) {
      console.error('Failed to sync data:', error);
      set({ isSyncing: false });
      return {
        success: false,
        message: error.message || 'Sync failed'
      };
    }
  }
}));
