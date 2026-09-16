/**
 * Example 2: Routing (workshop p2 finish)
 *
 * classify -> branch (plain code) -> dispatch to a specialist. One classifier call
 * labels the query; an ordinary lookup sends it to the agent built for that kind of
 * question. You write no keyword matching: the model reads meaning, your code picks the
 * path.
 */

import { Output, ToolLoopAgent } from 'ai';
import { z } from 'zod';
import { model } from '../shared/config.js';

const triage = new ToolLoopAgent({
  model,
  output: Output.object({
    schema: z.object({
      category: z.enum(['weather', 'booking', 'general']),
      reasoning: z.string().describe('one short clause on why'),
    }),
  }),
  instructions: `
You triage a traveller's message for TripMate into exactly one category.
weather: what to pack, what to wear, the climate, conditions, or the forecast.
booking: flights, trains, getting there, cost, or budget.
general: anything else, such as timing, culture, food, or recommendations.
Pick the single best fit.
`.trim(),
});

const weatherExpert = new ToolLoopAgent({
  model,
  instructions: `
You are TripMate's weather and packing expert.
Answer in two or three sentences, focused on conditions and what to pack.
`.trim(),
});

const bookingExpert = new ToolLoopAgent({
  model,
  instructions: `
You are TripMate's flights and budget expert.
Answer in two or three sentences, focused on routes, cost, and booking, mindful of a £500 budget.
`.trim(),
});

const generalExpert = new ToolLoopAgent({
  model,
  instructions: 'You are TripMate, a friendly general trip advisor. Answer briefly.',
});

const specialists = {
  weather: weatherExpert,
  booking: bookingExpert,
  general: generalExpert,
};

const QUERIES = [
  'What will the weather be like in Lisbon this weekend, and what should I pack?',
  'How much is a flight from London to Lisbon, and can I do it on my budget?',
  'What food should I try while I am in Lisbon?',
];

async function main() {
  for (const query of QUERIES) {
    console.log(`\n=== "${query}" ===`);

    const triageResult = await triage.generate({ prompt: query });
    const { category, reasoning } = triageResult.output;
    console.log(`[route] ${category}  (${reasoning})`);

    const specialist = specialists[category];
    const specialistResult = await specialist.generate({ prompt: query });
    const answer = specialistResult.text;
    console.log(answer);
  }
}

main().catch(console.error);
