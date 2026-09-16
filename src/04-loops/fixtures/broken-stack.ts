/**
 * Deliberately broken MinStack for the hard-verify loop (#13).
 * getMin() is O(n) instead of O(1).
 */

export class MinStack {
  private stack: number[] = [];

  push(x: number): void {
    this.stack.push(x);
  }

  pop(): number | undefined {
    return this.stack.pop();
  }

  getMin(): number {
    return Math.min(...this.stack);
  }
}

export function runMinStackTests(): { ok: boolean; error?: string } {
  const s = new MinStack();
  s.push(3);
  s.push(1);
  s.push(2);
  if (s.getMin() !== 1) return { ok: false, error: 'getMin should return 1 after push 3,1,2' };
  s.pop();
  if (s.getMin() !== 1) return { ok: false, error: 'getMin should still return 1 after pop' };
  s.pop();
  if (s.getMin() !== 3) return { ok: false, error: 'getMin should return 3 after second pop' };
  return { ok: true };
}
