import fontkit from '@pdf-lib/fontkit';
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from 'pdf-lib';

import type { SyntheticLabel } from './synthetic-fixtures';
import type { SyntheticReport } from './synthetic-engine';

const A4: [number, number] = [595.28, 841.89];
const MARGIN = 48;
const INK = rgb(0.125, 0.114, 0.114);
const GRAY = rgb(0.251, 0.231, 0.239);
const SOFT = rgb(0.788, 0.753, 0.773);
const PLUM = rgb(0.42, 0.176, 0.361);
const DEEP = rgb(0.306, 0.122, 0.263);
const MID = rgb(0.604, 0.416, 0.557);
const FAINT = rgb(0.953, 0.898, 0.937);
const PAPER = rgb(0.984, 0.957, 0.973);
const FLAG = rgb(0.608, 0.145, 0.169);
const CLEAR = rgb(0.09, 0.4, 0.227);

type Fonts = {
  body: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  mono: PDFFont;
};

type CourtRecord = SyntheticReport['publicRecords'][number];

function wrapText(font: PDFFont, text: string, size: number, width: number) {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (!line || font.widthOfTextAtSize(candidate, size) <= width) line = candidate;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawWrapped({
  page,
  font,
  text,
  x,
  y,
  width,
  size,
  color = INK,
  lineHeight = size * 1.42,
}: {
  page: PDFPage;
  font: PDFFont;
  text: string;
  x: number;
  y: number;
  width: number;
  size: number;
  color?: ReturnType<typeof rgb>;
  lineHeight?: number;
}) {
  for (const line of wrapText(font, text, size, width)) {
    page.drawText(line, { x, y, size, font, color });
    y -= lineHeight;
  }
  return y;
}

function drawRule(page: PDFPage, y: number, color = SOFT, thickness = 0.65) {
  page.drawLine({ start: { x: MARGIN, y }, end: { x: A4[0] - MARGIN, y }, thickness, color });
}

async function fetchAsset(path: string) {
  if (typeof window === 'undefined') return null;
  const response = await fetch(path);
  if (!response.ok) return null;
  return new Uint8Array(await response.arrayBuffer());
}

async function loadFonts(pdf: PDFDocument): Promise<Fonts> {
  const fallback: Fonts = {
    body: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
    italic: await pdf.embedFont(StandardFonts.TimesRomanItalic),
    mono: await pdf.embedFont(StandardFonts.Courier),
  };
  if (typeof window === 'undefined') return fallback;
  try {
    const [body, bold, italic, mono] = await Promise.all([
      fetchAsset('/assets/fonts/Onest-400.ttf'),
      fetchAsset('/assets/fonts/Onest-600.ttf'),
      fetchAsset('/assets/fonts/InstrumentSerif-Italic.ttf'),
      fetchAsset('/assets/fonts/GeistMono-Regular.ttf'),
    ]);
    if (!body || !bold || !italic || !mono) return fallback;
    pdf.registerFontkit(fontkit);
    return {
      body: await pdf.embedFont(body, { subset: true }),
      bold: await pdf.embedFont(bold, { subset: true }),
      italic: await pdf.embedFont(italic, { subset: true }),
      mono: await pdf.embedFont(mono, { subset: true }),
    };
  } catch {
    return fallback;
  }
}

async function loadWordmark(pdf: PDFDocument): Promise<PDFImage | null> {
  if (typeof document === 'undefined') return null;
  try {
    const response = await fetch('/assets/logo-horizontal.svg');
    if (!response.ok) return null;
    const source = URL.createObjectURL(new Blob([await response.text()], { type: 'image/svg+xml' }));
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = reject;
      element.src = source;
    });
    const canvas = document.createElement('canvas');
    canvas.width = 1003;
    canvas.height = 230;
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(source);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return null;
    return pdf.embedPng(await blob.arrayBuffer());
  } catch {
    return null;
  }
}

function drawHeader({ page, fonts, report, pageNumber, pageCount, wordmark }: {
  page: PDFPage;
  fonts: Fonts;
  report: SyntheticReport;
  pageNumber: number;
  pageCount: number;
  wordmark: PDFImage | null;
}) {
  if (wordmark) page.drawImage(wordmark, { x: MARGIN, y: 776, width: 174, height: 40 });
  else page.drawText('Parakh', { x: MARGIN, y: 785, size: 25, font: fonts.italic, color: PLUM });
  const dividerX = wordmark ? 224 : 160;
  page.drawLine({ start: { x: dividerX, y: 782 }, end: { x: dividerX, y: 802 }, thickness: 0.55, color: SOFT });
  page.drawText(pageNumber === 1 ? 'FACTUAL DUE DILIGENCE ENGINE' : 'WHAT IT MEANS, AND WHAT IT MISSED', {
    x: dividerX + 10,
    y: 788,
    size: 7.8,
    font: fonts.body,
    color: GRAY,
  });
  page.drawText('REF:', { x: 460, y: 804, size: 7.5, font: fonts.mono, color: GRAY });
  page.drawText(report.reportId, { x: 486, y: 804, size: 7.5, font: fonts.mono, color: INK });
  page.drawText('29 August 2026', { x: 460, y: 788, size: 7.5, font: fonts.bold, color: INK });
  page.drawText(`PAGE ${String(pageNumber).padStart(2, '0')} OF ${String(pageCount).padStart(2, '0')}`, {
    x: 456,
    y: 773,
    size: 7.5,
    font: fonts.mono,
    color: PLUM,
  });
  drawRule(page, 754, PLUM, 1.2);
}

function drawFooter(page: PDFPage, fonts: Fonts, report: SyntheticReport, pageNumber: number, pageCount: number) {
  drawRule(page, 92);
  drawWrapped({
    page,
    font: fonts.body,
    text: 'Synthetic fixture report. It is not a credit report, legal advice, rating, score, or recommendation. FLAG marks a synthetic finding that needs review; CLEAR marks an available fixture fact with nothing adverse shown; NOTE marks context or a limitation.',
    x: MARGIN,
    y: 76,
    width: A4[0] - MARGIN * 2,
    size: 7.2,
    color: GRAY,
    lineHeight: 10,
  });
  drawRule(page, 40);
  page.drawText(`PARAKH · ${report.reportId} · ${report.searchedIdentifier}`, { x: MARGIN, y: 24, size: 7.2, font: fonts.mono, color: rgb(0.55, 0.48, 0.52) });
  page.drawText(`PAGE ${String(pageNumber).padStart(2, '0')} OF ${String(pageCount).padStart(2, '0')}`, { x: 458, y: 24, size: 7.2, font: fonts.mono, color: rgb(0.55, 0.48, 0.52) });
}

function labelStyle(label: SyntheticLabel) {
  if (label === 'FLAG') return { fill: rgb(0.965, 0.878, 0.884), text: FLAG };
  if (label === 'CLEAR') return { fill: rgb(0.87, 0.925, 0.89), text: CLEAR };
  return { fill: rgb(0.93, 0.9, 0.925), text: DEEP };
}

function drawLabel(page: PDFPage, fonts: Fonts, label: SyntheticLabel, x: number, y: number) {
  const style = labelStyle(label);
  const width = fonts.bold.widthOfTextAtSize(label, 7.2) + 16;
  page.drawRectangle({ x, y: y - 13, width, height: 15, color: style.fill });
  page.drawText(label, { x: x + 8, y: y - 8.5, size: 7.2, font: fonts.bold, color: style.text });
}

function drawFilingStrip(page: PDFPage, fonts: Fonts, rows: SyntheticReport['filingPattern']['rows'], x: number, y: number) {
  const values = rows.map((row) => `${row.gstr1} ${row.gstr3b}`.toLowerCase());
  const statusFor = (value: string) => value.includes('missing') ? SOFT : value.includes('delayed') ? MID : PLUM;
  page.drawText('GSTR-1 / GSTR-3B', { x, y, size: 6.5, font: fonts.mono, color: GRAY });
  values.forEach((value, index) => page.drawRectangle({ x: x + index * 31, y: y - 13, width: 25, height: 5, color: statusFor(value) }));
  for (let index = values.length; index < 8; index += 1) page.drawRectangle({ x: x + index * 31, y: y - 13, width: 25, height: 5, borderColor: SOFT, borderWidth: 0.6 });
  const followUps = values.filter((value) => value.includes('delayed') || value.includes('missing')).length;
  page.drawText(`${rows.length - followUps} of ${rows.length} available periods on time · ${followUps} follow-up marker(s)`, { x, y: y - 25, size: 7, font: fonts.body, color: GRAY });
}

function drawBriefRow({ page, fonts, label, headline, detail, state, y, filing }: {
  page: PDFPage;
  fonts: Fonts;
  label: string;
  headline: string;
  detail: string;
  state: SyntheticLabel;
  y: number;
  filing?: SyntheticReport['filingPattern']['rows'];
}) {
  const height = filing ? 86 : 48;
  page.drawRectangle({ x: MARGIN, y: y - height, width: A4[0] - MARGIN * 2, height, borderColor: SOFT, borderWidth: 0.65 });
  page.drawText(label, { x: MARGIN + 13, y: y - height / 2 - 3, size: 7.2, font: fonts.bold, color: GRAY });
  page.drawText(headline, { x: 154, y: y - 18, size: 10.5, font: fonts.bold, color: INK, maxWidth: 306 });
  if (filing) drawFilingStrip(page, fonts, filing, 154, y - 37);
  else drawWrapped({ page, font: fonts.body, text: detail, x: 154, y: y - 32, width: 300, size: 7.8, color: GRAY, lineHeight: 10 });
  drawLabel(page, fonts, state, 498, y - height / 2 + 4);
  return y - height;
}

function drawBriefPage({ page, fonts, report, pageCount, wordmark }: {
  page: PDFPage;
  fonts: Fonts;
  report: SyntheticReport;
  pageCount: number;
  wordmark: PDFImage | null;
}) {
  drawHeader({ page, fonts, report, pageNumber: 1, pageCount, wordmark });
  let y = 714;
  y = drawWrapped({ page, font: fonts.bold, text: report.business.legalName, x: MARGIN, y, width: 330, size: 19, color: INK, lineHeight: 23 }) - 1;
  page.drawText(report.business.tradeName, { x: MARGIN, y, size: 10.5, font: fonts.body, color: GRAY });
  page.drawText('SYNTHETIC DEMO · FIXTURE ONLY', { x: MARGIN, y: y - 18, size: 7.2, font: fonts.mono, color: PLUM });
  page.drawText(`REPORT ${report.reportId}`, { x: 404, y: y - 3, size: 7.4, font: fonts.mono, color: GRAY });
  page.drawText('SEARCHED 29 August 2026', { x: 384, y: y - 17, size: 7.4, font: fonts.mono, color: GRAY });
  y -= 40;
  const cells = [
    ['DEMO REFERENCE', report.searchedIdentifier],
    ['SYNTHETIC REGISTRY', report.business.syntheticRegistrationDate],
    ['STATE', report.business.registrationState],
    ['CONSTITUTION', report.business.constitution],
  ];
  const cellWidth = (A4[0] - MARGIN * 2) / 4;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: A4[0] - MARGIN, y }, thickness: 0.65, color: SOFT });
  cells.forEach(([label, value], index) => {
    const x = MARGIN + index * cellWidth;
    if (index) page.drawLine({ start: { x, y }, end: { x, y: y - 42 }, thickness: 0.65, color: SOFT });
    page.drawText(label, { x: x + (index ? 11 : 0), y: y - 15, size: 6.8, font: fonts.mono, color: GRAY });
    page.drawText(value, { x: x + (index ? 11 : 0), y: y - 29, size: 8.7, font: fonts.bold, color: INK, maxWidth: cellWidth - 14 });
  });
  y -= 42;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: A4[0] - MARGIN, y }, thickness: 0.65, color: SOFT });
  y -= 27;
  page.drawText('SYNTHETIC REGISTERED ADDRESS', { x: MARGIN, y, size: 6.8, font: fonts.mono, color: GRAY });
  page.drawText(report.business.syntheticAddress, { x: 178, y, size: 8.8, font: fonts.body, color: INK, maxWidth: 365 });
  y -= 15;
  drawRule(page, y);
  y -= 14;
  const identity = report.observations[0];
  const filing = report.observations.find((item) => item.title.toLowerCase().includes('filing')) ?? identity;
  const courtFlag = report.publicRecords.some((record) => record.signal === 'FLAG') ? 'FLAG' : report.publicRecords.length ? 'NOTE' : 'CLEAR';
  const courtHeadline = report.publicRecords.length ? `${report.publicRecords.length} synthetic court record(s) returned for review` : 'No synthetic court record returned in this fixture';
  const courtDetail = report.publicRecords.length ? 'The records below are name-based synthetic examples. A name alignment is not identity confirmation.' : 'No synthetic court-record absence claim is made outside this local fixture.';
  y = drawBriefRow({ page, fonts, label: 'IDENTITY', headline: identity.title, detail: identity.detail, state: identity.label, y });
  y = drawBriefRow({ page, fonts, label: 'REGISTRATION', headline: report.business.registrationStatus, detail: 'The local synthetic registry fixture supplies this registration marker.', state: 'CLEAR', y });
  y = drawBriefRow({ page, fonts, label: 'FILING', headline: filing.title, detail: filing.detail, state: filing.label, y, filing: report.filingPattern.rows });
  y = drawBriefRow({ page, fonts, label: 'COURT RECORDS', headline: courtHeadline, detail: courtDetail, state: courtFlag, y });
  y = drawBriefRow({ page, fonts, label: 'ENTITY CONTEXT', headline: `Entity type: ${report.business.constitution}`, detail: 'Entity character is reference context only. It is not a recommendation or recovery forecast.', state: 'NOTE', y });
  page.drawRectangle({ x: MARGIN, y: y - 49, width: A4[0] - MARGIN * 2, height: 49, color: FAINT, borderColor: SOFT, borderWidth: 0.65 });
  page.drawText('What this check could not find.', { x: MARGIN + 13, y: y - 16, size: 8.2, font: fonts.bold, color: DEEP });
  drawWrapped({ page, font: fonts.body, text: `${report.cannotFind.join('. ')}. This report covers only local synthetic GST and court fixtures.`, x: MARGIN + 13, y: y - 29, width: A4[0] - MARGIN * 2 - 26, size: 7.6, color: DEEP, lineHeight: 9.5 });
  y -= 61;
  page.drawRectangle({ x: MARGIN, y: y - 44, width: A4[0] - MARGIN * 2, height: 44, borderColor: rgb(0.92, 0.86, 0.9), borderWidth: 0.65, color: rgb(0.99, 0.975, 0.985) });
  page.drawText('NEXT CHECK', { x: MARGIN + 13, y: y - 15, size: 6.8, font: fonts.mono, color: PLUM });
  drawWrapped({ page, font: fonts.body, text: 'Save this synthetic report. Compare the invoice name with the registered legal name before the next material order.', x: 154, y: y - 15, width: 360, size: 7.8, color: DEEP, lineHeight: 9.2 });
  drawFooter(page, fonts, report, 1, pageCount);
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function drawCourtCard(page: PDFPage, fonts: Fonts, record: CourtRecord, y: number) {
  const height = 137;
  const width = A4[0] - MARGIN * 2;
  page.drawRectangle({ x: MARGIN, y: y - height, width, height, borderColor: SOFT, borderWidth: 0.7 });
  page.drawRectangle({ x: MARGIN, y: y - 30, width, height: 30, color: PAPER });
  const side = record.partySide === 'unknown' ? 'Side unclear' : titleCase(record.partySide);
  page.drawRectangle({ x: MARGIN + 13, y: y - 21, width: 76, height: 14, color: rgb(0.93, 0.9, 0.925) });
  page.drawText(side, { x: MARGIN + 20, y: y - 16, size: 6.8, font: fonts.bold, color: DEEP });
  page.drawText(record.proceeding, { x: MARGIN + 98, y: y - 17, size: 9.3, font: fonts.bold, color: INK, maxWidth: 220 });
  page.drawRectangle({ x: 434, y: y - 21, width: 96, height: 14, color: rgb(0.91, 0.85, 0.9) });
  page.drawText(`${record.matchGrade} NAME MATCH`, { x: 442, y: y - 16, size: 6.5, font: fonts.bold, color: PLUM });
  drawWrapped({ page, font: fonts.mono, text: `MATCHED BUSINESS: ${record.matchedParty} · SEARCH BASIS ${record.matchBasis}`, x: MARGIN + 13, y: y - 45, width: width - 26, size: 6.2, color: PLUM, lineHeight: 8.4 });
  page.drawText(`${record.caseReference} · filed ${record.filingYear} · ${record.recordStatus}`, { x: MARGIN + 13, y: y - 62, size: 7.3, font: fonts.mono, color: GRAY, maxWidth: width - 26 });
  page.drawText(record.courtName, { x: MARGIN + 13, y: y - 79, size: 8, font: fonts.body, color: GRAY, maxWidth: width - 26 });
  page.drawText(record.parties.join(' · '), { x: MARGIN + 13, y: y - 96, size: 8, font: fonts.bold, color: INK, maxWidth: width - 26 });
  page.drawLine({ start: { x: MARGIN + 13, y: y - 108 }, end: { x: MARGIN + width - 13, y: y - 108 }, thickness: 0.6, color: SOFT });
  drawWrapped({ page, font: fonts.body, text: `Identity evidence: ${record.matchGrade} NAME MATCH. ${record.resolutionReason}`, x: MARGIN + 13, y: y - 121, width: width - 26, size: 7.6, color: INK, lineHeight: 9.2 });
  return y - height;
}

function drawCourtPage({ page, fonts, report, records, pageNumber, pageCount, wordmark, continued }: {
  page: PDFPage;
  fonts: Fonts;
  report: SyntheticReport;
  records: CourtRecord[];
  pageNumber: number;
  pageCount: number;
  wordmark: PDFImage | null;
  continued: boolean;
}) {
  drawHeader({ page, fonts, report, pageNumber, pageCount, wordmark });
  let y = 714;
  page.drawText(continued ? 'Court records, continued' : 'The court records, in full', { x: MARGIN, y, size: 19, font: fonts.bold, color: INK });
  y -= 17;
  page.drawText('Business-name records are separated from aliases. A name match is not identity confirmation.', { x: MARGIN, y, size: 8.6, font: fonts.body, color: GRAY });
  y -= 21;
  if (!continued) {
    page.drawRectangle({ x: MARGIN, y: y - 59, width: A4[0] - MARGIN * 2, height: 59, color: PAPER });
    page.drawRectangle({ x: MARGIN, y: y - 59, width: 3, height: 59, color: PLUM });
    page.drawText('Identity is not verified on any record below.', { x: MARGIN + 14, y: y - 18, size: 8.4, font: fonts.bold, color: DEEP });
    drawWrapped({ page, font: fonts.body, text: 'Each synthetic court record carries a party name, not PAN, address, or registration number. Match grades describe local name similarity, never confirmation that the party is this business.', x: MARGIN + 14, y: y - 31, width: A4[0] - MARGIN * 2 - 28, size: 7.6, color: DEEP, lineHeight: 9.5 });
    page.drawText('Synthetic Court Archive · local fixture-only bounded name matching · SEARCHED 29 Aug 2026', { x: MARGIN + 14, y: y - 50, size: 6.6, font: fonts.body, color: GRAY });
    y -= 76;
  } else {
    page.drawRectangle({ x: MARGIN, y: y - 25, width: A4[0] - MARGIN * 2, height: 25, color: PAPER });
    page.drawText('Continuation. These records carry the same synthetic identity warning and source limits.', { x: MARGIN + 13, y: y - 16, size: 7.6, font: fonts.body, color: DEEP });
    y -= 39;
  }
  page.drawText('BUSINESS-NAME MATCHES', { x: MARGIN, y, size: 7.3, font: fonts.mono, color: GRAY });
  y -= 15;
  for (const record of records) y = drawCourtCard(page, fonts, record, y) - 10;
  drawFooter(page, fonts, report, pageNumber, pageCount);
}

export async function buildSyntheticPdf(report: SyntheticReport) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Parakh synthetic report ${report.reportId}`);
  pdf.setAuthor('Parakh synthetic demo');
  pdf.setSubject('Fixture-only synthetic due diligence report');
  pdf.setCreationDate(new Date('2026-08-29T00:00:00.000Z'));
  pdf.setModificationDate(new Date('2026-08-29T00:00:00.000Z'));
  const [fonts, wordmark] = await Promise.all([loadFonts(pdf), loadWordmark(pdf)]);
  const courtChunks: CourtRecord[][] = [];
  for (let index = 0; index < report.publicRecords.length; index += 2) courtChunks.push(report.publicRecords.slice(index, index + 2));
  if (!courtChunks.length) courtChunks.push([]);
  const pageCount = 1 + courtChunks.length;
  const brief = pdf.addPage(A4);
  drawBriefPage({ page: brief, fonts, report, pageCount, wordmark });
  courtChunks.forEach((records, index) => {
    const page = pdf.addPage(A4);
    drawCourtPage({ page, fonts, report, records, pageNumber: index + 2, pageCount, wordmark, continued: index > 0 });
  });
  return pdf.save({ useObjectStreams: false });
}

export function syntheticPdfFilename(report: SyntheticReport) {
  return `parakh-${report.searchedIdentifier.toLowerCase()}-synthetic-report.pdf`;
}
