import { create } from 'zustand';
import { api } from '../lib/api';

export interface DashboardSummary {
  totalSessions: number;
  totalTokens: number;
  totalCost: number;
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

interface TrendData {
  date: string;
  tokens: number;
  cost: number;
}

interface AgentDistributionData {
  name: string;
  value: number;
}

interface DashboardState {
  summary: DashboardSummary | null;
  recentSessions: Session[];
  recentTags: Tag[];
  trends: TrendData[];
  agentDistribution: AgentDistributionData[];
  isLoading: boolean;
  error: string | null;
  
  fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  summary: null,
  recentSessions: [],
  recentTags: [],
  trends: [],
  agentDistribution: [],
  isLoading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [summaryRes, sessionsRes, tagsRes, trendsRes, distributionRes] = await Promise.all([
        api.get<DashboardSummary>('/dashboard/summary'),
        api.get<{ data: Session[] }>('/dashboard/recent-sessions'),
        api.get<{ data: Tag[] }>('/dashboard/recent-tags'),
        api.get<{ data: TrendData[] }>('/dashboard/trends'),
        api.get<{ data: AgentDistributionData[] }>('/dashboard/agent-distribution'),
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
  }
}));
