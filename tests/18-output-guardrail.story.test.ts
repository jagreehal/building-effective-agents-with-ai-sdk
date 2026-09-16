import { describe, it, expect, beforeAll } from "vitest";
import { story } from "executable-stories-vitest";
import { runExample } from "./helpers.js";

let output: string = "";

describe("18 - Output Guardrail", () => {
  beforeAll(async () => {
    const result = await runExample("04-loops/06-output-guardrail.ts");
    output = result.stdout;
    expect(result.exitCode).toBe(0);
  });

  it("redacts PII from model output", ({ task }) => {
    story.init(task, { tags: ["loop", "middleware", "real-output"] });

    expect(output).toContain("<redacted email>");

    story.then("middleware strips email before user sees it");
  });
});
