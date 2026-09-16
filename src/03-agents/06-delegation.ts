/**
 * Example 11: Orchestrator and Delegation (workshop p6 finish)
 *
 * An agent whose tools are OTHER AGENTS. A concierge orchestrator delegates the weather
 * question to a weather analyst and the flight question to a flight advisor, then
 * combines their answers.
 */

import { isStepCount, tool, ToolLoopAgent } from 'ai';
import { z } from 'zod';
import { model } from '../shared/config.js';

const weatherAnalyst = new ToolLoopAgent({
  model,
  instructions: `
You are a weather and packing analyst.
Given a city, describe the likely conditions and what to pack, in two sentences.
`.trim(),
});

const flightAdvisor = new ToolLoopAgent({
  model,
  instructions: `
You are a flights and budget advisor.
Given a route, suggest how to fly it within a £500 budget, in two sentences.
`.trim(),
});

const consultWeather = tool({
  description: "Ask the weather analyst about a destination's conditions and what to pack.",
  inputSchema: z.object({ city: z.string() }),
  // Pass abortSignal through so cancelling the concierge cancels the subagent too.
  execute: async ({ city }, { abortSignal }) => {
    console.log(`  [delegate] weatherAnalyst <- ${city}`);
    const weatherResult = await weatherAnalyst.generate({ prompt: city, abortSignal });
    return weatherResult.text;
  },
});

const consultFlights = tool({
  description: 'Ask the flight advisor how to fly a route within budget.',
  inputSchema: z.object({ route: z.string().describe('e.g. London to Lisbon') }),
  execute: async ({ route }, { abortSignal }) => {
    console.log(`  [delegate] flightAdvisor <- ${route}`);
    const flightResult = await flightAdvisor.generate({ prompt: route, abortSignal });
    return flightResult.text;
  },
});

async function main() {
  const concierge = new ToolLoopAgent({
    model,
    tools: { consultWeather, consultFlights },
    stopWhen: isStepCount(6),
    instructions: `
You are TripMate's concierge.
To plan a trip you MUST consult the weather analyst (consultWeather) and the flight advisor (consultFlights), then write a short plan that combines what they tell you.
Do not invent weather or flights yourself.
`.trim(),
  });

  const result = await concierge.generate({
    prompt: 'Plan a weekend in Lisbon. I am flying from London.',
  });
  console.log('\n--- plan ---');
  console.log(result.text);
  console.log('\nsteps:', result.steps.length);
}

main().catch(console.error);
