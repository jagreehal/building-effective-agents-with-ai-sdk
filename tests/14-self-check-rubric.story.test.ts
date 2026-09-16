import { describe, it, expect, beforeAll } from "vitest";
import { story } from "executable-stories-vitest";
import { runExample } from "./helpers.js";

let output: string = "";

describe("14 - Self-Check Rubric", () => {
  beforeAll(async () => {
    const result = await runExample("04-loops/02-self-check-rubric.ts");
    output = result.stdout;
    expect(result.exitCode).toBe(0);
  });

  it("runs PLAN/DO/VERIFY/DECIDE rounds", ({ task }) => {
    story.init(task, { tags: ["loop", "soft-verify", "real-output"] });

    expect(output).toContain("round 1");
    expect(output).toContain("VERIFY:");
    expect(output.includes("FINAL") || output.includes("round cap")).toBe(true);

    story.then("soft rubric loop completes or hits cap");
  });
});
