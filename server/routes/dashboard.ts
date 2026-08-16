import { Router } from 'express';
import { db } from '../db/index.js';
import { sessions, tags, sessionTags, agents, workspaces } from '../db/schema.js';
import { desc, eq, sql, gte, lt, and, or, like } from 'drizzle-orm';
import { ModelRegistry, ModelInfo } from '../services/model-registry.js';
import { getDateThresholds } from '../services/date-utils.js';
import { TagService } from '../services/tag-service.js';

const router = Router();

function getModelCondition(model?: string) {
  if (!model || model === 'all') return undefined;
  const clean = model.toLowerCase().trim();
  // Strip trailing effort identifiers for matching
  const baseModel = clean.replace(/--high-?|--medium-?|--low-?|--thinking-?|-thinking/g, '');
  return or(
    eq(sessions.model, clean),
    eq(sessions.model, baseModel),
    like(sessions.model, `${baseModel}%`),
    like(sessions.model, `%${baseModel}%`)
  );
}

function getWorkspaceCondition(workspaceId?: string) {
  if (!workspaceId || workspaceId === 'all') return undefined;
  return eq(sessions.workspaceId, workspaceId);
}

function getClientTzOffset(req: any): string | undefined {
  return (req.query.tzOffset as string) || (req.headers['x-timezone-offset'] as string) || undefined;
}

// GET /api/dashboard/workspaces - Returns all workspaces with aggregate AI metrics
router.get('/workspaces', async (_req, res) => {
  try {
    const allWorkspaces = await db.query.workspaces.findMany({
      orderBy: [desc(workspaces.updatedAt)]
    });

    const workspaceMetrics = await db.select({
      workspaceId: sessions.workspaceId,
      sessionCount: sql<number>`count(*)`,
      totalTokens: sql<number>`coalesce(sum(${sessions.totalTokens}), 0)`,
      inputTokens: sql<number>`coalesce(sum(${sessions.inputTokens}), 0)`,
      outputTokens: sql<number>`coalesce(sum(${sessions.outputTokens}), 0)`,
      totalCost: sql<number>`coalesce(sum(${sessions.estimatedCost}), 0)`,
      lastActive: sql<string>`max(${sessions.startedAt})`
    })
    .from(sessions)
    .groupBy(sessions.workspaceId);

    const metricsMap = new Map(workspaceMetrics.map(m => [m.workspaceId, m]));

    const result = allWorkspaces.map(ws => {
      const m = metricsMap.get(ws.id);
      return {
        id: ws.id,
        name: ws.name,
        path: ws.path,
        description: ws.description,
        sessionCount: m?.sessionCount || 0,
        totalTokens: m?.totalTokens || 0,
        inputTokens: m?.inputTokens || 0,
        outputTokens: m?.outputTokens || 0,
        totalCost: Number((m?.totalCost || 0).toFixed(4)),
        lastActive: m?.lastActive || ws.createdAt
      };
    });

    // Sort by session count descending, then name ascending
    result.sort((a, b) => {
      if (b.sessionCount !== a.sessionCount) {
        return b.sessionCount - a.sessionCount;
      }
      return a.name.localeCompare(b.name);
    });

    res.json({ data: result });
  } catch (error) {
    console.error('[dashboard/workspaces] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/dashboard/models - Returns distinct models used in DB + known models catalogue with aggregated metrics
router.get('/models', async (req, res) => {
  try {
    const workspaceId = req.query.workspaceId as string;
    const wsCond = getWorkspaceCondition(workspaceId);

    let query = db.select({
      model: sessions.model,
      count: sql<number>`count(*)`,
      totalTokens: sql<number>`coalesce(sum(${sessions.totalTokens}), 0)`,
      totalCost: sql<number>`coalesce(sum(${sessions.estimatedCost}), 0)`,
    })
    .from(sessions);

    if (wsCond) {
      query = query.where(wsCond) as any;
    }

    const dbModels = await query.groupBy(sessions.model);

    // Group database models by resolved canonical model ID
    const aggregatedMap = new Map<string, {
      id: string;
      name: string;
      provider: string;
      rawModels: string[];
      sessionCount: number;
      totalTokens: number;
      totalCost: number;
      specs: ModelInfo;
    }>();

    for (const row of dbModels) {
      const resolved = ModelRegistry.resolve(row.model);
      const existing = aggregatedMap.get(resolved.id);
      if (existing) {
        existing.rawModels.push(row.model);
        existing.sessionCount += row.count;
        existing.totalTokens += row.totalTokens;
        existing.totalCost += Number(row.totalCost);
      } else {
        aggregatedMap.set(resolved.id, {
          id: resolved.id,
          name: resolved.name,
          provider: resolved.provider,
          rawModels: [row.model],
          sessionCount: row.count,
          totalTokens: row.totalTokens,
          totalCost: Number(row.totalCost),
          specs: resolved
        });
      }
    }

    // Include registered default models that might not have sessions yet
    for (const known of ModelRegistry.getAll()) {
      if (!aggregatedMap.has(known.id)) {
        aggregatedMap.set(known.id, {
          id: known.id,
          name: known.name,
          provider: known.provider,
          rawModels: [],
          sessionCount: 0,
          totalTokens: 0,
          totalCost: 0,
          specs: known
        });
      }
    }

    // Sort by session count descending, then name ascending
    const result = Array.from(aggregatedMap.values()).sort((a, b) => {
      if (b.sessionCount !== a.sessionCount) {
        return b.sessionCount - a.sessionCount;
      }
      return a.name.localeCompare(b.name);
    });

    res.json({ data: result });
  } catch (error) {
    console.error('[dashboard/models] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/dashboard/model-specs?model=...&workspaceId=... - Detailed specs and telemetry analytics for a single model
router.get('/model-specs', async (req, res) => {
  try {
    const modelParam = (req.query.model as string) || 'gemini-3.7-flash';
    const workspaceId = req.query.workspaceId as string;
    const dateRange = (req.query.dateRange as string) || 'all';
    const tzOffset = getClientTzOffset(req);
    const resolved = ModelRegistry.resolve(modelParam);
    const { currentThreshold, endThreshold } = getDateThresholds(dateRange, tzOffset);

    const conditions = [];
    const modelCond = getModelCondition(modelParam);
    const wsCond = getWorkspaceCondition(workspaceId);

    if (modelCond) conditions.push(modelCond);
    if (wsCond) conditions.push(wsCond);

    if (currentThreshold && endThreshold) {
      conditions.push(
        and(
          gte(sessions.startedAt, currentThreshold.toISOString()),
          lt(sessions.startedAt, endThreshold.toISOString())
        )
      );
    } else if (currentThreshold) {
      conditions.push(gte(sessions.startedAt, currentThreshold.toISOString()));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch aggregate statistics for this model
    const statsResult = await db.select({
      totalSessions: sql<number>`count(*)`,
      totalTokens: sql<number>`coalesce(sum(${sessions.totalTokens}), 0)`,
      inputTokens: sql<number>`coalesce(sum(${sessions.inputTokens}), 0)`,
      outputTokens: sql<number>`coalesce(sum(${sessions.outputTokens}), 0)`,
      totalCost: sql<number>`coalesce(sum(${sessions.estimatedCost}), 0)`,
      avgDurationMs: sql<number>`coalesce(avg(${sessions.durationMs}), 0)`,
      maxTokens: sql<number>`coalesce(max(${sessions.totalTokens}), 0)`
    })
    .from(sessions)
    .where(whereClause);

    // Total sessions in DB (for workload share calculation)
    let allSessionsQuery = db.select({ count: sql<number>`count(*)` }).from(sessions);
    if (wsCond) {
      allSessionsQuery = allSessionsQuery.where(wsCond) as any;
    }
    const allSessionsResult = await allSessionsQuery;
    const totalWorkspaceSessions = allSessionsResult[0]?.count || 1;

    const stats = statsResult[0] || {
      totalSessions: 0,
      totalTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalCost: 0,
      avgDurationMs: 0,
      maxTokens: 0
    };

    const sessionCount = stats.totalSessions || 0;
    const avgTokensPerSession = sessionCount > 0 ? Math.round(stats.totalTokens / sessionCount) : 0;
    const avgCostPerSession = sessionCount > 0 ? Number((stats.totalCost / sessionCount).toFixed(5)) : 0;
    const workloadSharePercentage = totalWorkspaceSessions > 0 
      ? Number(((sessionCount / totalWorkspaceSessions) * 100).toFixed(1))
      : 0;

    res.json({
      specs: resolved,
      statistics: {
        totalSessions: sessionCount,
        totalTokens: stats.totalTokens || 0,
        inputTokens: stats.inputTokens || 0,
        outputTokens: stats.outputTokens || 0,
        totalCost: Number((stats.totalCost || 0).toFixed(5)),
        avgTokensPerSession,
        avgCostPerSession,
        avgDurationMs: Math.round(stats.avgDurationMs || 0),
        maxTokensSingleSession: stats.maxTokens || 0,
        workloadSharePercentage,
        dateRange
      }
    });
  } catch (error) {
    console.error('[dashboard/model-specs] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/dashboard/summary?dateRange=...&model=...&workspaceId=...
router.get('/summary', async (req, res) => {
  try {
    const dateRange = (req.query.dateRange as string) || (req.query.range as string) || '1d';
    const model = req.query.model as string;
    const workspaceId = req.query.workspaceId as string;
    const tzOffset = getClientTzOffset(req);
    const { currentThreshold, endThreshold, previousThreshold, previousEndThreshold, label } = getDateThresholds(dateRange, tzOffset);
    const modelCond = getModelCondition(model);
    const wsCond = getWorkspaceCondition(workspaceId);

    // Current period stats
    let currentConditions = [];
    if (modelCond) currentConditions.push(modelCond);
    if (wsCond) currentConditions.push(wsCond);

    if (currentThreshold && endThreshold) {
      currentConditions.push(
        and(
          gte(sessions.startedAt, currentThreshold.toISOString()),
          lt(sessions.startedAt, endThreshold.toISOString())
        )
      );
    } else if (currentThreshold) {
      currentConditions.push(gte(sessions.startedAt, currentThreshold.toISOString()));
    }

    let currentQuery = db.select({
      totalSessions: sql<number>`count(*)`,
      totalTokens: sql<number>`coalesce(sum(${sessions.totalTokens}), 0)`,
      inputTokens: sql<number>`coalesce(sum(${sessions.inputTokens}), 0)`,
      outputTokens: sql<number>`coalesce(sum(${sessions.outputTokens}), 0)`,
      totalCost: sql<number>`coalesce(sum(${sessions.estimatedCost}), 0)`,
      avgDurationMs: sql<number>`coalesce(avg(${sessions.durationMs}), 0)`,
      totalToolCalls: sql<number>`coalesce(sum(${sessions.toolCalls}), 0)`,
      completedSessions: sql<number>`coalesce(sum(case when ${sessions.status} = 'completed' or ${sessions.status} = 'success' then 1 else 0 end), 0)`
    }).from(sessions);

    if (currentConditions.length > 0) {
      currentQuery = currentQuery.where(and(...currentConditions)) as any;
    }

    const currentStatsResult = await currentQuery;
    const current = currentStatsResult[0] || { 
      totalSessions: 0, 
      totalTokens: 0, 
      inputTokens: 0, 
      outputTokens: 0, 
      totalCost: 0, 
      avgDurationMs: 0, 
      totalToolCalls: 0, 
      completedSessions: 0 
    };

    const totalSessions = current.totalSessions || 0;
    const totalTokens = current.totalTokens || 0;
    const inputTokens = current.inputTokens || 0;
    const outputTokens = current.outputTokens || 0;
    const totalCost = Number((current.totalCost || 0).toFixed(4));
    
    const inputRatio = totalTokens > 0 ? Number(((inputTokens / totalTokens) * 100).toFixed(1)) : 0;
    const outputRatio = totalTokens > 0 ? Number(((outputTokens / totalTokens) * 100).toFixed(1)) : 0;
    const avgCostPerSession = totalSessions > 0 ? Number((totalCost / totalSessions).toFixed(4)) : 0;
    const avgTokensPerSession = totalSessions > 0 ? Math.round(totalTokens / totalSessions) : 0;
    const avgDurationMs = Math.round(current.avgDurationMs || 0);
    const avgDurationSec = Number(((current.avgDurationMs || 0) / 1000).toFixed(1));
    const avgToolCalls = totalSessions > 0 ? Number(((current.totalToolCalls || 0) / totalSessions).toFixed(1)) : 0;
    const successRate = totalSessions > 0 ? Number(((current.completedSessions / totalSessions) * 100).toFixed(1)) : 100;

    // Previous period stats for trend comparison
    let sessionTrend = { value: 0, isPositive: true, label };
    let tokenTrend = { value: 0, isPositive: true, label };
    let costTrend = { value: 0, isPositive: true, label };

    if (currentThreshold && previousThreshold) {
      const prevConditions = [];
      if (modelCond) prevConditions.push(modelCond);
      if (wsCond) prevConditions.push(wsCond);

      if (previousEndThreshold) {
        prevConditions.push(
          and(
            gte(sessions.startedAt, previousThreshold.toISOString()),
            lt(sessions.startedAt, previousEndThreshold.toISOString())
          )
        );
      } else {
        prevConditions.push(
          and(
            gte(sessions.startedAt, previousThreshold.toISOString()),
            lt(sessions.startedAt, currentThreshold.toISOString())
          )
        );
      }

      const prevStatsResult = await db.select({
        totalSessions: sql<number>`count(*)`,
        totalTokens: sql<number>`coalesce(sum(${sessions.totalTokens}), 0)`,
        totalCost: sql<number>`coalesce(sum(${sessions.estimatedCost}), 0)`
      })
      .from(sessions)
      .where(and(...prevConditions));

      const prev = prevStatsResult[0] || { totalSessions: 0, totalTokens: 0, totalCost: 0 };
      const prevSessions = prev.totalSessions || 0;
      const prevTokens = prev.totalTokens || 0;
      const prevCost = prev.totalCost || 0;

      const calcTrend = (curr: number, prior: number) => {
        if (prior === 0) return curr > 0 ? { value: 100, isPositive: true, label } : { value: 0, isPositive: true, label };
        const diff = ((curr - prior) / prior) * 100;
        return {
          value: Math.min(Math.round(Math.abs(diff)), 999),
          isPositive: diff >= 0,
          label
        };
      };

      sessionTrend = calcTrend(totalSessions, prevSessions);
      tokenTrend = calcTrend(totalTokens, prevTokens);
      costTrend = calcTrend(totalCost, prevCost);
    }

    res.json({
      totalSessions,
      totalTokens,
      inputTokens,
      outputTokens,
      inputRatio,
      outputRatio,
      totalCost,
      avgCostPerSession,
      avgTokensPerSession,
      avgDurationMs,
      avgDurationSec,
      avgToolCalls,
      successRate,
      sessionTrend,
      tokenTrend,
      costTrend,
      dateRange,
      model: model || 'all',
      workspaceId: workspaceId || 'all'
    });
  } catch (error) {
    console.error('[dashboard/summary] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/dashboard/recent-sessions?dateRange=...&model=...&workspaceId=...
router.get('/recent-sessions', async (req, res) => {
  try {
    const dateRange = (req.query.dateRange as string) || (req.query.range as string) || '1d';
    const model = req.query.model as string;
    const workspaceId = req.query.workspaceId as string;
    const tzOffset = getClientTzOffset(req);
    const { currentThreshold, endThreshold } = getDateThresholds(dateRange, tzOffset);
    const modelCond = getModelCondition(model);
    const wsCond = getWorkspaceCondition(workspaceId);

    const conditions = [];
    if (modelCond) conditions.push(modelCond);
    if (wsCond) conditions.push(wsCond);

    if (currentThreshold && endThreshold) {
      conditions.push(
        and(
          gte(sessions.startedAt, currentThreshold.toISOString()),
          lt(sessions.startedAt, endThreshold.toISOString())
        )
      );
    } else if (currentThreshold) {
      conditions.push(gte(sessions.startedAt, currentThreshold.toISOString()));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const limitParam = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const limit = Math.min(Math.max(limitParam, 1), 200);

    const recentSessions = await db.query.sessions.findMany({
      where: whereClause,
      limit,
      orderBy: [desc(sessions.startedAt)],
      with: {
        agent: true,
        workspace: true,
        sessionTags: {
          with: {
            tag: true
          }
        }
      }
    });

    const formatted = recentSessions.map(session => {
      const meta = typeof session.metadata === 'string' ? JSON.parse(session.metadata || '{}') : (session.metadata || {});
      const modelInfo = ModelRegistry.resolve(session.model);
      const effortLevel = meta.effortLevel || (modelInfo.supportsThinking ? 'High' : 'Medium');

      return {
        id: session.id,
        agentName: session.agent?.name || 'Unknown Agent',
        workspaceId: session.workspaceId,
        workspaceName: session.workspace?.name || 'Default Workspace',
        workspacePath: session.workspace?.path || '',
        model: session.model,
        modelName: meta.modelName || modelInfo.name,
        provider: meta.provider || modelInfo.provider,
        modelColor: modelInfo.color,
        modelBg: modelInfo.badgeBg,
        startedAt: session.startedAt,
        durationMs: session.durationMs,
        inputTokens: session.inputTokens,
        outputTokens: session.outputTokens,
        totalTokens: session.totalTokens,
        estimatedCost: session.estimatedCost,
        status: session.status,
        summary: session.summary,
        metadata: meta,
        effortLevel,
        tags: session.sessionTags.map(st => st.tag)
      };
    });

    res.json({ data: formatted });
  } catch (error) {
    console.error('[dashboard/recent-sessions] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/dashboard/recent-tags?workspaceId=...
router.get('/recent-tags', async (req, res) => {
  try {
    const workspaceId = req.query.workspaceId as string;
    const wsCond = getWorkspaceCondition(workspaceId);

    let query = db.select({
      id: tags.id,
      prefix: tags.prefix,
      identifier: tags.identifier,
      action: tags.action,
      raw: tags.raw,
      color: tags.color,
      usageCount: sql<number>`count(${sessionTags.sessionId})`
    })
    .from(tags)
    .leftJoin(sessionTags, eq(tags.id, sessionTags.tagId))
    .leftJoin(sessions, eq(sessionTags.sessionId, sessions.id));

    if (wsCond) {
      query = query.where(wsCond) as any;
    }

    const popularTags = await query
      .groupBy(tags.id)
      .orderBy(desc(sql`count(${sessionTags.sessionId})`))
      .limit(10);

    res.json({ data: popularTags });
  } catch (error) {
    console.error('[dashboard/recent-tags] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/dashboard/trends?dateRange=...&model=...&workspaceId=...
router.get('/trends', async (req, res) => {
  try {
    const dateRange = (req.query.dateRange as string) || (req.query.range as string) || '1d';
    const model = req.query.model as string;
    const workspaceId = req.query.workspaceId as string;
    const tzOffset = getClientTzOffset(req);
    const { currentThreshold, endThreshold, isSingleDay, sqliteTzModifier } = getDateThresholds(dateRange, tzOffset);
    const modelCond = getModelCondition(model);
    const wsCond = getWorkspaceCondition(workspaceId);

    if (isSingleDay) {
      // Group by local hour for single day view (e.g. 10:00)
      const conditions = [];
      if (modelCond) conditions.push(modelCond);
      if (wsCond) conditions.push(wsCond);

      if (currentThreshold && endThreshold) {
        conditions.push(
          and(
            gte(sessions.startedAt, currentThreshold.toISOString()),
            lt(sessions.startedAt, endThreshold.toISOString())
          )
        );
      } else if (currentThreshold) {
        conditions.push(gte(sessions.startedAt, currentThreshold.toISOString()));
      }

      let query = db.select({
        date: sql<string>`strftime('%H:00', datetime(${sessions.startedAt}, ${sqliteTzModifier}))`,
        inputTokens: sql<number>`coalesce(sum(${sessions.inputTokens}), 0)`,
        outputTokens: sql<number>`coalesce(sum(${sessions.outputTokens}), 0)`,
        tokens: sql<number>`coalesce(sum(${sessions.totalTokens}), 0)`,
        cost: sql<number>`coalesce(sum(${sessions.estimatedCost}), 0)`,
        avgDurationMs: sql<number>`coalesce(avg(${sessions.durationMs}), 0)`,
        toolCalls: sql<number>`coalesce(sum(${sessions.toolCalls}), 0)`,
        sessionCount: sql<number>`count(*)`
      })
      .from(sessions);

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const rawTrendData = await query
        .groupBy(sql`strftime('%H:00', datetime(${sessions.startedAt}, ${sqliteTzModifier}))`)
        .orderBy(sql`strftime('%H:00', datetime(${sessions.startedAt}, ${sqliteTzModifier})) ASC`);

      const trendData = rawTrendData.map(d => ({
        date: d.date,
        inputTokens: d.inputTokens || 0,
        outputTokens: d.outputTokens || 0,
        tokens: d.tokens || 0,
        cost: Number(Number(d.cost || 0).toFixed(4)),
        avgDurationMs: Math.round(d.avgDurationMs || 0),
        avgDurationSec: Number(((d.avgDurationMs || 0) / 1000).toFixed(1)),
        toolCalls: d.toolCalls || 0,
        sessionCount: d.sessionCount || 0
      }));

      return res.json({ data: trendData });
    }

    // Group by local date (YYYY-MM-DD) for 7d, 30d, 90d, 180d, 365d, all
    const conditions = [];
    if (modelCond) conditions.push(modelCond);
    if (wsCond) conditions.push(wsCond);
    if (currentThreshold) {
      conditions.push(gte(sessions.startedAt, currentThreshold.toISOString()));
    }

    let query = db.select({
      date: sql<string>`strftime('%Y-%m-%d', datetime(${sessions.startedAt}, ${sqliteTzModifier}))`,
      inputTokens: sql<number>`coalesce(sum(${sessions.inputTokens}), 0)`,
      outputTokens: sql<number>`coalesce(sum(${sessions.outputTokens}), 0)`,
      tokens: sql<number>`coalesce(sum(${sessions.totalTokens}), 0)`,
      cost: sql<number>`coalesce(sum(${sessions.estimatedCost}), 0)`,
      avgDurationMs: sql<number>`coalesce(avg(${sessions.durationMs}), 0)`,
      toolCalls: sql<number>`coalesce(sum(${sessions.toolCalls}), 0)`,
      sessionCount: sql<number>`count(*)`
    })
    .from(sessions);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const rawTrendData = await query
      .groupBy(sql`strftime('%Y-%m-%d', datetime(${sessions.startedAt}, ${sqliteTzModifier}))`)
      .orderBy(sql`strftime('%Y-%m-%d', datetime(${sessions.startedAt}, ${sqliteTzModifier})) ASC`);

    const trendData = rawTrendData.map(d => ({
      date: d.date,
      inputTokens: d.inputTokens || 0,
      outputTokens: d.outputTokens || 0,
      tokens: d.tokens || 0,
      cost: Number(Number(d.cost || 0).toFixed(4)),
      avgDurationMs: Math.round(d.avgDurationMs || 0),
      avgDurationSec: Number(((d.avgDurationMs || 0) / 1000).toFixed(1)),
      toolCalls: d.toolCalls || 0,
      sessionCount: d.sessionCount || 0
    }));

    res.json({ data: trendData });
  } catch (error) {
    console.error('[dashboard/trends] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/dashboard/intent-distribution?dateRange=...&model=...&workspaceId=...
router.get('/intent-distribution', async (req, res) => {
  try {
    const dateRange = (req.query.dateRange as string) || (req.query.range as string) || '1d';
    const model = req.query.model as string;
    const workspaceId = req.query.workspaceId as string;
    const tzOffset = getClientTzOffset(req);
    const { currentThreshold, endThreshold } = getDateThresholds(dateRange, tzOffset);
    const modelCond = getModelCondition(model);
    const wsCond = getWorkspaceCondition(workspaceId);

    const conditions = [];
    if (modelCond) conditions.push(modelCond);
    if (wsCond) conditions.push(wsCond);

    if (currentThreshold && endThreshold) {
      conditions.push(
        and(
          gte(sessions.startedAt, currentThreshold.toISOString()),
          lt(sessions.startedAt, endThreshold.toISOString())
        )
      );
    } else if (currentThreshold) {
      conditions.push(gte(sessions.startedAt, currentThreshold.toISOString()));
    }

    let query = db.select({
      tagId: tags.id,
      tagName: tags.action,
      tagRaw: tags.raw,
      tagColor: tags.color,
      count: sql<number>`count(${sessions.id})`,
      totalTokens: sql<number>`coalesce(sum(${sessions.totalTokens}), 0)`,
      totalCost: sql<number>`coalesce(sum(${sessions.estimatedCost}), 0)`,
      avgDurationMs: sql<number>`coalesce(avg(${sessions.durationMs}), 0)`
    })
    .from(sessions)
    .innerJoin(sessionTags, eq(sessions.id, sessionTags.sessionId))
    .innerJoin(tags, eq(sessionTags.tagId, tags.id));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query
      .groupBy(tags.id)
      .orderBy(desc(sql`count(${sessions.id})`));

    const totalTurns = results.reduce((acc, r) => acc + (r.count || 0), 0);

    const formatted = results.map(r => ({
      id: r.tagId,
      tag: r.tagRaw || `[${r.tagName}]`,
      name: r.tagName || r.tagRaw?.replace(/[\[\]]/g, '') || 'Task',
      color: r.tagColor || TagService.getTagColor(r.tagName || 'Unknown'),
      count: r.count,
      percentage: totalTurns > 0 ? Number(((r.count / totalTurns) * 100).toFixed(1)) : 0,
      totalTokens: r.totalTokens || 0,
      totalCost: Number((r.totalCost || 0).toFixed(4)),
      avgDurationMs: Math.round(r.avgDurationMs || 0),
      avgDurationSec: Number(((r.avgDurationMs || 0) / 1000).toFixed(1))
    }));

    res.json({ data: formatted });
  } catch (error) {
    console.error('[dashboard/intent-distribution] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/dashboard/agent-distribution?dateRange=...&model=...&workspaceId=...
router.get('/agent-distribution', async (req, res) => {
  try {
    const dateRange = (req.query.dateRange as string) || (req.query.range as string) || '1d';
    const model = req.query.model as string;
    const workspaceId = req.query.workspaceId as string;
    const tzOffset = getClientTzOffset(req);
    const { currentThreshold, endThreshold } = getDateThresholds(dateRange, tzOffset);
    const modelCond = getModelCondition(model);
    const wsCond = getWorkspaceCondition(workspaceId);

    const conditions = [];
    if (modelCond) conditions.push(modelCond);
    if (wsCond) conditions.push(wsCond);

    if (currentThreshold && endThreshold) {
      conditions.push(
        and(
          gte(sessions.startedAt, currentThreshold.toISOString()),
          lt(sessions.startedAt, endThreshold.toISOString())
        )
      );
    } else if (currentThreshold) {
      conditions.push(gte(sessions.startedAt, currentThreshold.toISOString()));
    }

    let query = db.select({
      agentName: agents.name,
      sessionCount: sql<number>`count(${sessions.id})`
    })
    .from(sessions)
    .leftJoin(agents, eq(sessions.agentId, agents.id));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const distribution = await query
      .groupBy(agents.name)
      .orderBy(desc(sql`count(${sessions.id})`));

    const formatted = distribution.map(d => ({
      name: d.agentName || 'Unknown Agent',
      value: d.sessionCount
    }));

    res.json({ data: formatted });
  } catch (error) {
    console.error('[dashboard/agent-distribution] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/dashboard/agents
router.get('/agents', async (_req, res) => {
  try {
    const allAgents = await db.select().from(agents);
    res.json({ data: allAgents });
  } catch (error) {
    console.error('[dashboard/agents] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
