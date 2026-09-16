/**
 * Building Effective Agents with AI SDK - Evaluator-Optimizer
 *
 * Iteratively generate a result, evaluate it, and improve
 * based on feedback until quality requirements are met.
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

const GeneratorResponse = z.object({
  thoughts: z
    .string()
    .describe(
      'Your understanding of the task and feedback and how you plan to improve.',
    ),
  response: z.string().describe('The generated solution.'),
});

const EvaluatorResponse = z.object({
  thoughts: z
    .string()
    .describe(
      'Your careful and detailed review and evaluation of the submitted content.',
    ),
  evaluation: z
    .enum(['PASS', 'NEEDS_IMPROVEMENT', 'FAIL'])
    .describe('Evaluation result.'),
  feedback: z.string().describe('What needs improvement and why.'),
});

// ─────────────────────────────────────────────
// Generator
// ─────────────────────────────────────────────

async function generate(
  prompt: string,
  task: string,
  context = '',
): Promise<{ thoughts: string; result: string }> {
  const systemPrompt = context ? `${prompt}\n\n${context}` : prompt;

  const result = await generateText({
    model,
    output: Output.object({
      schema: GeneratorResponse,
    }),
    system: systemPrompt,
    prompt: `Task:\n${task}`,
  });

  show(result.output.thoughts, 'Thoughts');
  show(result.output.response, 'Generated');

  return { thoughts: result.output.thoughts, result: result.output.response };
}

// ─────────────────────────────────────────────
// Evaluator
// ─────────────────────────────────────────────

async function evaluate(
  prompt: string,
  content: string,
  task: string,
): Promise<{ evaluation: string; feedback: string }> {
  const result = await generateText({
    model,
    output: Output.object({
      schema: EvaluatorResponse,
    }),
    system: `${prompt}\n\nTask:\n${task}`,
    prompt: content,
  });

  show(result.output.evaluation, 'Status');
  show(result.output.feedback, 'Feedback');

  return {
    evaluation: result.output.evaluation,
    feedback: result.output.feedback,
  };
}

// ─────────────────────────────────────────────
// Generate-Evaluate loop
// ─────────────────────────────────────────────

interface ChainOfThoughtEntry {
  thoughts: string;
  result: string;
}

async function loop(
  task: string,
  evaluatorPrompt: string,
  generatorPrompt: string,
): Promise<{ result: string; chainOfThought: ChainOfThoughtEntry[] }> {
  const memory: string[] = [];
  const chainOfThought: ChainOfThoughtEntry[] = [];

  // Initial generation
  const { thoughts, result } = await generate(generatorPrompt, task);
  memory.push(result);
  chainOfThought.push({ thoughts, result });

  let iteration = 1;
  while (true) {
    iteration++;
    const { evaluation, feedback } = await evaluate(
      evaluatorPrompt,
      result,
      task,
    );

    if (evaluation === 'PASS') {
      return { result, chainOfThought };
    }

    const context = [
      'Previous attempts:',
      ...memory.map((m) => `- ${m.slice(0, 200)}...`),
      `\nFeedback: ${feedback}`,
    ].join('\n');

    const next = await generate(generatorPrompt, task, context);
    memory.push(next.result);
    chainOfThought.push({ thoughts: next.thoughts, result: next.result });

    // Safety limit to avoid infinite loops
    if (iteration >= 5) {
      console.log('\n(Max iterations reached, returning best result)');
      return { result: next.result, chainOfThought };
    }
  }
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

async function main() {
  const evaluatorPrompt = `
Evaluate this following code implementation for:
1. Code correctness: does it implement what is required in the spec flawlessly?
2. Time complexity: does the implementation meet the time complexity requirements?
3. Efficiency: is the implementation the most efficient and optimized possible for the requirements?
4. Style and best practices: does the code follow standard TypeScript style and best practices?
5. Readability: is the code easy to read and understand?
6. Documentation: is the code clearly documented?

You should be evaluating only and not attempting to solve the task.
Evaluate the code carefully and critically and make sure you don't
miss any opportunities for improvement.
Only output "PASS" if all the evaluation criteria are met and you
have no further suggestions for improvements, otherwise output
"NEEDS_IMPROVEMENT" or "FAIL" so that the coder can learn and improve.`;

  const generatorPrompt = `
Your goal is to complete the task based on the user input. If there are feedback
from your previous generations, you should reflect on them to improve your solution.`;

  const task = `
Implement a Stack with:
1. push(x)
2. pop()
3. getMin()
All operations should be O(1).`;

  const { result, chainOfThought } = await loop(
    task,
    evaluatorPrompt,
    generatorPrompt,
  );

  show(result, 'Final Result');
  show(JSON.stringify(chainOfThought, null, 2), 'Chain of Thought');
}

main().catch(console.error);
