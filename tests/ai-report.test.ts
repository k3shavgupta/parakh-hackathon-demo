import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildSyntheticReport,
  getSyntheticScenario,
} from '../lib/synthetic-engine';
import {
  buildSummaryEvidence,
  parseAiSummaryResponse,
  requestAiReport,
} from '../lib/ai-report';

const summary = {
  summary:
    'The synthetic entity has four filing periods, including one late return. Two candidate records need identity review.',
  key_signal: 'One late return in four periods.',
};
const attribution = {
  decision: 'UNCERTAIN',
  confidence: 'Low',
  justification: 'The synthetic alias needs identity review.',
};
const options = { apiKey: 'test-only', model: 'test-model', timeoutMs: 50 };
const response = (value: unknown) =>
  new Response(JSON.stringify({ output_text: JSON.stringify(value) }));
afterEach(() => vi.restoreAllMocks());

describe('server report AI synthesis', () => {
  it('waits for all attribution results and sends exactly one summary request using their reasoning', async () => {
    const requests: unknown[] = [];
    let completed = 0;
    const result = await requestAiReport(
      getSyntheticScenario('SYN-GSTIN-COURT-004')!,
      {
        ...options,
        fetchImpl: async (_url, init) => {
          const body = JSON.parse(init?.body as string);
          requests.push(body);
          if (body.text.format.name === 'synthetic_report_summary') {
            expect(completed).toBe(2);
            expect(JSON.stringify(body)).toContain(attribution.justification);
            expect(body.text.format.strict).toBe(true);
            expect(body.text.format.schema.required).toEqual([
              'summary',
              'key_signal',
            ]);
            return response(summary);
          }
          await new Promise((resolve) => setTimeout(resolve, 2));
          completed++;
          return response(attribution);
        },
      },
    );
    expect(requests).toHaveLength(3);
    expect(result.summary).toEqual({ status: 'success', result: summary });
    expect(
      Object.values(result.reasoning).every(
        (value) => value.status === 'success',
      ),
    ).toBe(true);
  });

  it('summarizes a zero-record fixture once and preserves unavailable filing coverage', async () => {
    const report = buildSyntheticReport('SYN-GSTIN-PARTIAL-005');
    const evidence = buildSummaryEvidence(report, {});
    expect(evidence.filing_counts).toEqual({
      periods: 2,
      gstr1: { onTime: 1, late: 0, missing: 0, unavailable: 1 },
      gstr3b: { onTime: 0, late: 0, missing: 0, unavailable: 2 },
    });
    let calls = 0;
    const result = await requestAiReport(
      getSyntheticScenario('SYN-GSTIN-PARTIAL-005')!,
      {
        ...options,
        fetchImpl: async () => {
          calls++;
          return response(summary);
        },
      },
    );
    expect(calls).toBe(1);
    expect(result.reasoning).toEqual({});
    expect(result.summary.status).toBe('success');
  });

  it('preserves successful record reasoning when another record and summary fail', async () => {
    let calls = 0;
    const result = await requestAiReport(
      getSyntheticScenario('SYN-GSTIN-COURT-004')!,
      {
        ...options,
        fetchImpl: async () => {
          calls++;
          if (calls === 1) return response(attribution);
          throw new Error('provider unavailable');
        },
      },
    );
    expect(calls).toBe(3);
    expect(result.reasoning['SYN-CIV-2026-014'].status).toBe('success');
    expect(result.reasoning['SYN-CIV-2025-032'].status).toBe('fallback');
    expect(result.summary.status).toBe('fallback');
    const evidence = buildSummaryEvidence(
      buildSyntheticReport('SYN-GSTIN-COURT-004'),
      result.reasoning,
    );
    expect(evidence.records[1].attribution).toEqual({ status: 'unavailable' });
  });

  it.each([
    '{}',
    JSON.stringify({ ...summary, extra: true }),
    JSON.stringify({ summary: '', key_signal: null }),
    JSON.stringify({
      summary: 'A trustworthy business with a high rating.',
      key_signal: null,
    }),
    JSON.stringify({ summary: 'Safe to deal with.', key_signal: null }),
    JSON.stringify({ summary: 'x'.repeat(1001), key_signal: null }),
  ])('rejects invalid or evaluative generated output', (raw) =>
    expect(parseAiSummaryResponse(raw)).toBeNull(),
  );

  it('accepts a valid object after the existing provider reasoning wrapper', () => {
    expect(
      parseAiSummaryResponse(
        '<reasoning>provider internal text</reasoning>' +
          JSON.stringify(summary),
      ),
    ).toEqual(summary);
  });

  it('uses the existing balanced-object parser for a duplicated provider opening fragment', () => {
    expect(
      parseAiSummaryResponse(
        '<reasoning>internal</reasoning>{"' + JSON.stringify(summary),
      ),
    ).toEqual(summary);
  });

  it('rejects a summary outside the requested two-to-three-sentence length', () => {
    expect(
      parseAiSummaryResponse(
        JSON.stringify({
          summary:
            'First finding. Second finding. Third finding. Fourth finding.',
          key_signal: null,
        }),
      ),
    ).toBeNull();
  });

  it('accepts null key signal without adding one', () => {
    expect(
      parseAiSummaryResponse(JSON.stringify({ ...summary, key_signal: null })),
    ).toEqual({ ...summary, key_signal: null });
  });
});
