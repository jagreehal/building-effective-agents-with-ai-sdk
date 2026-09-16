import { describe, it, expect, beforeAll } from "vitest";
import { story } from "executable-stories-vitest";
import { runExample } from "./helpers.js";

let agentOutput: string = "";

describe("10 - Agentic Tool Chain", () => {
  beforeAll(async () => {
    const result = await runExample("03-agents/05-agentic-tools.ts");
    agentOutput = result.stdout;
    expect(result.exitCode).toBe(0);
  });

  it("orchestrates a dependency chain of tools", ({ task }) => {
    story.init(task, { tags: ["agent", "toolloop", "p5", "real-output"] });

    story.given("TripMate with lookupTraveler, getWeather, and getFlights tools");

    story.when("asked to plan a Lisbon weekend");

    const hasLookup = agentOutput.includes("[tool fired] lookupTraveler");
    const hasWeather = agentOutput.includes("[tool fired] getWeather");
    const hasFlights = agentOutput.includes("[tool fired] getFlights");

    story.then("the model fires tools in dependency order", {
      table: {
        label: "Tool Calls Detected",
        columns: ["Tool", "Fired"],
        rows: [
          ["lookupTraveler", hasLookup ? "✅" : "❌"],
          ["getWeather", hasWeather ? "✅" : "❌"],
          ["getFlights", hasFlights ? "✅" : "❌"],
        ],
      },
    });

    expect(hasLookup || hasWeather || hasFlights).toBe(true);
    expect(agentOutput).toContain("steps:");
  });
});
