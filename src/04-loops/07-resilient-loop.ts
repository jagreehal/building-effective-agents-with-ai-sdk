/**
 * Example 19: Resilient Loop (workshop resilience finish)
 *
 * Tools return structured errors instead of throwing so the loop can adapt.
 */

import { isStepCount, tool, ToolLoopAgent } from 'ai';
import { z } from 'zod';
import { model } from '../shared/config.js';

const TRAVELER = { name: 'Jag', homeCity: 'London', interests: ['hiking', 'food'], budgetGBP: 500 };
const WEATHER: Record<string, { temperature: string; condition: string }> = {
  lisbon: { temperature: '22°C', condition: 'sunny' },
  barcelona: { temperature: '25°C', condition: 'clear' },
  porto: { temperature: '19°C', condition: 'cloudy' },
};
const FLIGHTS: Record<string, { price: string; airline: string }> = {
  'london->lisbon': { price: '£142', airline: 'TAP' },
  'london->barcelona': { price: '£128', airline: 'Vueling' },
  'london->porto': { price: '£119', airline: 'Ryanair' },
};

const lookupTraveler = tool({
  description: "Look up the current traveller's profile.",
  inputSchema: z.object({}),
  execute: async () => {
    console.log('  [tool fired] lookupTraveler');
    return TRAVELER;
  },
});

const getFlights = tool({
  description: "Find a flight price from the traveller's home city to the destination.",
  inputSchema: z.object({ from: z.string(), to: z.string() }),
  execute: async ({ from, to }) => {
    console.log(`  [tool fired] getFlights(${from} -> ${to})`);
    return FLIGHTS[`${from.toLowerCase()}->${to.toLowerCase()}`] ?? { error: `No flight from ${from} to ${to}` };
  },
});

const getWeather = tool({
  description: 'Get the weekend weather for a destination city.',
  inputSchema: z.object({ city: z.string() }),
  execute: async ({ city }) => {
    console.log(`  [tool fired] getWeather(${city})`);
    const data = WEATHER[city.toLowerCase()];
    if (!data) {
      console.log(`  [tool returned error] no weather for "${city}"`);
      return {
        error: `
No weather data for "${city}". It may not be a real destination.
Suggest a real city, or continue without the weather.
`.trim(),
      };
    }
    return { city, ...data };
  },
});

async function main() {
  console.log('TripMate: testing failure recovery (Atlantis is not real)…\n');

  const agent = new ToolLoopAgent({
    model,
    tools: { lookupTraveler, getWeather, getFlights },
    stopWhen: isStepCount(10),
    instructions: `
You are TripMate. Use lookupTraveler, getWeather(city), and getFlights(from, to).
If a tool returns an \`error\` field, acknowledge the failure to the user in plain words and either ask for a real alternative or continue with the data that worked.
Never invent weather, prices, or flights; only state what a tool returned.
`.trim(),
  });

  const result = await agent.generate({
    prompt: 'Plan a weekend in Atlantis from London. Check the weather, find flights, and pitch it.',
  });

  console.log();
  console.log(result.text);
}

main().catch((err) => {
  console.error('\nThe agent crashed:\n', err);
  process.exit(1);
});
