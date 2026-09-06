'use client';

/* oxlint-disable no-html-link-for-pages -- Vercel's Vinext adapter requires hard navigation for reliable public routes. */
import { useEffect, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  Printer,
} from 'lucide-react';

import { AiAttributionReasoningCard } from '@/components/ai-attribution-reasoning-card';
import { AiSummaryCard } from '@/components/ai-summary-card';
import { DemoProductHeader } from '@/components/demo-product-header';
import type { SyntheticReport } from '@/lib/synthetic-engine';
import { SCENARIOS } from '@/lib/synthetic-engine';
import type {
  ReportAiReasoningState,
  ReportAiSummaryState,
  ReportAiResponse,
} from '@/lib/report-ai-state';
import { reportSections, filingStatus } from '@/lib/report-layout';
import { cn } from '@/lib/utils';

const disclosure =
  'This hackathon demo uses synthetic data only. It does not access live government systems, private records, real GSTINs, PANs, Aadhaar numbers, OTPs, payments, or production Parakh data.';
const legalDisclaimer =
  'CICRA 2005 note: This synthetic demonstration is not a credit information report, legal opinion, or automated credit decision.';

function badgeClass(label: 'FLAG' | 'CLEAR' | 'NOTE') {
  if (label === 'FLAG') return 'border-[#e8b7bd] bg-[#fff3f4] text-[#a33f4a]';
  if (label === 'CLEAR') return 'border-[#c4dfd0] bg-[#eff9f3] text-[#2d6a48]';
  return 'border-[#eadbc8] bg-[#fff8ed] text-[#916022]';
}

function PrimaryObservation({
  label,
  title,
  detail,
}: {
  label: 'FLAG' | 'CLEAR' | 'NOTE';
  title: string;
  detail: string;
}) {
  return (
    <div className="grid gap-2 border-t border-[#f0e7ee] py-3.5 text-sm first:border-t-0 sm:grid-cols-[92px_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
      <div className="font-semibold text-[#8b7c84] text-xs tracking-wider">{title}</div>
      <div className="font-medium leading-6 text-[#201b1e]">{detail}</div>
      <span
        className={cn(
          'rounded-full border px-3 py-1 text-xs font-semibold shrink-0',
          badgeClass(label),
        )}
      >
        {label}
      </span>
    </div>
  );
}

function SectionCard({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[26px] bg-white p-5 shadow-[0_20px_70px_rgba(42,24,31,0.08)] sm:p-7 border border-[#ede3eb]">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-[#7a336f] text-white shadow-sm">
          <FileText className="size-4" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase text-[#9b8793] tracking-wider">
            {kicker}
          </p>
          <h2 className="text-2xl font-semibold text-[#201b1e]">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

export function ParakhReportDocument({ report }: { report: SyntheticReport }) {
  const [reasoning, setReasoning] = useState<
    Record<string, ReportAiReasoningState>
  >(() =>
    Object.fromEntries(
      report.publicRecords.map((record) => [record.id, { status: 'loading' }]),
    ),
  );
  const [summary, setSummary] = useState<ReportAiSummaryState>({
    status: 'loading',
  });
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40_000);
    let disposed = false;

    void (async () => {
      try {
        const response = await fetch('/api/ai-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: report.searchedIdentifier }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('AI report unavailable');
        const value = (await response.json()) as ReportAiResponse;
        if (
          !value ||
          !value.reasoning ||
          !['success', 'fallback'].includes(value.summary?.status)
        ) {
          throw new Error('Invalid AI report');
        }
        if (!disposed) {
          setReasoning(value.reasoning);
          setSummary(value.summary);
        }
      } catch {
        if (!disposed) {
          setReasoning(
            Object.fromEntries(
              report.publicRecords.map((record) => [
                record.id,
                { status: 'fallback', fixtureSignal: record.signal },
              ]),
            ),
          );
          setSummary({ status: 'fallback' });
        }
      } finally {
        clearTimeout(timeout);
      }
    })();

    return () => {
      disposed = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [report.publicRecords, report.searchedIdentifier]);

  const sections = reportSections(report);
  const { counts, filingLabel } = sections;
  const g1Pub = counts.gstr1.onTime + counts.gstr1.late + counts.gstr1.missing;
  const g3Pub = counts.gstr3b.onTime + counts.gstr3b.late + counts.gstr3b.missing;

  const filingHeadline =
    filingLabel === 'FLAG'
      ? 'Filing history shows delays'
      : filingLabel === 'NOTE'
        ? 'Limited filing history available'
        : 'Returns filed on time';
  const filingParagraph =
    filingLabel === 'NOTE'
      ? 'Available filing data is limited. Parakh cannot determine whether returns were filed on time for periods or filing dates not available from the source.'
      : `Available filing data covers ${counts.periods} fixture periods. GSTR-1 and GSTR-3B filings are evaluated against standard statutory due dates.`;

  const rows = report.filingPattern.rows;
  const rangeStr =
    rows.length > 0
      ? `${rows[0].month.split(' ')[0].toUpperCase()} ${rows[0].period.slice(2, 4)} – ${rows[rows.length - 1].month.split(' ')[0].toUpperCase()} ${rows[rows.length - 1].period.slice(2, 4)}`
      : '';

  const identityObservation =
    report.observations.find((item) => item.title.includes('Name') || item.title.includes('profile')) ??
    report.observations[0];
  const filingObservation =
    report.observations.find((item) => item.title.includes('filing') || item.title.includes('return')) ??
    report.observations[1] ??
    report.observations[0];
  const courtObservation =
    report.observations.find((item) => item.title.includes('Public-record') || item.title.includes('alignment')) ??
    report.observations.find((item) => item.title.includes('alias')) ??
    report.observations[report.observations.length - 1];

  const demoReference =
    report.engine?.identity?.demoReference ?? report.searchedIdentifier;

  async function exportPdf(forPrint: boolean) {
    setPdfBusy(true);
    setPdfError(null);
    const printWindow = forPrint ? window.open('', '_blank') : null;
    try {
      const { createSyntheticReportPdf } = await import('@/lib/report-pdf');
      const bytes = await createSyntheticReportPdf(report, reasoning, summary);
      const url = URL.createObjectURL(
        new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }),
      );
      if (printWindow) {
        printWindow.location.href = url;
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${report.reportId.toLowerCase()}-synthetic-report.pdf`;
        link.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      printWindow?.close();
      setPdfError('PDF preparation is unavailable right now. Use Print to save a copy.');
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbf8f5] text-[#201b1e]">
      <DemoProductHeader
        hideWhenPrinting
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void exportPdf(true)}
              disabled={pdfBusy}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--parakh-ink)] px-4 text-xs sm:text-sm font-semibold text-white transition hover:opacity-90 cursor-pointer"
            >
              <Printer className="size-4" />
              Print
            </button>
            <button
              type="button"
              onClick={() => void exportPdf(false)}
              disabled={pdfBusy}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-xs sm:text-sm font-semibold text-[var(--parakh-plum)] shadow-sm border border-[#ebd8e5] transition hover:bg-[#fbf2f7] cursor-pointer"
            >
              <Download className="size-4" />
              {pdfBusy ? 'Preparing PDF…' : 'Download PDF'}
            </button>
          </div>
        }
      />
      {pdfError ? (
        <p className="mx-auto max-w-6xl px-5 pt-3 text-right text-sm text-[#a33f4a] print:hidden" role="alert">
          {pdfError}
        </p>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
        {/* Top Gradient Hero Card */}
        <div className="rounded-[32px] bg-[radial-gradient(circle_at_top,#fff_0%,#fbf2f7_42%,#f0e1ea_100%)] p-5 shadow-[0_30px_90px_rgba(42,24,31,0.08)] sm:p-8 border border-[#ecdbe6]">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#7a336f] shadow-sm">
                Synthetic report
              </p>
              <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl text-[var(--parakh-ink)]">
                {report.business.tradeName}{' '}
                <span className="font-serif italic font-normal text-[#7a336f]">record</span>
              </h1>
              <p className="mt-4 text-base leading-7 text-[#675b63]">
                This report mirrors the Parakh report journey, but every source
                and business fact is synthetic.
              </p>
              <dl className="mt-6 grid gap-3 text-sm">
                <div className="rounded-[18px] bg-white/85 p-4 border border-[#f0e6ee] shadow-sm">
                  <dt className="font-semibold text-[#8b7c84] text-xs uppercase tracking-wider">
                    Demo reference
                  </dt>
                  <dd className="mt-1 font-semibold text-[var(--parakh-ink)]">
                    {demoReference}
                  </dd>
                </div>
                <div className="rounded-[18px] bg-white/85 p-4 border border-[#f0e6ee] shadow-sm">
                  <dt className="font-semibold text-[#8b7c84] text-xs uppercase tracking-wider">
                    Report ID
                  </dt>
                  <dd className="mt-1 font-semibold text-[var(--parakh-ink)]">
                    {report.reportId}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-[28px] bg-white p-5 shadow-[0_18px_60px_rgba(42,24,31,0.1)] border border-[#ede3eb]">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#f0e7ee] pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-[#9b8793] tracking-wider">
                    DEMO REFERENCE {demoReference} · {report.business.registrationState}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[var(--parakh-ink)]">
                    {report.business.legalName}
                  </h2>
                </div>
                <span className="rounded-full border border-[#eadbc8] bg-[#fff8ed] px-3 py-1 text-xs font-semibold text-[#916022]">
                  SPECIMEN
                </span>
              </div>
              <PrimaryObservation
                title="IDENTITY"
                label={identityObservation.label}
                detail={identityObservation.title}
              />
              <PrimaryObservation
                title="FILING"
                label={filingObservation.label}
                detail={filingObservation.title}
              />
              <PrimaryObservation
                title="LITIGATION"
                label={courtObservation.label}
                detail={
                  report.publicRecords.length
                    ? `${report.publicRecords.length} synthetic public-record signal(s) found`
                    : 'No synthetic public-record signal in this fixture'
                }
              />
              <PrimaryObservation
                title="LIMITS"
                label="NOTE"
                detail={`${report.cannotFind.length} unavailable source area(s) disclosed`}
              />
              <p className="mt-4 rounded-[18px] bg-[#f8f1f5] p-4 text-sm leading-6 text-[#675b63]">
                Could not find: {report.cannotFind.join(', ')}.
              </p>
            </div>
          </div>
        </div>

        {/* Disclosure Bar */}
        <div className="mt-6 rounded-[24px] bg-[#201d1d] p-5 text-sm leading-6 text-white sm:p-6 shadow-[0_12px_40px_rgba(42,24,31,0.12)]">
          <strong>Synthetic-data disclosure:</strong> {disclosure}
          <br />
          <strong>{legalDisclaimer}</strong>
        </div>

        <p className="mt-6 text-center text-xs font-bold tracking-widest text-[#a33f4a] uppercase">
          SYNTHETIC DEMO - NOT A REAL REGISTRATION
        </p>

        {/* AI Summary Card from Round 2 */}
        <div className="mt-8">
          <AiSummaryCard state={summary} />
        </div>

        {/* 2-Column Sections: Identity & Structure + Filing Pattern */}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <SectionCard
            title="Identity and structure"
            kicker="Who you are dealing with"
          >
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              {[
                ['Legal name', report.business.legalName],
                ['Trade name', report.business.tradeName],
                ['Constitution', report.business.constitution],
                ['State', report.business.registrationState],
                ['Status', report.business.registrationStatus],
                ['Synthetic registry since', report.business.registeredDate],
                ['Address', report.business.syntheticAddress],
                ['Source', report.business.provenance],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[18px] bg-[#fbf8f5] p-4 border border-[#f0e6ee]">
                  <div className="font-semibold text-[#8b7c84] text-xs uppercase tracking-wider">{label}</div>
                  <div className="mt-1 leading-6 font-medium text-[var(--parakh-ink)]">{value}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="GST return filing" kicker="Statutory returns & timing compliance">
            <div className="space-y-6">
              {/* Header Info Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0e7ee] pb-4">
                <div>
                  <h3 className="text-base font-semibold text-[var(--parakh-ink)]">
                    {filingHeadline}
                  </h3>
                  <p className="mt-1 text-xs text-[#675b63] max-w-xl leading-relaxed">
                    {filingParagraph}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full border px-3.5 py-1 text-xs font-semibold',
                    badgeClass(filingLabel),
                  )}
                >
                  {filingLabel}
                </span>
              </div>

              {/* Summary Counts Table (PRK-00068 signature style) */}
              <div className="overflow-x-auto rounded-[16px] border border-[#f0e7ee] bg-[#fbf8f5]">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#ebd8e5] text-[#7e6c80] font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Return</th>
                      <th className="px-4 py-2.5">Published</th>
                      <th className="px-4 py-2.5">On time</th>
                      <th className="px-4 py-2.5">Late</th>
                      <th className="px-4 py-2.5">Source unavailable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0e7ee] text-[var(--parakh-ink)] font-medium">
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-[#4f1a46]">GSTR-1</td>
                      <td className="px-4 py-2.5">{g1Pub}</td>
                      <td className="px-4 py-2.5 text-[#15803d] font-semibold">{counts.gstr1.onTime}</td>
                      <td className="px-4 py-2.5 text-[#9f1239] font-semibold">{counts.gstr1.late}</td>
                      <td className="px-4 py-2.5 text-[#7e6c80]">{counts.gstr1.unavailable}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-[#4f1a46]">GSTR-3B</td>
                      <td className="px-4 py-2.5">{g3Pub}</td>
                      <td className="px-4 py-2.5 text-[#15803d] font-semibold">{counts.gstr3b.onTime}</td>
                      <td className="px-4 py-2.5 text-[#9f1239] font-semibold">{counts.gstr3b.late}</td>
                      <td className="px-4 py-2.5 text-[#7e6c80]">{counts.gstr3b.unavailable}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Visual Dot Timeline */}
              <div className="rounded-[18px] bg-white p-4 border border-[#ebd8e5] space-y-4 shadow-sm">
                {/* GSTR-1 Timeline Row */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--parakh-ink)] mb-2">
                    <span>GSTR-1</span>
                    <span className="text-[#7e6c80] font-medium">{rangeStr}</span>
                  </div>
                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    {rows.map((row) => {
                      const m = row.month.split(' ')[0].slice(0, 4).toUpperCase();
                      const yStr = row.period.slice(2, 4);
                      const st = filingStatus(row.gstr1);
                      return (
                        <div key={`g1-${row.period}`} className="flex flex-col items-center min-w-[36px]">
                          <span className="text-[10px] font-bold text-[#7e6c80]">{m}</span>
                          <span className="text-[9px] text-[#9b8793]">{yStr}</span>
                          <div className="mt-2 flex h-4 items-center justify-center">
                            {st === 'onTime' ? (
                              <span className="size-2.5 rounded-full bg-[#15803d]" title={`${m} ${yStr}: On time`} />
                            ) : st === 'late' ? (
                              <span className="inline-block w-0 h-0 border-x-[5px] border-x-transparent border-b-[8px] border-b-[#9f1239]" title={`${m} ${yStr}: Late`} />
                            ) : (
                              <span className="inline-block w-3 h-0.5 bg-[#7e6c80]" title={`${m} ${yStr}: Source unavailable`} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* GSTR-3B Timeline Row */}
                <div className="border-t border-[#f0e7ee] pt-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--parakh-ink)] mb-2">
                    <span>GSTR-3B</span>
                    <span className="text-[#7e6c80] font-medium">{rangeStr}</span>
                  </div>
                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    {rows.map((row) => {
                      const m = row.month.split(' ')[0].slice(0, 4).toUpperCase();
                      const yStr = row.period.slice(2, 4);
                      const st = filingStatus(row.gstr3b);
                      return (
                        <div key={`g3-${row.period}`} className="flex flex-col items-center min-w-[36px]">
                          <span className="text-[10px] font-bold text-[#7e6c80]">{m}</span>
                          <span className="text-[9px] text-[#9b8793]">{yStr}</span>
                          <div className="mt-2 flex h-4 items-center justify-center">
                            {st === 'onTime' ? (
                              <span className="size-2.5 rounded-full bg-[#15803d]" title={`${m} ${yStr}: On time`} />
                            ) : st === 'late' ? (
                              <span className="inline-block w-0 h-0 border-x-[5px] border-x-transparent border-b-[8px] border-b-[#9f1239]" title={`${m} ${yStr}: Late`} />
                            ) : (
                              <span className="inline-block w-3 h-0.5 bg-[#7e6c80]" title={`${m} ${yStr}: Source unavailable`} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Timeline Legend */}
                <div className="flex flex-wrap items-center gap-5 border-t border-[#f0e7ee] pt-3 text-[11px] text-[#7e6c80]">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-[#15803d]" />
                    On time
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-0 h-0 border-x-[4px] border-x-transparent border-b-[7px] border-b-[#9f1239]" />
                    Late
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-0.5 bg-[#7e6c80]" />
                    Not available from source
                  </span>
                </div>
              </div>

              {/* Detailed Breakdown Table */}
              <div className="overflow-x-auto rounded-[16px] border border-[#f0e7ee]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fbf8f5] text-[#675b63]">
                    <tr>
                      <th className="px-3.5 py-2.5 font-semibold">Period</th>
                      <th className="px-3.5 py-2.5 font-semibold">GSTR-1</th>
                      <th className="px-3.5 py-2.5 font-semibold">GSTR-3B</th>
                      <th className="px-3.5 py-2.5 font-semibold">Filed on</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.filingPattern.rows.map((row) => (
                      <tr key={row.period} className="border-t border-[#f0e7ee]">
                        <td className="px-3.5 py-2.5 font-medium">{row.month}</td>
                        <td className="px-3.5 py-2.5 capitalize">{row.gstr1}</td>
                        <td className="px-3.5 py-2.5 capitalize">{row.gstr3b}</td>
                        <td className="px-3.5 py-2.5">{row.filedOn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Public-record signals"
            kicker="Court and record examples"
          >
            <div className="space-y-4">
              {report.publicRecords.length ? (
                report.publicRecords.map((record) => {
                  const aiState = reasoning[record.id] ?? {
                    status: 'fallback' as const,
                    fixtureSignal: record.signal,
                  };

                  return (
                    <div
                      key={record.id}
                      className="rounded-[22px] bg-[#fbf8f5] p-5 border border-[#f0e6ee] space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'rounded-full border px-3 py-1 text-xs font-semibold',
                              badgeClass(record.signal),
                            )}
                          >
                            {record.signal}
                          </span>
                          <span className="font-mono text-sm font-semibold text-[var(--parakh-ink)]">{record.id}</span>
                        </div>
                        <span className="text-xs text-[#8b7c84] font-medium">{record.date}</span>
                      </div>
                      <p className="text-sm leading-6 text-[#594b54]">
                        {record.summary}
                      </p>
                      <div className="text-xs leading-5 text-[#8b7c84] bg-white/80 rounded-xl p-3 border border-[#ede3eb]">
                        <p className="font-medium text-[var(--parakh-ink)]">
                          {record.caseReference} · {record.courtName}
                        </p>
                        <p className="mt-1">
                          Parties: {record.parties.join(' · ')}
                        </p>
                        <p className="mt-0.5">
                          Side: <span className="capitalize">{record.partySide}</span> · Match basis: {record.matchBasis}
                        </p>
                        <p className="mt-1 text-[11px] text-[#9b8793]">
                          Confidence {record.confidence} · {record.provenance}
                        </p>
                      </div>

                      {/* AI Attribution Reasoning Card for this signal */}
                      <AiAttributionReasoningCard
                        recordId={record.id}
                        fixtureSignal={record.signal}
                        state={aiState}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="rounded-[18px] bg-[#fbf8f5] p-4 text-sm leading-6 text-[#675b63]">
                  No synthetic public-record signal is present in this fixture.
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Observations" kicker="Evidence, not rating">
            <div className="space-y-3">
              {report.observations.map((item) => (
                <div
                  key={`${item.label}-${item.title}`}
                  className="rounded-[18px] bg-[#fbf8f5] p-4 border border-[#f0e6ee]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-semibold',
                        badgeClass(item.label),
                      )}
                    >
                      {item.label}
                    </span>
                    <span className="font-semibold text-[var(--parakh-ink)]">{item.title}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#675b63]">
                    {item.detail}
                  </p>
                  <p className="mt-2 text-xs text-[#8b7c84]">
                    Confidence {item.confidence} · {item.attribution}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionCard title="What we could not find" kicker="Limits">
            <ul className="space-y-2">
              {report.cannotFind.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 rounded-[16px] bg-[#fbf8f5] p-3.5 text-sm text-[#594b54] border border-[#f0e6ee]"
                >
                  <AlertTriangle className="mt-0.5 size-4 text-[#916022] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            title="Try another demo scenario"
            kicker="Demo scenarios"
          >
            <div className="grid gap-2">
              {SCENARIOS.map((scenario) => (
                <a
                  key={scenario.identifier}
                  href={`/report/${encodeURIComponent(scenario.identifier)}`}
                  className={cn(
                    'rounded-[18px] border p-3 text-left text-sm transition hover:bg-[#fbf8f5] block',
                    scenario.identifier === report.searchedIdentifier
                      ? 'border-[#7a336f] bg-[#fbf2f7]'
                      : 'border-[#f0e7ee] bg-white',
                  )}
                >
                  <span className="font-semibold text-[var(--parakh-ink)]">{scenario.identifier}</span>
                  <span className="mt-1 block text-xs text-[#7f7279]">
                    {scenario.shortName} · {scenario.scenarioType}
                  </span>
                </a>
              ))}
            </div>
          </SectionCard>
        </div>

        <section className="mt-8 rounded-[26px] bg-white p-6 shadow-[0_20px_70px_rgba(42,24,31,0.08)] border border-[#ede3eb] sm:p-8">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-5 text-[#2d6a48]" />
            <h2 className="text-2xl font-semibold text-[var(--parakh-ink)]">
              How this report was generated
            </h2>
          </div>
          <ol className="mt-4 grid gap-2.5 text-sm leading-6 text-[#675b63] sm:grid-cols-2">
            {report.generationSteps.map((step, idx) => (
              <li key={step} className="rounded-[16px] bg-[#fbf8f5] p-3.5 border border-[#f0e6ee] flex items-start gap-2.5">
                <span className="font-mono text-xs font-bold text-[#7a336f] mt-0.5">{String(idx + 1).padStart(2, '0')}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-xs text-[#8b7c84] leading-relaxed">
            Production use would require authorized APIs, consent-aware
            handling, audit logs, rate limits, data provenance, retention
            limits, security controls, and human-readable limitations.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3 print:hidden">
          <a
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#201b1e] border border-[#ebd8e5] shadow-sm transition hover:bg-[#fbf8f5]"
          >
            <ArrowLeft className="size-4" />
            Back to search
          </a>
          <button
            type="button"
            onClick={() => void exportPdf(true)}
            disabled={pdfBusy}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#201b1e] px-5 text-sm font-semibold text-white transition hover:opacity-90 cursor-pointer"
          >
            <Printer className="size-4" />
            Print report
          </button>
          <button
            type="button"
            onClick={() => void exportPdf(false)}
            disabled={pdfBusy}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#7a336f] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#682a5e] cursor-pointer"
          >
            <Download className="size-4" />
            {pdfBusy ? 'Preparing PDF…' : 'Download PDF'}
          </button>
        </div>
      </section>

      <footer className="border-t border-[#efe4e9] px-5 py-6 text-center text-xs leading-5 text-[#776973]">
        Synthetic demonstration generated from fictional fixture data. Not a
        live GST, court, or company-record lookup.
      </footer>
    </main>
  );
}
