import { Router } from 'express';
import { db } from '../db/index.js';
import { sessions, tags, sessionTags, agents } from '../db/schema.js';
import { desc, eq, sql } from 'drizzle-orm';

const router = Router();

// GET /api/dashboard/summary
router.get('/summary', async (req, res) => {
  try {
    const totalStatsResult = await db.select({
      totalSessions: sql<number>`count(*)`,
      totalTokens: sql<number>`sum(${sessions.totalTokens})`,
      totalCost: sql<number>`sum(${sessions.estimatedCost})`
    }).from(sessions);

    const stats = totalStatsResult[0] || { totalSessions: 0, totalTokens: 0, totalCost: 0 };
    
    // Defaulting nulls to 0
    res.json({
      totalSessions: stats.totalSessions || 0,
      totalTokens: stats.totalTokens || 0,
      totalCost: stats.totalCost || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/dashboard/recent-sessions
router.get('/recent-sessions', async (req, res) => {
  try {
    const recentSessions = await db.query.sessions.findMany({
      limit: 10,
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

    const formatted = recentSessions.map(session => ({
      id: session.id,
      agentName: session.agent?.name || 'Unknown Agent',
      model: session.model,
      startedAt: session.startedAt,
      durationMs: session.durationMs,
      totalTokens: session.totalTokens,
      estimatedCost: session.estimatedCost,
      status: session.status,
      summary: session.summary,
      tags: session.sessionTags.map(st => st.tag)
    }));

    res.json({ data: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/dashboard/recent-tags
router.get('/recent-tags', async (req, res) => {
  try {
    // A simplified query to get the most frequently used tags.
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
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/dashboard/trends
router.get('/trends', async (req, res) => {
  try {
    const trendData = await db.select({
      date: sql<string>`substr(${sessions.startedAt}, 1, 10)`,
      tokens: sql<number>`sum(${sessions.totalTokens})`,
      cost: sql<number>`sum(${sessions.estimatedCost})`
    })
    .from(sessions)
    .groupBy(sql`substr(${sessions.startedAt}, 1, 10)`)
    .orderBy(sql`substr(${sessions.startedAt}, 1, 10) ASC`)
    .limit(30); // last 30 active days

    res.json({ data: trendData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/dashboard/agent-distribution
router.get('/agent-distribution', async (req, res) => {
  try {
    const distribution = await db.select({
      agentName: agents.name,
      sessionCount: sql<number>`count(${sessions.id})`
    })
    .from(sessions)
    .leftJoin(agents, eq(sessions.agentId, agents.id))
    .groupBy(agents.name)
    .orderBy(desc(sql`count(${sessions.id})`));

    // Handle sessions with no linked agent in DB (just in case)
    const formatted = distribution.map(d => ({
      name: d.agentName || 'Unknown',
      value: d.sessionCount
    }));

    res.json({ data: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/dashboard/agents
router.get('/agents', async (req, res) => {
  try {
    const allAgents = await db.select().from(agents);
    res.json({ data: allAgents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
