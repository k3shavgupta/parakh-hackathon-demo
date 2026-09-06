import { afterEach, describe, expect, it, vi } from 'vitest';

import { POST } from '../app/api/ai-attribution/route';

describe('AI attribution API', () => {
  const originalKey = process.env.OPENAI_API_KEY;
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
    globalThis.fetch = originalFetch;
  });

  it('rejects malformed request bodies before touching a fixture', async () => {
    const response = await POST(
      new Request('http://localhost/api/ai-attribution', {
        method: 'POST',
        body: JSON.stringify({ identifier: 'SYN-GSTIN-COURT-004' }),
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: 'identifier and recordId are required.',
    });
  });

  it('rejects record IDs outside the server-resolved synthetic fixture', async () => {
    const response = await POST(
      new Request('http://localhost/api/ai-attribution', {
        method: 'POST',
        body: JSON.stringify({
          identifier: 'SYN-GSTIN-COURT-004',
          recordId: 'NOT-A-SYNTHETIC-RECORD',
        }),
      }),
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: 'Synthetic fixture record not found.',
    });
  });

  it('calls the provider through the real route when a server key is configured', async () => {
    process.env.OPENAI_API_KEY = 'route-test-key';
    globalThis.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({
          output_text: JSON.stringify({
            decision: 'ATTRIBUTED',
            confidence: 'High',
            justification: 'The synthetic record names the exact fixture entity.',
          }),
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    ) as typeof fetch;

    const response = await POST(
      new Request('http://localhost/api/ai-attribution', {
        method: 'POST',
        headers: { 'x-forwarded-for': 'route-test-success' },
        body: JSON.stringify({
          identifier: 'SYN-GSTIN-COURT-004',
          recordId: 'SYN-CIV-2026-014',
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      decision: 'ATTRIBUTED',
      confidence: 'High',
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/responses',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
