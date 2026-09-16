/**
 * Example 5: Evaluator-Optimizer (workshop p4 finish)
 *
 * Generate, score, improve, repeat. One agent writes; another grades it against a rubric
 * and gives feedback; a loop feeds that feedback back in until the score clears the bar
 * or the safety cap stops it.
 */

import { Output, ToolLoopAgent } from 'ai';
import { z } from 'zod';
import { model } from '../shared/config.js';
import {
  tripPitchEditorInstructions,
  tripPitchEvaluatorInstructions,
  tripPitchWriterInstructions,
} from '../shared/skills/trip-pitch.js';

const BAR = 8;
const MAX_ROUNDS = 3;

const writer = new ToolLoopAgent({
  model,
  instructions: tripPitchWriterInstructions,
});

const scorecard = z.object({
  score: z.number().min(1).max(10).describe('overall quality, 1 to 10'),
  feedback: z.string().describe('the single most useful change to raise the score, one sentence'),
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
  const draftResult = await writer.generate({ prompt: 'Pitch a weekend in Lisbon.' });
  let pitch = draftResult.text;

  let round = 1;
  const firstEvaluationResult = await evaluator.generate({ prompt: pitch });
  let { score, feedback } = firstEvaluationResult.output;
  console.log(`round ${round}: ${score}/10 (${feedback})`);

  while (score < BAR && round < MAX_ROUNDS) {
    round++;
    const editorResult = await editor.generate({ prompt: `Feedback: ${feedback}\n\nPitch:\n${pitch}` });
    pitch = editorResult.text;

    const evaluationResult = await evaluator.generate({ prompt: pitch });
    ({ score, feedback } = evaluationResult.output);
    console.log(`round ${round}: ${score}/10 (${feedback})`);
  }

  console.log(
    score >= BAR
      ? `\n[done] cleared the bar at ${score}/10`
      : `\n[done] hit the ${MAX_ROUNDS}-round cap at ${score}/10`,
  );
  console.log('\n--- final pitch ---');
  console.log(pitch);
}

main().catch(console.error);
