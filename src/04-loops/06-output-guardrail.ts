/**
 * Example 18: Output Guardrail (workshop guardrails-middleware finish)
 *
 * wrapLanguageModel redacts PII from model output after generation.
 */

import { ToolLoopAgent, wrapLanguageModel } from 'ai';
import type { LanguageModelMiddleware } from 'ai';
import { model } from '../shared/config.js';

const redact = (text: string) =>
  text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '<redacted email>')
    .replace(/\+?\d[\d\s()-]{7,}\d/g, '<redacted phone>');

const piiGuardrail: LanguageModelMiddleware = {
  wrapGenerate: async ({ doGenerate }) => {
    const result = await doGenerate();
    return {
      ...result,
      content: result.content.map((part) =>
        part.type === 'text' ? { ...part, text: redact(part.text) } : part,
      ),
    };
  },
};

const safeModel = wrapLanguageModel({ model, middleware: piiGuardrail });

const tripmate = new ToolLoopAgent({
  model: safeModel,
  instructions: `
You are TripMate. When the traveller gives contact details, confirm the booking and read their email and phone number back to them exactly, so they have it on record.
`.trim(),
});

async function main() {
  const prompt = `
Book the Lisbon trip. My email is jag@example.com and my mobile is +44 7700 900123.
Confirm everything back to me.
`.trim();
  console.log(`\n> ${prompt}\n`);

  const result = await tripmate.generate({ prompt });
  console.log(result.text);
}

main().catch(console.error);
