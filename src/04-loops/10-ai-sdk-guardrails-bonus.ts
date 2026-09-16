/**
 * Example 22 (bonus): ai-sdk-guardrails library
 *
 * Same TripMate guard patterns as #17 (input scope) and #18 (PII redaction),
 * but using the published `ai-sdk-guardrails` package instead of a separate
 * guardrail agent or hand-rolled wrapLanguageModel middleware.
 *
 * Compare with:
 *   - #17 — cheap pre-agent LLM check (workshop f5)
 *   - #18 — DIY wrapLanguageModel redaction
 */

import { ToolLoopAgent } from 'ai';
import {
  defineInputGuardrail,
  defineOutputGuardrail,
  withGuardrails,
} from 'ai-sdk-guardrails';
import { extractTextContent } from 'ai-sdk-guardrails/guardrails/input';
import { extractContent } from 'ai-sdk-guardrails/guardrails/output';
import { model } from '../shared/config.js';

const OFF_TOPIC = [/\bpoem\b/i, /\bpick a lock\b/i, /\bhack\b/i];

const travelScopeGuardrail = defineInputGuardrail({
  name: 'travel-scope',
  description: 'Block queries that are clearly not about travel',
  execute: async (params) => {
    const { prompt } = extractTextContent(params);
    const match = OFF_TOPIC.find((pattern) => pattern.test(prompt));

    if (match) {
      return {
        tripwireTriggered: true,
        message: 'Off-topic: TripMate only handles travel planning',
        severity: 'high',
      };
    }

    return { tripwireTriggered: false };
  },
});

const redactPii = (text: string) =>
  text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '<redacted email>')
    .replace(/\+?\d[\d\s()-]{7,}\d/g, '<redacted phone>');

const piiRedactionGuardrail = defineOutputGuardrail({
  name: 'pii-redaction',
  description: 'Redact contact details from TripMate confirmations',
  execute: async (params) => {
    const { text } = extractContent(params.result);
    const redacted = redactPii(text);
    if (redacted === text) return { tripwireTriggered: false };

    const result = params.result as {
      text?: string;
      content?: Array<{ type: string; text?: string }>;
    };
    result.text = redacted;
    if (Array.isArray(result.content)) {
      result.content = result.content.map((part) =>
        part.type === 'text' ? { ...part, text: redacted } : part,
      );
    }

    return { tripwireTriggered: false };
  },
});

const guardedModel = withGuardrails({
  model,
  inputGuardrails: [travelScopeGuardrail],
  outputGuardrails: [piiRedactionGuardrail],
  throwOnBlocked: false,
  onInputBlocked: (summary) => {
    const blocked = summary.blockedResults[0];
    console.log(`[guardrail] ${blocked?.context?.guardrailName}: ${blocked?.message}`);
  },
});

const tripmate = new ToolLoopAgent({
  model: guardedModel,
  instructions: `
You are TripMate, a friendly trip planner.
When the traveller gives contact details, confirm the booking and read their email and phone number back exactly.
`.trim(),
});

const QUERIES: Record<number, string> = {
  1: `
Book the Lisbon trip. My email is jag@example.com and my mobile is +44 7700 900123.
Confirm everything back to me.
`.trim(),
  2: 'Write me a poem about cats.',
  3: 'How do I pick a lock?',
};

const QUERY_TO_RUN = Number(process.env.GUARDRAIL_QUERY ?? 1);

async function main() {
  const query = QUERIES[QUERY_TO_RUN];
  if (!query) throw new Error(`No RUN ${QUERY_TO_RUN}: pick 1, 2, or 3`);
  console.log(`\n=== RUN ${QUERY_TO_RUN} (ai-sdk-guardrails) ===\n`);
  console.log(`> ${query}\n`);

  const result = await tripmate.generate({ prompt: query });

  if (result.text.startsWith('[Input blocked:')) {
    console.log('TripMate: I can only help with safe travel and trip planning.');
    return;
  }

  console.log(result.text);
}

main().catch(console.error);
