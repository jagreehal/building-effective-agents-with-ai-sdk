/**
 * Example 20: Scheduled Heartbeat
 *
 * Local demo of the article's "automation" building block.
 * Runs a ToolLoopAgent task on an interval; prints LOOP_TICK sentinel.
 *
 * Usage:
 *   tsx src/04-loops/08-scheduled-heartbeat.ts --interval 5s --max-runs 3
 *   LOOP_MAX_RUNS=1 tsx src/04-loops/08-scheduled-heartbeat.ts
 *
 * Cursor equivalent: /loop 5m <prompt>
 */

import { ToolLoopAgent } from 'ai';
import { model } from '../shared/config.js';
import { delay } from '../shared/utils.js';

function parseArgs() {
  const args = process.argv.slice(2);
  let intervalMs = 5_000;
  let maxRuns = Number(process.env.LOOP_MAX_RUNS ?? 3);
  let prompt = 'In one sentence, suggest a weekend destination for someone who loves food.';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--interval' && args[i + 1]) {
      intervalMs = parseInterval(args[++i]);
    } else if (args[i] === '--max-runs' && args[i + 1]) {
      maxRuns = Number(args[++i]);
    } else if (args[i] === '--prompt' && args[i + 1]) {
      prompt = args[++i];
    }
  }

  return { intervalMs, maxRuns, prompt };
}

function parseInterval(value: string): number {
  const match = value.match(/^(\d+)(ms|s|m|h)$/);
  if (!match) return 5_000;
  const n = Number(match[1]);
  switch (match[2]) {
    case 'ms':
      return n;
    case 's':
      return n * 1_000;
    case 'm':
      return n * 60_000;
    case 'h':
      return n * 3_600_000;
    default:
      return 5_000;
  }
}

async function main() {
  const { intervalMs, maxRuns, prompt } = parseArgs();

  const agent = new ToolLoopAgent({
    model,
    instructions: 'You are TripMate. Answer in one or two sentences.',
  });

  console.log(`Scheduled heartbeat: interval=${intervalMs}ms max-runs=${maxRuns}\n`);

  for (let run = 1; run <= maxRuns; run++) {
    const result = await agent.generate({ prompt });
    const usage = result.usage;
    console.log(
      `LOOP_TICK ${JSON.stringify({
        run,
        prompt: prompt.slice(0, 60),
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        text: result.text.slice(0, 120),
      })}`,
    );

    if (run < maxRuns) {
      await delay(intervalMs);
    }
  }

  console.log('\nHeartbeat stopped.');
}

main().catch(console.error);
