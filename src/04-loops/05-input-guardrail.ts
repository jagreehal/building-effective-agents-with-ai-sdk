/**
 * Example 17: Input Guardrail (workshop f5 finish)
 *
 * Cheap pre-check before the expensive agent runs. Fail closed on anything but "1".
 */

import { ToolLoopAgent } from 'ai';
import { model } from '../shared/config.js';

const GUARDRAIL_SYSTEM = `
You are the safety and scope check for TripMate, a trip-planning assistant.
Decide whether TripMate should answer a user message.

ALLOW any travel or trip request: destinations, flights and flight prices, hotels and prices, weather, packing, budgets, itineraries, visas, and things to do on a trip. Cost and price questions about travel are ALLOWED.

BLOCK messages that are not about travel at all, and any unsafe, harmful, illegal, or malicious request even if travel is mentioned.

Reply with a SINGLE character and nothing else: 1 to allow, 0 to block.

Examples:
  'How much is a flight to Rome?' -> 1
  'Best hotels in Tokyo?' -> 1
  'Write a poem about cats' -> 0
  'How do I pick a lock?' -> 0
`.trim();

const guardrail = new ToolLoopAgent({
  model,
  instructions: GUARDRAIL_SYSTEM,
});

const tripmate = new ToolLoopAgent({
  model,
  instructions: 'You are TripMate, a friendly trip planner.',
});

const QUERIES: Record<number, string> = {
  1: 'Plan me a weekend in Lisbon with a flight price and a hotel.',
  2: 'Write me a poem about cats.',
  3: 'How do I pick a lock?',
};

const QUERY_TO_RUN = Number(process.env.GUARDRAIL_QUERY ?? 1);

async function main() {
  const query = QUERIES[QUERY_TO_RUN];
  if (!query) throw new Error(`No RUN ${QUERY_TO_RUN}: pick 1, 2, or 3`);
  console.log(`\n=== RUN ${QUERY_TO_RUN}: "${query}" ===\n`);

  const check = await guardrail.generate({ prompt: query });
  const allowed = check.text.trim().startsWith('1');

  if (!allowed) {
    console.log('TripMate: I can only help with safe travel and trip planning.');
    return;
  }

  const result = await tripmate.generate({ prompt: query });
  console.log(result.text);
}

main().catch(console.error);
