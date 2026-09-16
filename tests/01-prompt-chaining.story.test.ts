import { describe, it, expect, beforeAll } from "vitest";
import { story } from "executable-stories-vitest";
import { runExample } from "./helpers.js";

let output: string = "";

describe("01 - Prompt Chaining", () => {
  beforeAll(async () => {
    const result = await runExample("01-basic-workflows/01-prompt-chaining.ts");
    output = result.stdout;
    expect(result.exitCode).toBe(0);
  });

  it("chains draft, review, gate, and edit (workshop p1)", ({ task }) => {
    story.init(task, { tags: ["basic", "workflow", "chaining", "p1", "real-output"] });

    story.given("a travel pitch for Lisbon");

    story.when("writer, reviewer, gate, and editor run in sequence");

    expect(output).toContain("--- draft ---");
    expect(output).toContain("--- review ---");
    expect(
      output.includes("[gate] passed") || output.includes("[gate] failed"),
    ).toBe(true);

    story.then("the chain produces a reviewed pitch with a plain-code gate", {
      code: {
        label: "Live Output (excerpt)",
        content: output.slice(0, 1200),
        lang: "text",
      },
    });
  });

  it("uses typed review output for the gate", ({ task }) => {
    story.init(task, { tags: ["real-output"] });

    story.given("a reviewer returning structured verdict fields");

    const hasBudgetCheck = output.includes("mentionsBudget:");
    const hasCtaCheck = output.includes("hasCallToAction:");

    expect(hasBudgetCheck).toBe(true);
    expect(hasCtaCheck).toBe(true);

    story.then("the gate reads boolean fields from typed output", {
      table: {
        label: "Verdict Fields",
        columns: ["Field", "Present"],
        rows: [
          ["mentionsBudget", hasBudgetCheck ? "✅" : "❌"],
          ["hasCallToAction", hasCtaCheck ? "✅" : "❌"],
        ],
      },
    });
  });
});
