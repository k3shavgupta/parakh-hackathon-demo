import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { confidencePercent } from './ai-attribution';
import type { SyntheticReport } from './synthetic-engine';
import {
  summaryCopy,
  type ReportAiReasoningState,
  type ReportAiSummaryState,
} from './report-ai-state';
import {
  EVIDENCE_SOURCE,
  FICTION_NOTICE,
  FILING_LABELS,
  filingStatus,
  fixtureMatchGrade,
  LABEL_GUIDE,
  nextCheck,
  REPORT_DISCLAIMER,
  reportSections,
} from './report-layout';

export type { ReportAiReasoningState } from './report-ai-state';

export function reasoningText(
  record: SyntheticReport['publicRecords'][number],
  state?: ReportAiReasoningState,
) {
  if (state?.status === 'success') {
    const factorPart =
      state.result.factors && state.result.factors.length > 0
        ? `Factors: ${state.result.factors.map((f) => `${f.label}: ${f.verdict}`).join(', ')}. `
        : '';
    return `${factorPart}${state.result.decision.replaceAll('_', ' ')} · Confidence ${state.result.confidence}. ${state.result.justification}`;
  }
  if (state?.status === 'loading') return 'AI reasoning is still in flight.';
  return `AI reasoning unavailable, showing fixture-based grade: ${record.signal}`;
}

export function reportToText(
  report: SyntheticReport,
  reasoning: Record<string, ReportAiReasoningState> = {},
  summary: ReportAiSummaryState = { status: 'fallback' },
) {
  const sections = reportSections(report);
  return [
    `Parakh synthetic report ${report.reportId}`,
    'AI Summary',
    summaryCopy(summary),
    ...(summary.status === 'success' && summary.result.key_signal
      ? [`Key finding: ${summary.result.key_signal}`]
      : []),
    `Subject: ${report.business.personName} · ${report.business.legalName}`,
    'Prepared for Demo viewer',
    `Synthetic GSTIN: ${report.searchedIdentifier}`,
    `Synthetic PAN-pattern: ${report.business.syntheticPanPattern}`,
    `Searched: ${report.generatedAt}`,
    `Registered address: ${report.business.syntheticAddress}`,
    'IDENTITY',
    `${sections.identity.label}: ${sections.identity.detail}`,
    'REGISTRATION',
    `${report.business.registrationStatus} · Registered ${report.business.registeredDate}`,
    'GST RETURN FILING',
    ...report.filingPattern.rows.map(
      (row) =>
        `${row.month}: GSTR-1 ${FILING_LABELS[filingStatus(row.gstr1)]}; GSTR-3B ${FILING_LABELS[filingStatus(row.gstr3b)]}`,
    ),
    'COURT RECORDS',
    sections.courtDetail,
    EVIDENCE_SOURCE,
    'ENTITY CONTEXT',
    report.business.context,
    'What this check could not find',
    ...report.cannotFind,
    'Next check',
    nextCheck(report),
    ...report.publicRecords.flatMap((record) => [
      record.caseReference,
      record.courtName,
      `Role: ${record.role}; Proceeding: ${record.proceedingType}; Filed year: ${record.filedYear}`,
      `Matched entity: ${record.matchedEntity}`,
      `Search basis: ${record.matchBasis}`,
      `Identity evidence: ${record.identityEvidence}`,
      'AI Attribution Reasoning',
      reasoningText(record, reasoning[record.id]),
    ]),
    report.syntheticDisclosure,
    LABEL_GUIDE,
    REPORT_DISCLAIMER,
  ].join('\n');
}

function wrap(
  text: string,
  font: PDFFont,
  size: number,
  width: number,
): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      let token = '';
      const tokens: string[] = [];
      for (const character of word) {
        if (font.widthOfTextAtSize(token + character, size) > width && token) {
          tokens.push(token);
          token = '';
        }
        token += character;
      }
      if (token) tokens.push(token);
      for (const chunk of tokens) {
        const candidate = line ? `${line} ${chunk}` : chunk;
        if (font.widthOfTextAtSize(candidate, size) > width && line) {
          lines.push(line);
          line = chunk;
        } else {
          line = candidate;
        }
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

export async function createSyntheticReportPdf(
  report: SyntheticReport,
  reasoning: Record<string, ReportAiReasoningState> = {},
  summary: ReportAiSummaryState = { status: 'fallback' },
) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setTitle(`${report.reportId} - Synthetic due-diligence report`);
  pdf.setAuthor('Parakh synthetic demo');

  const asset = async (path: string) => {
    try {
      if (typeof fetch === 'function') {
        const response = await fetch(path);
        if (response.ok) return new Uint8Array(await response.arrayBuffer());
      }
    } catch {
      /* Fallback to filesystem if running in node/server-side */
    }
    try {
      if (typeof process !== 'undefined' && typeof process.cwd === 'function') {
        const fsModule = await import('node:fs/promises');
        const pathModule = await import('node:path');
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        const filePath = pathModule.resolve(process.cwd(), 'public', cleanPath);
        const data = await fsModule.readFile(filePath);
        return new Uint8Array(data);
      }
    } catch {
      /* Graceful fallback */
    }
    return null;
  };

  const [regularBytes, boldBytes, logoBytes] = await Promise.all([
    asset('/fonts/Onest-Regular.ttf'),
    asset('/fonts/Onest-Semibold.ttf'),
    asset('/assets/logo-horizontal.png'),
  ]);

  const font = async (bytes: Uint8Array | null, fallback: StandardFonts) => {
    try {
      if (bytes) return await pdf.embedFont(bytes, { subset: true });
    } catch {
      /* Fallback to standard font */
    }
    return pdf.embedFont(fallback);
  };

  const regular = await font(regularBytes, StandardFonts.Helvetica);
  const bold = await font(boldBytes, StandardFonts.HelveticaBold);

  let logo: ReturnType<typeof pdf.embedPng> extends Promise<infer T> ? T | null : null = null;
  try {
    if (logoBytes) logo = await pdf.embedPng(logoBytes);
  } catch {
    /* Fallback to text brand */
  }

  // --- Palette & Tokens (Modern Grad Brand Guidelines) ---
  const ink = rgb(0.125, 0.106, 0.118); // #201b1e - Primary dark
  const darkPlum = rgb(0.373, 0.157, 0.341); // #5f2857 - Deep plum
  const plum = rgb(0.478, 0.200, 0.435); // #7a336f - Brand plum
  const muted = rgb(0.463, 0.400, 0.451); // #766673 - Muted label/meta
  const subdued = rgb(0.267, 0.224, 0.255); // #443941 - Subdued body
  const wash = rgb(0.984, 0.969, 0.980); // #fcf7fa - Soft card wash
  const washCard = rgb(0.976, 0.957, 0.973); // #f9f4f8 - Metadata plate wash
  const blush = rgb(0.949, 0.890, 0.929); // #f2e3ed - Chip track / tint
  const rule = rgb(0.914, 0.867, 0.898); // #e9dee5 - Section divider
  const hairline = rgb(0.937, 0.894, 0.922); // #efe4eb - Row divider
  const border = rgb(0.902, 0.824, 0.878); // #e6d2e0 - Container stroke
  const white = rgb(1, 1, 1);

  // Status Badge Colors (Modern Grad Accessible Palette)
  const statusClear = {
    fill: rgb(0.918, 0.969, 0.937), // #eaf7ee
    stroke: rgb(0.722, 0.886, 0.784), // #b8e2c8
    text: rgb(0.106, 0.420, 0.216), // #1b6b37
  };
  const statusFlag = {
    fill: rgb(0.996, 0.937, 0.945), // #feeff1
    stroke: rgb(0.976, 0.773, 0.788), // #f9c5c9
    text: rgb(0.702, 0.114, 0.173), // #b31d2c
  };
  const statusNote = {
    fill: rgb(0.957, 0.937, 0.953), // #f4eff3
    stroke: rgb(0.875, 0.835, 0.867), // #dfd5dd
    text: rgb(0.333, 0.286, 0.322), // #554952
  };
  const statusUnavailable = {
    fill: rgb(1.0, 0.965, 0.910), // #fff6e8
    stroke: rgb(0.980, 0.843, 0.722), // #fad7b8
    text: rgb(0.588, 0.318, 0.102), // #96511a
  };

  // Dimensions
  const W = 595.28;
  const H = 841.89;
  const M = 36;
  const CW = W - 2 * M; // 523.28
  const contentFloor = 74; // Safe bottom limit for content above footer

  let page = pdf.addPage([W, H]);
  let y = H - 96;

  const safe = (textValue: string, activeFont: PDFFont) =>
    Array.from(textValue)
      .map((char) => {
        try {
          activeFont.encodeText(char);
          return char;
        } catch {
          return '-';
        }
      })
      .join('');

  const draw = (
    textValue: string,
    x: number,
    yPos: number,
    size = 9,
    fontFace = regular,
    fillColor = ink,
  ) => {
    page.drawText(safe(textValue, fontFace), {
      x,
      y: yPos,
      size,
      font: fontFace,
      color: fillColor,
    });
  };

  const drawRoundedCard = (
    targetPage: PDFPage,
    x: number,
    topY: number,
    width: number,
    height: number,
    radius: number,
    fill?: ReturnType<typeof rgb>,
    stroke?: ReturnType<typeof rgb>,
    strokeWidth = 0.5,
  ) => {
    const r = Math.max(1, Math.min(radius, width / 2, height / 2));
    const d = `M 0 ${r} Q 0 0 ${r} 0 H ${width - r} Q ${width} 0 ${width} ${r} V ${height - r} Q ${width} ${height} ${width - r} ${height} H ${r} Q 0 ${height} 0 ${height - r} Z`;
    if (fill) {
      targetPage.drawSvgPath(d, { x, y: topY, color: fill });
    }
    if (stroke) {
      targetPage.drawSvgPath(d, {
        x,
        y: topY,
        borderColor: stroke,
        borderWidth: strokeWidth,
      });
    }
  };

  // Modern Grad Accented Callout Box with Left Accent Bar
  const drawAccentedBox = (
    targetPage: PDFPage,
    x: number,
    topY: number,
    width: number,
    height: number,
    radius: number,
    accentColor: ReturnType<typeof rgb>,
    fillColor = wash,
    borderColor = border,
  ) => {
    drawRoundedCard(targetPage, x, topY, width, height, radius, fillColor, borderColor, 0.75);
    const r = Math.min(radius, 4);
    targetPage.drawRectangle({
      x: x + 0.5,
      y: topY - height + r,
      width: 3.5,
      height: height - 2 * r,
      color: accentColor,
    });
  };

  const drawBadge = (
    targetPage: PDFPage,
    badgeLabel: string,
    x: number,
    baselineY: number,
    width = 72,
    height = 18,
  ) => {
    let cfg = statusNote;
    if (badgeLabel === 'CLEAR') cfg = statusClear;
    else if (badgeLabel === 'FLAG') cfg = statusFlag;
    else if (badgeLabel === 'UNAVAILABLE') cfg = statusUnavailable;

    const pillTopY = baselineY + 12.5;
    drawRoundedCard(targetPage, x, pillTopY, width, height, height / 2, cfg.fill, cfg.stroke, 0.75);

    const textW = bold.widthOfTextAtSize(badgeLabel, 8);
    const textX = x + (width - textW) / 2;
    targetPage.drawText(safe(badgeLabel, bold), {
      x: textX,
      y: baselineY,
      size: 8,
      font: bold,
      color: cfg.text,
    });
  };

  const newPage = () => {
    page = pdf.addPage([W, H]);
    y = H - 96;
  };

  const ensure = (heightNeeded: number) => {
    if (y - heightNeeded < contentFloor) {
      newPage();
    }
  };

  const sections = reportSections(report);

  // ==========================================
  // PAGE 1: 15-SECOND EXECUTIVE DECISION BRIEF
  // ==========================================

  // 1. Entity Title & Meta Block
  const primaryTitle = (
    report.business.tradeName ||
    report.business.personName ||
    report.business.legalName
  ).toUpperCase();
  const subTitle =
    report.business.tradeName && report.business.tradeName !== report.business.legalName
      ? report.business.legalName
      : report.business.personName && report.business.personName !== report.business.tradeName
        ? report.business.personName
        : '';

  const rightMetaX = W - M - 165;
  draw(`REPORT #${report.reportId}`, rightMetaX, 746, 8.5, bold, darkPlum);
  draw(`SEARCHED ${report.generatedAt}`, rightMetaX, 730, 8, regular, muted);

  const titleMaxWidth = CW - 180;
  const titleLines = wrap(primaryTitle, bold, 18, titleMaxWidth);
  y = 746;
  for (let idx = 0; idx < titleLines.length; idx++) {
    draw(titleLines[idx], M, y, 18, bold, ink);
    if (idx < titleLines.length - 1) y -= 20;
  }
  y -= 16;
  if (subTitle) {
    draw(subTitle, M, y, 10, regular, subdued);
    y -= 14;
  } else {
    y -= 2;
  }

  draw('Prepared for ', M, y, 9, regular, muted);
  draw('Demo viewer', M + regular.widthOfTextAtSize('Prepared for ', 9), y, 9, bold, ink);

  y -= 11;
  page.drawLine({
    start: { x: M, y },
    end: { x: W - M, y },
    thickness: 0.75,
    color: rule,
  });

  // 2. 4-Column Metadata Plate with Grounded Wash
  y -= 9;
  const gridHeight = 36;
  drawRoundedCard(page, M, y, CW, gridHeight, 6, washCard, border, 0.5);

  const colW = CW / 4;
  const cleanPan = report.business.syntheticPanPattern.replace(/\s*\(.*?\)/g, '');
  const cols = [
    { label: 'G S T I N', value: report.searchedIdentifier },
    { label: 'P A N', value: cleanPan },
    { label: 'S T A T E', value: report.business.registrationState },
    { label: 'C O N S T I T U T I O N', value: report.business.constitution },
  ];

  const gridTopY = y - 11;
  cols.forEach((col, index) => {
    const colX = M + 14 + index * colW;
    draw(col.label, colX, gridTopY, 7, bold, darkPlum);
    draw(col.value, colX, gridTopY - 13, 9.5, bold, ink);
    if (index > 0) {
      page.drawLine({
        start: { x: M + index * colW, y: y - 5 },
        end: { x: M + index * colW, y: y - gridHeight + 5 },
        thickness: 0.5,
        color: border,
      });
    }
  });

  y -= gridHeight + 9;

  // 3. Registered Address Row
  draw('REGISTERED ADDRESS', M, y, 7.5, bold, muted);
  const addrLines = wrap(report.business.syntheticAddress, regular, 8.5, CW - 145);
  let curAddrY = y;
  for (const line of addrLines) {
    draw(line, M + 140, curAddrY, 8.5, regular, ink);
    curAddrY -= 11;
  }
  y = Math.min(y - 12, curAddrY - 2);

  page.drawLine({
    start: { x: M, y },
    end: { x: W - M, y },
    thickness: 0.75,
    color: rule,
  });

  // 4. Decision Brief / Findings Table
  y -= 4;

  const renderFindingRow = (
    categoryLabel: string,
    headline: string,
    detailText: string,
    badgeLabel: string,
  ) => {
    const badgeW = 72;
    const badgeH = 18;
    const badgeX = W - M - badgeW;
    const maxContentW = CW - 140 - badgeW - 14;

    const headlineLines = wrap(headline, bold, 9.5, maxContentW);
    const detailLines = wrap(detailText, regular, 8.5, maxContentW);
    const rowHeight = Math.max(
      28,
      12 + headlineLines.length * 11.5 + detailLines.length * 11 + 4,
    );

    ensure(rowHeight);

    const rowBaselineY = y - 11;
    draw(categoryLabel, M, rowBaselineY, 8, bold, darkPlum);

    let textY = rowBaselineY;
    for (const line of headlineLines) {
      draw(line, M + 140, textY, 9.5, bold, ink);
      textY -= 11.5;
    }
    for (const line of detailLines) {
      draw(line, M + 140, textY, 8.5, regular, subdued);
      textY -= 11;
    }

    drawBadge(page, badgeLabel, badgeX, rowBaselineY - 1, badgeW, badgeH);

    y -= rowHeight;
    page.drawLine({
      start: { x: M, y },
      end: { x: W - M, y },
      thickness: 0.5,
      color: hairline,
    });
    y -= 3;
  };

  // AI Summary Row
  const aiSummaryText = summaryCopy(summary);
  const aiTitle =
    summary.status === 'success'
      ? 'AI generated'
      : summary.status === 'loading'
        ? 'Reviewing the synthetic evidence'
        : 'AI summary unavailable';
  const summaryKeySignal =
    summary.status === 'success' && summary.result.key_signal
      ? `Key finding: ${summary.result.key_signal} `
      : '';
  renderFindingRow(
    'AI Summary',
    aiTitle,
    `${aiSummaryText}${summaryKeySignal ? ` ${summaryKeySignal}` : ''}`,
    summary.status === 'success' ? 'CLEAR' : 'NOTE',
  );

  // Identity Row
  renderFindingRow(
    'IDENTITY',
    `${report.business.legalName} is identified on the register`,
    sections.identity.detail,
    sections.identity.label,
  );

  // Registration Row
  renderFindingRow(
    'REGISTRATION',
    `Registration status: ${report.business.registrationStatus}`,
    `Registered: ${report.business.registeredDate} (fictional)`,
    sections.registrationLabel,
  );

  // ==========================================
  // SIGNATURE GST RETURN FILING SECTION (PRK-00068 Style)
  // ==========================================
  const filingBadge = sections.filingLabel;
  const filingHeadline =
    filingBadge === 'FLAG'
      ? 'Filing history shows delays'
      : filingBadge === 'NOTE'
        ? 'Limited filing history available'
        : 'Returns filed on time';
  const filingParagraph =
    filingBadge === 'NOTE'
      ? 'Available filing data is limited. Parakh cannot determine whether returns were filed on time for periods or filing dates not available from the source.'
      : `Available filing data covers ${sections.counts.periods} fixture periods. GSTR-1 and GSTR-3B filings are evaluated against standard statutory due dates.`;

  // Height budget for full GST section:
  // Headline + Paragraph: ~26pt
  // Summary Table: ~32pt
  // Dot Timeline (GSTR-1 + GSTR-3B + Legend): ~68pt
  // Total ~126pt
  ensure(130);

  const gstSectionTopY = y - 11;
  draw('GST RETURN FILING', M, gstSectionTopY, 8, bold, darkPlum);

  const badgeW = 72;
  const badgeH = 18;
  const badgeX = W - M - badgeW;
  drawBadge(page, filingBadge, badgeX, gstSectionTopY - 1, badgeW, badgeH);

  // Headline & Paragraph
  draw(filingHeadline, M + 140, gstSectionTopY, 9.5, bold, ink);
  const gstParaLines = wrap(filingParagraph, regular, 8, CW - 140 - badgeW - 14);
  let gstCurY = gstSectionTopY - 11.5;
  for (const line of gstParaLines) {
    draw(line, M + 140, gstCurY, 8, regular, subdued);
    gstCurY -= 10.5;
  }
  gstCurY -= 4;

  // 1. Summary Counts Table (Return, Published, On time, Late, Source unavailable)
  const tblLeft = M + 140;
  const colRet = tblLeft;
  const colPub = tblLeft + 75;
  const colOnTime = tblLeft + 140;
  const colLate = tblLeft + 195;
  const colUnavail = tblLeft + 245;

  draw('Return', colRet, gstCurY, 7, bold, muted);
  draw('Published', colPub, gstCurY, 7, bold, muted);
  draw('On time', colOnTime, gstCurY, 7, bold, muted);
  draw('Late', colLate, gstCurY, 7, bold, muted);
  draw('Source unavailable', colUnavail, gstCurY, 7, bold, muted);
  gstCurY -= 11;

  const g1Pub = sections.counts.gstr1.onTime + sections.counts.gstr1.late + sections.counts.gstr1.missing;
  draw('GSTR-1', colRet, gstCurY, 7.5, bold, ink);
  draw(String(g1Pub), colPub + 10, gstCurY, 7.5, regular, ink);
  draw(String(sections.counts.gstr1.onTime), colOnTime + 8, gstCurY, 7.5, regular, ink);
  draw(String(sections.counts.gstr1.late), colLate + 6, gstCurY, 7.5, regular, ink);
  draw(String(sections.counts.gstr1.unavailable), colUnavail + 22, gstCurY, 7.5, regular, ink);
  gstCurY -= 10.5;

  const g3Pub = sections.counts.gstr3b.onTime + sections.counts.gstr3b.late + sections.counts.gstr3b.missing;
  draw('GSTR-3B', colRet, gstCurY, 7.5, bold, ink);
  draw(String(g3Pub), colPub + 10, gstCurY, 7.5, regular, ink);
  draw(String(sections.counts.gstr3b.onTime), colOnTime + 8, gstCurY, 7.5, regular, ink);
  draw(String(sections.counts.gstr3b.late), colLate + 6, gstCurY, 7.5, regular, ink);
  draw(String(sections.counts.gstr3b.unavailable), colUnavail + 22, gstCurY, 7.5, regular, ink);
  gstCurY -= 7;

  page.drawLine({
    start: { x: tblLeft, y: gstCurY },
    end: { x: W - M, y: gstCurY },
    thickness: 0.5,
    color: hairline,
  });
  gstCurY -= 8;

  // 2. Visual Dot Timeline (GSTR-1 and GSTR-3B)
  const rows = report.filingPattern.rows;
  const numPeriods = Math.max(1, rows.length);
  const rangeStr =
    rows.length > 0
      ? `${rows[0].month.split(' ')[0].toUpperCase()} ${rows[0].period.slice(2, 4)} – ${rows[rows.length - 1].month.split(' ')[0].toUpperCase()} ${rows[rows.length - 1].period.slice(2, 4)}`
      : 'AUG 25 – JUL 26';

  const tlColW = Math.min(28, (W - M - tblLeft - 8) / numPeriods);

  // Helper to format short month
  const parseMonth = (row: (typeof rows)[number]) => {
    const parts = row.month.split(' ');
    const m = parts[0].slice(0, 4).toUpperCase();
    const yStr = row.period.slice(2, 4);
    return { m, yStr };
  };

  // --- GSTR-1 Timeline Row ---
  draw('GSTR-1', tblLeft, gstCurY, 7.5, bold, ink);
  const rW1 = regular.widthOfTextAtSize(rangeStr, 7);
  draw(rangeStr, W - M - rW1, gstCurY, 7, bold, muted);
  gstCurY -= 10;

  for (let i = 0; i < rows.length; i++) {
    const { m, yStr } = parseMonth(rows[i]);
    const colX = tblLeft + i * tlColW;
    draw(m, colX, gstCurY, 6, bold, muted);
    draw(yStr, colX, gstCurY - 7, 5.5, regular, muted);

    const st = filingStatus(rows[i].gstr1);
    const markY = gstCurY - 17;
    if (st === 'onTime') {
      page.drawCircle({ x: colX + 6, y: markY, size: 2.5, color: statusClear.text });
    } else if (st === 'late') {
      page.drawSvgPath('M 0 5 L 2.5 0 L 5 5 Z', { x: colX + 3.5, y: markY + 3.5, color: statusFlag.text });
    } else {
      draw('—', colX + 3, markY - 2, 7, regular, muted);
    }
  }
  gstCurY -= 22;

  // --- GSTR-3B Timeline Row ---
  draw('GSTR-3B', tblLeft, gstCurY, 7.5, bold, ink);
  const rW3 = regular.widthOfTextAtSize(rangeStr, 7);
  draw(rangeStr, W - M - rW3, gstCurY, 7, bold, muted);
  gstCurY -= 10;

  for (let i = 0; i < rows.length; i++) {
    const { m, yStr } = parseMonth(rows[i]);
    const colX = tblLeft + i * tlColW;
    draw(m, colX, gstCurY, 6, bold, muted);
    draw(yStr, colX, gstCurY - 7, 5.5, regular, muted);

    const st = filingStatus(rows[i].gstr3b);
    const markY = gstCurY - 17;
    if (st === 'onTime') {
      page.drawCircle({ x: colX + 6, y: markY, size: 2.5, color: statusClear.text });
    } else if (st === 'late') {
      page.drawSvgPath('M 0 5 L 2.5 0 L 5 5 Z', { x: colX + 3.5, y: markY + 3.5, color: statusFlag.text });
    } else {
      draw('—', colX + 3, markY - 2, 7, regular, muted);
    }
  }
  gstCurY -= 22;

  // Legend Row
  page.drawCircle({ x: tblLeft + 4, y: gstCurY + 2, size: 2.5, color: statusClear.text });
  draw('On time', tblLeft + 11, gstCurY, 6.5, regular, muted);

  page.drawSvgPath('M 0 5 L 2.5 0 L 5 5 Z', { x: tblLeft + 52, y: gstCurY + 5.5, color: statusFlag.text });
  draw('Late', tblLeft + 60, gstCurY, 6.5, regular, muted);

  draw('—', tblLeft + 92, gstCurY - 1, 7, regular, muted);
  draw('Not available from source', tblLeft + 104, gstCurY, 6.5, regular, muted);

  gstCurY -= 8;
  page.drawLine({
    start: { x: M, y: gstCurY },
    end: { x: W - M, y: gstCurY },
    thickness: 0.5,
    color: hairline,
  });
  gstCurY -= 4;
  y = gstCurY;

  // Court Records Row
  const courtTitle = sections.courtRecords.length
    ? `${sections.courtRecords.length} records were returned for review`
    : 'No records found';
  renderFindingRow(
    'COURT RECORDS',
    courtTitle,
    sections.courtDetail,
    sections.courtLabel,
  );

  // Entity Context Row
  renderFindingRow(
    'ENTITY CONTEXT',
    `Entity type: ${report.business.constitution}`,
    report.business.context,
    'NOTE',
  );

  // 5. "What this check could not find" Callout Box with Dark Plum Left Accent Bar
  y -= 6;
  const cannotFindInline =
    report.cannotFind.length > 0
      ? report.cannotFind.join(' · ')
      : 'No live systems were queried.';
  const cannotFindLines = wrap(cannotFindInline, regular, 8, CW - 32);

  if (report.cannotFind.length > 6) {
    ensure(36);
    draw('What this check could not find', M, y - 10, 8.5, bold, darkPlum);
    y -= 18;
    for (const item of report.cannotFind) {
      const itemLines = wrap(`- ${item}`, regular, 8, CW);
      ensure(itemLines.length * 10.5 + 2);
      for (const line of itemLines) {
        draw(line, M, y, 8, regular, subdued);
        y -= 10.5;
      }
    }
  } else {
    const cannotBoxHeight = 16 + cannotFindLines.length * 10.5 + 4;
    ensure(cannotBoxHeight);
    drawAccentedBox(page, M, y, CW, cannotBoxHeight, 6, darkPlum, wash, border);

    draw('What this check could not find.', M + 14, y - 12, 8, bold, darkPlum);
    const titleW = bold.widthOfTextAtSize('What this check could not find. ', 8);
    draw('No live systems were queried.', M + 14 + titleW, y - 12, 8, regular, muted);

    let cfY = y - 22;
    for (const line of cannotFindLines) {
      draw(line, M + 14, cfY, 8, regular, subdued);
      cfY -= 10.5;
    }
    y -= cannotBoxHeight + 7;
  }

  // 6. "NEXT CHECK" Callout Box with Brand Plum Left Accent Bar
  const nextCheckText = nextCheck(report);
  const nextCheckLines = wrap(nextCheckText, regular, 8.5, CW - 120);
  const nextCheckHeight = Math.max(28, 12 + nextCheckLines.length * 11);

  ensure(nextCheckHeight);
  drawAccentedBox(page, M, y, CW, nextCheckHeight, 6, plum, wash, border);

  draw('NEXT CHECK', M + 14, y - 15, 8, bold, plum);
  let ncY = y - 15;
  for (const line of nextCheckLines) {
    draw(line, M + 98, ncY, 8.5, regular, ink);
    ncY -= 11.5;
  }
  y -= nextCheckHeight + 10;

  // ==========================================
  // SUBSEQUENT PAGES: COURT & PUBLIC RECORDS
  // ==========================================
  if (report.publicRecords.length > 0) {
    newPage();

    draw('The court records, in full', M, y, 18, bold, ink);
    y -= 16;
    draw(
      'Business-name records are separated from verified related-person records. A name match is not identity confirmation.',
      M,
      y,
      9.5,
      regular,
      muted,
    );
    y -= 14;

    // Disclaimer Callout with Left Accent
    const disclaimerHeight = 42;
    drawAccentedBox(page, M, y, CW, disclaimerHeight, 6, muted, wash, border);
    draw(
      'Identity is not verified on any record below. The court record carries a party name and state, not PAN, address, or',
      M + 14,
      y - 12,
      8.5,
      regular,
      subdued,
    );
    draw(
      'registration number. Each record is graded on name and state similarity, never confirmed as the same party.',
      M + 14,
      y - 23,
      8.5,
      regular,
      subdued,
    );
    draw(
      `${EVIDENCE_SOURCE} · bounded exact phrase passes · SEARCHED · ${report.generatedAt}`,
      M + 14,
      y - 34,
      7.5,
      regular,
      muted,
    );
    y -= disclaimerHeight + 14;

    draw('BUSINESS-NAME MATCHES', M, y, 8.5, bold, muted);
    y -= 12;

    for (const record of report.publicRecords) {
      const state = reasoning[record.id];
      const factors = state?.status === 'success' ? state.result.factors ?? [] : [];
      const justification =
        state?.status === 'success'
          ? state.result.justification
          : reasoningText(record, state);

      const justificationLines = wrap(justification, regular, 9, CW - 44);
      const hasFactors = factors.length > 0;
      const factorRowsHeight = hasFactors ? 20 : 0;

      const metaLine1 = `MATCHED BUSINESS: ${record.matchedEntity}  ·  SEARCH BASIS ${record.matchBasis}  ·  PROCEEDING ${record.proceedingType.toUpperCase()}`;
      const metaLines1 = wrap(metaLine1, regular, 8, CW - 28);
      const idEvidenceLine = `Identity evidence: ${record.identityEvidence}`;
      const idLines = wrap(idEvidenceLine, regular, 8, CW - 28);

      const metaHeight = 36 + metaLines1.length * 11.5 + 13 + 13 + idLines.length * 11.5 + 12;
      const reasoningBoxHeight =
        26 + factorRowsHeight + justificationLines.length * 12 + 26;
      const totalCardHeight = metaHeight + reasoningBoxHeight + 14;

      if (y - totalCardHeight < contentFloor) {
        newPage();
        draw('Court records, continued', M, y, 18, bold, ink);
        y -= 16;
        draw(
          'Business-name records are separated from verified related-person records. A name match is not identity confirmation.',
          M,
          y,
          9.5,
          regular,
          muted,
        );
        y -= 14;

        const contHeight = 24;
        drawAccentedBox(page, M, y, CW, contHeight, 6, muted, wash, border);
        draw(
          'Continuation. The records on this page follow the same identity warning and source scope as the first court-record page.',
          M + 14,
          y - 15,
          8.5,
          regular,
          subdued,
        );
        y -= contHeight + 14;
        draw('BUSINESS-NAME MATCHES', M, y, 8.5, bold, muted);
        y -= 12;
      }

      // Draw Elevated Court Card Container
      drawRoundedCard(page, M, y, CW, totalCardHeight, 8, white, border, 0.75);

      // Card Header strip with soft tint
      const headerTopY = y - 6;
      const roleText =
        record.role === 'Not applicable'
          ? 'Registry entry'
          : record.partySide === 'named-party'
            ? 'Named Party'
            : record.role;
      const roleIsRespondent =
        roleText.toLowerCase().includes('respondent') ||
        roleText.toLowerCase().includes('defendant');
      const roleCfg = roleIsRespondent ? statusFlag : statusNote;

      const roleW = bold.widthOfTextAtSize(roleText, 8) + 16;
      drawRoundedCard(page, M + 12, headerTopY, roleW, 18, 9, roleCfg.fill, roleCfg.stroke, 0.5);
      draw(roleText, M + 20, headerTopY - 12.5, 8, bold, roleCfg.text);

      const titleProceeding = (
        record.category === 'registry'
          ? 'REGISTRY ENTRY'
          : record.proceedingType || record.caseReference
      ).toUpperCase();
      const maxTitleW = CW - roleW - 150;
      const titleProceedingTrimmed =
        bold.widthOfTextAtSize(titleProceeding, 9.5) > maxTitleW
          ? titleProceeding.slice(0, 32) + '...'
          : titleProceeding;
      draw(titleProceedingTrimmed, M + 18 + roleW, headerTopY - 12.5, 9.5, bold, ink);

      const matchGrade = fixtureMatchGrade(record);
      const gradeW = bold.widthOfTextAtSize(matchGrade, 8) + 16;
      const gradeX = W - M - gradeW - 12;
      drawRoundedCard(page, gradeX, headerTopY, gradeW, 18, 9, wash, border, 0.5);
      draw(matchGrade, gradeX + 8, headerTopY - 12.5, 8, bold, darkPlum);

      page.drawLine({
        start: { x: M, y: y - 28 },
        end: { x: W - M, y: y - 28 },
        thickness: 0.5,
        color: border,
      });

      // Card Meta Lines
      let curCardY = y - 40;
      for (const line of metaLines1) {
        draw(line, M + 14, curCardY, 8, regular, subdued);
        curCardY -= 11.5;
      }
      draw(`${record.caseReference}  ·  filed ${record.filedYear}`, M + 14, curCardY, 8, regular, subdued);
      curCardY -= 13;
      draw(record.courtName, M + 14, curCardY, 9.5, bold, ink);
      curCardY -= 13;
      for (const line of idLines) {
        draw(line, M + 14, curCardY, 8, regular, subdued);
        curCardY -= 11.5;
      }
      curCardY -= 12;

      // AI Attribution Reasoning Sub-panel
      drawRoundedCard(page, M + 12, curCardY, CW - 24, reasoningBoxHeight, 6, wash, border, 0.5);

      let rY = curCardY - 13;
      draw('AI Attribution Reasoning', M + 24, rY, 9.5, bold, darkPlum);
      rY -= 16;

      if (hasFactors) {
        let chipX = M + 24;
        for (const factor of factors) {
          const factorText = `${factor.label}: ${factor.verdict}`;
          const fW = bold.widthOfTextAtSize(factorText, 8) + 14;
          drawRoundedCard(page, chipX, rY + 9, fW, 16, 8, blush, undefined, 0);
          draw(factorText, chipX + 7, rY - 2.5, 8, bold, plum);
          chipX += fW + 8;
        }
        rY -= 17;
      }

      for (const line of justificationLines) {
        draw(line, M + 24, rY, 9, regular, ink);
        rY -= 12;
      }
      rY -= 2;

      const confValue = state?.status === 'success' ? state.result.confidence : 'Medium';
      const confLabel = `Confidence ${confValue}`;
      draw(confLabel, M + 24, rY, 8.5, bold, darkPlum);
      const confLabelW = bold.widthOfTextAtSize(confLabel, 8.5);

      const gaugeX = M + 24 + confLabelW + 8;
      const gaugeTopY = rY + 7;
      const gaugeW = 60;
      const gaugeH = 6;
      drawRoundedCard(page, gaugeX, gaugeTopY, gaugeW, gaugeH, 3, blush);

      const pct = confidencePercent(confValue);
      const fillW = Math.max(2, (gaugeW * pct) / 100);
      drawRoundedCard(page, gaugeX, gaugeTopY, fillW, gaugeH, 3, plum);

      const decisionStr =
        state?.status === 'success'
          ? ` · Decision ${state.result.decision.replaceAll('_', ' ')}`
          : ` · Fixture grade ${record.signal}`;
      draw(decisionStr, gaugeX + gaugeW + 6, rY, 8, regular, muted);
      rY -= 12;

      draw(
        state?.status === 'success'
          ? 'Runtime AI response · Factors and confidence weighed by model.'
          : 'Runtime AI response or explicitly labeled fixture fallback.',
        M + 24,
        rY,
        7.5,
        regular,
        muted,
      );

      y -= totalCardHeight + 14;
    }
  }

  // ==========================================
  // RUNNING HEADERS & FOOTERS ACROSS ALL PAGES
  // ==========================================
  const totalPages = pdf.getPageCount();
  for (let i = 0; i < totalPages; i++) {
    const p = pdf.getPage(i);
    const pageNum = String(i + 1).padStart(2, '0');
    const totalPadded = String(totalPages).padStart(2, '0');

    // Running Header
    if (logo) {
      p.drawImage(logo, { x: M, y: H - 43, width: 84, height: 19 });
      p.drawText('|', {
        x: M + 92,
        y: H - 39,
        size: 13,
        font: regular,
        color: rgb(0.847, 0.714, 0.812),
      });
      const headerSub =
        i === 0 ? 'FACTUAL DUE DILIGENCE ENGINE' : 'WHAT IT MEANS, AND WHAT IT MISSED';
      p.drawText(headerSub, {
        x: M + 104,
        y: H - 38,
        size: 7.5,
        font: bold,
        color: muted,
      });
    } else {
      const headerBrand =
        i === 0
          ? 'Parakh | FACTUAL DUE DILIGENCE ENGINE'
          : 'Parakh | WHAT IT MEANS, AND WHAT IT MISSED';
      p.drawText(headerBrand, {
        x: M,
        y: H - 39,
        size: 11,
        font: bold,
        color: plum,
      });
    }

    const refText = `REF: ${report.reportId}`;
    const refW = bold.widthOfTextAtSize(refText, 8);
    p.drawText(safe(refText, bold), {
      x: W - M - refW,
      y: H - 35,
      size: 8,
      font: bold,
      color: darkPlum,
    });

    const dateText = report.generatedAt;
    const dateW = regular.widthOfTextAtSize(dateText, 8);
    p.drawText(safe(dateText, regular), {
      x: W - M - dateW,
      y: H - 46,
      size: 8,
      font: regular,
      color: muted,
    });

    const pageCountText = `PAGE ${pageNum} OF ${totalPadded}`;
    const pcW = bold.widthOfTextAtSize(pageCountText, 8);
    p.drawText(safe(pageCountText, bold), {
      x: W - M - pcW,
      y: H - 57,
      size: 8,
      font: bold,
      color: muted,
    });

    p.drawLine({
      start: { x: M, y: H - 73 },
      end: { x: W - M, y: H - 73 },
      thickness: 0.6,
      color: rule,
    });

    // Running Footer
    p.drawLine({
      start: { x: M, y: 66 },
      end: { x: W - M, y: 66 },
      thickness: 0.6,
      color: rule,
    });

    // Disclaimer Line 1
    p.drawText(safe(LABEL_GUIDE, regular), {
      x: M,
      y: 53,
      size: 7.2,
      font: regular,
      color: muted,
    });

    // Disclaimer Line 2
    const notCredit = REPORT_DISCLAIMER;
    p.drawText(safe(notCredit, bold), {
      x: M,
      y: 41,
      size: 7.2,
      font: bold,
      color: darkPlum,
    });

    const footerPageText = `Page ${i + 1} of ${totalPages} · PAGE ${pageNum} OF ${totalPadded}`;
    const fpW = bold.widthOfTextAtSize(footerPageText, 7.5);
    p.drawText(safe(footerPageText, bold), {
      x: W - M - fpW,
      y: 41,
      size: 7.5,
      font: bold,
      color: muted,
    });

    // Disclaimer Line 3
    const reportIdentText = `PARAKH · REPORT #${report.reportId} · ${report.searchedIdentifier}`;
    p.drawText(safe(reportIdentText, regular), {
      x: M,
      y: 29,
      size: 7,
      font: regular,
      color: muted,
    });

    const fnW = regular.widthOfTextAtSize(FICTION_NOTICE, 7);
    p.drawText(safe(FICTION_NOTICE, regular), {
      x: W - M - fnW,
      y: 29,
      size: 7,
      font: regular,
      color: muted,
    });
  }

  return pdf.save();
}
