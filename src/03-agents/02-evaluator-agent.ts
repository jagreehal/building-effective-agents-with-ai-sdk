/**
 * Example 7: Evaluator-Optimizer Agent (supplementary)
 *
 * Not from the workshop finish set. Agentic version of the evaluator loop via
 * tools — compare with example 05 (workshop p4 finish) for the workflow version.
 */

import { isStepCount, tool, ToolLoopAgent } from 'ai';
import { z } from 'zod';
import { model } from '../shared/config.js';
import { show } from '../shared/utils.js';

async function main() {
  console.log('═'.repeat(60));
  console.log('  ToolLoopAgent: Evaluator-Optimizer');
  console.log('═'.repeat(60) + '\n');

  const evaluatorAgent = new ToolLoopAgent({
    model,
    instructions: `
You are a code reviewer. Evaluate the code and respond
with either "PASS" if it meets all criteria, or "NEEDS_IMPROVEMENT"
followed by specific feedback on what to fix.
`.trim(),
  });

  const agent = new ToolLoopAgent({
    model,
    instructions: `
You are a TypeScript developer. Write code solutions,
then use the evaluate tool to check your work. Iterate until the
evaluation passes. Call the done tool when your code is ready.
`.trim(),
    tools: {
      evaluate: tool({
        description: 'Evaluate code for correctness and quality',
        inputSchema: z.object({
          code: z.string().describe('The code to evaluate'),
        }),
        execute: async ({ code }, { abortSignal }) => {
          console.log(`  🔍 [Evaluator] Checking code...`);
          const result = await evaluatorAgent.generate({
            prompt: `Evaluate this code for correctness (O(1) operations),
TypeScript best practices, and edge case handling:\n\n${code}`,
            abortSignal,
          });
          return result.text;
        },
      }),
      // No execute: a tool without one ends the loop when the model calls it.
      done: tool({
        description: 'Call when code is finalized and passes evaluation',
        inputSchema: z.object({
          code: z.string().describe('The final code'),
        }),
      }),
    },
    stopWhen: isStepCount(15),
  });

  const task = `Implement a Stack with push(x), pop(), and getMin() - all O(1).
Write TypeScript code, evaluate it, then call done when ready.`;

  console.log(`📝 Task: ${task}\n`);
  console.log('🚀 Starting code generation with evaluation...\n');

  const result = await agent.generate({ prompt: task });

  show(result.text, 'Agent Final Text');

  const doneCall = result.staticToolCalls.find((tc) => tc.toolName === 'done');
  if (doneCall?.toolName === 'done') {
    show(doneCall.input.code, '✅ Final Code');
  }
}

main().catch(console.error);
