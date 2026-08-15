import { db } from '../db/index.js';
import { workspaces, agents, tags, sessions, sessionTags } from '../db/schema.js';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  console.log('Seeding database...');
  
  // Create workspace
  const workspaceId = uuidv4();
  await db.insert(workspaces).values({
    id: workspaceId,
    name: 'Default Workspace',
    path: '/Users/dev/project',
  }).onConflictDoNothing();

  // Create agents
  const claudeId = uuidv4();
  const antigravityId = uuidv4();
  await db.insert(agents).values([
    { id: claudeId, name: 'Claude Desktop', type: 'claude', status: 'connected' },
    { 
      id: antigravityId, 
      name: 'Google Antigravity', 
      type: 'antigravity', 
      status: 'connected',
      config: JSON.stringify({ authType: 'local_log', logPath: '~/.gemini/antigravity-ide/brain/**' })
    },
  ]).onConflictDoNothing();

  // Create tags
  const tag1Id = uuidv4();
  const tag2Id = uuidv4();
  await db.insert(tags).values([
    { id: tag1Id, prefix: 'us', identifier: '1234', action: 'implement', raw: '[us-1234][implement]' },
    { id: tag2Id, prefix: 'de', identifier: '5678', action: 'debug', raw: '[de-5678][debug]' },
  ]).onConflictDoNothing();

  // Create sessions
  const sessionId1 = uuidv4();
  const sessionId2 = uuidv4();
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 3600000);
  
  await db.insert(sessions).values([
    {
      id: sessionId1,
      workspaceId,
      agentId: claudeId,
      model: 'claude-3-5-sonnet',
      startedAt: oneHourAgo.toISOString(),
      endedAt: now.toISOString(),
      durationMs: 3600000,
      inputTokens: 1500,
      outputTokens: 800,
      totalTokens: 2300,
      estimatedCost: 0.02,
      status: 'completed',
      summary: 'Implemented the auth flow based on specs.',
      toolCalls: 0
    },
    {
      id: sessionId2,
      workspaceId,
      agentId: antigravityId,
      model: 'gemini-1.5-pro',
      startedAt: oneHourAgo.toISOString(),
      endedAt: now.toISOString(),
      durationMs: 1800000,
      inputTokens: 3000,
      outputTokens: 1200,
      totalTokens: 4200,
      estimatedCost: 0.05,
      status: 'completed',
      summary: 'Debugged memory leak in node server.',
      toolCalls: 5
    }
  ]).onConflictDoNothing();

  // Link tags to sessions
  await db.insert(sessionTags).values([
    { sessionId: sessionId1, tagId: tag1Id },
    { sessionId: sessionId2, tagId: tag2Id }
  ]).onConflictDoNothing();

  console.log('Database seeded successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
