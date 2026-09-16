/**
 * The Mission Engine
 *
 * Four kinds of agent, with a strict separation of concerns:
 *
 *   Mission Control → WHO works on this?
 *   Specialists     → WHAT DO I THINK?
 *   Team Leader     → WHAT DO WE DO?
 *   The World       → WHAT HAPPENS NEXT?
 *
 * The specialists never decide whether their own idea worked. They never talk
 * to each other either — every message goes up to the leader and back down.
 * That is what stops the demo turning into an agent chat room.
 *
 * The loop re-runs Mission Control every chapter, so the team changes as the
 * problem changes. That re-planning step is the whole point.
 */

import { Output, ToolLoopAgent } from 'ai';
import { z } from 'zod';
import { model } from '../shared/config.js';
import { type Agent, byId, capabilityCard, roster } from './agents.js';

export type MissionState = {
  chapter: number;
  situation: string;
  history: string[];
  resolved: boolean;
  /** Ties every span in this mission together as one conversation. */
  missionId: string;
};

/** Groups every span in one mission under a single conversation id. */
const observed = (state: MissionState) => ({
  runtimeContext: { sessionId: state.missionId },
});

export type Deployment = { agent: Agent; reason: string };
export type Report = { agent: Agent; text: string };

export type MissionEvent =
  | { type: 'chapter'; chapter: number; situation: string }
  | { type: 'deploy'; agent: Agent; reason: string }
  | { type: 'standDown'; agent: Agent; reason: string }
  | { type: 'hold'; agent: Agent }
  | { type: 'report'; agent: Agent; text: string }
  | { type: 'plan'; action: string; rationale: string }
  | { type: 'world'; whatHappened: string; situation: string; resolved: boolean }
  | { type: 'end'; state: MissionState; reason: 'resolved' | 'out-of-chapters' };

const brief = (state: MissionState) =>
  [
    `SITUATION: ${state.situation}`,
    state.history.length ? `\nWHAT HAS HAPPENED SO FAR:\n${state.history.map((h, i) => `${i + 1}. ${h}`).join('\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n');

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Mission Control — the router. Sees capability adverts, never system prompts.
// ═══════════════════════════════════════════════════════════════════════════════

const Selection = z.object({
  deploy: z
    .array(
      z.object({
        agentId: z.string().describe('the id of a specialist from the roster'),
        reason: z
          .string()
          .describe('one sentence: what about THIS situation makes this specialist the right call'),
      })
    )
    .describe('the 2 to 3 specialists to deploy for this chapter'),
});

const missionControl = new ToolLoopAgent({
  model,
  id: 'mission-control',
  telemetry: { functionId: 'mission-control', includeRuntimeContext: { sessionId: true } },
  output: Output.object({ schema: Selection }),
  instructions: `
You are Mission Control. You do not solve the problem. You choose who works on it.
Pick the 2-3 specialists whose advertised capabilities match what THIS chapter actually needs.
Respect avoidWhen: do not deploy a specialist the situation tells you to avoid.
A specialist who is not needed this chapter must be left out, even if they were useful last chapter.
Justify each choice against the situation, not against the specialist's job title.
`.trim(),
});

export async function selectTeam(state: MissionState): Promise<Deployment[]> {
  const result = await missionControl.generate({
    ...observed(state),
    prompt: `${brief(state)}

AVAILABLE SPECIALISTS:
${JSON.stringify(roster.map(capabilityCard), null, 2)}

Who do you deploy for this chapter, and why?`,
  });

  const picked = result.output.deploy
    .map((d) => ({ agent: byId(d.agentId), reason: d.reason }))
    .filter((d): d is Deployment => Boolean(d.agent));

  // ponytail: small local models sometimes invent ids or pick nobody.
  // Fall back to the scout — "go and find out" is never the wrong first move.
  return picked.length
    ? picked
    : [{ agent: byId('scout')!, reason: 'Fallback: the situation is not yet understood well enough to route.' }];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Specialists — same world state, different instructions. Run in parallel.
// ═══════════════════════════════════════════════════════════════════════════════

export function runSpecialist(agent: Agent, state: MissionState): Promise<Report> {
  return new ToolLoopAgent({
    model,
    id: agent.id,
    telemetry: { functionId: `specialist.${agent.id}`, includeRuntimeContext: { sessionId: true } },
    instructions: agent.systemPrompt,
  })
    .generate({
      ...observed(state),
      prompt: `${brief(state)}\n\nGive your assessment.`,
    })
    .then((r) => ({ agent, text: r.text.trim() }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Team Leader — turns several opinions into one action.
// ═══════════════════════════════════════════════════════════════════════════════

const Decision = z.object({
  action: z.string().describe('the single concrete thing the team does next, in 1-2 sentences'),
  rationale: z.string().describe('which reports you weighted and which you overruled, in one sentence'),
});

const teamLeader = new ToolLoopAgent({
  model,
  id: 'team-leader',
  telemetry: { functionId: 'team-leader', includeRuntimeContext: { sessionId: true } },
  output: Output.object({ schema: Decision }),
  instructions: `
You are the team leader. Your specialists have each given you a partial view.
Choose ONE action the team takes now. It must be concrete enough to actually carry out.
Where reports conflict, pick a side and say so. Do not average them, and do not do everything at once.
Safety concerns raised by the sceptic outrank speed.
`.trim(),
});

export async function decide(state: MissionState, reports: Report[]) {
  const result = await teamLeader.generate({
    ...observed(state),
    prompt: `${brief(state)}

TEAM REPORTS:
${reports.map((r) => `--- ${r.agent.name} (${r.agent.role}) ---\n${r.text}`).join('\n\n')}

What does the team do?`,
  });
  return result.output;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. The World — decides what the action actually achieves. The agents don't.
// ═══════════════════════════════════════════════════════════════════════════════

const Outcome = z.object({
  whatHappened: z.string().describe('the consequence of the action, in 2-3 sentences'),
  situation: z
    .string()
    .describe(
      'the new situation now facing the team: 2-3 full sentences of prose, self-contained, naming ' +
        'what is now true and what is now at stake. Never a headline, never capitals.'
    ),
  resolved: z.boolean().describe('true only if everyone is safe and nothing urgent remains'),
});

const world = new ToolLoopAgent({
  model,
  id: 'world',
  telemetry: { functionId: 'world', includeRuntimeContext: { sessionId: true } },
  output: Output.object({ schema: Outcome }),
  instructions: `
You are the world. You decide what an action achieves — the team does not get to declare its own success.
Let a well-reasoned action mostly work, but introduce one honest complication that changes the KIND of problem the
team faces: a technical fix should expose a human problem, a human fix should expose a logistical one.
Never invent a rescue that arrives from nowhere. Only set resolved=true when the danger is genuinely over.
Write \`situation\` as prose a newcomer could act on cold — never a title or a summary line. It must carry
forward what has already been fixed, so nobody re-solves a solved problem.
`.trim(),
});

export async function advance(state: MissionState, action: string) {
  const result = await world.generate({
    ...observed(state),
    prompt: `${brief(state)}\n\nTHE TEAM DOES: ${action}\n\nWhat happens?`,
  });
  return result.output;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Scenario generation — the "Surprise Me" mode.
// ═══════════════════════════════════════════════════════════════════════════════

const scenarioAgent = new ToolLoopAgent({
  model,
  id: 'scenario-writer',
  telemetry: { functionId: 'scenario-writer', includeRuntimeContext: { sessionId: true } },
  output: Output.object({
    schema: z.object({
      situation: z.string().describe('the opening situation, self-contained, 2-3 sentences'),
    }),
  }),
  instructions: `
Write the opening of a rescue scenario: people at risk, a clock, and incomplete information.
It must need more than one kind of expertise to solve. Do not include a solution or any specialists.
`.trim(),
});

export async function newScenario(): Promise<string> {
  const result = await scenarioAgent.generate({
    prompt: 'Invent a fresh emergency. Not a storm-hit research station — pick somewhere else entirely.',
  });
  return result.output.situation;
}

// ═══════════════════════════════════════════════════════════════════════════════
// The loop: select → work → synthesise → advance → re-select.
// ═══════════════════════════════════════════════════════════════════════════════

export async function* runMission(opts: {
  situation: string;
  /** Director mode: fix the team by hand and skip the router entirely. */
  fixedTeam?: string[];
  maxChapters?: number;
}): AsyncGenerator<MissionEvent, void> {
  const maxChapters = opts.maxChapters ?? 3;
  const state: MissionState = {
    chapter: 0,
    situation: opts.situation,
    history: [],
    resolved: false,
    missionId: crypto.randomUUID(),
  };
  let previous: Deployment[] = [];

  while (!state.resolved && state.chapter < maxChapters) {
    state.chapter++;
    yield { type: 'chapter', chapter: state.chapter, situation: state.situation };

    const team = opts.fixedTeam
      ? opts.fixedTeam
          .map((id) => byId(id))
          .filter((a): a is Agent => Boolean(a))
          .map((agent) => ({ agent, reason: 'Hand-picked by the director.' }))
      : await selectTeam(state);

    // The visible bit: who changed, and why.
    for (const gone of previous.filter((p) => !team.some((t) => t.agent.id === p.agent.id))) {
      yield { type: 'standDown', agent: gone.agent, reason: 'No longer matches the problem in front of the team.' };
    }
    for (const d of team) {
      const held = previous.some((p) => p.agent.id === d.agent.id);
      yield held ? { type: 'hold', agent: d.agent } : { type: 'deploy', agent: d.agent, reason: d.reason };
    }
    previous = team;

    const reports = await Promise.all(team.map((d) => runSpecialist(d.agent, state)));
    for (const r of reports) yield { type: 'report', agent: r.agent, text: r.text };

    const plan = await decide(state, reports);
    yield { type: 'plan', ...plan };

    const outcome = await advance(state, plan.action);
    yield { type: 'world', ...outcome };

    state.history.push(`${plan.action} → ${outcome.whatHappened}`);
    state.situation = outcome.situation;
    state.resolved = outcome.resolved;
  }

  yield { type: 'end', state, reason: state.resolved ? 'resolved' : 'out-of-chapters' };
}
