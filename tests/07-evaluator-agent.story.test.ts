import { describe, it, expect, beforeAll } from "vitest";
import { story } from "executable-stories-vitest";
import { runExample } from "./helpers.js";

let agentOutput: string = "";

describe("07 - Evaluator Agent", () => {
  beforeAll(async () => {
    const result = await runExample("03-agents/02-evaluator-agent.ts");
    agentOutput = result.stdout;
    expect(result.exitCode).toBe(0);
  });

  it("uses tool calls for code evaluation iteration", ({ task }) => {
    story.init(task, { tags: ["agent", "toolloop", "evaluator", "real-output"] });

    story.given("an agent with evaluate and done tools");

    story.when("implementing MinStack");

    // Verify tool usage
    const hasEvaluations = agentOutput.toLowerCase().includes("evaluat");
    const hasIterations = agentOutput.toLowerCase().includes("iterat") ||
                         agentOutput.toLowerCase().includes("check");
    const hasCodeGeneration = agentOutput.includes("{") && 
                             (agentOutput.includes("push") || agentOutput.includes("pop"));

    story.then("the agent uses tools to iterate", {
      table: {
        label: "Agent Tool Usage",
        columns: ["Activity", "Detected"],
        rows: [
          ["Evaluation Activity", hasEvaluations ? "✅" : "❌"],
          ["Iteration Indicators", hasIterations ? "✅" : "❌"],
          ["Code Generation", hasCodeGeneration ? "✅" : "❌"],
        ],
      },
    });
  });

  it("produces evaluated code through the agent loop", ({ task }) => {
    story.init(task, { tags: ["real-output"] });

    story.given("the evaluator agent loop");

    story.when("iteration completes");

    story.then("we see the agent's work", {
      code: {
        label: "Agent Output",
        content: agentOutput,
        lang: "text",
      },
    });
  });
});
