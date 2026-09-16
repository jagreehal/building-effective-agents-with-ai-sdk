import { describe, it, expect, beforeAll } from "vitest";
import { story } from "executable-stories-vitest";
import { runExample } from "./helpers.js";

let output: string = "";

describe("08 - Structured Output Agent", () => {
  beforeAll(async () => {
    const result = await runExample("03-agents/03-structured-output.ts");
    output = result.stdout;
    expect(result.exitCode).toBe(0);
  });

  it("returns typed recommendation fields (workshop f3)", ({ task }) => {
    story.init(task, { tags: ["agent", "toolloop", "structured", "f3", "real-output"] });

    story.given("a traveller who loves hiking and food");

    story.when("the agent generates structured output");

    expect(output).toMatch(/^== .+ ==/m);
    expect(output).toContain("Why:");
    expect(output).toContain("Packing:");

    story.then("destination, why, and packing fields are printed from result.output", {
      code: {
        label: "Structured Output",
        content: output,
        lang: "text",
      },
    });
  });
});
