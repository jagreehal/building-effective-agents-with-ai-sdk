/**
 * Example 6: Orchestrator Agent with Subagents (supplementary)
 *
 * Not from the workshop finish set. Demonstrates write/review/done orchestration
 * with subagents — compare with example 11 (workshop p6 delegation) for the
 * canonical TripMate concierge pattern.
 */

import { isStepCount, tool, ToolLoopAgent } from 'ai';
import { z } from 'zod';
import { model } from '../shared/config.js';
import { show } from '../shared/utils.js';

async function main() {
  console.log('═'.repeat(60));
  console.log('  ToolLoopAgent: Orchestrator with Subagents');
  console.log('═'.repeat(60) + '\n');

  const writerAgent = new ToolLoopAgent({
    model,
    instructions: `
You are a creative writer. Generate polished content
based on the specification provided. Be concise and specific.
`.trim(),
  });

  const reviewerAgent = new ToolLoopAgent({
    model,
    instructions: `
You are a content reviewer. Evaluate the provided content
for clarity, engagement, and quality. Give a score from 1-10 and brief feedback.
`.trim(),
  });

  const orchestrator = new ToolLoopAgent({
    model,
    instructions: `
You are a project orchestrator. Break tasks into subtasks
and delegate to the appropriate tools. Use the write tool to generate
content variants, then use the review tool to evaluate each one.
Call the done tool when you have the final polished result.
`.trim(),
    tools: {
      write: tool({
        description: 'Generate content based on a specification',
        inputSchema: z.object({
          spec: z.string().describe('What to write'),
        }),
        execute: async ({ spec }, { abortSignal }) => {
          console.log(`  📝 [Writer] Working on: ${spec.slice(0, 50)}...`);
          const result = await writerAgent.generate({ prompt: spec, abortSignal });
          return result.text;
        },
      }),
      review: tool({
        description: 'Review and score content',
        inputSchema: z.object({
          content: z.string().describe('Content to review'),
        }),
        execute: async ({ content }, { abortSignal }) => {
          console.log(`  🔍 [Reviewer] Evaluating...`);
          const result = await reviewerAgent.generate({
            prompt: `Review this content and give a score (1-10) and brief feedback:\n\n${content}`,
            abortSignal,
          });
          return result.text;
        },
      }),
      // No execute: a tool without one ends the loop when the model calls it.
      done: tool({
        description: 'Call when you have the final result',
        inputSchema: z.object({
          summary: z.string().describe('The final polished result'),
        }),
      }),
    },
    stopWhen: isStepCount(10),
  });

  console.log('🎯 Starting orchestration...\n');

  const result = await orchestrator.generate({
    prompt: 'Write a short, catchy tagline for an eco-friendly water bottle brand.',
  });

  show(result.text, 'Orchestrator Final Text');

  const doneCall = result.staticToolCalls.find((tc) => tc.toolName === 'done');
  if (doneCall?.toolName === 'done') {
    show(doneCall.input.summary, '✅ Final Result');
  }
}

main().catch(console.error);
