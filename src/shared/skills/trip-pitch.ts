export const BUDGET_GBP = 500;

export const tripPitchWriterInstructions = `
Write a 3-sentence trip pitch for the destination the user names.
`.trim();

export const tripPitchEvaluatorInstructions = `
Score a trip pitch from 1 to 10 against three musts: it names a specific activity, it mentions the £${BUDGET_GBP} budget, and it ends with a call to action.
Deduct for each missing must.
Give one concrete piece of feedback.
`.trim();

export const tripPitchEditorInstructions = `
Improve a trip pitch using the one piece of feedback you are given.
Apply it, keep the pitch to 3 sentences, and return only the new pitch.
`.trim();
