# Building Effective Agents - Examples

This directory contains organized examples demonstrating agentic patterns using the AI SDK.

## Quick Start

```bash
# See all available examples
pnpm list

# Run a specific example
pnpm example 01    # Prompt Chaining
pnpm example 05    # Evaluator-Optimizer

# Run all examples
pnpm all
```

## Directory Structure

```
src/
├── index.ts                      # Entry point with example runner
├── shared/                       # Shared utilities
│   ├── config.ts                # Model configuration
│   └── utils.ts                 # Helper functions
├── 01-basic-workflows/          # Simple, deterministic patterns
│   ├── 01-prompt-chaining.ts    # Sequential processing
│   ├── 02-routing.ts            # Input classification & routing
│   └── 03-parallelization.ts    # Concurrent execution
├── 02-advanced-workflows/       # Complex, iterative patterns
│   ├── 01-orchestrator-workers.ts  # Task decomposition
│   └── 02-evaluator-optimizer.ts   # Iterative improvement
└── 03-agents/                   # ToolLoopAgent patterns
    ├── 01-orchestrator-agent.ts    # Multi-agent orchestration
    ├── 02-evaluator-agent.ts       # Self-improving agent
    ├── 03-structured-output.ts     # Typed output schemas
    ├── 04-simple-tools.ts          # Basic tool usage
    ├── 05-agentic-tools.ts         # Model-orchestrated tool chain (p5)
    ├── 06-delegation.ts            # Sub-agents as tools (p6)
    └── 07-conversation.ts          # Streaming chat with memory (p7)
├── 04-loops/                    # Loop engineering (verify, state, gates)
│   ├── 01-hard-verify-loop.ts   # Hard test gate (#13)
│   ├── 02-self-check-rubric.ts  # Soft rubric loop (#14)
│   ├── 03-loop-state.ts         # Explicit attempt memory (#15)
│   ├── 04-tool-approval.ts      # Human gate (#16)
│   ├── 05-input-guardrail.ts    # Pre-check (#17)
│   ├── 06-output-guardrail.ts   # Middleware (#18)
│   ├── 07-resilient-loop.ts     # Tool errors as data (#19)
│   ├── 08-scheduled-heartbeat.ts # Interval re-run (#20)
│   ├── 09-loop-usage.ts         # Token tracking (#21)
│   └── 10-ai-sdk-guardrails-bonus.ts # Library guardrails (#22)
├── LOOPS.md                     # Loop engineering guide
└── shared/skills/               # Reusable instruction modules
```

## Progression Guide

1. **Start Here**: `01-basic-workflows/`
   - Fundamental patterns using `ToolLoopAgent` with focused `instructions`
   - Best for understanding the basics before moving to tool loops

2. **Level Up**: `02-advanced-workflows/`
   - More complex patterns with iteration and feedback loops
   - Shows how to build sophisticated workflows with typed outputs

3. **Production Ready**: `03-agents/`
   - Uses `ToolLoopAgent` with tools, subagents, and stop conditions
   - Recommended approach for real applications

4. **Loops**: `04-loops/` + [LOOPS.md](LOOPS.md)
   - Verify, state, stop conditions, gates, and scheduled re-run
   - Maps loop engineering concepts to AI SDK v7

## Configuration

Edit `src/shared/config.ts` to change the model:

```typescript
export const MODEL_NAME = 'granite4';  // Change to your preferred model
```

Make sure you have the model pulled in Ollama:

```bash
ollama pull granite4
```

## Learning Path

| Step | Example | Workshop | What You'll Learn |
|------|---------|----------|-------------------|
| 1 | 01-prompt-chaining | p1 | Breaking tasks into sequential steps |
| 2 | 02-routing | p2 | Classification and delegation |
| 3 | 03-parallelization | p3 | Concurrent processing |
| 4 | 04-orchestrator-workers | — | Task decomposition patterns |
| 5 | 05-evaluator-optimizer | p4 | Iterative improvement |
| 6 | 06-orchestrator-agent | — | Building agents with subagents |
| 7 | 07-evaluator-agent | — | Self-improving agents |
| 8 | 08-structured-output | f3 | Typed responses |
| 9 | 09-simple-tools | — | Tool integration basics |
| 10 | 05-agentic-tools | p5 | Model-orchestrated tool chains |
| 11 | 06-delegation | p6 | Sub-agents as delegation tools |
| 12 | 07-conversation | p7 | Streaming chat with memory |
| 13 | hard-verify-loop | — | Objective test gate (hard verify) |
| 14 | self-check-rubric | — | Soft PLAN/DO/VERIFY/DECIDE loop |
| 15 | loop-state | — | Explicit attempt memory |
| 16 | tool-approval | workshop | Human-in-the-loop gate |
| 17 | input-guardrail | f5 | Cheap pre-check |
| 18 | output-guardrail | workshop | PII middleware |
| 19 | resilient-loop | workshop | Structured tool errors |
| 20 | scheduled-heartbeat | — | Interval re-run (LOOP_TICK) |
| 21 | loop-usage | — | Token tracking (onStepFinish) |
