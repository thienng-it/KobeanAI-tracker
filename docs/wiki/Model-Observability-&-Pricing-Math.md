# Model Observability & Pricing Math

KobeanAI Tracker computes real-time costs and token tallies from raw transcripts using exact model rate cards and subagent trajectory tracking.

---

## 1. Official Pricing Rate Card (Per 1 Million Tokens)

| Model Name | Provider | Input Rate | Output Rate | Context Window |
| :--- | :--- | :--- | :--- | :--- |
| **Gemini 3.7 / 2.0 / 1.5 Pro** | Google | **$1.25** | **$5.00** | 2,000,000 tokens |
| **Gemini 2.0 Flash** | Google | **$0.10** | **$0.40** | 1,000,000 tokens |
| **Claude 3.7 / 3.5 Sonnet** | Anthropic | **$3.00** | **$15.00** | 200,000 tokens |
| **Claude 3.5 Haiku** | Anthropic | **$0.80** | **$4.00** | 200,000 tokens |
| **GPT-4o** | OpenAI | **$2.50** | **$10.00** | 128,000 tokens |
| **o1 / o3-mini** | OpenAI | **$1.10** | **$4.40** | 200,000 tokens |

---

## 2. Cost Computation Equation

```text
Turn Cost = (Input Tokens / 1,000,000 * Input Rate) + (Output Tokens / 1,000,000 * Output Rate)
```

### Thinking Loop & Subagent Token Extraction
When an assistant performs chain-of-thought planning or spawns browser/coding subagents:
1. **Thinking Tokens**: Isolated and categorized under reasoning latency.
2. **Subagent Turns**: Added to the parent session's cumulative cost and token count while maintaining independent tool execution logs.
