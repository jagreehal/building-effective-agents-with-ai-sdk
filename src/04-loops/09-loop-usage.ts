/**
 * Example 21: Loop Usage / Cost
 *
 * Tracks token usage across loop iterations via onStepFinish.
 * Teaches cost-per-accepted-change without OpenTelemetry.
 */

import { Output, ToolLoopAgent, type ToolLoopAgentSettings } from 'ai';
import { z } from 'zod';
import { model } from '../shared/config.js';
import {
  tripPitchEditorInstructions,
  tripPitchEvaluatorInstructions,
  tripPitchWriterInstructions,
} from '../shared/skills/trip-pitch.js';
import { MAX_LOOP_ROUNDS, SCORE_BAR } from '../shared/skills/loop-protocol.js';

const scorecard = z.object({
  score: z.number().min(1).max(10),
  feedback: z.string(),
});

let totalInputTokens = 0;
let totalOutputTokens = 0;
let stepCount = 0;

// One callback shared by every agent in the loop. Each step reports its own usage.
const trackUsage: ToolLoopAgentSettings['onStepFinish'] = ({ usage }) => {
  const inputTokens = usage.inputTokens ?? 0;
  const outputTokens = usage.outputTokens ?? 0;
  totalInputTokens += inputTokens;
  totalOutputTokens += outputTokens;
  stepCount++;
  console.log(
    `  [usage] step ${stepCount}: +${inputTokens} in / +${outputTokens} out (total: ${totalInputTokens} in, ${totalOutputTokens} out)`,
  );
};

const writer = new ToolLoopAgent({
  model,
  instructions: tripPitchWriterInstructions,
  onStepFinish: trackUsage,
});

const evaluator = new ToolLoopAgent({
  model,
  output: Output.object({ schema: scorecard }),
  instructions: tripPitchEvaluatorInstructions,
  onStepFinish: trackUsage,
});

const editor = new ToolLoopAgent({
  model,
  instructions: tripPitchEditorInstructions,
  onStepFinish: trackUsage,
});

async function main() {
  console.log('Loop usage tracking (onStepFinish)\n');

  const draft = await writer.generate({ prompt: 'Pitch a weekend in Lisbon.' });
  let pitch = draft.text;
  let round = 1;

  const first = await evaluator.generate({ prompt: pitch });
  let { score, feedback } = first.output;
  console.log(`round ${round}: ${score}/10`);

  while (score < SCORE_BAR && round < MAX_LOOP_ROUNDS) {
    round++;
    const edited = await editor.generate({ prompt: `Feedback: ${feedback}\n\nPitch:\n${pitch}` });
    pitch = edited.text;
    const evaluation = await evaluator.generate({ prompt: pitch });
    ({ score, feedback } = evaluation.output);
    console.log(`round ${round}: ${score}/10`);
  }

  const accepted = score >= SCORE_BAR;
  console.log(`\n[done] ${accepted ? 'accepted' : 'cap reached'} at ${score}/10`);
  console.log(
    `[cost] ${stepCount} steps, ${totalInputTokens} input tokens, ${totalOutputTokens} output tokens`,
  );
  if (accepted) {
    console.log(`[cost per accepted change] ${totalInputTokens + totalOutputTokens} tokens total`);
  }
  console.log('\n--- final pitch ---');
  console.log(pitch);
}

main().catch(console.error);
