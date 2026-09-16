/**
 * Example 23: Mission Control — dynamic agent orchestration
 *
 *   pnpm 23                      # autopilot: Mission Control picks the team
 *   pnpm 23 director brain,engineer,wildcard
 *   pnpm 23 surprise             # the world agent invents a fresh emergency
 *
 * Watch the team CHANGE between chapters. That re-selection is the lesson:
 * capability discovery → routing → specialised prompts → parallel delegation
 * → aggregation → state transition → re-planning.
 */

import { roster } from './agents.js';
import { startTelemetry } from '../shared/telemetry.js';
import { runMission, newScenario } from './mission.js';
import { section, show } from '../shared/utils.js';

const DEFAULT_SCENARIO = `
A storm has knocked out power to a remote research station in the Arctic. Four scientists are trapped inside
with the temperature dropping. Communications are intermittent and the nearest help is nine hours away.
`.trim();

// Short aliases so "brain" works as well as "strategist".
const ALIASES: Record<string, string> = {
  brain: 'strategist',
  strategy: 'strategist',
  investigator: 'scout',
  people: 'negotiator',
  tech: 'engineer',
  risk: 'sceptic',
  skeptic: 'sceptic',
  creative: 'wildcard',
};

async function main() {
  startTelemetry('mission-control');

  const [mode = 'autopilot', arg] = process.argv.slice(2);

  const situation = mode === 'surprise' ? await newScenario() : DEFAULT_SCENARIO;

  const fixedTeam =
    mode === 'director'
      ? (arg ?? 'strategist,engineer,wildcard')
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .map((s) => ALIASES[s] ?? s)
      : undefined;

  section(`MISSION — ${mode.toUpperCase()} MODE`);
  console.log(`Roster: ${roster.map((a) => `${a.emoji} ${a.name}`).join('  ')}\n`);

  for await (const event of runMission({ situation, fixedTeam })) {
    switch (event.type) {
      case 'chapter':
        section(`CHAPTER ${event.chapter}`);
        show(event.situation, 'Situation');
        console.log('🛰️  Mission Control is assessing the team...\n');
        break;

      case 'deploy':
        console.log(`${event.agent.emoji} ${event.agent.name} HAS BEEN DEPLOYED`);
        console.log(`   ${event.reason}\n`);
        break;

      case 'standDown':
        console.log(`${event.agent.emoji} ${event.agent.name} IS STANDING DOWN`);
        console.log(`   ${event.reason}\n`);
        break;

      case 'hold':
        console.log(`${event.agent.emoji} ${event.agent.name} remains on the team\n`);
        break;

      case 'report':
        show(event.text, `${event.agent.emoji} ${event.agent.name} — ${event.agent.role}`);
        break;

      case 'plan':
        show(`${event.action}\n\n(Leader's call: ${event.rationale})`, '🎖️  THE TEAM WILL');
        break;

      case 'world':
        show(event.whatHappened, '🌍 WHAT HAPPENS');
        break;

      case 'end':
        section(
          event.reason === 'resolved'
            ? 'MISSION COMPLETE'
            : 'MISSION ONGOING — out of chapters'
        );
        console.log(`Chapters run: ${event.state.chapter}\n`);
        break;
    }
  }
}

main().catch(console.error);
