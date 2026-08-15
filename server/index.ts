import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './db/index.js';
import { TelemetryService } from './services/telemetry-service.js';
import { errorHandler } from './middleware/error.js';

import healthRoutes from './routes/health.js';
import dashboardRoutes from './routes/dashboard.js';
import sessionsRoutes from './routes/sessions.js';
import skillsRoutes from './routes/skills.js';
import agentsRoutes from './routes/agents.js';
import commandsRoutes from './routes/commands.js';
import rulesRoutes from './routes/rules.js';

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Security Headers (configured to allow SPA inline styles/resources)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : '*';

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request body parser with reasonable size limits
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Rate Limiting on API endpoints
const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', apiLimiter);

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/commands', commandsRoutes);
app.use('/api/rules', rulesRoutes);

app.get('/api/setup/check', (req, res) => {
  res.json({
    os: process.platform,
    tools: [
      { tool: "Node.js", installed: true, version: process.version },
    ]
  });
});

app.post('/api/setup/complete', (req, res) => {
  res.json({ success: true, workspaceId: "temp-uuid" });
});

// Serve Frontend in Production / when dist exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const candidatePaths = [
  path.resolve(process.cwd(), 'dist'),
  path.resolve(__dirname, '..'),
  path.resolve(__dirname, '../../dist'),
  path.resolve((process as any).resourcesPath || '', 'app/dist'),
];

const distPath = candidatePaths.find(p => fs.existsSync(path.join(p, 'index.html')));
if (distPath) {
  console.log(`[Server] Serving frontend static assets from: ${distPath}`);
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
} else {
  console.warn('[Server] Notice: Frontend dist directory not found in candidate paths.');
}

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start server
const server = app.listen(PORT, async () => {
  console.log(`[Server] KobeanAI Tracker running on http://localhost:${PORT} (${isProd ? 'production' : 'development'})`);
  
  // Start telemetry engine
  const telemetryService = TelemetryService.getInstance();
  await telemetryService.start();

  // Auto-discover workspace & global skills, rules, and commands
  try {
    const { SkillScanner } = await import('./services/skill-scanner.js');
    await SkillScanner.syncAll();
  } catch (err) {
    console.error('[Server] Skill discovery error:', err);
  }

  // Graceful shutdown handler
  const shutdown = async (signal: string) => {
    console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
    await telemetryService.stop();
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
});

