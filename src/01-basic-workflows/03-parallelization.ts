/**
 * Example 3: Parallelization (workshop p3 finish)
 *
 * Three reviews of the same itinerary, fired at once instead of one after another, then
 * merged. The reviews do not depend on each other, so Promise.all runs them together;
 * an aggregator combines the results.
 */

import { Output, ToolLoopAgent } from 'ai';
import { z } from 'zod';
import { model } from '../shared/config.js';

const ITINERARY = `Lisbon, 2 nights, flying from London, £500 all in:
- Day 1: morning hike up to Castelo de S. Jorge, seafood lunch in Alfama, evening Fado bar.
- Day 2: day trip to Sintra by train, picnic at Pena Park, sunset at Cabo da Roca.`;

const review = z.object({
  rating: z.number().min(1).max(5).describe('1 = serious problems, 5 = great'),
  comment: z.string().describe('at most 12 words: the single most important point'),
});

const budgetReviewer = new ToolLoopAgent({
  model,
  output: Output.object({ schema: review }),
  instructions: `
Review a trip itinerary for COST against a £500 budget from London.
Rate it 1-5 and give one terse comment, 12 words max.
`.trim(),
});

const weatherReviewer = new ToolLoopAgent({
  model,
  output: Output.object({ schema: review }),
  instructions: `
Review a trip itinerary for WEATHER fit: what the plan assumes about conditions, and what could spoil it.
Rate it 1-5 and give one terse comment, 12 words max.
`.trim(),
});

const safetyReviewer = new ToolLoopAgent({
  model,
  output: Output.object({ schema: review }),
  instructions: `
Review a trip itinerary for SAFETY and practicality: timing, transport, crowds.
Rate it 1-5 and give one terse comment, 12 words max.
`.trim(),
});

const synthesiser = new ToolLoopAgent({
  model,
  instructions: `
You are the lead planner.
Given three specialist reviews of an itinerary, write a two-sentence verdict: ship it, or the one thing to fix first.
`.trim(),
});

async function main() {
  const t0 = Date.now();
  const [budget, weather, safety] = await Promise.all([
    budgetReviewer.generate({ prompt: ITINERARY }),
    weatherReviewer.generate({ prompt: ITINERARY }),
    safetyReviewer.generate({ prompt: ITINERARY }),
  ]);
  const elapsed = Date.now() - t0;

  const reviews = [
    { aspect: 'budget', ...budget.output },
    { aspect: 'weather', ...weather.output },
    { aspect: 'safety', ...safety.output },
  ];
  for (const r of reviews) console.log(`[${r.aspect}] ${r.rating}/5: ${r.comment}`);
  console.log(`\n(3 reviews in ${elapsed}ms, run in parallel)`);

  const synthesiserResult = await synthesiser.generate({ prompt: JSON.stringify(reviews) });
  const verdict = synthesiserResult.text;
  console.log('\n--- verdict ---');
  console.log(verdict);
}

main().catch(console.error);
