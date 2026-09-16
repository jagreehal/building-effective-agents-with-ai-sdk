import { describe, it, expect, beforeAll } from "vitest";
import { story } from "executable-stories-vitest";
import { runExample } from "./helpers.js";

let output = "";

describe("23 - Mission Control", () => {
  beforeAll(async () => {
    const result = await runExample("05-mission-control/01-mission.ts");
    output = result.stdout;
    expect(result.exitCode).toBe(0);
  });

  it("routes to specialists on capability, not on name", ({ task }) => {
    story.init(task, { tags: ["mission", "routing", "real-output"] });
    story.given("a rescue scenario and a roster of six specialists");
    story.when("Mission Control reads only the capability metadata");

    const deployed = [...output.matchAll(/(\w+) HAS BEEN DEPLOYED/g)].map((m) => m[1]);
    expect(deployed.length).toBeGreaterThan(0);

    story.then(`${deployed.length} specialist(s) were deployed with a stated reason`, {
      table: {
        label: "Routing",
        columns: ["Signal", "Present"],
        rows: [
          ["Deployment with reason", /HAS BEEN DEPLOYED/.test(output) ? "✅" : "❌"],
          ["Team leader committed action", /THE TEAM WILL/.test(output) ? "✅" : "❌"],
          ["World adjudicated outcome", /WHAT HAPPENS/.test(output) ? "✅" : "❌"],
        ],
      },
    });
  });

  it("re-assesses the team as the story advances", ({ task }) => {
    story.init(task, { tags: ["mission", "re-planning", "real-output"] });
    story.given("a situation that changes after the first chapter");
    story.when("Mission Control is asked again");

    const chapters = (output.match(/CHAPTER \d/g) || []).length;
    expect(chapters).toBeGreaterThan(1);

    story.then(`the roster was re-evaluated across ${chapters} chapters`, {
      code: {
        label: "Live Mission Log",
        content: output,
        lang: "text",
      },
    });
  });
});
