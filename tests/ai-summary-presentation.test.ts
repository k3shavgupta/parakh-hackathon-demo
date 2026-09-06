import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { AiSummaryCard } from '../components/ai-summary-card';
import { buildSyntheticReport } from '../lib/synthetic-engine';
import { createSyntheticReportPdf } from '../lib/report-pdf';
import { type ReportAiSummaryState } from '../lib/report-ai-state';

const states: ReportAiSummaryState[] = [
  { status: 'loading' },
  { status: 'fallback' },
  {
    status: 'success',
    result: {
      summary:
        'The fictional entity has one late return. Two candidate records need review.',
      key_signal: 'One late return.',
    },
  },
];
describe('summary and paginated evidence output', () => {
  it.each(states)(
    'preserves $status summary in web and real PDF output',
    async (state) => {
      const html = renderToStaticMarkup(
        createElement(AiSummaryCard, { state }),
      );
      const report = buildSyntheticReport('SYN-GSTIN-COURT-004');
      const bytes = await createSyntheticReportPdf(report, {}, state);
      const extracted = spawnSync('pdftotext', ['-layout', '-', '-'], {
        input: Buffer.from(bytes),
        encoding: 'utf8',
      });
      expect(extracted.status).toBe(0);
      const text = extracted.stdout.replace(/\s+/g, ' ');
      const marker =
        state.status === 'success'
          ? state.result.summary
          : state.status === 'loading'
            ? 'Reviewing the synthetic evidence'
            : 'AI summary unavailable';
      expect(html).toContain(marker);
      expect(text).toContain(marker);
      expect(text.indexOf('AI Summary')).toBeLessThan(text.indexOf('IDENTITY'));
      expect(text).toContain('GST RETURN FILING');
      expect(text).toContain('GSTR-3B');
      expect(text).toContain('DEMO-CASE-0014');
      const pages = extracted.stdout.split('\f').filter((page) => page.trim());
      for (const [index, page] of pages.entries()) {
        const normalized = page.replace(/\s+/g, ' ');
        expect(normalized).toContain(`Page ${index + 1} of ${pages.length}`);
        expect(normalized).toContain(
          'Not a credit report, not legal advice, not a rating or score.',
        );
        expect(normalized).toContain('FLAG:');
        expect(normalized).toContain('CLEAR:');
        expect(normalized).toContain('NOTE:');
      }
    },
  );
});
