import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';

import { buildSyntheticReport } from '../lib/synthetic-engine';
import { buildSyntheticPdf } from '../lib/synthetic-pdf';

describe('synthetic report PDF', () => {
  it('creates a selectable, A4 fixture-only report', async () => {
    const report = buildSyntheticReport('DEMO-2026-0004');
    const pdfBytes = await buildSyntheticPdf(report);
    const pdf = await PDFDocument.load(pdfBytes);
    const firstPage = pdf.getPage(0);

    expect(String.fromCharCode(...pdfBytes.slice(0, 4))).toBe('%PDF');
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(3);
    expect(firstPage.getWidth()).toBeCloseTo(595.28, 1);
    expect(firstPage.getHeight()).toBeCloseTo(841.89, 1);
    expect(pdf.getTitle()).toBe(`Parakh synthetic report ${report.reportId}`);
  });
});
