/**
 * Example 9: Tools (workshop f4 finish)
 *
 * getUserTime reads the machine clock; the model picks a Spanish greeting from that
 * time. One tool, one gap.
 */

import { isStepCount, tool, ToolLoopAgent } from 'ai';
import { z } from 'zod';
import { model } from '../shared/config.js';

const getUserTime = tool({
  description: "Get the user's current local time and timezone.",
  inputSchema: z.object({}),
  execute: async () => {
    const now = new Date();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const utcOffsetHours = -now.getTimezoneOffset() / 60;
    const localTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    console.log(
      `  [tool fired] getUserTime() -> ${timeZone} ${localTime} (UTC${utcOffsetHours >= 0 ? '+' : ''}${utcOffsetHours})`,
    );
    return localTime;
  },
});

async function main() {
  const agent = new ToolLoopAgent({
    model,
    tools: { getUserTime },
    stopWhen: isStepCount(4),
  });

  const result = await agent.generate({
    prompt: "I'm travelling to Spain. What greeting should I use at this time of day?",
  });

  console.log();
  console.log(result.text);
  console.log('\nsteps:', result.steps.length);
}

main().catch(console.error);
