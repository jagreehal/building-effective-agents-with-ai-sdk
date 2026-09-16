# Agents (ToolLoopAgent)

These examples use `ToolLoopAgent` from the AI SDK - the recommended approach for building autonomous agents.

The `ToolLoopAgent` class handles:
- The execution loop
- Context management
- Tool calling
- Stopping conditions

## Examples

### 01-orchestrator-agent.ts
**Pattern**: Multi-Agent Orchestration

A main orchestrator agent delegates tasks to specialized subagents via tools. Each subagent is its own `ToolLoopAgent` with isolated context.

**Use Case**: Complex workflows requiring coordination between multiple specialized agents

**Key Concept**: Agents as tools for other agents

```
Main Agent → (write tool → Writer Subagent)
         → (review tool → Reviewer Subagent) → done
```

---

### 02-evaluator-agent.ts
**Pattern**: Self-Improving Agent

An agent that generates solutions, evaluates them via a tool, and iterates until quality is met.

**Use Case**: Code generation with automated review, content refinement

**Key Concept**: Tool-based feedback loop

```
Agent → generate → evaluate tool → (iterate) → done
```

---

### 03-structured-output.ts
**Pattern**: Typed Responses

Use `Output.object()` with `ToolLoopAgent` for schema-validated structured output.

**Use Case**: Data extraction, analysis pipelines, typed API responses

**Key Concept**: Zod schema validation + typed output

---

### 04-simple-tools.ts
**Pattern**: Basic Tool Usage

A simple example showing calculator tools with `ToolLoopAgent`.

**Use Case**: Agents that need to perform calculations, look up data

**Key Concept**: Tool definition and execution

---

### 05-agentic-tools.ts (workshop p5)
**Pattern**: Model-Orchestrated Tool Chain

TripMate chains `lookupTraveler` → `getWeather` → `getFlights` with no orchestration code from you. The model reads tool descriptions and picks the order.

**Key Concept**: Dependency chains; the model decides which tools to call

---

### 06-delegation.ts (workshop p6)
**Pattern**: Agents as Tools

A concierge orchestrator delegates to specialist sub-agents (`consultWeather`, `consultFlights`) whose `execute` bodies run full `ToolLoopAgent` instances.

**Key Concept**: Delegation tools; sub-agents with isolated context

---

### 07-conversation.ts (workshop p7)
**Pattern**: Streaming Chat with Memory

A readline chat loop using `agent.stream({ messages })` and a running `messages` array for multi-turn memory.

**Key Concept**: Streaming delivery + conversation history

## Workshop alignment

| This repo | ai-workshop patterns |
|-----------|---------------------|
| 01–03 basic workflows | p1 chaining, p2 routing, p3 parallelization |
| 04–05 advanced workflows | p4 evaluator (+ orchestrator-workers from Anthropic doc) |
| 05-agentic-tools | **p5** agentic tool chain |
| 06-delegation | **p6** orchestrator & delegation |
| 07-conversation | **p7** streaming conversation |

## Why Use ToolLoopAgent?

✅ **Benefits**:
- Cleaner, more maintainable code
- Built-in loop management
- Automatic context handling
- Flexible stopping conditions
- Easy tool integration

🎯 **Best for**:
- Production applications
- Complex multi-step tasks
- Tool-using agents
- Workflows that need iteration

## ToolLoopAgent API

```typescript
const agent = new ToolLoopAgent({
  model,                    // Language model to use
  instructions: '...',      // System instructions
  tools: {                  // Available tools
    myTool: tool({
      description: '...',
      inputSchema: z.object({...}),
      execute: async (input) => {...}
    })
  },
  stopWhen: [              // Stopping conditions
    isStepCount(10),
    hasToolCall('done')
  ]
});

const result = await agent.generate({ prompt: '...' });
```

## Running Examples

```bash
pnpm 06    # Orchestrator Agent
pnpm 07    # Evaluator Agent
pnpm 08    # Structured Output
pnpm 09    # Simple Tools
pnpm 10    # Agentic Tool Chain (p5)
pnpm 11    # Delegation (p6)
pnpm 12    # Streaming Conversation (p7)
```

## Comparison with Manual Workflows

| Aspect | Manual Workflows | ToolLoopAgent |
|--------|-----------------|---------------|
| Code Size | More verbose | Concise |
| Control | Full control | Delegated |
| Flexibility | Fixed | Dynamic |
| Maintenance | Higher effort | Lower effort |
| Learning Curve | Lower | Higher |
