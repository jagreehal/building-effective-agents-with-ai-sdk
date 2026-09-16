import { describe, it, expect, beforeAll } from "vitest";
import { story } from "executable-stories-vitest";
import { runExample } from "./helpers.js";

let output: string = "";

describe("03 - Parallelization", () => {
  beforeAll(async () => {
    const result = await runExample("01-basic-workflows/03-parallelization.ts");
    output = result.stdout;
    expect(result.exitCode).toBe(0);
  });

  it("runs three itinerary reviews in parallel (workshop p3)", ({ task }) => {
    story.init(task, { tags: ["basic", "workflow", "parallel", "p3", "real-output"] });

    story.given("one Lisbon itinerary");

    story.when("budget, weather, and safety reviewers run via Promise.all");

    expect(output).toContain("[budget]");
    expect(output).toContain("[weather]");
    expect(output).toContain("[safety]");
    expect(output).toMatch(/run in parallel\)/);

    story.then("parallel reviews complete and a synthesiser merges them", {
      code: {
        label: "Live Parallel Output",
        content: output,
        lang: "text",
      },
    });
  });

  it("produces a final verdict", ({ task }) => {
    story.init(task, { tags: ["real-output"] });

    expect(output).toContain("--- verdict ---");
    expect(output.length).toBeGreaterThan(200);

    story.then("the synthesiser returns a combined verdict");
  });
});
