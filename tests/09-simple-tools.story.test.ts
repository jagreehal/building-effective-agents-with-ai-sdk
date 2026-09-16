import { describe, it, expect, beforeAll } from "vitest";
import { story } from "executable-stories-vitest";
import { runExample } from "./helpers.js";

let output: string = "";

describe("09 - Simple Tools Agent", () => {
  beforeAll(async () => {
    const result = await runExample("03-agents/04-simple-tools.ts");
    output = result.stdout;
    expect(result.exitCode).toBe(0);
  });

  it("uses getUserTime to pick a Spanish greeting (workshop f4)", ({ task }) => {
    story.init(task, { tags: ["agent", "toolloop", "tools", "f4", "real-output"] });

    story.given("a question about Spanish greetings");

    story.when("the agent calls getUserTime");

    expect(output).toContain("[tool fired] getUserTime()");
    expect(output).toContain("steps:");

    story.then("the agent answers using the tool result", {
      code: {
        label: "Tool Execution Output",
        content: output,
        lang: "text",
      },
    });
  });
});
