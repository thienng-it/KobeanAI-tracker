import { Router } from 'express';
import { db } from '../db/index.js';
import { sessions, tags, sessionTags, agents } from '../db/schema.js';
import { desc, eq, sql, gte, lt, and } from 'drizzle-orm';
import { subDays, subHours } from 'date-fns';
import { ModelRegistry } from '../services/model-registry.js';

const router = Router();

function getDateThresholds(dateRange: string) {
  const now = new Date();
  let currentThreshold: Date | null = null;
  let endThreshold: Date | null = null;
  let previousThreshold: Date | null = null;
  let previousEndThreshold: Date | null = null;
  let label = 'vs previous period';
  let isSingleDay = false;

  // Check if dateRange is a specific date: YYYY-MM-DD or date:YYYY-MM-DD
  const dateMatch = dateRange.match(/(?:date:)?(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    const dateStr = dateMatch[1];
    currentThreshold = new Date(`${dateStr}T00:00:00.000Z`);
    endThreshold = new Date(`${dateStr}T23:59:59.999Z`);
    previousThreshold = subDays(currentThreshold, 1);
    previousEndThreshold = new Date(`${subDays(currentThreshold, 1).toISOString().slice(0, 10)}T23:59:59.999Z`);
    label = `vs prior day (${subDays(currentThreshold, 1).toISOString().slice(5, 10)})`;
    isSingleDay = true;
    return { currentThreshold, endThreshold, previousThreshold, previousEndThreshold, label, isSingleDay, dateStr };
  }

  switch (dateRange) {
    case '1d':
      currentThreshold = subHours(now, 24);
      previousThreshold = subHours(now, 48);
      label = 'vs yesterday';
      isSingleDay = true;
      break;
    case '7d':
      currentThreshold = subDays(now, 7);
      previousThreshold = subDays(now, 14);
      label = 'vs last week';
      break;
    case '30d':
      currentThreshold = subDays(now, 30);
      previousThreshold = subDays(now, 60);
      label = 'vs last month';
      break;
    case '90d':
      currentThreshold = subDays(now, 90);
      previousThreshold = subDays(now, 180);
      label = 'vs last quarter';
      break;
    case '180d':
      currentThreshold = subDays(now, 180);
      previousThreshold = subDays(now, 360);
      label = 'vs last 6 months';
      break;
    case '365d':
      currentThreshold = subDays(now, 365);
      previousThreshold = subDays(now, 730);
      label = 'vs last year';
      break;
    case 'all':
    default:
      currentThreshold = null;
      previousThreshold = null;
      label = 'overall';
      break;
  }

  return { currentThreshold, endThreshold, previousThreshold, previousEndThreshold, label, isSingleDay };
}

// GET /api/dashboard/summary?dateRange=...
router.get('/summary', async (req, res) => {
  try {
    const dateRange = (req.query.dateRange as string) || '7d';
    const { currentThreshold, endThreshold, previousThreshold, label } = getDateThresholds(dateRange);

    // Current period stats
    let currentQuery = db.select({
      totalSessions: sql<number>`count(*)`,
      totalTokens: sql<number>`sum(${sessions.totalTokens})`,
      totalCost: sql<number>`sum(${sessions.estimatedCost})`
    }).from(sessions);

    if (currentThreshold && endThreshold) {
      currentQuery = currentQuery.where(
        and(
          gte(sessions.startedAt, currentThreshold.toISOString()),
          lt(sessions.startedAt, endThreshold.toISOString())
        )
      ) as any;
    } else if (currentThreshold) {
      currentQuery = currentQuery.where(gte(sessions.startedAt, currentThreshold.toISOString())) as any;
    }

    const currentStatsResult = await currentQuery;
    const current = currentStatsResult[0] || { totalSessions: 0, totalTokens: 0, totalCost: 0 };

    const totalSessions = current.totalSessions || 0;
    const totalTokens = current.totalTokens || 0;
    const totalCost = current.totalCost || 0;

    // Previous period stats for trend comparison
    let sessionTrend = { value: 0, isPositive: true, label };
    let tokenTrend = { value: 0, isPositive: true, label };
    let costTrend = { value: 0, isPositive: true, label };

    if (currentThreshold && previousThreshold) {
      const prevStatsResult = await db.select({
        totalSessions: sql<number>`count(*)`,
        totalTokens: sql<number>`sum(${sessions.totalTokens})`,
        totalCost: sql<number>`sum(${sessions.estimatedCost})`
      })
      .from(sessions)
      .where(
        and(
          gte(sessions.startedAt, previousThreshold.toISOString()),
          lt(sessions.startedAt, currentThreshold.toISOString())
        )
      );

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
      totalCost,
      sessionTrend,
      tokenTrend,
      costTrend,
      dateRange
    });
  } catch (error) {
    console.error('[dashboard/summary] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/dashboard/recent-sessions?dateRange=...
router.get('/recent-sessions', async (req, res) => {
  try {
    const dateRange = (req.query.dateRange as string) || '7d';
    const { currentThreshold, endThreshold } = getDateThresholds(dateRange);

    let whereClause = undefined;
    if (currentThreshold && endThreshold) {
      whereClause = and(
        gte(sessions.startedAt, currentThreshold.toISOString()),
        lt(sessions.startedAt, endThreshold.toISOString())
      );
    } else if (currentThreshold) {
      whereClause = gte(sessions.startedAt, currentThreshold.toISOString());
    }

    const recentSessions = await db.query.sessions.findMany({
      where: whereClause,
      limit: 15,
      orderBy: [desc(sessions.startedAt)],
      with: {
        agent: true,
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

// GET /api/dashboard/recent-tags
router.get('/recent-tags', async (req, res) => {
  try {
    const popularTags = await db.select({
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
    .groupBy(tags.id)
    .orderBy(desc(sql`count(${sessionTags.sessionId})`))
    .limit(10);

    res.json({ data: popularTags });
  } catch (error) {
    console.error('[dashboard/recent-tags] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/dashboard/trends?dateRange=...
router.get('/trends', async (req, res) => {
  try {
    const dateRange = (req.query.dateRange as string) || '7d';
    const { currentThreshold, endThreshold, isSingleDay } = getDateThresholds(dateRange);

    if (isSingleDay) {
      // Group by hour for single day view (e.g. 13:00)
      let query = db.select({
        date: sql<string>`substr(${sessions.startedAt}, 12, 2) || ':00'`,
        tokens: sql<number>`sum(${sessions.totalTokens})`,
        cost: sql<number>`sum(${sessions.estimatedCost})`
      })
      .from(sessions);

      if (currentThreshold && endThreshold) {
        query = query.where(
          and(
            gte(sessions.startedAt, currentThreshold.toISOString()),
            lt(sessions.startedAt, endThreshold.toISOString())
          )
        ) as any;
      } else if (currentThreshold) {
        query = query.where(gte(sessions.startedAt, currentThreshold.toISOString())) as any;
      }

      const trendData = await query
        .groupBy(sql`substr(${sessions.startedAt}, 12, 2)`)
        .orderBy(sql`substr(${sessions.startedAt}, 12, 2) ASC`);

      return res.json({ data: trendData });
    }

    // Group by date (YYYY-MM-DD) for 7d, 30d, 90d, 180d, 365d, all
    let query = db.select({
      date: sql<string>`substr(${sessions.startedAt}, 1, 10)`,
      tokens: sql<number>`sum(${sessions.totalTokens})`,
      cost: sql<number>`sum(${sessions.estimatedCost})`
    })
    .from(sessions);

    if (currentThreshold) {
      query = query.where(gte(sessions.startedAt, currentThreshold.toISOString())) as any;
    }

    const trendData = await query
      .groupBy(sql`substr(${sessions.startedAt}, 1, 10)`)
      .orderBy(sql`substr(${sessions.startedAt}, 1, 10) ASC`);

    res.json({ data: trendData });
  } catch (error) {
    console.error('[dashboard/trends] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/dashboard/agent-distribution?dateRange=...
router.get('/agent-distribution', async (req, res) => {
  try {
    const dateRange = (req.query.dateRange as string) || '7d';
    const { currentThreshold, endThreshold } = getDateThresholds(dateRange);

    let query = db.select({
      agentName: agents.name,
      sessionCount: sql<number>`count(${sessions.id})`
    })
    .from(sessions)
    .leftJoin(agents, eq(sessions.agentId, agents.id));

    if (currentThreshold && endThreshold) {
      query = query.where(
        and(
          gte(sessions.startedAt, currentThreshold.toISOString()),
          lt(sessions.startedAt, endThreshold.toISOString())
        )
      ) as any;
    } else if (currentThreshold) {
      query = query.where(gte(sessions.startedAt, currentThreshold.toISOString())) as any;
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
router.get('/agents', async (req, res) => {
  try {
    const allAgents = await db.select().from(agents);
    res.json({ data: allAgents });
  } catch (error) {
    console.error('[dashboard/agents] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
