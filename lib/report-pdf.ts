import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';

import type { AiAttributionResult } from './ai-attribution';
import type { SyntheticLabel } from './synthetic-fixtures';
import type { SyntheticReport } from './synthetic-engine';

export type ReportAiReasoningState =
  | { status: 'loading' }
  | { status: 'success'; result: AiAttributionResult }
  | { status: 'fallback'; fixtureSignal: SyntheticLabel };

export function reportToText(
  report: SyntheticReport,
  reasoning: Record<string, ReportAiReasoningState> = {},
) {
  const aiLines = report.publicRecords.length
    ? report.publicRecords.flatMap((record) => {
        const state = reasoning[record.id];
        const result =
          state?.status === 'success'
            ? [
                `- ${record.id}: ${state.result.decision}. Confidence: ${state.result.confidence}. ${state.result.justification}`,
              ]
            : state?.status === 'loading'
              ? [`- ${record.id}: AI reasoning is still in flight.`]
              : [
                  `- ${record.id}: AI reasoning unavailable, showing fixture-based grade: ${record.signal}`,
                ];
        return result;
      })
    : ['- No synthetic public-record signal requires attribution reasoning.'];

  return [
    `Parakh synthetic report ${report.reportId}`,
    `Synthetic GSTIN: ${report.searchedIdentifier}`,
    `Generated: ${report.generatedAt}`,
    '',
    report.syntheticDisclosure,
    'CICRA 2005 note: This synthetic demonstration is not a credit information report, legal opinion, or automated credit decision.',
    '',
    report.summary,
    '',
    `Entity: ${report.business.legalName}`,
    `Trade name: ${report.business.tradeName}`,
    `State: ${report.business.registrationState}`,
    `Synthetic PAN-pattern marker: ${report.business.syntheticPanPattern}`,
    '',
    'Public-record signals:',
    ...report.publicRecords.flatMap((record) => [
      `- ${record.id}: ${record.caseReference} · ${record.courtName}`,
      `  Parties: ${record.parties.join('; ')} · Party side: ${record.partySide}`,
      `  Match basis: ${record.matchBasis}. Fixture grade: ${record.signal}.`,
    ]),
    '',
    'AI Attribution Reasoning:',
    ...aiLines,
    '',
    'Observations:',
    ...report.observations.map(
      (item) =>
        `- ${item.label}: ${item.title}. ${item.detail} Confidence: ${item.confidence}. Attribution: ${item.attribution}. Provenance: ${item.provenance}`,
    ),
    '',
    'What we could not find:',
    ...report.cannotFind.map((item) => `- ${item}`),
    '',
    'This demo does not score, rate, clear, or issue a legal or credit verdict.',
  ].join('\n');
}

function wrapLine(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [''];
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function createSyntheticReportPdf(
  report: SyntheticReport,
  reasoning: Record<string, ReportAiReasoningState> = {},
) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const plum = rgb(0.478, 0.2, 0.435);
  const ink = rgb(0.125, 0.106, 0.118);
  const muted = rgb(0.404, 0.357, 0.388);
  const width = 595.28;
  const height = 841.89;
  const margin = 48;
  const maxWidth = width - margin * 2;
  let page = pdf.addPage([width, height]);
  let y = height - margin;

  const addPageIfNeeded = (requiredSpace: number) => {
    if (y - requiredSpace < margin) {
      page = pdf.addPage([width, height]);
      y = height - margin;
    }
  };

  const drawWrappedText = (
    text: string,
    font: PDFFont,
    size: number,
    color: ReturnType<typeof rgb>,
  ) => {
    const lineHeight = size * 1.45;
    for (const sourceLine of text.split('\n')) {
      for (const line of wrapLine(sourceLine, font, size, maxWidth)) {
        addPageIfNeeded(lineHeight);
        page.drawText(line, { x: margin, y, size, font, color });
        y -= lineHeight;
      }
    }
  };

  page.drawText('PARAKH · SYNTHETIC REPORT', {
    x: margin,
    y,
    size: 10,
    font: bold,
    color: plum,
  });
  y -= 28;
  page.drawText(report.business.tradeName, {
    x: margin,
    y,
    size: 24,
    font: bold,
    color: ink,
  });
  y -= 20;
  drawWrappedText(
    `${report.reportId} · ${report.searchedIdentifier} · ${report.generatedAt}`,
    regular,
    9,
    muted,
  );
  y -= 16;

  for (const block of reportToText(report, reasoning).split('\n')) {
    const isHeading = [
      'Public-record signals:',
      'AI Attribution Reasoning:',
      'Observations:',
      'What we could not find:',
    ].includes(block);
    if (isHeading) {
      addPageIfNeeded(26);
      y -= 7;
      page.drawText(block, { x: margin, y, size: 12, font: bold, color: plum });
      y -= 20;
      continue;
    }
    drawWrappedText(block, regular, 9, ink);
    y -= 2;
  }

  return pdf.save();
}
