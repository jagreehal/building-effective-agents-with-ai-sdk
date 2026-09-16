import { describe, it, expect, beforeAll } from "vitest";
import { story } from "executable-stories-vitest";
import { runExample } from "./helpers.js";

let output: string = "";

describe("13 - Hard Verify Loop", () => {
  beforeAll(async () => {
    const result = await runExample("04-loops/01-hard-verify-loop.ts", 600000);
    output = result.stdout + result.stderr;
    expect(result.exitCode).toBe(0);
  }, 600000);

  it("iterates until verify passes or hits cap", ({ task }) => {
    story.init(task, { tags: ["loop", "hard-verify", "real-output"] });

    expect(output).toMatch(/iteration \d+: VERIFY failed|\[verify\] passed/);
    expect(output.includes("[done]") || output.includes("final code")).toBe(true);

    story.then("hard gate drives the loop, not LLM self-grade");
  });
});
