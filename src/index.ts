#!/usr/bin/env tsx
/**
 * Building Effective Agents with AI SDK
 * 
 * TypeScript examples demonstrating agentic patterns from Anthropic's
 * "Building Effective Agents" using AI SDK with local models via Ollama.
 * 
 * Quick Start:
 *   pnpm example 01          # Run prompt chaining
 *   pnpm example 02          # Run routing
 *   pnpm example all         # Run all examples
 * 
 * Or run directly:
 *   tsx src/01-basic-workflows/01-prompt-chaining.ts
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ═══════════════════════════════════════════════════════════════════════════════
// Example Registry
// ═══════════════════════════════════════════════════════════════════════════════

const EXAMPLES = {
  // Basic Workflows (Simple, deterministic patterns)
  '01': {
    name: 'Prompt Chaining',
    description: 'Draft → review → gate → edit (workshop p1 finish)',
    path: '01-basic-workflows/01-prompt-chaining.ts',
    category: 'Basic',
  },
  '02': {
    name: 'Routing',
    description: 'Classify and dispatch to TripMate specialists (workshop p2 finish)',
    path: '01-basic-workflows/02-routing.ts',
    category: 'Basic',
  },
  '03': {
    name: 'Parallelization',
    description: 'Parallel itinerary reviews + synthesiser (workshop p3 finish)',
    path: '01-basic-workflows/03-parallelization.ts',
    category: 'Basic',
  },

  // Advanced Workflows (Complex, iterative patterns)
  '04': {
    name: 'Orchestrator-Workers',
    description: 'Break tasks into subtasks and delegate to parallel workers',
    path: '02-advanced-workflows/01-orchestrator-workers.ts',
    category: 'Advanced',
  },
  '05': {
    name: 'Evaluator-Optimizer',
    description: 'Score and improve a trip pitch in a loop (workshop p4 finish)',
    path: '02-advanced-workflows/02-evaluator-optimizer.ts',
    category: 'Advanced',
  },

  // Agents (ToolLoopAgent patterns)
  '06': {
    name: 'Orchestrator Agent',
    description: 'Write/review subagents with done tool (supplementary, not workshop)',
    path: '03-agents/01-orchestrator-agent.ts',
    category: 'Agent',
  },
  '07': {
    name: 'Evaluator Agent',
    description: 'Agentic code eval loop via tools (supplementary, not workshop)',
    path: '03-agents/02-evaluator-agent.ts',
    category: 'Agent',
  },
  '08': {
    name: 'Structured Output Agent',
    description: 'Typed travel recommendation (workshop f3 finish)',
    path: '03-agents/03-structured-output.ts',
    category: 'Agent',
  },
  '09': {
    name: 'Simple Tools Agent',
    description: 'getUserTime tool for greetings (workshop f4 finish)',
    path: '03-agents/04-simple-tools.ts',
    category: 'Agent',
  },
  '10': {
    name: 'Agentic Tool Chain',
    description: 'Model-orchestrated tool dependency chain (workshop p5 finish)',
    path: '03-agents/05-agentic-tools.ts',
    category: 'Agent',
  },
  '11': {
    name: 'Delegation',
    description: 'Sub-agents as delegation tools (workshop p6 finish)',
    path: '03-agents/06-delegation.ts',
    category: 'Agent',
  },
  '12': {
    name: 'Streaming Conversation',
    description: 'Chat loop with streaming and memory (workshop p7 finish)',
    path: '03-agents/07-conversation.ts',
    category: 'Agent',
  },

  // Loops (verify, state, gates, heartbeat)
  '13': {
    name: 'Hard Verify Loop',
    description: 'Fix code until tests pass — hard gate, not LLM judge',
    path: '04-loops/01-hard-verify-loop.ts',
    category: 'Loop',
  },
  '14': {
    name: 'Self-Check Rubric',
    description: 'PLAN/DO/VERIFY/DECIDE soft loop (article paste prompt)',
    path: '04-loops/02-self-check-rubric.ts',
    category: 'Loop',
  },
  '15': {
    name: 'Loop State',
    description: 'Explicit attempt log passed into each iteration',
    path: '04-loops/03-loop-state.ts',
    category: 'Loop',
  },
  '16': {
    name: 'Tool Approval',
    description: 'Human gate via toolApproval (workshop finish)',
    path: '04-loops/04-tool-approval.ts',
    category: 'Loop',
  },
  '17': {
    name: 'Input Guardrail',
    description: 'Cheap pre-check before agent runs (workshop f5)',
    path: '04-loops/05-input-guardrail.ts',
    category: 'Loop',
  },
  '18': {
    name: 'Output Guardrail',
    description: 'PII redaction via wrapLanguageModel middleware',
    path: '04-loops/06-output-guardrail.ts',
    category: 'Loop',
  },
  '19': {
    name: 'Resilient Loop',
    description: 'Tools return errors as data (workshop resilience)',
    path: '04-loops/07-resilient-loop.ts',
    category: 'Loop',
  },
  '20': {
    name: 'Scheduled Heartbeat',
    description: 'Interval re-run with LOOP_TICK sentinel',
    path: '04-loops/08-scheduled-heartbeat.ts',
    category: 'Loop',
  },
  '21': {
    name: 'Loop Usage',
    description: 'Token tracking via onStepFinish',
    path: '04-loops/09-loop-usage.ts',
    category: 'Loop',
  },
  '22': {
    name: 'ai-sdk-guardrails (bonus)',
    description: 'Input scope + PII redaction via ai-sdk-guardrails npm package',
    path: '04-loops/10-ai-sdk-guardrails-bonus.ts',
    category: 'Loop',
  },

  // Mission Control (dynamic multi-agent orchestration)
  '23': {
    name: 'Mission Control',
    description: 'Router picks specialists per chapter, then re-picks as the story changes',
    path: '05-mission-control/01-mission.ts',
    category: 'Mission',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════════

function printHeader() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║     Building Effective Agents with AI SDK - Examples          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
}

function printUsage() {
  console.log('Usage: pnpm example <number>');
  console.log('       tsx src/index.ts <number>\n');
  console.log('Examples:');
  console.log('  pnpm example 01     # Prompt Chaining');
  console.log('  pnpm example 05     # Evaluator-Optimizer');
  console.log('  pnpm example all    # Run all examples\n');
}

function printExamples() {
  console.log('Available Examples:\n');

  // Group by category
  const categories = ['Basic', 'Advanced', 'Agent', 'Loop', 'Mission'] as const;
  
  for (const category of categories) {
    console.log(`${category} Workflows:`);
    const categoryExamples = Object.entries(EXAMPLES).filter(
      ([_, ex]) => ex.category === category
    );
    
    for (const [id, example] of categoryExamples) {
      console.log(`  ${id}. ${example.name}`);
      console.log(`     ${example.description}`);
    }
    console.log();
  }
}

function runExample(id: string): Promise<void> {
  const example = EXAMPLES[id as keyof typeof EXAMPLES];
  
  if (!example) {
    console.error(`❌ Unknown example: ${id}`);
    console.log(`   Run without arguments to see available examples.\n`);
    process.exit(1);
  }

  console.log(`🚀 Running: ${example.name}\n`);
  
  const filePath = join(__dirname, example.path);
  const child = spawn('tsx', [filePath], {
    stdio: 'inherit',
    shell: true,
  });

  return new Promise((resolve, reject) => {
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Example exited with code ${code}`));
      }
    });
  });
}

async function runAll() {
  const ids = Object.keys(EXAMPLES);
  
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  Example ${id} of ${ids.length}`);
    console.log(`${'═'.repeat(60)}\n`);
    
    await runExample(id);
    
    if (i < ids.length - 1) {
      console.log(`\n⏳ Continuing to next example in 2 seconds...\n`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('  All examples completed!');
  console.log('═'.repeat(60) + '\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  const arg = process.argv[2];

  printHeader();

  if (!arg) {
    printUsage();
    printExamples();
    console.log('Pro Tip: Start with the basics - try "pnpm example 01"\n');
    return;
  }

  if (arg === 'all') {
    await runAll();
    return;
  }

  if (arg === 'list' || arg === '--list' || arg === '-l') {
    printExamples();
    return;
  }

  // Pad single digits with zero
  const id = arg.length === 1 ? `0${arg}` : arg;
  await runExample(id);
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
