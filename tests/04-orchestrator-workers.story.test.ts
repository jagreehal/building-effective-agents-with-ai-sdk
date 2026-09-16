import { describe, it, expect, beforeAll } from "vitest";
import { story } from "executable-stories-vitest";
import { runExample } from "./helpers.js";

let orchestratorOutput: string = "";

describe("04 - Orchestrator-Workers", () => {
  beforeAll(async () => {
    const result = await runExample("02-advanced-workflows/01-orchestrator-workers.ts");
    orchestratorOutput = result.stdout;
    expect(result.exitCode).toBe(0);
  });

  it("creates a task plan and executes workers in parallel", ({ task }) => {
    story.init(task, { tags: ["advanced", "workflow", "orchestrator", "real-output"] });

    story.given("a complex task requiring multiple approaches");

    story.when("the orchestrator analyzes and plans");

    // Verify the orchestrator produced a plan
    const hasAnalysis = orchestratorOutput.toLowerCase().includes("analysis");
    const hasTasks = orchestratorOutput.toLowerCase().includes("tasks");
    const hasWorkers = orchestratorOutput.toLowerCase().includes("worker result");

    expect(hasAnalysis || hasTasks).toBe(true);

    story.then("the LLM generates a plan with subtasks", {
      table: {
        label: "Orchestrator Output Components",
        columns: ["Component", "Present"],
        rows: [
          ["Analysis Section", hasAnalysis ? "✅" : "❌"],
          ["Task List", hasTasks ? "✅" : "❌"],
          ["Worker Results", hasWorkers ? "✅" : "❌"],
        ],
      },
    });
  });

  it("produces multiple worker outputs for the product description", ({ task }) => {
    story.init(task, { tags: ["real-output"] });

    story.given("a product description task");

    story.when("workers execute different aspects in parallel");

    // Count worker results
    const workerResultCount = (orchestratorOutput.match(/Worker Result/g) || []).length;

    expect(workerResultCount).toBeGreaterThanOrEqual(1);

    story.then(`${workerResultCount} worker result(s) were produced`, {
      code: {
        label: "Live Orchestrator Output",
        content: orchestratorOutput,
        lang: "text",
      },
    });
  });

  it("demonstrates task decomposition quality", ({ task }) => {
    story.init(task, { tags: ["real-output"] });

    story.given("the orchestrator's task breakdown");

    story.when("examining the plan quality");

    // Check for meaningful task descriptions
    const hasTypeField = orchestratorOutput.toLowerCase().includes('"type"');
    const hasDescriptionField = orchestratorOutput.toLowerCase().includes('"description"');
    const outputLength = orchestratorOutput.length;

    story.then("the LLM produces structured, actionable subtasks", {
      code: {
        label: "Plan Structure Quality",
        content: `Contains task types: ${hasTypeField ? "✅" : "❌"}
Contains descriptions: ${hasDescriptionField ? "✅" : "❌"}
Total output length: ${outputLength} chars`,
        lang: "text",
      },
    });
  });
});
