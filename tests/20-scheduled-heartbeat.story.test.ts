import { describe, it, expect, beforeAll } from "vitest";
import { story } from "executable-stories-vitest";
import { runExample } from "./helpers.js";

let output: string = "";

describe("20 - Scheduled Heartbeat", () => {
  beforeAll(async () => {
    const result = await runExample("04-loops/08-scheduled-heartbeat.ts", 120000, {
      LOOP_MAX_RUNS: "1",
    });
    output = result.stdout;
    expect(result.exitCode).toBe(0);
  }, 120000);

  it("emits LOOP_TICK sentinel", ({ task }) => {
    story.init(task, { tags: ["loop", "heartbeat", "real-output"] });

    expect(output).toContain("LOOP_TICK");
    expect(output).toContain("Heartbeat stopped");

    story.then("single tick completes without hanging");
  });
});
