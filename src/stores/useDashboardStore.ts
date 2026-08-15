import { create } from 'zustand';
import { api } from '../lib/api';

export type DateRange = '1d' | '7d' | '30d' | '90d' | '180d' | '365d' | 'all';

export interface TrendMetric {
  value: number;
  isPositive: boolean;
  label: string;
}

export interface DashboardSummary {
  totalSessions: number;
  totalTokens: number;
  totalCost: number;
  sessionTrend?: TrendMetric;
  tokenTrend?: TrendMetric;
  costTrend?: TrendMetric;
  dateRange?: string;
}

export interface Session {
  id: string;
  agentName: string;
  model: string;
  startedAt: string;
  durationMs: number | null;
  totalTokens: number | null;
  estimatedCost: number | null;
  status: string;
  summary: string | null;
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
  cost: number;
}

export interface AgentDistributionData {
  name: string;
  value: number;
}

interface DashboardState {
  summary: DashboardSummary | null;
  recentSessions: Session[];
  recentTags: Tag[];
  trends: TrendData[];
  agentDistribution: AgentDistributionData[];
  dateRange: DateRange;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
  
  setDateRange: (range: DateRange) => Promise<void>;
  fetchDashboardData: (range?: DateRange) => Promise<void>;
  syncAllLatest: () => Promise<{ success: boolean; message: string }>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  summary: null,
  recentSessions: [],
  recentTags: [],
  trends: [],
  agentDistribution: [],
  dateRange: '7d',
  isLoading: false,
  isSyncing: false,
  lastSyncedAt: null,
  error: null,

  setDateRange: async (range: DateRange) => {
    set({ dateRange: range });
    await get().fetchDashboardData(range);
  },

  fetchDashboardData: async (customRange?: DateRange) => {
    const range = customRange || get().dateRange;
    set({ isLoading: true, error: null });
    try {
      const [summaryRes, sessionsRes, tagsRes, trendsRes, distributionRes] = await Promise.all([
        api.get<DashboardSummary>(`/dashboard/summary?dateRange=${range}`),
        api.get<{ data: Session[] }>(`/dashboard/recent-sessions?dateRange=${range}`),
        api.get<{ data: Tag[] }>('/dashboard/recent-tags'),
        api.get<{ data: TrendData[] }>(`/dashboard/trends?dateRange=${range}`),
        api.get<{ data: AgentDistributionData[] }>(`/dashboard/agent-distribution?dateRange=${range}`),
      ]);

      set({
        summary: summaryRes,
        recentSessions: sessionsRes.data,
        recentTags: tagsRes.data,
        trends: trendsRes.data,
        agentDistribution: distributionRes.data,
        isLoading: false
      });
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
