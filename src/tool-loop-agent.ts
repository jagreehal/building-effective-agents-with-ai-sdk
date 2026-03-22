/**
 * Building Effective Agents with AI SDK - ToolLoopAgent
 *
 * The recommended v6/v7 approach for building agents using ToolLoopAgent.
 * This demonstrates the orchestrator-workers and evaluator-optimizer
 * patterns using the Agent class instead of manual loops.
 *
 * See: /Users/jreehal/dev/ai/ai/content/docs/03-agents/
 */

import { ToolLoopAgent, tool, stepCountIs, hasToolCall, Output } from 'ai';
import { ollama } from 'ai-sdk-ollama';
import { z } from 'zod';

const model = ollama('granite4');

function show(text: string, title: string) {
  console.log(`\n${title}`);
  console.log('-'.repeat(title.length));
  console.log(`\n${text}\n`);
}

// ─────────────────────────────────────────────
// Example 1: Orchestrator-Worker via Subagents
// ─────────────────────────────────────────────
//
// A main agent delegates tasks to specialized
// subagents using tools. Each subagent is its
// own ToolLoopAgent with isolated context.

async function orchestratorWithSubagents() {
  console.log('=== Orchestrator-Workers (Subagents) ===\n');

  // Worker subagent: generates content from a specification
  const writerAgent = new ToolLoopAgent({
    model,
    instructions: `You are a creative writer. Generate polished content
    based on the specification provided. Be concise and specific.`,
  });

  // Worker subagent: evaluates and scores content
  const reviewerAgent = new ToolLoopAgent({
    model,
    instructions: `You are a content reviewer. Evaluate the provided content
    for clarity, engagement, and quality. Give a score from 1-10 and brief feedback.`,
  });

  // Main orchestrator agent with tools that delegate to subagents
  const orchestrator = new ToolLoopAgent({
    model,
    instructions: `You are a project orchestrator. Break tasks into subtasks
    and delegate to the appropriate tools. Use the writer tool to generate
    content variants, then use the reviewer tool to evaluate each one.
    Call the done tool when you have the final polished result.`,
    tools: {
      write: tool({
        description: 'Generate content based on a specification',
        inputSchema: z.object({
          spec: z.string().describe('What to write'),
        }),
        execute: async ({ spec }) => {
          console.log(`  [Writer] Working on: ${spec}`);
          const result = await writerAgent.generate({ prompt: spec });
          return result.text;
        },
      }),
      review: tool({
        description: 'Review and score content',
        inputSchema: z.object({
          content: z.string().describe('Content to review'),
        }),
        execute: async ({ content }) => {
          console.log(`  [Reviewer] Evaluating...`);
          const result = await reviewerAgent.generate({
            prompt: `Review this content and give a score (1-10) and brief feedback:\n\n${content}`,
          });
          return result.text;
        },
      }),
      done: tool({
        description: 'Call when you have the final result',
        inputSchema: z.object({
          summary: z.string().describe('The final polished result'),
        }),
      }),
    },
    stopWhen: [stepCountIs(10), hasToolCall('done')],
  });

  const result = await orchestrator.generate({
    prompt: 'Write a short, catchy tagline for an eco-friendly water bottle brand.',
  });

  show(result.text, 'Orchestrator Final Text');

  // Extract done tool result if available
  const doneCall = result.staticToolCalls.find(
    (tc: { toolName: string }) => tc.toolName === 'done',
  );
  if (doneCall) {
    show((doneCall.input as { summary: string }).summary, 'Done Tool Summary');
  }
}

// ─────────────────────────────────────────────
// Example 2: Evaluator-Optimizer with Tools
// ─────────────────────────────────────────────
//
// An agent that generates code, evaluates it
// via a tool, and iterates until quality is met.

async function evaluatorOptimizerAgent() {
  console.log('=== Evaluator-Optimizer (Agent) ===\n');

  // Separate evaluator subagent to avoid circular reference
  const evaluatorAgent = new ToolLoopAgent({
    model,
    instructions: `You are a code reviewer. Evaluate the code and respond
    with either "PASS" if it meets all criteria, or "NEEDS_IMPROVEMENT"
    followed by specific feedback on what to fix.`,
  });

  const agent = new ToolLoopAgent({
    model,
    instructions: `You are a TypeScript developer. Write code solutions,
    then use the evaluate tool to check your work. Iterate until the
    evaluation passes. Call the done tool when your code is ready.`,
    tools: {
      evaluate: tool({
        description: 'Evaluate code for correctness and quality',
        inputSchema: z.object({
          code: z.string().describe('The code to evaluate'),
        }),
        execute: async ({ code }) => {
          console.log(`  [Evaluator] Checking code...`);
          const result = await evaluatorAgent.generate({
            prompt: `Evaluate this code for correctness (O(1) operations),
TypeScript best practices, and edge case handling:\n\n${code}`,
          });
          return result.text;
        },
      }),
      done: tool({
        description: 'Call when code is finalized and passes evaluation',
        inputSchema: z.object({
          code: z.string().describe('The final code'),
        }),
      }),
    },
    stopWhen: [stepCountIs(15), hasToolCall('done')],
  });

  const result = await agent.generate({
    prompt: `Implement a Stack with push(x), pop(), and getMin() - all O(1).
Write TypeScript code, evaluate it, then call done when ready.`,
  });

  show(result.text, 'Agent Final Text');

  const doneCall = result.staticToolCalls.find(
    (tc: { toolName: string }) => tc.toolName === 'done',
  );
  if (doneCall) {
    show((doneCall.input as { code: string }).code, 'Final Code');
  }
}

// ─────────────────────────────────────────────
// Example 3: Simple Agent with Structured Output
// ─────────────────────────────────────────────

async function structuredAgent() {
  console.log('=== Structured Output Agent ===\n');

  const analysisAgent = new ToolLoopAgent({
    model,
    instructions: 'You are a data analyst. Provide structured analysis.',
    output: Output.object({
      schema: z.object({
        sentiment: z.enum(['positive', 'neutral', 'negative']),
        summary: z.string(),
        keyPoints: z.array(z.string()),
      }),
    }),
  });

  const result = await analysisAgent.generate({
    prompt: `Analyze this customer feedback:
    "The product is great but shipping was slow and packaging was damaged."`,
  });

  show(JSON.stringify(result.output, null, 2), 'Structured Output');
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

async function main() {
  const example = process.argv[2] ?? 'all';

  if (example === 'orchestrator' || example === 'all') {
    await orchestratorWithSubagents();
  }

  if (example === 'evaluator' || example === 'all') {
    await evaluatorOptimizerAgent();
  }

  if (example === 'structured' || example === 'all') {
    await structuredAgent();
  }
}

main().catch(console.error);
