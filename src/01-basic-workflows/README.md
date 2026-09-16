# Basic Workflows

These examples demonstrate fundamental agentic patterns using simple, deterministic control flow.

Each example uses the **ai-workshop finish** reference where one exists (`p1`–`p7`, `f3`, `f4`), adapted to import `model` from `shared/config.ts`.

## Examples

### 01-prompt-chaining.ts
**Pattern**: Sequential Processing

Feed the output of one LLM call into the next, completing a task step by step.

**Use Case**: Multi-step data processing, content refinement pipelines

**Key Concept**: Each step transforms the output of the previous step

```
Input → Step 1 → Step 2 → Step 3 → Output
```

---

### 02-routing.ts
**Pattern**: Classification & Delegation

Use an LLM call to classify input and route it to the appropriate specialized handler.

**Use Case**: Support ticket triage, content moderation, request classification

**Key Concept**: Separate classification from processing for cleaner architecture

```
Input → Classifier → Route → Handler → Output
```

---

### 03-parallelization.ts
**Pattern**: Concurrent Execution

Run multiple LLM calls concurrently when they are independent of each other.

**Use Case**: Multi-perspective analysis, batch processing, gathering diverse viewpoints

**Key Concept**: Use `Promise.all` for independent operations

```
Input → [Task A, Task B, Task C] → Promise.all → Results
```

## When to Use Basic Workflows

✅ **Use when**:
- You need deterministic, predictable behavior
- The workflow steps are fixed and known
- You want full control over the execution flow
- Error handling needs to be explicit

❌ **Don't use when**:
- The workflow needs to adapt dynamically
- You need iterative refinement
- The task requires tool use

## Running Examples

```bash
pnpm 01    # Prompt chaining
pnpm 02    # Routing
pnpm 03    # Parallelization
```
