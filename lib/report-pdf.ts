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

async function embedBrandLogo(pdf: PDFDocument) {
  if (typeof fetch !== 'function') return null;

  try {
    const response = await fetch('/assets/logo-horizontal.png');
    if (!response.ok) return null;
    return pdf.embedPng(new Uint8Array(await response.arrayBuffer()));
  } catch {
    return null;
  }
}

export async function createSyntheticReportPdf(
  report: SyntheticReport,
  reasoning: Record<string, ReportAiReasoningState> = {},
) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logo = await embedBrandLogo(pdf);
  const plum = rgb(0.478, 0.2, 0.435);
  const softPlum = rgb(0.973, 0.945, 0.965);
  const ink = rgb(0.125, 0.106, 0.118);
  const muted = rgb(0.404, 0.357, 0.388);
  const line = rgb(0.91, 0.86, 0.9);
  const warmWhite = rgb(0.988, 0.98, 0.969);
  const width = 595.28;
  const height = 841.89;
  const margin = 48;
  const maxWidth = width - margin * 2;
  let page = pdf.addPage([width, height]);
  let y = height - margin;

  const drawContinuationHeader = () => {
    if (logo) {
      page.drawImage(logo, {
        x: margin,
        y: height - margin - 21,
        width: 92,
        height: 21,
      });
    } else {
      page.drawText('Parakh', {
        x: margin,
        y: height - margin - 16,
        size: 14,
        font: bold,
        color: plum,
      });
    }
    page.drawLine({
      start: { x: margin, y: height - margin - 30 },
      end: { x: width - margin, y: height - margin - 30 },
      thickness: 1,
      color: line,
    });
    y = height - margin - 52;
  };

  const addPageIfNeeded = (requiredSpace: number) => {
    if (y - requiredSpace < margin + 24) {
      page = pdf.addPage([width, height]);
      drawContinuationHeader();
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

  page.drawRectangle({ x: 0, y: 0, width, height, color: warmWhite });
  if (logo) {
    page.drawImage(logo, {
      x: margin,
      y: height - margin - 28,
      width: 122,
      height: 28,
    });
  } else {
    page.drawText('Parakh', {
      x: margin,
      y: height - margin - 20,
      size: 18,
      font: bold,
      color: plum,
    });
  }
  page.drawText('BUILD WHAT MOVES INDIA · SPECIMEN', {
    x: width - margin - 182,
    y: height - margin - 17,
    size: 7,
    font: bold,
    color: muted,
  });
  page.drawLine({
    start: { x: margin, y: height - margin - 38 },
    end: { x: width - margin, y: height - margin - 38 },
    thickness: 1,
    color: line,
  });
  y = height - margin - 68;

  page.drawRectangle({
    x: margin,
    y: y - 106,
    width: maxWidth,
    height: 118,
    color: softPlum,
    borderColor: line,
    borderWidth: 1,
  });
  page.drawText('SYNTHETIC COUNTERPARTY RECORD', {
    x: margin + 18,
    y,
    size: 8,
    font: bold,
    color: plum,
  });
  y -= 25;
  page.drawText(report.business.tradeName, {
    x: margin + 18,
    y,
    size: 23,
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
  y -= 27;

  const disclosureTop = y;
  page.drawRectangle({
    x: margin,
    y: disclosureTop - 54,
    width: maxWidth,
    height: 66,
    color: ink,
  });
  page.drawText('SYNTHETIC-DATA DISCLOSURE', {
    x: margin + 16,
    y,
    size: 8,
    font: bold,
    color: rgb(0.96, 0.82, 0.94),
  });
  y -= 16;
  for (const disclosureLine of wrapLine(
    report.syntheticDisclosure,
    regular,
    8,
    maxWidth - 32,
  )) {
    page.drawText(disclosureLine, {
      x: margin + 16,
      y,
      size: 8,
      font: regular,
      color: rgb(1, 1, 1),
    });
    y -= 11;
  }
  y = disclosureTop - 78;

  const reportLines = reportToText(report, reasoning).split('\n').slice(7);
  for (const block of reportLines) {
    const isHeading = [
      'Public-record signals:',
      'AI Attribution Reasoning:',
      'Observations:',
      'What we could not find:',
    ].includes(block);
    if (isHeading) {
      addPageIfNeeded(26);
      y -= 7;
      page.drawLine({
        start: { x: margin, y: y + 8 },
        end: { x: width - margin, y: y + 8 },
        thickness: 1,
        color: line,
      });
      page.drawText(block, { x: margin, y, size: 12, font: bold, color: plum });
      y -= 20;
      continue;
    }
    drawWrappedText(block, regular, 9, ink);
    y -= 2;
  }

  for (const reportPage of pdf.getPages()) {
    reportPage.drawLine({
      start: { x: margin, y: 36 },
      end: { x: width - margin, y: 36 },
      thickness: 1,
      color: line,
    });
    reportPage.drawText(`${report.reportId} · Synthetic demo only`, {
      x: margin,
      y: 23,
      size: 7,
      font: regular,
      color: muted,
    });
  }

  return pdf.save();
}
