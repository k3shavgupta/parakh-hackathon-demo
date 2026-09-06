import { describe, expect, it } from 'vitest';

import {
  buildAttributionPrompt,
  createIpRateLimiter,
  parseAiAttributionResponse,
  requestAiAttribution,
} from '../lib/ai-attribution';
import { getSyntheticScenario } from '../lib/synthetic-engine';

describe('AI attribution boundary', () => {
  it('builds a bounded prompt from synthetic entity and record metadata', () => {
    const scenario = getSyntheticScenario('SYN-GSTIN-COURT-004');
    const record = scenario?.publicRecords[0];
    expect(scenario && record).toBeTruthy();

    const prompt = buildAttributionPrompt(scenario!, record!);

    expect(prompt).toContain('Setu Freight Corridors Private Limited');
    expect(prompt).toContain('SYNTHETIC-CASE-DEMO-014');
    expect(prompt).toContain('Synthetic Demo Court');
    expect(prompt).toContain('Exact synthetic legal-name match');
    expect(prompt).toContain('No real GSTIN, PAN, court system, or public record');
  });

  it('accepts only the constrained attribution response shape', () => {
    expect(
      parseAiAttributionResponse(
        JSON.stringify({
          decision: 'ATTRIBUTED',
          confidence: 'High',
          justification: 'The synthetic legal name is an exact party match.',
        }),
      ),
    ).toEqual({
      decision: 'ATTRIBUTED',
      confidence: 'High',
      justification: 'The synthetic legal name is an exact party match.',
    });

    expect(
      parseAiAttributionResponse(
        JSON.stringify({
          decision: 'ATTRIBUTED',
          confidence: 'High',
          justification: '',
          extra: 'ignore me',
        }),
      ),
    ).toBeNull();
  });

  it('allows ten calls per IP in a rolling hour and blocks the eleventh', () => {
    const limiter = createIpRateLimiter({ limit: 10, windowMs: 60 * 60 * 1000 });
    const start = 1_000_000;

    for (let index = 0; index < 10; index += 1) {
      expect(limiter.check('demo-ip', start + index)).toEqual({
        allowed: true,
        remaining: 9 - index,
      });
    }
    expect(limiter.check('demo-ip', start + 11)).toEqual({
      allowed: false,
      remaining: 0,
    });
    expect(limiter.check('another-ip', start + 11).allowed).toBe(true);
    expect(limiter.check('demo-ip', start + 60 * 60 * 1000 + 1).allowed).toBe(
      true,
    );
  });

  it('makes the runtime Responses API request with server-provided credentials', async () => {
    const scenario = getSyntheticScenario('SYN-GSTIN-COURT-004');
    const record = scenario?.publicRecords[0];
    const fetchImpl: typeof fetch = async (input, init) => {
      expect(input).toBe('https://api.openai.com/v1/responses');
      expect(init?.headers).toMatchObject({
        Authorization: 'Bearer server-only-test-key',
      });
      const requestBody = typeof init?.body === 'string' ? init.body : '';
      expect(JSON.parse(requestBody).text.format.type).toBe('json_schema');
      return new Response(
        JSON.stringify({
          output_text: JSON.stringify({
            decision: 'ATTRIBUTED',
            confidence: 'High',
            justification: 'The named synthetic party matches the entity.',
          }),
        }),
        { status: 200 },
      );
    };

    await expect(
      requestAiAttribution(scenario!, record!, {
        apiKey: 'server-only-test-key',
        model: 'test-model',
        timeoutMs: 1000,
        fetchImpl,
      }),
    ).resolves.toMatchObject({ decision: 'ATTRIBUTED', confidence: 'High' });
  });

  it('supports a Bedrock OpenAI-compatible Responses endpoint', async () => {
    const scenario = getSyntheticScenario('SYN-GSTIN-CLEAR-001');
    const record = scenario?.publicRecords[0];
    const fetchImpl: typeof fetch = async (input, init) => {
      expect(input).toBe(
        'https://bedrock-runtime.us-east-1.amazonaws.com/openai/v1/responses',
      );
      expect(init?.headers).toMatchObject({
        Authorization: 'Bearer bedrock-test-key',
      });
      return new Response(
        JSON.stringify({
          output_text: JSON.stringify({
            decision: 'ATTRIBUTED',
            confidence: 'High',
            justification: 'The synthetic legal name exactly matches the named party.',
          }),
        }),
        { status: 200 },
      );
    };

    await expect(
      requestAiAttribution(scenario!, record!, {
        apiKey: 'bedrock-test-key',
        model: 'openai.gpt-5.6-luna',
        baseUrl: 'https://bedrock-runtime.us-east-1.amazonaws.com/openai/v1',
        timeoutMs: 1000,
        fetchImpl,
      }),
    ).resolves.toMatchObject({ decision: 'ATTRIBUTED', confidence: 'High' });
  });

  it('retains a sanitized provider error detail for server-side diagnostics', async () => {
    const scenario = getSyntheticScenario('SYN-GSTIN-CLEAR-001');
    const record = scenario?.publicRecords[0];
    const fetchImpl: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          error: { message: 'Model access is not enabled for this account.' },
        }),
        { status: 403 },
      );

    await expect(
      requestAiAttribution(scenario!, record!, {
        apiKey: 'server-only-test-key',
        model: 'test-model',
        timeoutMs: 1000,
        fetchImpl,
      }),
    ).rejects.toThrow('403: Model access is not enabled for this account.');
  });
});
