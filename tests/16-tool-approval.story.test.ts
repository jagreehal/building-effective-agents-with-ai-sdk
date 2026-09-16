import { describe, it, expect, beforeAll } from "vitest";
import { story } from "executable-stories-vitest";
import { runExample } from "./helpers.js";

let output: string = "";

describe("16 - Tool Approval", () => {
  beforeAll(async () => {
    const result = await runExample("04-loops/04-tool-approval.ts");
    output = result.stdout;
    expect(result.exitCode).toBe(0);
  });

  it("gates bookFlight with human approval", ({ task }) => {
    story.init(task, { tags: ["loop", "tool-approval", "real-output"] });

    const hasApproval = output.includes("needs your approval") || output.includes("APPROVED");
    const hasBookFlight = output.includes("[tool fired] bookFlight");

    expect(hasApproval || hasBookFlight).toBe(true);

    story.then("dangerous tool waits for approval over budget");
  });
});
