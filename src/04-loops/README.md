# Loops Track

Examples mapping loop engineering concepts to AI SDK v7. See [LOOPS.md](../LOOPS.md) for the full guide.

| Script | Example | Concept |
|--------|---------|---------|
| `pnpm 13` | Hard verify loop | Objective test gate |
| `pnpm 14` | Self-check rubric | Soft LLM verify (light loop) |
| `pnpm 15` | Loop state | Explicit attempt memory |
| `pnpm 16` | Tool approval | Human-in-the-loop gate |
| `pnpm 17` | Input guardrail | Cheap pre-check |
| `pnpm 18` | Output guardrail | Middleware redaction |
| `pnpm 19` | Resilient loop | Structured tool errors |
| `pnpm 20` | Scheduled heartbeat | Interval re-run (`LOOP_MAX_RUNS=1` for tests) |
| `pnpm 21` | Loop usage | `onStepFinish` token tracking |
| `pnpm 22` | ai-sdk-guardrails (bonus) | Library `withGuardrails` — compare with #17–#18 |

Examples **17–18** show workshop-style DIY guardrails. **22** is the same TripMate scenario using the published [`ai-sdk-guardrails`](https://www.npmjs.com/package/ai-sdk-guardrails) package.

Shared instruction modules live in [`../shared/skills/`](../shared/skills/).
