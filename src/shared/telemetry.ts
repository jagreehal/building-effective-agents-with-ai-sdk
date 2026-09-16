/**
 * OpenTelemetry for the agents, via autotel + autotel-genai.
 *
 * Opt-in, because it wants somewhere to send spans:
 *
 *   npx autotel-devtools        # receiver on :4318, live GenAI run view
 *   AUTOTEL=1 pnpm 23           # in another terminal
 *
 * `autotelTelemetry()` implements the AI SDK's stable Telemetry interface, so
 * one registration turns every generate() call in every example into a
 * canonical `gen_ai.*` span — model, tokens, cost, latency — with no
 * per-call instrumentation.
 */

import { registerTelemetry } from 'ai';
import { init } from 'autotel';
import { autotelTelemetry } from 'autotel-genai/observer';

export function startTelemetry(service: string): void {
  if (!process.env.AUTOTEL) return;

  // devtools defaults to :4318. If something else already holds that port it
  // will say so on startup and take :4319 — point at it with OTLP_ENDPOINT.
  const endpoint = process.env.OTLP_ENDPOINT;
  init(endpoint ? { service, endpoint } : { service, devtools: true });
  // captureContent is off by default for privacy. These are made-up rescue
  // scenarios and the prompts are the interesting part, so record them.
  registerTelemetry(autotelTelemetry({ captureContent: true }));

  console.log(`📡 Telemetry on — spans → ${endpoint ?? 'http://localhost:4318'}\n`);
}
