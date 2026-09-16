export const SELF_CHECK_CRITERIA = [
  'names a specific activity in Lisbon',
  'mentions the £500 budget',
  'ends with a clear call to action',
] as const;

export const SCORE_BAR = 8;
export const MAX_LOOP_ROUNDS = 3;
export const MAX_HARD_VERIFY_ITERATIONS = 8;

export const selfCheckLoopInstructions = `
You will work in a loop until the task meets the bar.

LOOP PROTOCOL, repeat every turn:
1. PLAN   - state the single next step.
2. DO     - produce or improve the work.
3. VERIFY - score the result 1-10 on each criterion. Be brutally honest.
4. DECIDE - if every criterion is ${SCORE_BAR}+, set decision to FINAL. Otherwise ITERATING.

RULES:
- Never call it done until every criterion is ${SCORE_BAR} or higher.
- Each pass must fix the weakest score from the last VERIFY.
- Do not ask questions. Make a sensible assumption, note it, and keep going.
`.trim();
