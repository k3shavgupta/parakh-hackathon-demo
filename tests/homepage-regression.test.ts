import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const homepage = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');

describe('homepage regression copy', () => {
  it('keeps the standalone prototype footer copy without the production sentence', () => {
    expect(homepage).toContain('Standalone Build What Moves India prototype.');
    expect(homepage).not.toMatch(/Production parakh\.biz is\s+unchanged\./);
  });
});
