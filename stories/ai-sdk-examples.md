# Building Effective Agents with AI SDK - Test Stories

| Key | Value |
| --- | --- |
| Date | 2026-09-16T20:34:05.216Z |
| Version | 1.0.0 |
| Git SHA | ecc4ea6 |

## tests/06-orchestrator-agent.story.test.ts

### 06 - Orchestrator Agent

### ✅ orchestrates multiple agents via tool calls
Tags: `agent`, `orchestrator`, `real-output`, `toolloop`

- **Given** a main orchestrator and specialized subagents
- **When** the orchestrator delegates via tools
- **Then** multiple agents collaborate on the task _(no assertion)_
    **Agent Activity Detected**
    
    | Agent/Component | Active |
    | --- | --- |
    | Writer Subagent | ❌ |
    | Reviewer Subagent | ❌ |
    | Tool Call Activity | ❌ |
    

### ✅ produces a final result through agent collaboration
Tags: `real-output`

- **Given** the multi-agent workflow
- **When** agents complete their collaboration
- **Then** the orchestrator produces a collaborative result _(no assertion)_
    **Agent Collaboration Output**
    
    ```text
    Has final result indicator: ✅
    Output length: 376 characters
    
    ════════════════════════════════════════════════════════════
      ToolLoopAgent: Orchestrator with Subagents
    ════════════════════════════════════════════════════════════
    
    🎯 Starting orchestration...
    
    
    Orchestrator Final Text
    -----------------------
    
    {"name": "write", "arguments": {"spec": "Write a short, catchy tagline for an eco-friendly water bottle brand."}}
    </tool_call>
    
    
    ```
    

## tests/16-tool-approval.story.test.ts

### 16 - Tool Approval

### ✅ gates bookFlight with human approval
Tags: `loop`, `real-output`, `tool-approval`

- **Then** dangerous tool waits for approval over budget _(no assertion)_