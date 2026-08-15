import { Router } from 'express';
import { db } from '../db/index.js';
import { sessions } from '../db/schema.js';
import { desc, and, eq, gte, inArray, like, or } from 'drizzle-orm';
import { subDays } from 'date-fns';
import { ModelRegistry } from '../services/model-registry.js';

const router = Router();

// GET /api/sessions
router.get('/', async (req, res) => {
  try {
    const { agentId, tagId, dateRange, search, limit = '50', offset = '0' } = req.query;

    let whereClause = undefined;
    const conditions = [];

    if (search && typeof search === 'string') {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          like(sessions.summary, searchTerm),
          like(sessions.model, searchTerm)
        )
      );
    }

    if (agentId && typeof agentId === 'string' && agentId !== 'all') {
      conditions.push(eq(sessions.agentId, agentId));
    }

    if (dateRange && typeof dateRange === 'string' && dateRange !== 'all') {
      const now = new Date();
      let thresholdDate: Date | null = null;
      if (dateRange === '1d') thresholdDate = subDays(now, 1);
      else if (dateRange === '7d') thresholdDate = subDays(now, 7);
      else if (dateRange === '30d') thresholdDate = subDays(now, 30);
      else if (dateRange === '90d') thresholdDate = subDays(now, 90);
      else if (dateRange === '180d') thresholdDate = subDays(now, 180);
      else if (dateRange === '365d') thresholdDate = subDays(now, 365);

      if (thresholdDate) {
        conditions.push(gte(sessions.startedAt, thresholdDate.toISOString()));
      }
    }

    // Tag filtering requires a subquery or join, which is slightly more complex.
    // For simplicity, since Drizzle doesn't support easy exists subqueries right out of the box with the query builder,
    // if tagId is provided, we fetch the sessionIds that have that tag first.
    if (tagId && typeof tagId === 'string') {
      const sessionTagsMap = await db.query.sessionTags.findMany({
        where: (st, { eq }) => eq(st.tagId, tagId),
        columns: { sessionId: true }
      });
      const sessionIds = sessionTagsMap.map(st => st.sessionId);
      
      if (sessionIds.length > 0) {
        conditions.push(inArray(sessions.id, sessionIds));
      } else {
        // Force no results if tag has no sessions
        conditions.push(eq(sessions.id, 'NO_MATCH')); 
      }
    }

    if (conditions.length > 0) {
      whereClause = and(...conditions);
    }

    const fetchedSessions = await db.query.sessions.findMany({
      where: whereClause,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
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

    // We also need total count for pagination (omitted for brevity, just returning fake total for now if not calculated)
    const formatted = fetchedSessions.map(session => {
      const meta = typeof session.metadata === 'string' ? JSON.parse(session.metadata || '{}') : (session.metadata || {});
      const modelInfo = ModelRegistry.resolve(session.model);
      const effortLevel = meta.effortLevel || (modelInfo.supportsThinking ? 'High' : 'Medium');

      return {
        id: session.id,
        agentName: session.agent?.name || 'Unknown Agent',
        agentId: session.agentId,
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

    res.json({
      data: formatted,
      meta: {
        total: formatted.length, // Placeholder
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10)
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/sessions/sync - Trigger manual re-scan of historical logs
router.post('/sync', async (req, res) => {
  try {
    const { TelemetryService } = await import('../services/telemetry-service.js');
    const telemetry = TelemetryService.getInstance();
    await telemetry.syncConnectors();

    const agentsList = await db.query.agents.findMany({
      where: (agent, { eq }) => eq(agent.type, 'antigravity')
    });

    let totalSynced = 0;
    for (const agent of agentsList) {
      let config = typeof agent.config === 'string' ? JSON.parse(agent.config) : (agent.config || {});
      const { AntigravityConnector } = await import('../connectors/antigravity.js');
      const connector = new AntigravityConnector(agent.id, agent.name, config);
      const count = await connector.scanHistory();
      totalSynced += count;
    }

    res.json({
      success: true,
      message: `Successfully synchronized ${totalSynced} sessions`,
      syncedCount: totalSynced
    });
  } catch (error) {
    console.error('[sessions/sync] Error:', error);
    res.status(500).json({ error: 'Failed to sync sessions' });
  }
});

export default router;
