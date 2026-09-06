import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import { AiAttributionReasoningCard } from '../components/ai-attribution-reasoning-card';
import { confidencePercent } from '../lib/ai-attribution';
import { buildSyntheticReport } from '../lib/synthetic-engine';
import { createSyntheticReportPdf } from '../lib/report-pdf';
import type { ReportAiReasoningState } from '../lib/report-ai-state';

describe('confidence visual and factor chips', () => {
  it('maps confidence levels proportionally to percentage values', () => {
    expect(confidencePercent('High')).toBe(100);
    expect(confidencePercent('Medium')).toBe(60);
    expect(confidencePercent('Low')).toBe(30);
  });

  it('renders factor chips and proportional confidence gauge in web card', () => {
    const stateWithFactors: ReportAiReasoningState = {
      status: 'success',
      result: {
        decision: 'ATTRIBUTED',
        confidence: 'High',
        factors: [
          { label: 'Name similarity', verdict: 'High' },
          { label: 'PAN pattern', verdict: 'Match' },
        ],
        justification: 'Exact name match with matching PAN pattern.',
      },
    };

    const html = renderToStaticMarkup(
      createElement(AiAttributionReasoningCard, {
        recordId: 'DEMO-CASE-0014',
        fixtureSignal: 'FLAG',
        state: stateWithFactors,
      }),
    );

    // Factors displayed as chips
    expect(html).toContain('Name similarity');
    expect(html).toContain('PAN pattern');
    expect(html).toContain('Match');

    // Confidence gauge rendered with plum fill on blush track
    expect(html).toContain('data-testid="confidence-gauge"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('width:100%');
    expect(html).toContain('Confidence High');
  });

  it('hides factor chips gracefully when factors are omitted', () => {
    const stateWithoutFactors: ReportAiReasoningState = {
      status: 'success',
      result: {
        decision: 'ATTRIBUTED',
        confidence: 'Medium',
        justification: 'Name matches without factor breakdown.',
      },
    };

    const html = renderToStaticMarkup(
      createElement(AiAttributionReasoningCard, {
        recordId: 'DEMO-CASE-0014',
        fixtureSignal: 'FLAG',
        state: stateWithoutFactors,
      }),
    );

    expect(html).not.toContain('data-testid="attribution-factors"');
    expect(html).toContain('data-testid="confidence-gauge"');
    expect(html).toContain('width:60%');
    expect(html).toContain('Confidence Medium');
  });

  it('includes factors and confidence visual in PDF output', async () => {
    const report = buildSyntheticReport('SYN-GSTIN-COURT-004');
    const firstRecord = report.publicRecords[0];
    const reasoning: Record<string, ReportAiReasoningState> = {
      [firstRecord.id]: {
        status: 'success',
        result: {
          decision: 'ATTRIBUTED',
          confidence: 'High',
          factors: [
            { label: 'Name similarity', verdict: 'High' },
            { label: 'PAN pattern', verdict: 'Match' },
          ],
          justification: 'Party name exactly matches the registered legal entity.',
        },
      },
    };

    const bytes = await createSyntheticReportPdf(report, reasoning);
    const result = spawnSync('pdftotext', ['-', '-'], {
      input: Buffer.from(bytes),
      encoding: 'utf8',
    });
    expect(result.status).toBe(0);
    const text = result.stdout;

    expect(text).toContain('AI Attribution Reasoning');
    expect(text).toContain('Name similarity: High');
    expect(text).toContain('PAN pattern: Match');
    expect(text).toContain('Confidence High');
    expect(text).toContain('Party name exactly matches the registered legal entity.');
  });
});
