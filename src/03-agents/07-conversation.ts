/**
 * Example 12: Streaming Conversation (workshop p7 finish)
 *
 * A real chat loop. Streams TripMate's reply token by token and carries the whole
 * conversation forward via a `messages` array.
 *
 * Try piping input:
 *   printf 'My name is Jag.\nWhat is my name?\nquit\n' | tsx src/03-agents/07-conversation.ts
 */

import * as readline from 'node:readline';
import { ToolLoopAgent, type ModelMessage } from 'ai';
import { model } from '../shared/config.js';

const MAX_TURNS = 50;

async function main() {
  const agent = new ToolLoopAgent({
    model,
    instructions: `
You are TripMate, a friendly trip planner.
Keep replies to two or three sentences.
`.trim(),
  });

  const messages: ModelMessage[] = [];

  console.log("Chat with TripMate. Type 'quit' or press Enter on an empty line to exit.\n");
  const rl = readline.createInterface({ input: process.stdin });
  let turns = 0;

  process.stdout.write('You: ');
  for await (const line of rl) {
    const input = line.trim();
    if (!input || ['quit', 'q', 'exit'].includes(input.toLowerCase())) break;

    messages.push({ role: 'user', content: input });

    process.stdout.write('TripMate: ');
    const stream = await agent.stream({ messages });
    for await (const chunk of stream.textStream) process.stdout.write(chunk);
    console.log('\n');

    // The SDK's own record of the turn: carries tool calls/results too, not just text.
    messages.push(...(await stream.responseMessages));

    if (++turns >= MAX_TURNS) {
      console.log('(reached the turn limit)');
      break;
    }
    process.stdout.write('You: ');
  }

  rl.close();
  console.log('Chat ended.');
}

main().catch(console.error);
