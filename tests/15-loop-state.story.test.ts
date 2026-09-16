import { describe, it, expect, beforeAll } from "vitest";
import { story } from "executable-stories-vitest";
import { runExample } from "./helpers.js";

let output: string = "";

describe("15 - Loop State", () => {
  beforeAll(async () => {
    const result = await runExample("04-loops/03-loop-state.ts");
    output = result.stdout;
    expect(result.exitCode).toBe(0);
  });

  it("tracks attempt state across rounds", ({ task }) => {
    story.init(task, { tags: ["loop", "state", "real-output"] });

    expect(output).toContain("state:");
    expect(output).toMatch(/round \d+/);
    expect(output).toContain("final pitch");

    story.then("explicit attempt log is maintained");
  });
});
