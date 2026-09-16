/**
 * Building Effective Agents with AI SDK - Basic Workflows
 */

import { ollama, generateText } from 'ai-sdk-ollama';
import { Output } from 'ai';
import { z } from 'zod';

const model = ollama('granite4');

function show(text: string, title: string) {
  console.log(`\n${title}`);
  console.log('-'.repeat(title.length));
  console.log(`\n${text}\n`);
}

// ─────────────────────────────────────────────
// Workflow 1: Prompt Chaining
// ─────────────────────────────────────────────
//
// Feed the output of one LLM call into the next,
// completing the task step by step.

async function chain(input: string, prompts: string[]): Promise<string> {
  let result = input;
  for (let i = 0; i < prompts.length; i++) {
    const { text } = await generateText({
      model,
      system: prompts[i],
      prompt: `Input:\n${result}`,
    });
    result = text;
    show(result, `Step ${i + 1}`);
  }
  return result;
}

// ─────────────────────────────────────────────
// Workflow 2: Routing
// ─────────────────────────────────────────────
//
// Use an LLM call to classify input and route
// it to the appropriate specialized handler.

const RouteSelection = z.object({
  reasoning: z
    .string()
    .describe(
      'Brief explanation of why this ticket should be routed to a specific team.',
    ),
  selection: z.string().describe('The chosen team name'),
});

async function route(
  input: string,
  routes: Record<string, string>,
): Promise<string> {
  const routeNames = Object.keys(routes);

  const routeResult = await generateText({
    model,
    output: Output.object({
      schema: RouteSelection,
    }),
    system: `Analyze the input and select the most appropriate support team from these options: ${routeNames.join(', ')}`,
    prompt: input,
  });

  const { reasoning, selection } = routeResult.output;
  const routeKey = selection.trim().toLowerCase();

  show(reasoning, 'Routing Analysis');
  show(routeKey, 'Selected Route');

  const { text } = await generateText({
    model,
    system: routes[routeKey],
    prompt: input,
  });

  return text;
}

// ─────────────────────────────────────────────
// Workflow 3: Parallelization
// ─────────────────────────────────────────────
//
// Run multiple LLM calls concurrently when they
// are independent of each other.

async function parallel(prompt: string, inputs: string[]): Promise<string[]> {
  const results = await Promise.all(
    inputs.map((input) =>
      generateText({
        model,
        system: prompt,
        prompt: input,
      }),
    ),
  );
  return results.map((r) => r.text);
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

async function main() {
  const workflow = process.argv[2] ?? 'chain';

  if (workflow === 'chain') {
    const dataProcessingSteps = [
      `Extract only the numerical values and their associated metrics from the text.
      Format each as 'value: metric' on a new line.
      Example: 92: customer satisfaction`,

      `Convert all numerical values to percentages where possible.
      If not a percentage or points, convert to decimal (e.g., 92 points -> 92%).
      Keep one number per line.
      Example: 92%: customer satisfaction`,

      `Sort all lines in descending order by numerical value.
      Keep the format 'value: metric' on each line.`,

      `Format the sorted data as a markdown table with columns:
      | Metric | Value |
      |:--|--:|`,
    ];

    const report = `
Q3 Performance Summary:
Our customer satisfaction score rose to 92 points this quarter.
Revenue grew by 45% compared to last year.
Market share is now at 23% in our primary market.
Customer churn decreased to 5% from 8%.
New user acquisition cost is $43 per user.
Product adoption rate increased to 78%.
Employee satisfaction is at 87 points.
Operating margin improved to 34%.`.trim();

    show(report, 'Input text');
    const result = await chain(report, dataProcessingSteps);
    show(result, 'Result');
  }

  if (workflow === 'route') {
    const supportRoutes: Record<string, string> = {
      billing: `You are a billing support specialist. Follow these guidelines:
        1. Always start with "Billing Support Response:"
        2. First acknowledge the specific billing issue
        3. Explain any charges or discrepancies clearly
        4. List concrete next steps with timeline
        5. End with payment options if relevant
        Keep responses professional but friendly.`,

      technical: `You are a technical support engineer. Follow these guidelines:
        1. Always start with "Technical Support Response:"
        2. List exact steps to resolve the issue
        3. Include system requirements if relevant
        4. Provide workarounds for common problems
        5. End with escalation path if needed
        Use clear, numbered steps and technical details.`,

      account: `You are an account security specialist. Follow these guidelines:
        1. Always start with "Account Support Response:"
        2. Prioritize account security and verification
        3. Provide clear steps for account recovery/changes
        4. Include security tips and warnings
        5. Set clear expectations for resolution time
        Maintain a serious, security-focused tone.`,

      product: `You are a product specialist. Follow these guidelines:
        1. Always start with "Product Support Response:"
        2. Focus on feature education and best practices
        3. Include specific examples of usage
        4. Link to relevant documentation sections
        5. Suggest related features that might help
        Be educational and encouraging in tone.`,
    };

    const tickets = [
      `Subject: Can't access my account
      Message: Hi, I've been trying to log in for the past hour but keep getting an 'invalid password' error.
      I'm sure I'm using the right password. Can you help me regain access? This is urgent as I need to
      submit a report by end of day.
      - John`,

      `Subject: Unexpected charge on my card
      Message: Hello, I just noticed a charge of $49.99 on my credit card from your company, but I thought
      I was on the $29.99 plan. Can you explain this charge and adjust it if it's a mistake?
      Thanks,
      Sarah`,

      `Subject: How to export data?
      Message: I need to export all my project data to Excel. I've looked through the docs but can't
      figure out how to do a bulk export. Is this possible? If so, could you walk me through the steps?
      Best regards,
      Mike`,
    ];

    console.log('Processing support tickets...\n');
    for (let i = 0; i < tickets.length; i++) {
      show(tickets[i], `Ticket ${i + 1}`);
      const response = await route(tickets[i], supportRoutes);
      show(response, `Response ${i + 1}`);
    }
  }

  if (workflow === 'parallel') {
    const stakeholders = [
      `Customers:
      - Price sensitive
      - Want better tech
      - Environmental concerns`,

      `Employees:
      - Job security worries
      - Need new skills
      - Want clear direction`,

      `Investors:
      - Expect growth
      - Want cost control
      - Risk concerns`,

      `Suppliers:
      - Capacity constraints
      - Price pressures
      - Tech transitions`,
    ];

    const results = await parallel(
      `Analyze how market changes will impact this stakeholder group.
      Provide specific impacts and recommended actions.
      Format with clear sections and priorities.`,
      stakeholders,
    );

    for (let i = 0; i < stakeholders.length; i++) {
      show(results[i], stakeholders[i].split(':')[0]);
    }
  }
}

main().catch(console.error);
