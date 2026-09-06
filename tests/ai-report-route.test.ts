import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../app/api/ai-report/route';
import { POST as attributionPost } from '../app/api/ai-attribution/route';
import { requestAiSummary, buildSummaryPrompt } from '../lib/ai-report';
import { buildSyntheticReport } from '../lib/synthetic-engine';
const request = (body: unknown, ip: string) =>
  new Request('http://localhost/api/ai-report', {
    method: 'POST',
    headers: { 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  });
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe('report endpoint boundaries', () => {
  it('rejects real identifiers and client-supplied reasoning without provider calls', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    for (const identifier of [
      '27ABCDE1234F1Z5',
      'ABCDE1234F',
      '1234 5678 9012',
    ])
      expect((await POST(request({ identifier }, 'invalid'))).status).toBe(404);
    expect(
      (
        await POST(
          request(
            {
              identifier: 'SYN-GSTIN-COURT-004',
              reasoning: { fabricated: true },
            },
            'injected',
          ),
        )
      ).status,
    ).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('returns an unavailable response when the server has no key', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    expect(
      (
        await POST(
          request({ identifier: 'SYN-GSTIN-PARTIAL-005' }, 'missing-key'),
        )
      ).status,
    ).toBe(503);
  });
  it('shares the existing ten-per-hour limiter with standalone attribution', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    for (let index = 0; index < 9; index++)
      expect(
        (
          await POST(
            request({ identifier: 'SYN-GSTIN-PARTIAL-005' }, 'shared-limit'),
          )
        ).status,
      ).toBe(503);
    expect(
      (
        await attributionPost(
          request(
            { identifier: 'SYN-GSTIN-COURT-004', recordId: 'SYN-CIV-2026-014' },
            'shared-limit',
          ),
        )
      ).status,
    ).toBe(503);
    expect(
      (
        await POST(
          request({ identifier: 'SYN-GSTIN-PARTIAL-005' }, 'shared-limit'),
        )
      ).status,
    ).toBe(429);
  });
  it('returns sanitized fallbacks, never provider error details or keys', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'secret-test-key');
    vi.stubGlobal('fetch', async () => {
      throw new Error('secret-test-key sensitive failure');
    });
    const response = await POST(
      request({ identifier: 'SYN-GSTIN-COURT-004' }, 'provider-failure'),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    const text = await response.text();
    expect(text).not.toContain('secret-test-key');
    expect(JSON.parse(text).summary.status).toBe('fallback');
  });
  it('aborts an unresponsive summary provider', async () => {
    await expect(
      requestAiSummary(
        buildSyntheticReport('SYN-GSTIN-PARTIAL-005'),
        {},
        {
          apiKey: 'test',
          model: 'test',
          timeoutMs: 5,
          fetchImpl: async (_url, init) =>
            new Promise((_resolve, reject) => {
              init?.signal?.addEventListener('abort', () =>
                reject(new Error('aborted')),
              );
            }),
        },
      ),
    ).rejects.toThrow('aborted');
  });
  it('uses forced structured tool output and validates nullable fields for Bedrock', async () => {
    let sent: Record<string, unknown> = {};
    const result = await requestAiSummary(
      buildSyntheticReport('SYN-GSTIN-PARTIAL-005'),
      {},
      {
        apiKey: 'test',
        model: 'test',
        apiMode: 'chat-completions',
        timeoutMs: 100,
        fetchImpl: async (_url, init) => {
          sent = JSON.parse(init?.body as string);
          return Response.json({
            choices: [
              {
                message: {
                  tool_calls: [
                    {
                      type: 'function',
                      function: {
                        name: 'report_summary',
                        arguments: JSON.stringify({
                          summary:
                            'The fixture has limited filing evidence. No court candidates are supplied.',
                          key_signal: null,
                        }),
                      },
                    },
                  ],
                },
              },
            ],
          });
        },
      },
    );
    expect(sent.tool_choice).toEqual({
      type: 'function',
      function: { name: 'report_summary' },
    });
    expect(sent.tools).toMatchObject([
      {
        type: 'function',
        function: {
          strict: true,
          parameters: { required: ['summary', 'key_signal'] },
        },
      },
    ]);
    expect(result.key_signal).toBeNull();
  });
  it('uses descriptive prompt language even for delay findings', () => {
    expect(
      buildSummaryPrompt(buildSyntheticReport('SYN-GSTIN-DELAY-002'), {}),
    ).not.toMatch(/\b(score|rating|credit|trustworthy|safe to deal with)\b/i);
  });
});
