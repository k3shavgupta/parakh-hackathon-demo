import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';
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

function reasoningText(
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
      // Split long identifiers too; never let an unbroken token cross a margin.
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
        } else line = candidate;
      }
    }
    lines.push(line);
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
      const response = await fetch(path);
      return response.ok ? new Uint8Array(await response.arrayBuffer()) : null;
    } catch {
      return null;
    }
  };
  const [regularBytes, boldBytes, serifBytes, logoBytes] = await Promise.all(
    [
      '/fonts/Onest-Regular.ttf',
      '/fonts/Onest-Semibold.ttf',
      '/fonts/InstrumentSerif-Italic.ttf',
      '/assets/logo-horizontal.png',
    ].map(asset),
  );
  const font = async (bytes: Uint8Array | null, fallback: StandardFonts) => {
    try {
      if (bytes) return await pdf.embedFont(bytes, { subset: true });
    } catch {
      /* Graceful local export when a font asset fails. */
    }
    return pdf.embedFont(fallback);
  };
  const regular = await font(regularBytes, StandardFonts.Helvetica);
  const bold = await font(boldBytes, StandardFonts.HelveticaBold);
  const serif = await font(serifBytes, StandardFonts.TimesRomanItalic);
  let logo = null;
  try {
    if (logoBytes) logo = await pdf.embedPng(logoBytes);
  } catch {
    /* Text brand remains. */
  }
  const color = (hex: string) =>
    rgb(
      parseInt(hex.slice(1, 3), 16) / 255,
      parseInt(hex.slice(3, 5), 16) / 255,
      parseInt(hex.slice(5, 7), 16) / 255,
    );
  const ink = color('#201b1e'),
    plum = color('#7a336f'),
    dark = color('#5f2857'),
    muted = color('#766673'),
    wash = color('#fbf0f6'),
    blush = color('#f2e3ed'),
    rule = color('#eaddE6');
  const W = 595.28,
    H = 841.89,
    M = 38,
    CW = W - 2 * M,
    bottom = 102;
  let page = pdf.addPage([W, H]),
    y = H - 100;
  const safe = (text: string, font: PDFFont) =>
    Array.from(text)
      .map((char) => {
        try {
          font.encodeText(char);
          return char;
        } catch {
          return '-';
        }
      })
      .join('');
  const lines = (text: string, font = regular, size = 9, width = CW) =>
    wrap(safe(text, font), font, size, width);
  const draw = (
    text: string,
    x: number,
    top: number,
    size = 9,
    font = regular,
    fill = ink,
  ) => page.drawText(safe(text, font), { x, y: top, size, font, color: fill });
  const newPage = () => {
    page = pdf.addPage([W, H]);
    y = H - 100;
  };
  const ensure = (height: number) => {
    if (y - height < bottom) newPage();
  };
  const text = (
    value: string,
    size = 9,
    font = regular,
    fill = ink,
    indent = 0,
    width = CW - indent,
  ) => {
    for (const line of lines(value, font, size, width)) {
      ensure(size * 1.45);
      draw(line, M + indent, y, size, font, fill);
      y -= size * 1.45;
    }
  };
  const badge = (value: string) => {
    const labelColor =
      value === 'FLAG'
        ? color('#a33f4a')
        : value === 'CLEAR'
          ? color('#2d6a48')
          : color('#80551f');
    const fill =
      value === 'FLAG'
        ? color('#fff0f1')
        : value === 'CLEAR'
          ? color('#eff9f3')
          : color('#fff6e8');
    page.drawRectangle({
      x: W - M - 48,
      y: y - 4,
      width: 48,
      height: 17,
      color: fill,
    });
    draw(value, W - M - 40, y + 1, 7, bold, labelColor);
  };
  const heading = (title: string, label?: string) => {
    ensure(58);
    y -= 6;
    page.drawLine({
      start: { x: M, y: y + 13 },
      end: { x: W - M, y: y + 13 },
      thickness: 0.6,
      color: rule,
    });
    draw(title, M, y, 9, bold, dark);
    if (label) badge(label);
    y -= 19;
  };
  const rounded = (
    x: number,
    top: number,
    width: number,
    height: number,
    radius: number,
    fill: ReturnType<typeof rgb>,
  ) => {
    page.drawSvgPath(
      `M ${radius} 0 H ${width - radius} Q ${width} 0 ${width} ${radius} V ${height - radius} Q ${width} ${height} ${width - radius} ${height} H ${radius} Q 0 ${height} 0 ${height - radius} V ${radius} Q 0 0 ${radius} 0 Z`,
      { x, y: top, color: fill },
    );
  };
  const card = (title: string, body: string, detail?: string) => {
    const bodyLines = lines(body, regular, 10, CW - 28);
    const detailLines = detail ? lines(detail, regular, 8, CW - 28) : [];
    const height = 42 + bodyLines.length * 14 + detailLines.length * 11;
    ensure(height + 12);
    rounded(M, y + 14, CW, height, 12, wash);
    draw(title, M + 14, y - 3, 10, bold, dark);
    y -= 24;
    for (const line of bodyLines) {
      draw(line, M + 14, y, 10);
      y -= 14;
    }
    if (detailLines.length) {
      y -= 4;
      for (const line of detailLines) {
        draw(line, M + 14, y, 8, regular, muted);
        y -= 11;
      }
    }
    y -= 22;
  };
  const attributionCard = (
    record: SyntheticReport['publicRecords'][number],
    state?: ReportAiReasoningState,
  ) => {
    if (state?.status !== 'success') {
      card(
        'AI Attribution Reasoning',
        reasoningText(record, state),
        'Runtime AI response or explicitly labeled fixture fallback.',
      );
      return;
    }

    const res = state.result;
    const factors = res.factors ?? [];
    const justificationLines = lines(res.justification, regular, 9.5, CW - 28);
    const hasFactors = factors.length > 0;
    const factorsHeight = hasFactors ? 20 : 0;
    const height =
      36 +
      factorsHeight +
      justificationLines.length * 13.5 +
      18 + // confidence gauge row
      14; // footer detail
    ensure(height + 12);
    rounded(M, y + 14, CW, height, 12, wash);
    draw('AI Attribution Reasoning', M + 14, y - 3, 10, bold, dark);
    y -= 22;

    if (hasFactors) {
      let curX = M + 14;
      for (const factor of factors) {
        const factorText = `${factor.label}: ${factor.verdict}`;
        const factorW = bold.widthOfTextAtSize(factorText, 7.5) + 12;
        if (curX + factorW > M + CW - 14) {
          y -= 16;
          curX = M + 14;
        }
        page.drawRectangle({
          x: curX,
          y: y - 3,
          width: factorW,
          height: 14,
          color: blush,
        });
        draw(factorText, curX + 6, y, 7.5, bold, plum);
        curX += factorW + 6;
      }
      y -= 17;
    }

    for (const line of justificationLines) {
      draw(line, M + 14, y, 9.5);
      y -= 13.5;
    }
    y -= 3;

    // Confidence gauge row
    const confLabel = `Confidence ${res.confidence}`;
    draw(confLabel, M + 14, y, 8, bold, dark);
    const confLabelW = bold.widthOfTextAtSize(confLabel, 8);
    const gaugeX = M + 14 + confLabelW + 6;
    const gaugeY = y - 1;
    const gaugeW = 54;
    const gaugeH = 6;
    page.drawRectangle({
      x: gaugeX,
      y: gaugeY,
      width: gaugeW,
      height: gaugeH,
      color: blush,
    });
    const pct = confidencePercent(res.confidence);
    const fillW = Math.max(2, (gaugeW * pct) / 100);
    page.drawRectangle({
      x: gaugeX,
      y: gaugeY,
      width: fillW,
      height: gaugeH,
      color: plum,
    });

    const decText = ` · Decision ${res.decision.replaceAll('_', ' ')}`;
    draw(decText, gaugeX + gaugeW + 4, y, 8, regular, muted);
    y -= 14;

    draw(
      'Runtime AI response · Factors and confidence weighed by model.',
      M + 14,
      y,
      7.5,
      regular,
      muted,
    );
    y -= 18;
  };
  const facts = (pairs: [string, string][], columns = 2) => {
    const gap = 16,
      cellWidth = (CW - gap * (columns - 1)) / columns;
    for (let index = 0; index < pairs.length; index += columns) {
      const row = pairs.slice(index, index + columns);
      const height =
        Math.max(
          ...row.map(([, value]) => lines(value, regular, 9, cellWidth).length),
        ) *
          12 +
        23;
      ensure(height);
      row.forEach(([label, value], column) => {
        const x = M + column * (cellWidth + gap);
        draw(label, x, y, 7, regular, muted);
        lines(value, regular, 9, cellWidth).forEach((line, i) =>
          draw(line, x, y - 14 - i * 12, 9),
        );
      });
      y -= height;
    }
  };
  const sections = reportSections(report);
  
  const summaryDetail =
    summary.status === 'success'
      ? `${summary.result.key_signal ? `Key finding: ${summary.result.key_signal} ` : ''}AI generated from fictional evidence and record attributions.`
      : 'Fixture findings remain available below.';

  y -= 10;
  page.drawLine({
    start: { x: M, y: y },
    end: { x: W - M, y: y },
    thickness: 1.5,
    color: dark,
  });
  y -= 25;
  
  draw(report.business.tradeName.toUpperCase(), M, y, 20, bold, ink);
  y -= 15;
  draw(report.business.legalName, M, y, 10, regular, ink);
  
  const rightMetaX = W - M - 180;
  draw(`REPORT ${report.reportId}`, rightMetaX, y + 15, 8, regular, muted);
  draw(`SEARCHED ${report.generatedAt}`, rightMetaX, y, 8, regular, muted);
  
  y -= 20;
  draw(`Prepared for `, M, y, 9, regular, ink);
  draw(`Demo viewer`, M + regular.widthOfTextAtSize('Prepared for ', 9), y, 9, bold, ink);
  y -= 15;
  
  page.drawLine({
    start: { x: M, y: y },
    end: { x: W - M, y: y },
    thickness: 0.5,
    color: muted,
  });
  y -= 15;
  
  const gridY = y;
  draw('GSTIN', M, gridY, 7, regular, muted);
  draw(report.searchedIdentifier, M, gridY - 12, 9, bold, ink);
  
  draw('PAN', M + 130, gridY, 7, regular, muted);
  draw(report.business.syntheticPanPattern, M + 130, gridY - 12, 9, bold, ink);
  
  draw('STATE', M + 260, gridY, 7, regular, muted);
  draw(report.business.registrationState, M + 260, gridY - 12, 9, bold, ink);
  
  draw('CONSTITUTION', M + 380, gridY, 7, regular, muted);
  draw(report.business.constitution, M + 380, gridY - 12, 9, bold, ink);
  
  page.drawLine({
    start: { x: M + 120, y: gridY + 5 },
    end: { x: M + 120, y: gridY - 15 },
    thickness: 0.5,
    color: muted,
  });
  page.drawLine({
    start: { x: M + 250, y: gridY + 5 },
    end: { x: M + 250, y: gridY - 15 },
    thickness: 0.5,
    color: muted,
  });
  page.drawLine({
    start: { x: M + 370, y: gridY + 5 },
    end: { x: M + 370, y: gridY - 15 },
    thickness: 0.5,
    color: muted,
  });
  
  y -= 30;
  page.drawLine({
    start: { x: M, y: y },
    end: { x: W - M, y: y },
    thickness: 0.5,
    color: muted,
  });
  y -= 18;
  
  draw('REGISTERED ADDRESS', M, y, 7, bold, muted);
  draw(report.business.syntheticAddress, M + 130, y, 9, regular, ink);
  
  y -= 15;
  page.drawLine({
    start: { x: M, y: y },
    end: { x: W - M, y: y },
    thickness: 0.5,
    color: muted,
  });
  y -= 25;
  
  let tempY = y;
  const drawRowDry = (desc) => {
    const descLines = lines(desc, regular, 9, CW - 180);
    tempY -= 32;
    tempY -= (descLines.length * 12);
    tempY -= 10;
  };
  
  const filingStatusDesc = sections.filingLabel === 'FLAG' ? 'Filing history shows delays' : sections.filingLabel === 'NOTE' ? 'Filing history unavailable' : 'Returns filed on time';
  const filingDesc = `${sections.counts.periods} fixture periods. GSTR-3B: ${sections.counts.gstr3b.onTime} on time, ${sections.counts.gstr3b.late} late.`;
  const courtTitle = sections.courtRecords.length ? `${sections.courtRecords.length} records were returned for review` : 'No records found';
  
  const aiDescDry = summaryCopy(summary) + (summaryDetail ? ' \n' + summaryDetail : '');
  drawRowDry(aiDescDry);
  drawRowDry(sections.identity.detail);
  drawRowDry(`Registered: ${report.business.registeredDate} (fictional)`);
  drawRowDry(filingDesc);
  drawRowDry(sections.courtDetail);
  drawRowDry(report.business.context);
  
  let limitsHeight = 15 + 13 + (report.cannotFind.length * 13) + 10;
  
  const boxTopY = y;
  const boxHeight = (boxTopY - tempY) + limitsHeight;
  
  rounded(M, boxTopY - boxHeight, CW, boxHeight, 10, color('#ffffff'));
  page.drawSvgPath(
    `M 0 ${limitsHeight} H ${CW} V 10 Q ${CW} 0 ${CW - 10} 0 H 10 Q 0 0 0 10 Z`,
    { x: M, y: boxTopY - boxHeight, color: wash },
  );
  page.drawSvgPath(
    `M 10 ${boxHeight} H ${CW - 10} Q ${CW} ${boxHeight} ${CW} ${boxHeight - 10} V 10 Q ${CW} 0 ${CW - 10} 0 H 10 Q 0 0 0 10 V ${boxHeight - 10} Q 0 ${boxHeight} 10 ${boxHeight} Z`,
    { x: M, y: boxTopY - boxHeight, borderColor: muted, borderWidth: 0.5 },
  );
  
  const drawRow = (label, title, desc, badgeLabel) => {
    const rowTop = y;
    draw(label, M + 15, y - 20, 8, bold, muted);
    draw(title, M + 130, y - 20, 10, bold, ink);
    const descLines = lines(desc, regular, 9, CW - 180);
    let curY = y - 32;
    for (const line of descLines) {
      draw(line, M + 130, curY, 9, regular, ink);
      curY -= 12;
    }
    
    const badgeColor = badgeLabel === 'FLAG' ? color('#a33f4a') : badgeLabel === 'CLEAR' ? color('#2d6a48') : badgeLabel === 'NOTE' ? color('#5d4357') : color('#a33f4a');
    const badgeFill = badgeLabel === 'FLAG' ? color('#fff0f1') : badgeLabel === 'CLEAR' ? color('#eff9f3') : badgeLabel === 'NOTE' ? color('#fbf2f7') : color('#fff0f1');
    const bWidth = 60;
    
    rounded(W - M - bWidth - 15, y - 26, bWidth, 16, 8, badgeFill);
    const bTextW = bold.widthOfTextAtSize(badgeLabel, 7);
    draw(badgeLabel, W - M - bWidth - 15 + (bWidth - bTextW) / 2, y - 15, 7, bold, badgeColor);
    
    const rowHeight = rowTop - curY + 10;
    y -= rowHeight;
    page.drawLine({
      start: { x: M, y: y },
      end: { x: W - M, y: y },
      thickness: 0.5,
      color: muted,
    });
  };
  
  
  const aiTitle = summary.status === 'success' ? 'AI generated' : summary.status === 'loading' ? 'Thinking' : 'Unavailable';
  const aiDesc = summaryCopy(summary) + (summaryDetail ? ' \n' + summaryDetail : '');
  drawRow('AI Summary', aiTitle, aiDesc, summary.status === 'success' ? 'CLEAR' : 'NOTE');
  
  drawRow('IDENTITY', `${report.business.legalName} is identified on the register`, sections.identity.detail, sections.identity.label);
  drawRow('REGISTRATION', `Registration status: ${report.business.registrationStatus}`, `Registered: ${report.business.registeredDate} (fictional)`, sections.registrationLabel);
  drawRow('GST RETURN FILING', filingStatusDesc, filingDesc, sections.filingLabel);
  drawRow('COURT RECORDS', courtTitle, sections.courtDetail, sections.courtLabel);
  drawRow('ENTITY CONTEXT', `Entity type: ${report.business.constitution}`, report.business.context, 'NOTE');
  
  let limitsY = y - 18;
  draw('What this check could not find.', M + 15, limitsY, 9, bold, dark);
  draw('No live systems were queried.', M + 15 + bold.widthOfTextAtSize('What this check could not find. ', 9), limitsY, 9, regular, dark);
  limitsY -= 13;
  for (const item of report.cannotFind) {
      draw(item, M + 15, limitsY, 9, regular, dark);
      limitsY -= 13;
  }
  y -= limitsHeight;
  y -= 15;
  
  const nextCheckLines = lines(nextCheck(report), regular, 9, CW - 130);
  const nextCheckHeight = 25 + (nextCheckLines.length * 12);
  rounded(M, y - nextCheckHeight, CW, nextCheckHeight, 6, wash);
  page.drawSvgPath(
    `M 6 ${nextCheckHeight} H ${CW - 6} Q ${CW} ${nextCheckHeight} ${CW} ${nextCheckHeight - 6} V 6 Q ${CW} 0 ${CW - 6} 0 H 6 Q 0 0 0 6 V ${nextCheckHeight - 6} Q 0 ${nextCheckHeight} 6 ${nextCheckHeight} Z`,
    { x: M, y: y - nextCheckHeight, borderColor: color('#ebd7e5'), borderWidth: 0.5 },
  );
  draw('NEXT CHECK', M + 15, y - 20, 8, bold, plum);
  let ncy = y - 20;
  for (const line of nextCheckLines) {
    draw(line, M + 110, ncy, 9, regular, ink);
    ncy -= 12;
  }
  y -= (nextCheckHeight + 15);

newPage();
  text('Scope and follow-up', 8, bold, plum);
  y -= 8;
  text('Read with context', 26, serif, plum);
  y -= 12;
  text(report.business.legalName, 9, regular, muted);
  y -= 20;
  heading('COURT RECORDS', sections.courtLabel);
  text(sections.courtDetail);
  y -= 7;
  text(
    `Source: ${EVIDENCE_SOURCE} · Synthetic/demo records only.`,
    8,
    regular,
    muted,
  );
  if (sections.registryRecords.length)
    text(
      `${sections.registryRecords.length} separate registry candidate(s) appear in the evidence details. These are not court records.`,
      8,
      regular,
      muted,
    );
  y -= 20;
  heading('ENTITY CONTEXT', 'NOTE');
  text(report.business.context);
  y -= 20;
  heading('What this check could not find');
  report.cannotFind.forEach((item) => {
    text(`- ${item}`);
    y -= 7;
  });
  text(
    'No live systems were queried. An absent fixture record does not establish an absence of real-world records.',
    8,
    regular,
    muted,
  );
  y -= 24;
  card(
    'Next check',
    nextCheck(report),
    'Suggested evidence-gathering step for this fictional example.',
  );
  text(report.syntheticDisclosure, 8, regular, muted);

  if (report.publicRecords.length) {
    newPage();
    text('Synthetic evidence details', 8, bold, plum);
    y -= 8;
    text('Record by record', 26, serif, plum);
    y -= 12;
    text(`${EVIDENCE_SOURCE} · Fictional candidates`, 8, regular, muted);
    y -= 20;
    for (const [recordIndex, record] of report.publicRecords.entries()) {
      if (recordIndex > 0) newPage();
      ensure(285);
      heading(record.caseReference, record.signal);
      text(record.summary);
      y -= 12;
      facts([
        ['Role', record.role],
        [
          'Case / record type',
          record.category === 'registry'
            ? 'Registry entry (not a court case)'
            : record.category,
        ],
        ['Fixture match grade', fixtureMatchGrade(record)],
        ['Matched entity / candidate', record.matchedEntity],
        ['Search basis', record.matchBasis],
        ['Proceeding type', record.proceedingType],
        ['Filed year', record.filedYear],
        ['Court / registry', record.courtName],
      ]);
      text(`Identity evidence: ${record.identityEvidence}`, 8);
      y -= 8;
      attributionCard(record, reasoning[record.id]);
      y -= 10;
    }
  }
  // Add furniture only after pagination resolves so every page has accurate X of Y.
  for (const [index, sheet] of pdf.getPages().entries()) {
    page = sheet;
    if (logo) {
      page.drawImage(logo, { x: M, y: H - 43, width: 79, height: 18 });
      draw('|', M + 87, H - 39, 14, regular, color('#d8b6cf'));
      draw('FACTUAL DUE DILIGENCE ENGINE', M + 100, H - 38, 7.5, bold, muted);
    } else {
      draw('Parakh | FACTUAL DUE DILIGENCE ENGINE', M, H - 39, 12, bold, plum);
    }
    const ref = `REF ${report.reportId}`;
    draw(ref, W - M - bold.widthOfTextAtSize(ref, 8), H - 38, 8, bold, dark);
    const pageLabel = `${report.generatedAt} · Page ${index + 1} of ${pdf.getPageCount()}`;
    draw(
      pageLabel,
      W - M - regular.widthOfTextAtSize(pageLabel, 8),
      H - 57,
      8,
      regular,
      muted,
    );
    page.drawLine({
      start: { x: M, y: H - 73 },
      end: { x: W - M, y: H - 73 },
      thickness: 0.6,
      color: rule,
    });
    page.drawLine({
      start: { x: M, y: 83 },
      end: { x: W - M, y: 83 },
      thickness: 0.6,
      color: rule,
    });
    let footerY = 70;
    for (const line of lines(LABEL_GUIDE, regular, 7)) {
      draw(line, M, footerY, 7, regular, muted);
      footerY -= 10;
    }
    draw(REPORT_DISCLAIMER, M, footerY - 2, 7, bold, dark);
    draw(FICTION_NOTICE, M, footerY - 15, 6.8, regular, muted);
  }
  return pdf.save();
}
