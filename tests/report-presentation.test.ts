import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';

import { buildSyntheticReport } from '../lib/synthetic-engine';
import {
  createSyntheticReportPdf,
  reportToText,
  type ReportAiReasoningState,
} from '../lib/report-pdf';

describe('report AI attribution presentation', () => {
  it('includes successful model reasoning as a distinct report section', () => {
    const report = buildSyntheticReport('SYN-GSTIN-COURT-004');
    const firstRecord = report.publicRecords[0];
    const reasoning: Record<string, ReportAiReasoningState> = {
      [firstRecord.id]: {
        status: 'success',
        result: {
          decision: 'ATTRIBUTED',
          confidence: 'High',
          justification: 'The fictional legal name matches the named party.',
        },
      },
    };

    const text = reportToText(report, reasoning);

    expect(text).toContain('AI Attribution Reasoning');
    expect(text).toContain('ATTRIBUTED');
    expect(text).toContain('The fictional legal name matches the named party.');
  });

  it('includes the fixture-grade fallback when model reasoning is unavailable', () => {
    const report = buildSyntheticReport('SYN-GSTIN-COURT-004');
    const firstRecord = report.publicRecords[0];
    const reasoning: Record<string, ReportAiReasoningState> = {
      [firstRecord.id]: {
        status: 'fallback',
        fixtureSignal: firstRecord.signal,
      },
    };

    const text = reportToText(report, reasoning);

    expect(text).toContain(
      'AI reasoning unavailable, showing fixture-based grade: FLAG',
    );
  });

  it('creates a non-empty A4 PDF containing the report output', async () => {
    const report = buildSyntheticReport('SYN-GSTIN-COURT-004');
    const bytes = await createSyntheticReportPdf(report, {
      [report.publicRecords[0].id]: {
        status: 'fallback',
        fixtureSignal: 'FLAG',
      },
    });
    const pdf = await PDFDocument.load(bytes);

    expect(bytes.byteLength).toBeGreaterThan(1000);
    expect(pdf.getPageCount()).toBeGreaterThan(0);
    expect(pdf.getPage(0).getSize()).toMatchObject({ width: 595.28, height: 841.89 });
  });

  it('starts a new A4 page when long report text reaches the page boundary', async () => {
    const report = buildSyntheticReport('SYN-GSTIN-COURT-004');
    report.cannotFind = Array.from(
      { length: 90 },
      (_, index) => `Synthetic limitation ${index + 1}: ${'evidence '.repeat(18)}`,
    );

    const bytes = await createSyntheticReportPdf(report);
    const pdf = await PDFDocument.load(bytes);

    expect(pdf.getPageCount()).toBeGreaterThan(2);
    expect(pdf.getPage(0).getHeight()).toBe(841.89);
    expect(pdf.getPage(pdf.getPageCount() - 1).getHeight()).toBe(841.89);
  });
});
