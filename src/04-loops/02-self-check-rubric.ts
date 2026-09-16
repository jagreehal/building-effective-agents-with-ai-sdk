/**
 * Example 14: Self-Check Rubric Loop (article light loop)
 *
 * PLAN / DO / VERIFY / DECIDE in one structured agent chain.
 * WARNING: soft verify only — the model grades its own work. See #13 for hard gates.
 */

import { Output, ToolLoopAgent } from 'ai';
import { z } from 'zod';
import { model } from '../shared/config.js';
import {
  MAX_LOOP_ROUNDS,
  SCORE_BAR,
  SELF_CHECK_CRITERIA,
  selfCheckLoopInstructions,
} from '../shared/skills/loop-protocol.js';

const loopStep = z.object({
  plan: z.string().describe('the single next step'),
  work: z.string().describe('the improved trip pitch'),
  activityScore: z.number().min(1).max(10),
  budgetScore: z.number().min(1).max(10),
  ctaScore: z.number().min(1).max(10),
  weakest: z.string().describe('which criterion scored lowest and why'),
  decision: z.enum(['ITERATING', 'FINAL']),
});

const loopAgent = new ToolLoopAgent({
  model,
  output: Output.object({ schema: loopStep }),
  instructions: selfCheckLoopInstructions,
});

async function main() {
  console.log('Self-check rubric loop (soft verify)\n');
  console.log('Criteria:', SELF_CHECK_CRITERIA.join('; '));
  console.log(`Bar: ${SCORE_BAR}/10 on each criterion\n`);

  let pitch = '';
  let round = 0;

  while (round < MAX_LOOP_ROUNDS) {
    round++;
    const prompt =
      round === 1
        ? 'Write a 3-sentence pitch for a weekend in Lisbon.'
        : `Improve this pitch. Fix the weakest criterion first.\n\nPitch:\n${pitch}`;

    const result = await loopAgent.generate({ prompt });
    const step = result.output;

    pitch = step.work;
    console.log(`\n--- round ${round} ---`);
    console.log(`PLAN: ${step.plan}`);
    console.log(
      `VERIFY: activity=${step.activityScore} budget=${step.budgetScore} cta=${step.ctaScore}`,
    );
    console.log(`weakest: ${step.weakest}`);
    console.log(`DECIDE: ${step.decision}`);

    const allPass =
      step.activityScore >= SCORE_BAR &&
      step.budgetScore >= SCORE_BAR &&
      step.ctaScore >= SCORE_BAR;

    if (step.decision === 'FINAL' && allPass) {
      console.log('\nFINAL');
      console.log(pitch);
      return;
    }
  }

  console.log(`\n[done] hit ${MAX_LOOP_ROUNDS}-round cap`);
  console.log('\n--- final pitch ---');
  console.log(pitch);
}

main().catch(console.error);
