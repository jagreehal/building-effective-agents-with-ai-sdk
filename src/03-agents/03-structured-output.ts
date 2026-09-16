/**
 * Example 8: Structured Output (workshop f3 finish)
 *
 * One call returns a typed object instead of prose. The SDK constrains the model to
 * emit JSON shaped like the schema, then validates it before handing it back.
 */

import { Output, ToolLoopAgent } from 'ai';
import { z } from 'zod';
import { model } from '../shared/config.js';

const recommendation = z.object({
  destination: z.string().describe('a single city or region name'),
  whyToVisit: z
    .string()
    .describe("two sentences on why it fits this traveller's interests"),
  packingEssentials: z
    .array(z.string())
    .describe('3 to 5 concrete items to pack for this trip'),
});

async function main() {
  const agent = new ToolLoopAgent({
    model,
    output: Output.object({ schema: recommendation }),
    instructions: `
You are TripMate, a travel-planning assistant.
When the user describes a traveller, recommend a destination, say why it suits them, and list what to pack.
`.trim(),
  });

  const result = await agent.generate({
    prompt: 'Recommend a trip for someone who loves hiking and food.',
  });

  const rec = result.output;
  console.log(`== ${rec.destination} ==`);
  console.log(`Why:     ${rec.whyToVisit}`);
  console.log(`Packing: ${rec.packingEssentials.join(', ')}`);
}

main().catch(console.error);
