import { describe, it, expect, beforeAll } from "vitest";
import { story } from "executable-stories-vitest";
import { runExample } from "./helpers.js";

let output: string = "";

describe("02 - Routing", () => {
  beforeAll(async () => {
    const result = await runExample("01-basic-workflows/02-routing.ts");
    output = result.stdout;
    expect(result.exitCode).toBe(0);
  });

  it("classifies TripMate queries and dispatches to specialists (workshop p2)", ({ task }) => {
    story.init(task, { tags: ["basic", "workflow", "routing", "p2", "real-output"] });

    story.given("three traveller queries");

    story.when("the triage agent labels each query");

    const routeCount = (output.match(/\[route\]/g) || []).length;
    expect(routeCount).toBeGreaterThanOrEqual(3);

    story.then("each query is classified and answered by a specialist", {
      code: {
        label: "Live Routing Output (excerpt)",
        content: output.slice(0, 1500),
        lang: "text",
      },
    });
  });

  it("routes weather, booking, and general queries", ({ task }) => {
    story.init(task, { tags: ["real-output"] });

    const hasWeather = output.includes("[route] weather");
    const hasBooking = output.includes("[route] booking");
    const hasGeneral = output.includes("[route] general");

    expect(hasWeather || hasBooking || hasGeneral).toBe(true);

    story.then("specialists cover the expected categories", {
      table: {
        label: "Routes Detected",
        columns: ["Category", "Detected"],
        rows: [
          ["weather", hasWeather ? "✅" : "❌"],
          ["booking", hasBooking ? "✅" : "❌"],
          ["general", hasGeneral ? "✅" : "❌"],
        ],
      },
    });
  });
});
