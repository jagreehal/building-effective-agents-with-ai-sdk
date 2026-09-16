/**
 * Example 15: Loop State
 *
 * Explicit attempt log passed into each editor turn so the loop
 * remembers what already failed (article "state" building block).
 */

import { Output, ToolLoopAgent } from 'ai';
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

interface Attempt {
  round: number;
  score: number;
  feedback: string;
  pitch: string;
}

const writer = new ToolLoopAgent({
  model,
  instructions: tripPitchWriterInstructions,
});

const evaluator = new ToolLoopAgent({
  model,
  output: Output.object({ schema: scorecard }),
  instructions: tripPitchEvaluatorInstructions,
});

const editor = new ToolLoopAgent({
  model,
  instructions: tripPitchEditorInstructions,
});

async function main() {
  console.log('Loop with explicit state (attempt log)\n');

  const attempts: Attempt[] = [];
  const draft = await writer.generate({ prompt: 'Pitch a weekend in Lisbon.' });
  let pitch = draft.text;

  for (let round = 1; round <= MAX_LOOP_ROUNDS; round++) {
    const evaluation = await evaluator.generate({ prompt: pitch });
    const { score, feedback } = evaluation.output;

    attempts.push({ round, score, feedback, pitch });
    console.log(`round ${round}: ${score}/10 (${feedback})`);
    console.log(`  state: ${attempts.length} attempt(s) on record`);

    if (score >= SCORE_BAR) {
      console.log(`\n[done] cleared the bar at ${score}/10`);
      console.log('\n--- final pitch ---');
      console.log(pitch);
      return;
    }

    if (round === MAX_LOOP_ROUNDS) break;

    const stateSummary = attempts
      .map(
        (a) =>
          `Round ${a.round} (${a.score}/10): ${a.feedback}\nPitch snippet: ${a.pitch.slice(0, 120)}...`,
      )
      .join('\n\n');

    const edited = await editor.generate({
      prompt: `Do not repeat these failed attempts:\n${stateSummary}\n\nLatest feedback: ${feedback}\n\nPitch:\n${pitch}`,
    });
    pitch = edited.text;
  }

  console.log(`\n[done] hit ${MAX_LOOP_ROUNDS}-round cap`);
  console.log('\n--- final pitch ---');
  console.log(pitch);
}

main().catch(console.error);
