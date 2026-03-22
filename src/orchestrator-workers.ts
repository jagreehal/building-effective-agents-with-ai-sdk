/**
 * Building Effective Agents with AI SDK - Orchestrator-Workers
 *
 * An orchestrator determines what work needs to be done,
 * divides it into subtasks, and delegates to workers that
 * execute in parallel.
 *
 */

import { ollama, generateText } from 'ai-sdk-ollama';
import { Output } from 'ai';
import { z } from 'zod';

const model = ollama('granite4');

function show(text: string, title: string) {
  console.log(`\n${title}`);
  console.log('-'.repeat(title.length));
  console.log(`\n${text}\n`);
}

// ─────────────────────────────────────────────
// Schema definitions
// ─────────────────────────────────────────────

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
      'Explain your understanding of the task and which variations would be valuable.',
    ),
  tasks: z.array(Task).describe('List of tasks to execute in parallel.'),
});

// ─────────────────────────────────────────────
// Orchestrator-Workers workflow
// ─────────────────────────────────────────────

async function orchestrate(task: string) {
  // Step 1: Orchestrator breaks the task into subtasks
  const orchestratorResult = await generateText({
    model,
    output: Output.object({
      schema: OrchestratorResponse,
    }),
    system: 'Analyze this task and break it down into 2-3 distinct approaches.',
    prompt: task,
  });

  const plan = orchestratorResult.output;

  show(plan.analysis, 'Analysis');
  show(JSON.stringify(plan.tasks, null, 2), 'Tasks');

  // Step 2: Workers execute subtasks in parallel
  const workerResponses = await Promise.all(
    plan.tasks.map((taskInfo: z.infer<typeof Task>) =>
      generateText({
        model,
        system: 'Generate content based on the task specification.',
        prompt: JSON.stringify({
          original_task: task,
          ...taskInfo,
        }),
      }),
    ),
  );

  // Step 3: Collect and display results
  for (let i = 0; i < plan.tasks.length; i++) {
    show(workerResponses[i].text, `Worker Result (${plan.tasks[i].type})`);
  }

  return { plan, results: workerResponses.map((r) => r.text) };
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

async function main() {
  await orchestrate(
    'Write a product description for a new eco-friendly water bottle.',
  );
}

main().catch(console.error);
