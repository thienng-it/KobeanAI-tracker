import { db } from '../db/index.js';
import { AgentConnector, AgentConfig } from '../connectors/base.js';
import { AntigravityConnector } from '../connectors/antigravity.js';

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
    console.log('[TelemetryService] Starting telemetry engine...');
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
   * Syncs the running connectors with the current state in the database.
   * Can be called when an agent's config is updated in the UI.
   */
  public async syncConnectors(): Promise<void> {
    const agents = await db.query.agents.findMany();

    for (const agent of agents) {
      if (!agent.config) continue;

      let config: AgentConfig;
      try {
        config = typeof agent.config === 'string' ? JSON.parse(agent.config) : agent.config;
      } catch (e) {
        console.error(`[TelemetryService] Failed to parse config for agent ${agent.id}`, e);
        continue;
      }

      // Check if we need to start or restart a connector
      if (agent.type === 'antigravity') {
        const existing = this.connectors.get(agent.id);
        
        if (existing) {
          // If config changed, restart it
          const existingConfig = existing.getConfig();
          if (JSON.stringify(existingConfig) !== JSON.stringify(config)) {
            console.log(`[TelemetryService] Restarting connector for ${agent.name} due to config change`);
            await existing.stopWatching();
            const newConnector = new AntigravityConnector(agent.id, agent.name, config);
            this.connectors.set(agent.id, newConnector);
            await newConnector.startWatching();
          }
        } else {
          // Start a new connector
          console.log(`[TelemetryService] Initializing connector for ${agent.name}`);
          const connector = new AntigravityConnector(agent.id, agent.name, config);
          this.connectors.set(agent.id, connector);
          await connector.startWatching();
        }
      }
      
      // We would add other connector types (Claude, Codex, etc.) here
    }
  }
}
