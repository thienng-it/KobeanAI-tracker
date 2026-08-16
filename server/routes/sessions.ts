import { Router } from 'express';
import { db } from '../db/index.js';
import { sessions } from '../db/schema.js';
import { desc, and, eq, gte, lt, inArray, like, or, sql } from 'drizzle-orm';
import { ModelRegistry } from '../services/model-registry.js';
import { getDateThresholds } from '../services/date-utils.js';

const router = Router();

// GET /api/sessions
router.get('/', async (req, res) => {
  try {
    const { agentId, tagId, model, workspaceId, dateRange, search, limit = '50', offset = '0' } = req.query;

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

    if (workspaceId && typeof workspaceId === 'string' && workspaceId !== 'all') {
      conditions.push(eq(sessions.workspaceId, workspaceId));
    }

    if (model && typeof model === 'string' && model !== 'all') {
      const cleanModel = model.toLowerCase().trim();
      const baseModel = cleanModel.replace(/--high-?|--medium-?|--low-?|--thinking-?|-thinking/g, '');
      conditions.push(
        or(
          eq(sessions.model, cleanModel),
          eq(sessions.model, baseModel),
          like(sessions.model, `${baseModel}%`),
          like(sessions.model, `%${baseModel}%`)
        )
      );
    }

    if (dateRange && typeof dateRange === 'string' && dateRange !== 'all') {
      const tzOffset = (req.query.tzOffset as string) || (req.headers['x-timezone-offset'] as string);
      const { currentThreshold, endThreshold } = getDateThresholds(dateRange, tzOffset);

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
    }

    // Tag filtering
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
        workspace: true,
        sessionTags: {
          with: {
            tag: true
          }
        }
      }
    });

    const formatted = fetchedSessions.map(session => {
      const meta = typeof session.metadata === 'string' ? JSON.parse(session.metadata || '{}') : (session.metadata || {});
      const modelInfo = ModelRegistry.resolve(session.model);
      const effortLevel = meta.effortLevel || (modelInfo.supportsThinking ? 'High' : 'Medium');

      return {
        id: session.id,
        agentName: session.agent?.name || 'Unknown Agent',
        agentId: session.agentId,
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

    // Compute total matching count and aggregate metrics for pagination and stats
    let countQuery = db.select({
      count: sql<number>`count(*)`,
      totalTokens: sql<number>`coalesce(sum(${sessions.totalTokens}), 0)`,
      totalCost: sql<number>`coalesce(sum(${sessions.estimatedCost}), 0)`
    }).from(sessions);

    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions)) as any;
    }

    const countResult = await countQuery;
    const totalMatching = countResult[0]?.count || 0;
    const filteredTokens = countResult[0]?.totalTokens || 0;
    const filteredCost = Number((countResult[0]?.totalCost || 0).toFixed(4));

    res.json({
      data: formatted,
      meta: {
        total: totalMatching,
        totalTokens: filteredTokens,
        totalCost: filteredCost,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10)
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/sessions/sync - Trigger manual re-scan of historical logs across all agents
router.post('/sync', async (req, res) => {
  try {
    const { WorkspaceService } = await import('../services/workspace-service.js');
    await WorkspaceService.cleanUpBranchWorkspaces();

    const { TelemetryService } = await import('../services/telemetry-service.js');
    const telemetry = TelemetryService.getInstance();
    await telemetry.syncConnectors();

    const agentsList = await db.query.agents.findMany();

    let totalSynced = 0;
    for (const agent of agentsList) {
      let config = typeof agent.config === 'string' ? JSON.parse(agent.config) : (agent.config || {});
      const agentType = (agent.type || '').toLowerCase();

      if (agentType.includes('antigravity') || agent.id.includes('antigravity')) {
        const { AntigravityConnector } = await import('../connectors/antigravity.js');
        const connector = new AntigravityConnector(agent.id, agent.name, config);
        const count = await connector.scanHistory();
        totalSynced += count;
      } else if (agentType.includes('claude') || agent.id.includes('claude')) {
        const { ClaudeConnector } = await import('../connectors/claude.js');
        const connector = new ClaudeConnector(agent.id, agent.name, config);
        const count = await connector.syncLatest();
        totalSynced += count;
      } else if (agentType.includes('cursor') || agent.id.includes('cursor')) {
        const { CursorConnector } = await import('../connectors/cursor.js');
        const connector = new CursorConnector(agent.id, agent.name, config);
        const count = await connector.scanHistory();
        totalSynced += count;
      }
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
