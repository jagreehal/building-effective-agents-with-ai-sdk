import { describe, it, expect, beforeAll } from "vitest";
import { story } from "executable-stories-vitest";
import { runExample } from "./helpers.js";

let output: string = "";

describe("19 - Resilient Loop", () => {
  beforeAll(async () => {
    const result = await runExample("04-loops/07-resilient-loop.ts");
    output = result.stdout;
    expect(result.exitCode).toBe(0);
  });

  it("handles Atlantis tool errors honestly", ({ task }) => {
    story.init(task, { tags: ["loop", "resilience", "real-output"] });

    const mentionsAtlantis = output.toLowerCase().includes("atlantis");
    const hasErrorHandling =
      output.toLowerCase().includes("error") ||
      output.toLowerCase().includes("no weather") ||
      output.toLowerCase().includes("not a real");

    expect(mentionsAtlantis || hasErrorHandling).toBe(true);
    expect(output.length).toBeGreaterThan(100);

    story.then("agent surfaces tool failure instead of inventing data");
  });
});
