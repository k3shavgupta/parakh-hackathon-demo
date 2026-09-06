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
  const subdued = rgb(0.314, 0.267, 0.302); // #50444d - Subdued body
  const wash = rgb(0.984, 0.969, 0.980); // #fcf7fa - Soft card wash
  const blush = rgb(0.949, 0.890, 0.929); // #f2e3ed - Chip track / tint
  const rule = rgb(0.922, 0.875, 0.906); // #ebdfe7 - Section divider
  const hairline = rgb(0.941, 0.902, 0.929); // #f0e6ed - Row divider
  const border = rgb(0.922, 0.843, 0.898); // #ebd7e5 - Container stroke
  const white = rgb(1, 1, 1);

  // Status Badge Colors
  const statusClear = {
    fill: rgb(0.937, 0.976, 0.953), // #eff9f3
    stroke: rgb(0.804, 0.922, 0.839), // #cdebd6
    text: rgb(0.122, 0.420, 0.227), // #1f6b3a
  };
  const statusFlag = {
    fill: rgb(1.0, 0.941, 0.945), // #fff0f1
    stroke: rgb(0.988, 0.816, 0.827), // #fcd0d3
    text: rgb(0.643, 0.149, 0.173), // #a4262c
  };
  const statusNote = {
    fill: rgb(0.961, 0.941, 0.957), // #f5f0f4
    stroke: rgb(0.906, 0.875, 0.898), // #e7dfe5
    text: rgb(0.420, 0.353, 0.404), // #6b5a67
  };
  const statusUnavailable = {
    fill: rgb(1.0, 0.965, 0.910), // #fff6e8
    stroke: rgb(0.984, 0.851, 0.784), // #fbd9c8
    text: rgb(0.604, 0.357, 0.157), // #9a5b28
  };

  // Dimensions
  const W = 595.28;
  const H = 841.89;
  const M = 36;
  const CW = W - 2 * M; // 523.28
  const contentFloor = 80; // Safe bottom limit for content above footer

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

  const drawBadge = (
    targetPage: PDFPage,
    badgeLabel: string,
    x: number,
    baselineY: number,
    width = 68,
    height = 16,
  ) => {
    let cfg = statusNote;
    if (badgeLabel === 'CLEAR') cfg = statusClear;
    else if (badgeLabel === 'FLAG') cfg = statusFlag;
    else if (badgeLabel === 'UNAVAILABLE') cfg = statusUnavailable;

    const pillTopY = baselineY + 10.5;
    drawRoundedCard(targetPage, x, pillTopY, width, height, height / 2, cfg.fill, cfg.stroke, 0.5);

    const textW = bold.widthOfTextAtSize(badgeLabel, 7);
    const textX = x + (width - textW) / 2;
    targetPage.drawText(safe(badgeLabel, bold), {
      x: textX,
      y: baselineY,
      size: 7,
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
  // PAGE 1: 15-SECOND DECISION BRIEF
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

  y = 744;
  draw(primaryTitle, M, y, 16, bold, ink);
  y -= 15;
  if (subTitle) {
    draw(subTitle, M, y, 9.5, regular, subdued);
  }

  const rightMetaX = W - M - 165;
  draw(`REPORT #${report.reportId}`, rightMetaX, 744, 7.5, bold, darkPlum);
  draw(`SEARCHED ${report.generatedAt}`, rightMetaX, 730, 7.5, regular, muted);

  y -= 16;
  draw('Prepared for ', M, y, 8.5, regular, muted);
  draw('Demo viewer', M + regular.widthOfTextAtSize('Prepared for ', 8.5), y, 8.5, bold, ink);

  y -= 12;
  page.drawLine({
    start: { x: M, y },
    end: { x: W - M, y },
    thickness: 0.75,
    color: rule,
  });

  // 2. 4-Column Metadata Grid
  y -= 14;
  const colW = CW / 4;
  const cols = [
    { label: 'G S T I N', value: report.searchedIdentifier },
    { label: 'P A N', value: report.business.syntheticPanPattern },
    { label: 'S T A T E', value: report.business.registrationState },
    { label: 'C O N S T I T U T I O N', value: report.business.constitution },
  ];

  const gridTopY = y;
  cols.forEach((col, index) => {
    const colX = M + index * colW;
    draw(col.label, colX, gridTopY, 6.5, bold, muted);
    draw(col.value, colX, gridTopY - 13, 8.5, bold, ink);
    if (index > 0) {
      page.drawLine({
        start: { x: colX - 10, y: gridTopY + 4 },
        end: { x: colX - 10, y: gridTopY - 17 },
        thickness: 0.5,
        color: rule,
      });
    }
  });

  y -= 26;
  page.drawLine({
    start: { x: M, y },
    end: { x: W - M, y },
    thickness: 0.5,
    color: rule,
  });

  // 3. Registered Address Row
  y -= 14;
  draw('REGISTERED ADDRESS', M, y, 6.5, bold, muted);
  const addrLines = wrap(report.business.syntheticAddress, regular, 8, CW - 130);
  let curAddrY = y;
  for (const line of addrLines) {
    draw(line, M + 125, curAddrY, 8, regular, ink);
    curAddrY -= 10.5;
  }
  y = Math.min(y - 12, curAddrY - 2);

  page.drawLine({
    start: { x: M, y },
    end: { x: W - M, y },
    thickness: 0.5,
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
    const detailLines = wrap(detailText, regular, 8, CW - 125 - 75);
    const rowHeight = Math.max(26, 15 + detailLines.length * 10.5 + 5);

    ensure(rowHeight);

    const rowBaselineY = y - 11;
    draw(categoryLabel, M, rowBaselineY, 7.5, bold, muted);
    draw(headline, M + 125, rowBaselineY, 9, bold, ink);

    let detailY = rowBaselineY - 11;
    for (const line of detailLines) {
      draw(line, M + 125, detailY, 8, regular, subdued);
      detailY -= 10.5;
    }

    const badgeW = 68;
    const badgeH = 16;
    const badgeX = W - M - badgeW;
    drawBadge(page, badgeLabel, badgeX, rowBaselineY, badgeW, badgeH);

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

  // GST Return Filing Row
  const filingStatusDesc =
    sections.filingLabel === 'FLAG'
      ? 'Filing history shows delays'
      : sections.filingLabel === 'NOTE'
        ? 'Filing history unavailable'
        : 'Returns filed on time';
  const filingDesc = `${sections.counts.periods} fixture periods. GSTR-3B: ${sections.counts.gstr3b.onTime} on time, ${sections.counts.gstr3b.late} late.`;
  renderFindingRow(
    'GST RETURN FILING',
    filingStatusDesc,
    filingDesc,
    sections.filingLabel,
  );

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

  // 5. "What this check could not find" Callout Box
  y -= 8;
  const cannotFindInline =
    report.cannotFind.length > 0
      ? report.cannotFind.join(' · ')
      : 'No live systems were queried.';
  const cannotFindLines = wrap(cannotFindInline, regular, 7.5, CW - 24);

  if (report.cannotFind.length > 6) {
    ensure(36);
    draw('What this check could not find', M, y - 10, 8.5, bold, darkPlum);
    y -= 18;
    for (const item of report.cannotFind) {
      const itemLines = wrap(`- ${item}`, regular, 7.5, CW);
      ensure(itemLines.length * 10 + 2);
      for (const line of itemLines) {
        draw(line, M, y, 7.5, regular, subdued);
        y -= 10;
      }
    }
  } else {
    const cannotBoxHeight = 18 + cannotFindLines.length * 10.5 + 4;
    ensure(cannotBoxHeight);
    drawRoundedCard(page, M, y, CW, cannotBoxHeight, 6, wash, border, 0.5);

    draw('What this check could not find.', M + 12, y - 12, 7.5, bold, darkPlum);
    const titleW = bold.widthOfTextAtSize('What this check could not find. ', 7.5);
    draw('No live systems were queried.', M + 12 + titleW, y - 12, 7.5, regular, muted);

    let cfY = y - 22;
    for (const line of cannotFindLines) {
      draw(line, M + 12, cfY, 7.5, regular, subdued);
      cfY -= 10;
    }
    y -= cannotBoxHeight + 8;
  }

  // 6. "NEXT CHECK" Callout Box
  const nextCheckText = nextCheck(report);
  const nextCheckLines = wrap(nextCheckText, regular, 8, CW - 110);
  const nextCheckHeight = Math.max(28, 14 + nextCheckLines.length * 10.5);

  ensure(nextCheckHeight);
  drawRoundedCard(page, M, y, CW, nextCheckHeight, 6, wash, border, 0.5);

  draw('NEXT CHECK', M + 12, y - 15, 7.5, bold, plum);
  let ncY = y - 15;
  for (const line of nextCheckLines) {
    draw(line, M + 96, ncY, 8, regular, ink);
    ncY -= 10.5;
  }
  y -= nextCheckHeight + 12;

  // ==========================================
  // SUBSEQUENT PAGES: COURT & PUBLIC RECORDS
  // ==========================================
  if (report.publicRecords.length > 0) {
    newPage();

    draw('The court records, in full', M, y, 15, bold, ink);
    y -= 14;
    draw(
      'Business-name records are separated from verified related-person records. A name match is not identity confirmation.',
      M,
      y,
      8.5,
      regular,
      muted,
    );
    y -= 14;

    // Disclaimer Callout
    const disclaimerHeight = 36;
    drawRoundedCard(page, M, y, CW, disclaimerHeight, 6, wash, border, 0.5);
    draw(
      'Identity is not verified on any record below. The court record carries a party name and state, not PAN, address, or',
      M + 12,
      y - 11,
      7.5,
      regular,
      subdued,
    );
    draw(
      'registration number. Each record is graded on name and state similarity, never confirmed as the same party.',
      M + 12,
      y - 20,
      7.5,
      regular,
      subdued,
    );
    draw(
      `${EVIDENCE_SOURCE} · bounded exact phrase passes · SEARCHED · ${report.generatedAt}`,
      M + 12,
      y - 29,
      7,
      regular,
      muted,
    );
    y -= disclaimerHeight + 14;

    draw('BUSINESS-NAME MATCHES', M, y, 7.5, bold, muted);
    y -= 12;

    for (const record of report.publicRecords) {
      const state = reasoning[record.id];
      const factors = state?.status === 'success' ? state.result.factors ?? [] : [];
      const justification =
        state?.status === 'success'
          ? state.result.justification
          : reasoningText(record, state);

      const justificationLines = wrap(justification, regular, 8, CW - 36);
      const hasFactors = factors.length > 0;
      const factorRowsHeight = hasFactors ? 18 : 0;

      const metaLine1 = `MATCHED BUSINESS: ${record.matchedEntity}  ·  SEARCH BASIS ${record.matchBasis}  ·  PROCEEDING ${record.proceedingType.toUpperCase()}`;
      const metaLines1 = wrap(metaLine1, regular, 7, CW - 24);
      const idEvidenceLine = `Identity evidence: ${record.identityEvidence}`;
      const idLines = wrap(idEvidenceLine, regular, 7, CW - 24);

      const metaHeight = 36 + metaLines1.length * 10.5 + 11 + 11 + idLines.length * 10.5 + 12;
      const reasoningBoxHeight =
        24 + factorRowsHeight + justificationLines.length * 10.5 + 24;
      const totalCardHeight = metaHeight + reasoningBoxHeight + 14;

      if (y - totalCardHeight < contentFloor) {
        newPage();
        draw('Court records, continued', M, y, 15, bold, ink);
        y -= 14;
        draw(
          'Business-name records are separated from verified related-person records. A name match is not identity confirmation.',
          M,
          y,
          8.5,
          regular,
          muted,
        );
        y -= 14;

        const contHeight = 22;
        drawRoundedCard(page, M, y, CW, contHeight, 6, wash, border, 0.5);
        draw(
          'Continuation. The records on this page follow the same identity warning and source scope as the first court-record page.',
          M + 12,
          y - 14,
          7.5,
          regular,
          subdued,
        );
        y -= contHeight + 14;
        draw('BUSINESS-NAME MATCHES', M, y, 7.5, bold, muted);
        y -= 12;
      }

      // Draw Court Card Container
      drawRoundedCard(page, M, y, CW, totalCardHeight, 8, white, border, 0.75);

      // Card Header strip
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

      const roleW = bold.widthOfTextAtSize(roleText, 7) + 16;
      drawRoundedCard(page, M + 12, headerTopY, roleW, 16, 8, roleCfg.fill, roleCfg.stroke, 0.5);
      draw(roleText, M + 20, headerTopY - 11, 7, bold, roleCfg.text);

      const titleProceeding = (
        record.category === 'registry'
          ? 'REGISTRY ENTRY'
          : record.proceedingType || record.caseReference
      ).toUpperCase();
      const maxTitleW = CW - roleW - 140;
      const titleProceedingTrimmed =
        bold.widthOfTextAtSize(titleProceeding, 8.5) > maxTitleW
          ? titleProceeding.slice(0, 32) + '...'
          : titleProceeding;
      draw(titleProceedingTrimmed, M + 16 + roleW, headerTopY - 11, 8.5, bold, ink);

      const matchGrade = fixtureMatchGrade(record);
      const gradeW = bold.widthOfTextAtSize(matchGrade, 7) + 14;
      const gradeX = W - M - gradeW - 12;
      drawRoundedCard(page, gradeX, headerTopY, gradeW, 16, 8, wash, border, 0.5);
      draw(matchGrade, gradeX + 7, headerTopY - 11, 7, bold, darkPlum);

      page.drawLine({
        start: { x: M, y: y - 26 },
        end: { x: W - M, y: y - 26 },
        thickness: 0.5,
        color: hairline,
      });

      // Card Meta Lines
      let curCardY = y - 37;
      for (const line of metaLines1) {
        draw(line, M + 12, curCardY, 7, regular, subdued);
        curCardY -= 10.5;
      }
      draw(`${record.caseReference}  ·  filed ${record.filedYear}`, M + 12, curCardY, 7, regular, subdued);
      curCardY -= 11;
      draw(record.courtName, M + 12, curCardY, 8, bold, ink);
      curCardY -= 11;
      for (const line of idLines) {
        draw(line, M + 12, curCardY, 7, regular, subdued);
        curCardY -= 10.5;
      }
      curCardY -= 12;

      // AI Attribution Reasoning Sub-panel
      drawRoundedCard(page, M + 12, curCardY, CW - 24, reasoningBoxHeight, 6, wash, border, 0.5);

      let rY = curCardY - 12;
      draw('AI Attribution Reasoning', M + 22, rY, 8.5, bold, darkPlum);
      rY -= 14;

      if (hasFactors) {
        let chipX = M + 22;
        for (const factor of factors) {
          const factorText = `${factor.label}: ${factor.verdict}`;
          const fW = bold.widthOfTextAtSize(factorText, 7) + 12;
          drawRoundedCard(page, chipX, rY + 8, fW, 14, 7, blush, undefined, 0);
          draw(factorText, chipX + 6, rY - 2, 7, bold, plum);
          chipX += fW + 6;
        }
        rY -= 15;
      }

      for (const line of justificationLines) {
        draw(line, M + 22, rY, 8, regular, ink);
        rY -= 10.5;
      }
      rY -= 2;

      const confValue = state?.status === 'success' ? state.result.confidence : 'Medium';
      const confLabel = `Confidence ${confValue}`;
      draw(confLabel, M + 22, rY, 7.5, bold, darkPlum);
      const confLabelW = bold.widthOfTextAtSize(confLabel, 7.5);

      const gaugeX = M + 22 + confLabelW + 6;
      const gaugeTopY = rY + 6;
      const gaugeW = 54;
      const gaugeH = 5;
      drawRoundedCard(page, gaugeX, gaugeTopY, gaugeW, gaugeH, 2.5, blush);

      const pct = confidencePercent(confValue);
      const fillW = Math.max(2, (gaugeW * pct) / 100);
      drawRoundedCard(page, gaugeX, gaugeTopY, fillW, gaugeH, 2.5, plum);

      const decisionStr =
        state?.status === 'success'
          ? ` · Decision ${state.result.decision.replaceAll('_', ' ')}`
          : ` · Fixture grade ${record.signal}`;
      draw(decisionStr, gaugeX + gaugeW + 4, rY, 7.5, regular, muted);
      rY -= 11;

      draw(
        state?.status === 'success'
          ? 'Runtime AI response · Factors and confidence weighed by model.'
          : 'Runtime AI response or explicitly labeled fixture fallback.',
        M + 22,
        rY,
        6.8,
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
      p.drawImage(logo, { x: M, y: H - 43, width: 79, height: 18 });
      p.drawText('|', {
        x: M + 87,
        y: H - 39,
        size: 13,
        font: regular,
        color: rgb(0.847, 0.714, 0.812),
      });
      const headerSub =
        i === 0 ? 'FACTUAL DUE DILIGENCE ENGINE' : 'WHAT IT MEANS, AND WHAT IT MISSED';
      p.drawText(headerSub, {
        x: M + 98,
        y: H - 38,
        size: 7,
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
        size: 10.5,
        font: bold,
        color: plum,
      });
    }

    const refText = `REF: ${report.reportId}`;
    const refW = bold.widthOfTextAtSize(refText, 7.5);
    p.drawText(safe(refText, bold), {
      x: W - M - refW,
      y: H - 35,
      size: 7.5,
      font: bold,
      color: darkPlum,
    });

    const dateText = report.generatedAt;
    const dateW = regular.widthOfTextAtSize(dateText, 7.5);
    p.drawText(safe(dateText, regular), {
      x: W - M - dateW,
      y: H - 46,
      size: 7.5,
      font: regular,
      color: muted,
    });

    const pageCountText = `PAGE ${pageNum} OF ${totalPadded}`;
    const pcW = bold.widthOfTextAtSize(pageCountText, 7.5);
    p.drawText(safe(pageCountText, bold), {
      x: W - M - pcW,
      y: H - 57,
      size: 7.5,
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

    // Disclaimer Line 1 (LABEL_GUIDE contains FLAG:, CLEAR:, NOTE:)
    p.drawText(safe(LABEL_GUIDE, regular), {
      x: M,
      y: 53,
      size: 6.8,
      font: regular,
      color: muted,
    });

    // Disclaimer Line 2
    const notCredit = REPORT_DISCLAIMER;
    p.drawText(safe(notCredit, bold), {
      x: M,
      y: 41,
      size: 6.8,
      font: bold,
      color: darkPlum,
    });

    const footerPageText = `Page ${i + 1} of ${totalPages} · PAGE ${pageNum} OF ${totalPadded}`;
    const fpW = bold.widthOfTextAtSize(footerPageText, 7);
    p.drawText(safe(footerPageText, bold), {
      x: W - M - fpW,
      y: 41,
      size: 7,
      font: bold,
      color: muted,
    });

    // Disclaimer Line 3 (Report ID and Fiction notice)
    const reportIdentText = `PARAKH · REPORT #${report.reportId} · ${report.searchedIdentifier}`;
    p.drawText(safe(reportIdentText, regular), {
      x: M,
      y: 29,
      size: 6.5,
      font: regular,
      color: muted,
    });

    const fnW = regular.widthOfTextAtSize(FICTION_NOTICE, 6.5);
    p.drawText(safe(FICTION_NOTICE, regular), {
      x: W - M - fnW,
      y: 29,
      size: 6.5,
      font: regular,
      color: muted,
    });
  }

  return pdf.save();
}
