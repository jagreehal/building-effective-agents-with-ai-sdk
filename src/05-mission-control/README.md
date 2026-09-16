# Mission Control — dynamic agent orchestration

```bash
pnpm 23                                        # autopilot — the router picks the team
pnpm 23 director brain,engineer,wildcard       # you pick the team
pnpm 23 surprise                               # the world agent invents the emergency
```

Six specialists (`agents.ts`), four orchestration roles (`mission.ts`):

```
Mission Control → WHO?              routes on advertised capability
Specialists     → WHAT DO I THINK?  same world state, different — and limited — instructions
Team Leader     → WHAT DO WE DO?    one action out of several partial views
The World       → WHAT HAPPENS?     the team never adjudicates its own success
```

The loop re-runs Mission Control every chapter, so the team changes when the problem
changes: the engineer stands down once the generator is fixed, the negotiator deploys
when someone refuses to leave.

Two things make this more than role-play:

- **Mission Control never sees the specialists' system prompts** — only `capabilities`,
  `usefulWhen` and `avoidWhen`. That is capability discovery, exactly as an orchestrator
  chooses between tools.
- **Every specialist has a hard limitation.** Cortex cannot diagnose hardware, Sparks
  cannot handle people, Trace cannot propose a plan. Without them a single capable model
  answers everything and delegation looks pointless.

`runMission()` is an async generator of events, so a UI can drive the same engine.

Needs Ollama: `ollama pull granite4.1:3b`. Override with `OLLAMA_MODEL=...`.

## Watching the agents run

```bash
npx autotel-devtools                                    # OTLP receiver + live GenAI view
AUTOTEL=1 pnpm 23                                       # spans → :4318
AUTOTEL=1 OTLP_ENDPOINT=http://127.0.0.1:4319 pnpm 23   # if devtools reports :4318 was busy
```

`autotel-genai`'s `autotelTelemetry()` implements the AI SDK's stable `Telemetry`
interface, so one `registerTelemetry()` in `shared/telemetry.ts` instruments every
call. No per-call plumbing.

Each role names its own span, because `telemetry.functionId` is set on the agent:

```
invoke_agent mission-control     → chat granite4.1:3b   (input/output tokens, tok/s)
invoke_agent specialist.engineer → chat granite4.1:3b
invoke_agent specialist.sceptic  → chat granite4.1:3b
invoke_agent team-leader         → chat granite4.1:3b
invoke_agent world               → chat granite4.1:3b
```

Every call in one mission shares a `gen_ai.conversation.id`, so "what did this
mission cost" and "which specialist is slowest" are ordinary queries. Note that
`runtimeContext` values are dropped from telemetry unless named in
`includeRuntimeContext` — that is how `sessionId` gets through.

`gen_ai.usage.cost.usd` stays absent for Ollama models: they aren't in
`MODEL_PRICING`, and an unpriced model is left out rather than guessed at zero.
