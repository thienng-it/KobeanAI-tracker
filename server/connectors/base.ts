export interface AgentConfig {
  authType: 'api_key' | 'local_log';
  apiKey?: string;
  logPath?: string;
}

export abstract class AgentConnector {
  protected id: string;
  protected name: string;
  protected config: AgentConfig;
  protected isWatching: boolean = false;

  constructor(id: string, name: string, config: AgentConfig) {
    this.id = id;
    this.name = name;
    this.config = config;
  }

  public abstract startWatching(): Promise<void>;
  public abstract stopWatching(): Promise<void>;

  public getConfig(): AgentConfig {
    return this.config;
  }

  public getStatus(): { isWatching: boolean } {
    return { isWatching: this.isWatching };
  }
}
