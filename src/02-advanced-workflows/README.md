# Advanced Workflows

These examples demonstrate more sophisticated patterns that involve iteration, feedback loops, and dynamic task decomposition.

Each example uses `ToolLoopAgent` with `Output.object()` for typed intermediate results.

## Examples

### 01-orchestrator-workers.ts
**Pattern**: Task Decomposition

An orchestrator determines what work needs to be done, divides it into subtasks, and delegates to workers that execute in parallel.

**Use Case**: Complex tasks that can be broken into independent subtasks, content generation with multiple perspectives

**Key Concept**: Dynamic planning + parallel execution

```
Task → Orchestrator (plan) → [Worker 1, Worker 2, ...] → Results
```

**Features**:
- Dynamic task breakdown using structured output
- Parallel worker execution
- Result aggregation

---

### 02-evaluator-optimizer.ts
**Pattern**: Iterative Improvement

Iteratively generate a result, evaluate it, and improve based on feedback until quality requirements are met.

**Use Case**: Code generation, content refinement, tasks requiring high quality

**Key Concept**: Feedback loop with explicit quality criteria

```
Task → Generate → Evaluate → (Feedback → Generate)* → Final Result
```

**Features**:
- Structured evaluation with PASS/NEEDS_IMPROVEMENT/FAIL
- Chain of thought tracking
- Configurable iteration limits
- Feedback incorporation

## When to Use Advanced Workflows

✅ **Use when**:
- Tasks need dynamic decomposition
- Iterative refinement improves quality
- You need feedback loops
- The workflow should adapt based on intermediate results

❌ **Don't use when**:
- The workflow is simple and linear
- You need the cleaner abstraction of agents
- Real-time responses are critical (iteration adds latency)

## Comparison with Agents

These workflows use manual loops and explicit control flow. For a cleaner approach using the AI SDK's `ToolLoopAgent`, see the `03-agents/` examples.

| Aspect | Advanced Workflows | Agents |
|--------|-------------------|--------|
| Control | Explicit, manual | Delegated to agent |
| Code Verbosity | Higher | Lower |
| Flexibility | Fixed patterns | Dynamic tool use |
| Maintenance | More code to maintain | Cleaner, focused code |

## Running Examples

```bash
pnpm 04    # Orchestrator-Workers
pnpm 05    # Evaluator-Optimizer
```
