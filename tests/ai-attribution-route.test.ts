import { describe, expect, it } from 'vitest';

import { POST } from '../app/api/ai-attribution/route';

describe('AI attribution API', () => {
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
});
