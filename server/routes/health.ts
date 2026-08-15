import { Router } from 'express';
import { sqlite } from '../db/index.js';

const router = Router();

// GET /api/health
router.get('/', (req, res) => {
  const startTime = Date.now();
  
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;

  try {
    const queryStart = Date.now();
    // Run simple fast pragma check
    sqlite.prepare('SELECT 1').get();
    dbLatencyMs = Date.now() - queryStart;
  } catch (error: any) {
    dbStatus = 'unhealthy';
    console.error('[Health] DB probe failed:', error.message);
  }

  const memoryUsage = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  const responsePayload = {
    status: dbStatus === 'healthy' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
    },
    system: {
      nodeVersion: process.version,
      memory: {
        rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      }
    }
  };

  const httpStatus = dbStatus === 'healthy' ? 200 : 503;
  res.status(httpStatus).json(responsePayload);
});

export default router;
