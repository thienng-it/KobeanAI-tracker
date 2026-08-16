# Model Observability & Telemetry Standard Rule

## Purpose & Scope
This rule governs how AI models, specifications, pricing rates, and model-specific telemetry metrics are resolved, stored, filtered, and rendered across KobeanAI Tracker.

## Directives

1. **Canonical Model Normalization**:
   - Always resolve raw or ambient model names through `ModelRegistry.resolve(rawString)` in `server/services/model-registry.ts`.
   - Strip transient effort tags (e.g. `--high-`, `--medium-`, `--low-`, `--thinking-`) to ensure robust grouping while preserving reasoning mode flags in session metadata.

2. **Model Specification Attributes (`ModelInfo`)**:
   - Every tracked model must declare accurate specifications:
     - `contextWindow`: Total token context capacity (e.g. 1M, 2M, 200k).
     - `maxOutputTokens`: Maximum single-turn completion token limit.
     - `inputPricePerMillion`, `outputPricePerMillion`, `thinkingPricePerMillion`: Precision pricing in USD per 1M tokens.
     - `supportsThinking`: Boolean indicating native chain-of-thought or reasoning support.
     - `modalities`: Supported input/output formats (Text, Code, Vision, Audio, Video).
     - `tier`: Architectural classification (`Flagship`, `Reasoning`, `Flash / Efficient`, `High Performance`, `Local`).

3. **Cross-Module Filtering Contract**:
   - REST endpoints (`/api/dashboard/summary`, `/api/dashboard/recent-sessions`, `/api/dashboard/trends`, `/api/dashboard/agent-distribution`, `/api/sessions`) must support `model` query parameter.
   - When a specific model is filtered, all summary cards, time-series charts, and activity feeds must reactively compute statistics for that model only.
   - The dedicated `ModelSpecsCard` must display both the hardware/pricing specifications and the real-world workload statistics (total sessions, tokens, cost, avg per session, input/output ratio).

4. **UI & Aesthetic Standard**:
   - Use glassmorphism panels (`.glass-panel`) with provider-colored accents and subtle glowing radial backdrops.
   - Display token counts and currency in `JetBrains Mono` (`var(--font-mono)`).
   - Use `cubic-bezier(0.16, 1, 0.3, 1)` spring curves for dropdown transitions and interactive state changes.
