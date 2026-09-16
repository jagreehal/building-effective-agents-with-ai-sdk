/**
 * Shared Utilities
 * 
 * Common helper functions used across all examples.
 */

/**
 * Display formatted output with a title header.
 * Creates a clear visual separation in the console output.
 * 
 * @param text - The content to display
 * @param title - The section title
 */
export function show(text: string, title: string): void {
  console.log(`\n${title}`);
  console.log('-'.repeat(title.length));
  console.log(`\n${text}\n`);
}

/**
 * Display a section header for major transitions.
 * 
 * @param title - The section title
 */
export function section(title: string): void {
  const line = '='.repeat(60);
  console.log(`\n${line}`);
  console.log(`  ${title}`);
  console.log(`${line}\n`);
}

/**
 * Pause execution for a specified duration.
 * Useful for rate limiting or adding delays between API calls.
 * 
 * @param ms - Milliseconds to delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
