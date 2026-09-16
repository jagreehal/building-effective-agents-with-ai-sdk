import { describe, it, expect, beforeAll } from "vitest";
import { story } from "executable-stories-vitest";
import { runExample } from "./helpers.js";

let agentOutput: string = "";

describe("06 - Orchestrator Agent", () => {
  beforeAll(async () => {
    const result = await runExample("03-agents/01-orchestrator-agent.ts");
    agentOutput = result.stdout;
    expect(result.exitCode).toBe(0);
  });

  it("orchestrates multiple agents via tool calls", ({ task }) => {
    story.init(task, { tags: ["agent", "toolloop", "orchestrator", "real-output"] });

    story.given("a main orchestrator and specialized subagents");

    story.when("the orchestrator delegates via tools");

    // Verify agent activity
    const hasWriterActivity = agentOutput.toLowerCase().includes("writer");
    const hasReviewerActivity = agentOutput.toLowerCase().includes("reviewer");
    const hasToolActivity = agentOutput.includes("[") && agentOutput.includes("]");

    story.then("multiple agents collaborate on the task", {
      table: {
        label: "Agent Activity Detected",
        columns: ["Agent/Component", "Active"],
        rows: [
          ["Writer Subagent", hasWriterActivity ? "✅" : "❌"],
          ["Reviewer Subagent", hasReviewerActivity ? "✅" : "❌"],
          ["Tool Call Activity", hasToolActivity ? "✅" : "❌"],
        ],
      },
    });
  });

  it("produces a final result through agent collaboration", ({ task }) => {
    story.init(task, { tags: ["real-output"] });

    story.given("the multi-agent workflow");

    story.when("agents complete their collaboration");

    // Verify we got a result
    const hasFinalResult = agentOutput.toLowerCase().includes("final") ||
                          agentOutput.toLowerCase().includes("done") ||
                          agentOutput.toLowerCase().includes("orchestrator final");
    const outputLength = agentOutput.length;

    expect(outputLength).toBeGreaterThan(200);

    story.then("the orchestrator produces a collaborative result", {
      code: {
        label: "Agent Collaboration Output",
        content: `Has final result indicator: ${hasFinalResult ? "✅" : "⚠️"}
Output length: ${outputLength} characters

${agentOutput.slice(0, 1200)}`,
        lang: "text",
      },
    });
  });
});
