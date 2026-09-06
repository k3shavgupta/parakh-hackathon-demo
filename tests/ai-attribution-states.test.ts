import { createElement } from 'react';
import { spawnSync } from 'node:child_process';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AiAttributionReasoningCard } from '../components/ai-attribution-reasoning-card';
import { getSyntheticScenario, buildSyntheticReport, type SyntheticReport } from '../lib/synthetic-engine';
import { requestAiAttribution } from '../lib/ai-attribution';
import {
  createSyntheticReportPdf,
  reportToText,
  type ReportAiReasoningState,
} from '../lib/report-pdf';

function extractPdfText(bytes: Uint8Array) {
  const result = spawnSync('pdftotext', ['-', '-'], {
    input: Buffer.from(bytes),
    encoding: 'utf8',
  });
  if (result.status !== 0 || result.error) {
    throw result.error ?? new Error(result.stderr);
  }
  return result.stdout;
}

describe('AI attribution reasoning states', () => {
  it('renders attributed, not attributed, uncertain, and fallback in web and PDF output', async () => {
    const attributedReport = buildSyntheticReport('SYN-GSTIN-CLEAR-001');
    const notAttributedReport = buildSyntheticReport('SYN-GSTIN-MISMATCH-003');
    const fallbackReport = buildSyntheticReport('SYN-GSTIN-COURT-004');

    async function mockedProviderResult(
      scenarioId: string,
      recordId: string,
      response: {
        decision: 'ATTRIBUTED' | 'NOT_ATTRIBUTED' | 'UNCERTAIN';
        confidence: 'High' | 'Medium' | 'Low';
        justification: string;
      },
    ): Promise<ReportAiReasoningState> {
      const scenario = getSyntheticScenario(scenarioId);
      const record = scenario?.publicRecords.find((item) => item.id === recordId);
      if (!scenario || !record) throw new Error('missing test fixture');
      const result = await requestAiAttribution(scenario, record, {
        apiKey: 'test-only-key',
        model: 'test-model',
        timeoutMs: 100,
        fetchImpl: async () =>
          new Response(
            JSON.stringify({ output_text: JSON.stringify(response) }),
            { status: 200 },
          ),
      });
      return { status: 'success', result };
    }

    const attributedRecord = attributedReport.publicRecords[0];
    const notAttributedRecord = notAttributedReport.publicRecords[1];
    const uncertainRecord = notAttributedReport.publicRecords[0];
    const fallbackRecord = fallbackReport.publicRecords[0];

    let providerFailed = false;
    try {
      await requestAiAttribution(
        getSyntheticScenario('SYN-GSTIN-COURT-004')!,
        getSyntheticScenario('SYN-GSTIN-COURT-004')!.publicRecords[0],
        {
          apiKey: 'test-only-key',
          model: 'test-model',
          timeoutMs: 100,
          fetchImpl: async () => {
            throw new Error('mocked timeout');
          },
        },
      );
    } catch {
      providerFailed = true;
    }
    expect(providerFailed).toBe(true);
    const fallbackState: ReportAiReasoningState = {
      status: 'fallback',
      fixtureSignal: fallbackRecord.signal,
    };

    const cases: Array<{
      report: SyntheticReport;
      record: SyntheticReport['publicRecords'][number];
      name: string;
      state: ReportAiReasoningState;
      webMarker: string;
      pdfMarker: string;
    }> = [
      {
        report: attributedReport,
        record: attributedRecord,
        name: 'attributed',
        state: await mockedProviderResult(
          'SYN-GSTIN-CLEAR-001',
          attributedRecord.id,
          {
            decision: 'ATTRIBUTED',
            confidence: 'High',
            justification: 'The exact synthetic legal name matches the named party.',
          },
        ),
        webMarker: 'ATTRIBUTED',
        pdfMarker: 'The exact synthetic legal name matches the named party.',
      },
      {
        report: notAttributedReport,
        record: notAttributedRecord,
        name: 'not attributed',
        state: await mockedProviderResult(
          'SYN-GSTIN-MISMATCH-003',
          notAttributedRecord.id,
          {
            decision: 'NOT_ATTRIBUTED',
            confidence: 'High',
            justification: 'The similar-name record identifies a different synthetic entity.',
          },
        ),
        webMarker: 'NOT ATTRIBUTED',
        pdfMarker: 'The similar-name record identifies a different synthetic entity.',
      },
      {
        report: notAttributedReport,
        record: uncertainRecord,
        name: 'uncertain',
        state: await mockedProviderResult(
          'SYN-GSTIN-MISMATCH-003',
          uncertainRecord.id,
          {
            decision: 'UNCERTAIN',
            confidence: 'Medium',
            justification: 'The alias is similar, but the available synthetic evidence is ambiguous.',
          },
        ),
        webMarker: 'UNCERTAIN',
        pdfMarker: 'The alias is similar, but the available synthetic evidence is ambiguous.',
      },
      {
        report: fallbackReport,
        record: fallbackRecord,
        name: 'fallback',
        state: fallbackState,
        webMarker: 'FALLBACK',
        pdfMarker: 'AI reasoning unavailable, showing fixture-based grade: FLAG',
      },
    ];

    for (const testCase of cases) {
      const web = renderToStaticMarkup(
        createElement(AiAttributionReasoningCard, {
          recordId: testCase.record.id,
          fixtureSignal: testCase.record.signal,
          state: testCase.state,
        }),
      );
      const pdfText = reportToText(testCase.report, {
        [testCase.record.id]: testCase.state,
      });
      const pdfBytes = await createSyntheticReportPdf(testCase.report, {
        [testCase.record.id]: testCase.state,
      });
      const extractedPdf = extractPdfText(pdfBytes);
      const normalizedExtractedPdf = extractedPdf.replace(/\s+/g, ' ');
      const normalizedPdfMarker = testCase.pdfMarker.replace(/\s+/g, ' ');

      expect(web, testCase.name).toContain(testCase.webMarker);
      expect(pdfText, testCase.name).toContain(testCase.pdfMarker);
      expect(normalizedExtractedPdf, testCase.name).toContain(normalizedPdfMarker);
      expect(pdfBytes.byteLength, testCase.name).toBeGreaterThan(1000);
    }
  });
});
