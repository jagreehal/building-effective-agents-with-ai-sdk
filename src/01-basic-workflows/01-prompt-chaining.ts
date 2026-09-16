/**
 * Example 1: Prompt Chaining (workshop p1 finish)
 *
 * draft -> review -> (gate) -> edit -> review. Three small agents, each with one easy
 * job, and a plain-code gate between the review and the edit: an `if` on the reviewer's
 * typed verdict. The final review keeps us honest about whether the edit fixed the draft.
 */

import { Output, ToolLoopAgent } from 'ai';
import { z } from 'zod';
import { model } from '../shared/config.js';

const TRAVELLER = { name: 'Jag', homeCity: 'London', budgetGBP: 500 };

const writer = new ToolLoopAgent({
  model,
  instructions: `
You are a travel copywriter.
Write a short, vivid trip pitch (3 to 4 sentences) for the destination the user names.
Make it specific and evocative.
`.trim(),
});

const qualityCheck = z.object({
  mentionsBudget: z
    .boolean()
    .describe(`true only if the pitch refers to the £${TRAVELLER.budgetGBP} budget`),
  hasCallToAction: z
    .boolean()
    .describe("true only if the pitch ends by inviting a clear next step, e.g. 'shall I find flights?'"),
  notes: z.string().describe("one short sentence on what to fix, or 'looks good'"),
});

const reviewer = new ToolLoopAgent({
  model,
  output: Output.object({ schema: qualityCheck }),
  instructions: `
You review trip pitches for a traveller on a £${TRAVELLER.budgetGBP} budget.
Judge the pitch on two things only: does it mention that budget, and does it end with a call to action.
Be strict: if it does not clearly do the thing, answer false.
`.trim(),
});

const editor = new ToolLoopAgent({
  model,
  instructions: `
You edit trip pitches for a traveller on a £${TRAVELLER.budgetGBP} budget from ${TRAVELLER.homeCity}.
Rewrite the pitch to fix the issues you are given and nothing else.
Keep the vibe and the length.
Return only the rewritten pitch.
`.trim(),
});

async function main() {
  const destination = 'Lisbon';

  const draftResult = await writer.generate({ prompt: `Pitch a weekend in ${destination}.` });
  const draft = draftResult.text;
  console.log('--- draft ---');
  console.log(draft);

  const reviewResult = await reviewer.generate({ prompt: draft });
  const verdict = reviewResult.output;
  console.log('\n--- review ---');
  console.log(`mentionsBudget: ${verdict.mentionsBudget}   hasCallToAction: ${verdict.hasCallToAction}`);
  console.log(`notes: ${verdict.notes}`);

  if (verdict.mentionsBudget && verdict.hasCallToAction) {
    console.log('\n[gate] passed: shipping the draft as-is.');
    return;
  }

  const missing = [
    verdict.mentionsBudget ? null : `mention the £${TRAVELLER.budgetGBP} budget`,
    verdict.hasCallToAction ? null : 'end with a one-line call to action',
  ].filter(Boolean);
  console.log(`\n[gate] failed, sending back to fix: ${missing.join('; ')}`);

  const editorResult = await editor.generate({
    prompt: `Rewrite this pitch so it will: ${missing.join('; ')}.\n\nPitch:\n${draft}`,
  });
  const improved = editorResult.text;
  console.log('\n--- final (after the chain) ---');
  console.log(improved);

  const finalReviewResult = await reviewer.generate({ prompt: improved });
  const finalVerdict = finalReviewResult.output;
  console.log('\n--- final review ---');
  console.log(
    `mentionsBudget: ${finalVerdict.mentionsBudget}   hasCallToAction: ${finalVerdict.hasCallToAction}`,
  );
  if (!finalVerdict.mentionsBudget || !finalVerdict.hasCallToAction) {
    console.log(`remaining issue: ${finalVerdict.notes}`);
  }
}

main().catch(console.error);
