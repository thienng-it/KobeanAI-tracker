import { db } from '../db/index.js';
import { AgentConnector, AgentConfig } from '../connectors/base.js';
import { AntigravityConnector } from '../connectors/antigravity.js';
import { ClaudeConnector } from '../connectors/claude.js';
import { CursorConnector } from '../connectors/cursor.js';

export class TelemetryService {
  private static instance: TelemetryService;
  private connectors: Map<string, AgentConnector> = new Map();

  private constructor() {}

  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  public async start(): Promise<void> {
    console.log('[TelemetryService] Starting multi-agent telemetry engine...');
    await this.syncConnectors();
  }

  public async stop(): Promise<void> {
    console.log('[TelemetryService] Stopping telemetry engine...');
    for (const connector of this.connectors.values()) {
      await connector.stopWatching();
    }
    this.connectors.clear();
  }

  /**
   * Syncs running connectors with active agent configurations in SQLite.
   */
  public async syncConnectors(): Promise<void> {
    const agents = await db.query.agents.findMany();

    for (const agent of agents) {
      let config: AgentConfig = {};
      try {
        if (agent.config) {
          config = typeof agent.config === 'string' ? JSON.parse(agent.config) : agent.config;
        }
      } catch (e) {
        console.error(`[TelemetryService] Failed to parse config for agent ${agent.id}`, e);
        continue;
      }

      const agentType = (agent.type || '').toLowerCase();
      const agentId = agent.id.toLowerCase();
      let connectorFactory: (() => AgentConnector) | null = null;

      if (agentType.includes('antigravity') || agentId.includes('antigravity') || agentType.includes('gemini')) {
        connectorFactory = () => new AntigravityConnector(agent.id, agent.name, config);
      } else if (agentType.includes('claude') || agentId.includes('claude')) {
        connectorFactory = () => new ClaudeConnector(agent.id, agent.name, config);
      } else if (agentType.includes('cursor') || agentId.includes('cursor') || agentType.includes('ide')) {
        connectorFactory = () => new CursorConnector(agent.id, agent.name, config);
      } else {
        // Fallback generic / Antigravity connector for custom AI CLI / IDE tools
        connectorFactory = () => new AntigravityConnector(agent.id, agent.name, config);
      }

      const existing = this.connectors.get(agent.id);
      if (existing) {
        const existingConfig = existing.getConfig();
        if (JSON.stringify(existingConfig) !== JSON.stringify(config)) {
          console.log(`[TelemetryService] Restarting connector for ${agent.name} (${agent.type})`);
          await existing.stopWatching();
          const newConnector = connectorFactory();
          this.connectors.set(agent.id, newConnector);
          await newConnector.startWatching();
        }
      } else {
        console.log(`[TelemetryService] Initializing connector for ${agent.name} (${agent.type})`);
        const newConnector = connectorFactory();
        this.connectors.set(agent.id, newConnector);
        await newConnector.startWatching();
      }
    }
  }
}
