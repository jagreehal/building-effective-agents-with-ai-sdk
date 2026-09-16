import { describe, it, expect, beforeAll } from "vitest";
import { story } from "executable-stories-vitest";
import { runExample } from "./helpers.js";

let output: string = "";

describe("21 - Loop Usage", () => {
  beforeAll(async () => {
    const result = await runExample("04-loops/09-loop-usage.ts");
    output = result.stdout;
    expect(result.exitCode).toBe(0);
  });

  it("logs token usage per step", ({ task }) => {
    story.init(task, { tags: ["loop", "usage", "real-output"] });

    expect(output).toContain("[usage]");
    expect(output).toContain("[cost]");

    story.then("onStepFinish aggregates loop cost");
  });
});
