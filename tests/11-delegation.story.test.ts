import { describe, it, expect, beforeAll } from "vitest";
import { story } from "executable-stories-vitest";
import { runExample } from "./helpers.js";

let agentOutput: string = "";

describe("11 - Delegation", () => {
  beforeAll(async () => {
    const result = await runExample("03-agents/06-delegation.ts");
    agentOutput = result.stdout;
    expect(result.exitCode).toBe(0);
  });

  it("delegates to specialist sub-agents via tools", ({ task }) => {
    story.init(task, { tags: ["agent", "toolloop", "p6", "delegation", "real-output"] });

    story.given("a concierge orchestrator with delegation tools");

    story.when("asked to plan a Lisbon weekend from London");

    const hasWeatherDelegate = agentOutput.includes("[delegate] weatherAnalyst");
    const hasFlightDelegate = agentOutput.includes("[delegate] flightAdvisor");

    story.then("both specialists are consulted", {
      table: {
        label: "Delegation Activity",
        columns: ["Sub-agent", "Consulted"],
        rows: [
          ["weatherAnalyst", hasWeatherDelegate ? "✅" : "❌"],
          ["flightAdvisor", hasFlightDelegate ? "✅" : "❌"],
        ],
      },
    });

    expect(agentOutput).toContain("--- plan ---");
    expect(agentOutput.length).toBeGreaterThan(200);
  });
});
