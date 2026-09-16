import { describe, it, expect, beforeAll } from "vitest";
import { story } from "executable-stories-vitest";
import { runExample } from "./helpers.js";

let output: string = "";

describe("17 - Input Guardrail", () => {
  beforeAll(async () => {
    const result = await runExample("04-loops/05-input-guardrail.ts", 600000, {
      GUARDRAIL_QUERY: "2",
    });
    output = result.stdout;
    expect(result.exitCode).toBe(0);
  });

  it("blocks non-travel queries before TripMate runs", ({ task }) => {
    story.init(task, { tags: ["loop", "guardrail", "real-output"] });

    expect(output).toContain("I can only help with safe travel");

    story.then("guardrail refuses poem request without calling TripMate");
  });
});
