/**
 * Example 16: Tool Approval (workshop finish)
 *
 * Human-in-the-loop gate via toolApproval before dangerous tools run.
 */

import {
  isStepCount,
  tool,
  ToolLoopAgent,
  type ModelMessage,
  type ToolApprovalResponse,
} from 'ai';
import { z } from 'zod';
import { model } from '../shared/config.js';

const TRAVELER = { name: 'Jag', homeCity: 'London', budgetGBP: 500 };
const FLIGHTS: Record<string, { priceGBP: number; airline: string }> = {
  'london->lisbon': { priceGBP: 142, airline: 'TAP' },
  'london->reykjavik': { priceGBP: 620, airline: 'Icelandair' },
};
const routeKey = (from: string, to: string) => `${from.toLowerCase()}->${to.toLowerCase()}`;
const priceOf = (from: string, to: string) => FLIGHTS[routeKey(from, to)]?.priceGBP;

const getFlights = tool({
  description: "Find a flight price from the traveller's home city to a destination.",
  inputSchema: z.object({ from: z.string(), to: z.string() }),
  execute: async ({ from, to }) => {
    console.log(`  [tool fired] getFlights(${from} -> ${to})`);
    return FLIGHTS[routeKey(from, to)] ?? { error: `No flight from ${from} to ${to}` };
  },
});

const bookFlight = tool({
  description: 'Book (pay for) a flight. This spends real money and cannot be undone.',
  inputSchema: z.object({ from: z.string(), to: z.string() }),
  execute: async ({ from, to }) => {
    console.log(`  [tool fired] bookFlight(${from} -> ${to})  *** money spent ***`);
    return { booked: true, ...FLIGHTS[routeKey(from, to)] };
  },
});

function askHuman(from: string, to: string, priceGBP: number, reason?: string): boolean {
  console.log(`  🙋 needs your approval: bookFlight(${from} -> ${to}) at £${priceGBP}${reason ? ` — ${reason}` : ''}`);
  const approved = priceGBP <= 700;
  console.log(`     -> ${approved ? 'APPROVED' : 'DECLINED'}`);
  return approved;
}

async function main() {
  console.log('TripMate: booking a flight (approval required over budget)…\n');

  const agent = new ToolLoopAgent({
    model,
    tools: { getFlights, bookFlight },
    stopWhen: isStepCount(8),
    instructions: `
You are TripMate, booking travel for ${TRAVELER.name} from ${TRAVELER.homeCity}.
Use getFlights(from, to) to find a price, then bookFlight(from, to) to book it.
If a booking is declined, do not retry it; tell the user plainly that it was not approved.
`.trim(),
    toolApproval: {
      bookFlight: ({ from, to }) => {
        const price = priceOf(from, to);
        if (price === undefined) return 'approved';
        return price <= TRAVELER.budgetGBP
          ? 'approved'
          : { type: 'user-approval', reason: `£${price} is over the £${TRAVELER.budgetGBP} budget` };
      },
    },
  });

  const messages: ModelMessage[] = [
    { role: 'user', content: 'Book me a weekend flight from London to Reykjavik.' },
  ];
  let approvals: ToolApprovalResponse[] = [];

  for (let round = 0; round < 5; round++) {
    if (approvals.length > 0) {
      messages.push({ role: 'tool', content: approvals });
      approvals = [];
    }

    const result = await agent.generate({ messages });
    messages.push(...result.responseMessages);

    for (const part of result.content) {
      if (
        part.type === 'tool-approval-request' &&
        !part.isAutomatic &&
        !part.toolCall.dynamic &&
        part.toolCall.toolName === 'bookFlight'
      ) {
        const { from, to } = part.toolCall.input;
        const approved = askHuman(from, to, priceOf(from, to) ?? 0, part.reason);
        approvals.push({
          type: 'tool-approval-response',
          approvalId: part.approvalId,
          approved,
          reason: approved ? 'Traveller confirmed the overspend' : 'Traveller declined the price',
        });
      } else if (part.type === 'tool-approval-response' && !part.toolCall.dynamic) {
        console.log(`  ⚙️  policy ${part.approved ? 'approved' : 'denied'} a bookFlight call`);
      }
    }

    if (approvals.length === 0) {
      console.log(`\nTripMate: ${result.text}`);
      break;
    }
  }
}

main().catch((err) => {
  console.error('\nThe agent crashed:\n', err);
  process.exit(1);
});
