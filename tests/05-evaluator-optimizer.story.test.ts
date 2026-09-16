import { describe, it, expect, beforeAll } from "vitest";
import { story } from "executable-stories-vitest";
import { runExample } from "./helpers.js";

let output: string = "";

describe("05 - Evaluator-Optimizer", () => {
  beforeAll(async () => {
    const result = await runExample("02-advanced-workflows/02-evaluator-optimizer.ts");
    output = result.stdout;
    expect(result.exitCode).toBe(0);
  });

  it("iterates on a trip pitch until score clears the bar (workshop p4)", ({ task }) => {
    story.init(task, { tags: ["advanced", "workflow", "evaluator", "p4", "real-output"] });

    story.given("a Lisbon weekend pitch");

    story.when("writer, evaluator, and editor loop");

    expect(output).toMatch(/round \d+: \d+\/10/);
    expect(output).toContain("--- final pitch ---");
    expect(output.includes("[done] cleared") || output.includes("[done] hit")).toBe(true);

    story.then("the loop reports score rounds and a final pitch", {
      code: {
        label: "Live Iteration Output",
        content: output,
        lang: "text",
      },
    });
  });
});
