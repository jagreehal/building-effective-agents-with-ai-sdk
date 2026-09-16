import { describe, it, expect, beforeAll } from "vitest";
import { story } from "executable-stories-vitest";
import { runExample } from "./helpers.js";

let blockedOutput = "";
let travelOutput = "";

describe("22 - ai-sdk-guardrails (bonus)", () => {
  beforeAll(async () => {
    const blocked = await runExample(
      "04-loops/10-ai-sdk-guardrails-bonus.ts",
      600000,
      { GUARDRAIL_QUERY: "2" },
    );
    blockedOutput = blocked.stdout;
    expect(blocked.exitCode).toBe(0);

    const travel = await runExample(
      "04-loops/10-ai-sdk-guardrails-bonus.ts",
      600000,
      { GUARDRAIL_QUERY: "1" },
    );
    travelOutput = travel.stdout;
    expect(travel.exitCode).toBe(0);
  });

  it("blocks off-topic input via withGuardrails", ({ task }) => {
    story.init(task, { tags: ["loop", "guardrail", "ai-sdk-guardrails"] });

    expect(blockedOutput).toContain("I can only help with safe travel");

    story.then("travel-scope guardrail stops poem before TripMate runs");
  });

  it("redacts PII from guarded model output", ({ task }) => {
    story.init(task, { tags: ["loop", "guardrail", "ai-sdk-guardrails"] });

    expect(travelOutput).toContain("<redacted email>");

    story.then("pii-redaction guardrail strips contact details");
  });
});
