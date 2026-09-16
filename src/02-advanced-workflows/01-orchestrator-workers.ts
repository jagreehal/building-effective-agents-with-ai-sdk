/**
 * Example 4: Orchestrator-Workers
 *
 * An orchestrator determines what work needs to be done, divides it into
 * subtasks, and delegates to workers that execute in parallel.
 *
 * Use case: Complex tasks that can be broken into independent subtasks,
 * content generation with multiple perspectives, or parallel processing
 * of different aspects of a problem.
 *
 * Pattern: Task → Orchestrator (plan) → [Worker 1, Worker 2, ...] → Results
 */

import { Output, ToolLoopAgent } from 'ai';
import { z } from 'zod';
import { model } from '../shared/config.js';
import { show } from '../shared/utils.js';

const Task = z.object({
  type: z
    .string()
    .describe('The type of task, e.g. "formal", "conversational", "hybrid"'),
  description: z
    .string()
    .describe('Clear description for executing this task.'),
});

const OrchestratorResponse = z.object({
  analysis: z
    .string()
    .describe(
      'Explain your understanding of the task and which variations would be valuable.'
    ),
  tasks: z.array(Task).describe('List of tasks to execute in parallel.'),
});

const orchestrator = new ToolLoopAgent({
  model,
  output: Output.object({ schema: OrchestratorResponse }),
  instructions: 'Analyze this task and break it down into 2-3 distinct approaches.',
});

const worker = new ToolLoopAgent({
  model,
  instructions: 'Generate content based on the task specification.',
});

async function orchestrate(task: string) {
  console.log('🎯 Orchestrator: Analyzing task and creating plan...\n');

  const orchestratorResult = await orchestrator.generate({ prompt: task });
  const plan = orchestratorResult.output;

  show(plan.analysis, 'Analysis');
  show(
    plan.tasks.map((t) => `• ${t.type}: ${t.description}`).join('\n'),
    'Planned Tasks'
  );

  console.log('\n👷 Workers: Executing tasks in parallel...\n');

  const workerResponses = await Promise.all(
    plan.tasks.map((taskInfo) =>
      worker.generate({
        prompt: JSON.stringify({
          original_task: task,
          ...taskInfo,
        }),
      })
    )
  );

  console.log('\n📊 Results:\n');
  for (let i = 0; i < plan.tasks.length; i++) {
    show(workerResponses[i].text, `Worker Result (${plan.tasks[i].type})`);
  }

  return { plan, results: workerResponses.map((r) => r.text) };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Example: Multi-Style Product Description
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await orchestrate(
    'Write a product description for a new eco-friendly water bottle.'
  );
}

main().catch(console.error);
