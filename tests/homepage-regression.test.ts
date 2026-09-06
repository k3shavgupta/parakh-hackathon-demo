import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const homepage = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');

describe('homepage regression copy', () => {
  it('keeps the standalone prototype footer copy without the production sentence', () => {
    expect(homepage).toContain('Standalone Build What Moves India prototype.');
    expect(homepage).not.toMatch(/Production parakh\.biz is\s+unchanged\./);
  });

  it('uses the live homepage composition and the supplied Parakh wordmark', () => {
    expect(homepage).toContain('<DemoProductHeader />');
    expect(homepage).toContain('One GSTIN.<br />The <em>whole record</em>.');
    expect(homepage).toContain('DEMO-2026-0002');
    expect(homepage).toContain('Synthetic report preview');
    expect(homepage).toContain('resolveSyntheticSearch');
  });
});
