/**
 * Example 13: Hard Verify Loop
 *
 * Article coding loop: maker writes code, YOUR tests reject bad work.
 * VERIFY is an inline test runner — not LLM judgment.
 *
 * GOAL: fix MinStack.getMin to O(1)
 * STOP: tests pass OR 8 iterations
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ToolLoopAgent } from 'ai';
import { model } from '../shared/config.js';
import { MAX_HARD_VERIFY_ITERATIONS } from '../shared/skills/loop-protocol.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '../..');
const FIXTURE_PATH = join(__dirname, 'fixtures/broken-stack.ts');

interface Attempt {
  iteration: number;
  error: string;
}

function verify(code: string): { ok: boolean; error: string } {
  writeFileSync(FIXTURE_PATH, code, 'utf8');
  try {
    execSync(
      `./node_modules/.bin/tsx -e "import { runMinStackTests } from './src/04-loops/fixtures/broken-stack.ts'; const r = runMinStackTests(); if (!r.ok) { console.error(r.error); process.exit(1); }"`,
      { cwd: projectRoot, stdio: 'pipe', encoding: 'utf8' },
    );
    return { ok: true, error: '' };
  } catch (err) {
    const stderr =
      err && typeof err === 'object' && 'stderr' in err
        ? String((err as { stderr: Buffer }).stderr)
        : err instanceof Error
          ? err.message
          : String(err);
    return { ok: false, error: stderr.trim().slice(0, 500) || 'Verification failed' };
  }
}

const maker = new ToolLoopAgent({
  model,
  instructions: `
You fix TypeScript code. Implement MinStack with push(x), pop(), and getMin() — all O(1).
Use a secondary min stack for getMin. Export class MinStack and function runMinStackTests() unchanged.
Return ONLY the complete file contents, no markdown fences.
`.trim(),
});

async function main() {
  console.log('Hard verify loop: fix MinStack until tests pass\n');

  let code = readFileSync(FIXTURE_PATH, 'utf8');
  const attempts: Attempt[] = [];

  for (let i = 1; i <= MAX_HARD_VERIFY_ITERATIONS; i++) {
    const check = verify(code);
    if (check.ok) {
      console.log(`\n[verify] passed on iteration ${i}`);
      console.log('\n--- final code ---');
      console.log(code);
      console.log(`\n[done] ${attempts.length} failed attempt(s) recorded`);
      return;
    }

    attempts.push({ iteration: i, error: check.error });
    console.log(`\niteration ${i}: VERIFY failed — ${check.error.slice(0, 120)}`);

    const context = [
      'Previous failures:',
      ...attempts.map((a) => `- iteration ${a.iteration}: ${a.error}`),
      '',
      'Current code:',
      code,
    ].join('\n');

    const result = await maker.generate({
      prompt: `Fix this MinStack. Tests must pass.\n\n${context}`,
    });
    code = result.text
      .replace(/^```(?:typescript|ts)?\n/m, '')
      .replace(/\n```$/m, '')
      .trim();
  }

  console.log(`\n[done] hit ${MAX_HARD_VERIFY_ITERATIONS}-iteration cap`);
  console.log('Last error:', attempts[attempts.length - 1]?.error);
}

main().catch(console.error);
