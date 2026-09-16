/**
 * Example 10: Agentic Tool Chain (workshop p5 finish)
 *
 * TripMate has three tools and chains them in dependency order with no orchestration
 * code from you: lookupTraveler -> getWeather -> getFlights -> compose the pitch.
 */

import { isStepCount, tool, ToolLoopAgent } from 'ai';
import { z } from 'zod';
import { model } from '../shared/config.js';

const TRAVELER = {
  name: 'Jag',
  homeCity: 'London',
  interests: ['hiking', 'food'],
  budgetGBP: 500,
};

const WEATHER: Record<
  string,
  { temperature: string; condition: string; advisory?: string }
> = {
  lisbon: {
    temperature: '22°C',
    condition: 'sunny',
    advisory: 'wildfire smoke alert mid-afternoon',
  },
  barcelona: { temperature: '25°C', condition: 'clear' },
  reykjavik: { temperature: '9°C', condition: 'rain and wind' },
};

const FLIGHTS: Record<string, { price: string; airline: string }> = {
  'london->lisbon': { price: '£142', airline: 'TAP' },
  'london->barcelona': { price: '£128', airline: 'Vueling' },
  'london->reykjavik': { price: '£196', airline: 'Icelandair' },
};

const lookupTraveler = tool({
  description: `
Look up the current traveller's profile: name, home city, interests, budget.
Call this first; you do not otherwise know who the user is.
`.trim(),
  inputSchema: z.object({}),
  execute: async () => {
    console.log('  [tool fired] lookupTraveler');
    return TRAVELER;
  },
});

const getWeather = tool({
  description:
    'Get the weekend weather for the destination city. Use to advise on conditions.',
  inputSchema: z.object({ city: z.string() }),
  execute: async ({ city }) => {
    console.log(`  [tool fired] getWeather(${city})`);
    return WEATHER[city.toLowerCase()] ?? { error: `No weather for "${city}"` };
  },
});

const getFlights = tool({
  description:
    "Find a flight price from the traveller's home city to the destination.",
  inputSchema: z.object({ from: z.string(), to: z.string() }),
  execute: async ({ from, to }) => {
    console.log(`  [tool fired] getFlights(${from} -> ${to})`);
    const key = `${from.toLowerCase()}->${to.toLowerCase()}`;
    return FLIGHTS[key] ?? { error: `No flight from ${from} to ${to}` };
  },
});

async function main() {
  console.log('TripMate: planning a weekend trip…\n');

  const agent = new ToolLoopAgent({
    model,
    tools: { lookupTraveler, getWeather, getFlights },
    stopWhen: isStepCount(8),
    instructions: `
You are TripMate, a server-side trip planner for an authenticated user.
Before answering, call lookupTraveler (no arguments) to get the traveller's name, home city, interests, and budget.
Call getWeather(city) for the destination the user named.
Because the user asks for flight pricing, call getFlights(from, to) from the home city to that destination.
Never invent prices, weather, or flights; only state what a tool returned.
Combine it into a short pitch and flag any weather advisory.
`.trim(),
  });

  const result = await agent.generate({
    prompt:
      'Plan me  weekend in Lisbon. Greet me by name, give me the flight price from my home city, match my interests, stay in budget, and flag anything urgent.',
  });

  console.log();
  console.log(result.text);
  console.log('\nsteps:', result.steps.length);
}

main().catch(console.error);
