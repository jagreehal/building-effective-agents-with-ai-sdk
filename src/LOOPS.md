# Loops with AI SDK v7

This track maps the loop ideas from practical agent engineering to concrete AI SDK patterns. A **loop** is a goal the system keeps working toward until a **verifier** passes or a **stop condition** fires—not a single prompt and wait.

## The five phases

| Phase | What it means | Example in this repo |
|-------|---------------|----------------------|
| DISCOVER | Work out what needs doing | p5 agentic tools, orchestrator-workers |
| PLAN | Decide how to do it | p1 chaining, self-check rubric (#14) |
| EXECUTE | Do the work | `ToolLoopAgent.generate` |
| VERIFY | Check against the goal | Hard gate (#13), typed gate (p4), plain `if` (p1) |
| ITERATE | Feed result back and repeat | `while` loops, p4, #15 state |

## Article building blocks → repo examples

| Building block | Example | Script |
|----------------|---------|--------|
| Hard verify (tests, tsc) | MinStack fix loop | `pnpm 13` |
| Soft verify (LLM rubric) | Self-check rubric | `pnpm 14` |
| Explicit state | Attempt log in loop | `pnpm 15` |
| Human gate | `toolApproval` | `pnpm 16` |
| Input guardrail | Cheap pre-check | `pnpm 17` |
| Output guardrail | `wrapLanguageModel` | `pnpm 18` |
| Guardrails library | `withGuardrails` from `ai-sdk-guardrails` | `pnpm 22` (bonus) |
| Resilient tools | Return `{ error }` not throw | `pnpm 19` |
| Scheduled heartbeat | Interval re-run | `pnpm 20` |
| Cost awareness | `onStepFinish` usage | `pnpm 21` |
| Skills (reusable instructions) | `src/shared/skills/` | used by #13–#15 |

Workshop patterns p1–p7 and foundations f3/f4 live in examples 01–12. Supplementary examples 06–07 show agentic variants not in the workshop finish set.

## Four-box test: do you need a loop?

Only build a loop when **all four** are true:

1. The task repeats (at least weekly).
2. Something can **automatically reject** bad output (test, linter, hard rule—not just LLM self-grade).
3. The agent can do the work end-to-end.
4. "Done" is **objective**, not taste.

Miss one box → use a single prompt or a manual workflow.

## Build order (what actually works)

1. Get **one manual run** reliable.
2. Extract instructions into a **skill** (`src/shared/skills/`).
3. Wrap in a loop with **verify + stop condition**.
4. **Then** put it on a schedule (#20) or Cursor `/loop`.

Skipping step 1–3 and scheduling an unreliable loop is how loops bill you while you sleep.

## Soft vs hard verify

| | Soft (LLM judge) | Hard (your code) |
|--|------------------|------------------|
| Example | p4, #14 | #13 |
| Gate | `Output.object` score | `tsc`, vitest, pure function |
| Risk | Model grades own homework | Objective pass/fail |
| When to use | Prose, pitches, rubrics | Code, schemas, measurable rules |

Example #14 implements the article's paste prompt (PLAN/DO/VERIFY/DECIDE). It is the **light loop**—fine for learning, risky for production without a hard gate.

## What this repo does not implement

- **Mira / Telegram / 500-app connectors** — tools mock external actions (same as the workshop).
- **Production cron** — #20 uses `setInterval` locally; Cursor `/loop` is the IDE-native heartbeat.
- **Long-term memory across days** — p7 and #15 keep in-session state only.

## Cursor `/loop`

For recurring work inside Cursor, use the `/loop` command (e.g. `/loop 5m check CI status`). Example #20 shows the same idea in plain Node: run a task on an interval, print `LOOP_TICK`, stop after `max-runs`.
