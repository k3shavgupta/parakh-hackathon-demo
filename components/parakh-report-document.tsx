'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  Printer,
} from 'lucide-react';

import type { SyntheticReport } from '@/lib/synthetic-engine';
import { SCENARIOS } from '@/lib/synthetic-engine';
import { cn } from '@/lib/utils';

const disclosure =
  'This hackathon demo uses synthetic data only. It does not access live government systems, private records, real GSTINs, PANs, Aadhaar numbers, OTPs, payments, or production Parakh data.';

function badgeClass(label: 'FLAG' | 'CLEAR' | 'NOTE') {
  if (label === 'FLAG') return 'border-[#e8b7bd] bg-[#fff3f4] text-[#a33f4a]';
  if (label === 'CLEAR') return 'border-[#c4dfd0] bg-[#eff9f3] text-[#2d6a48]';
  return 'border-[#eadbc8] bg-[#fff8ed] text-[#916022]';
}

function reportToText(report: SyntheticReport) {
  return [
    `Parakh synthetic report ${report.reportId}`,
    `Synthetic GSTIN: ${report.searchedIdentifier}`,
    `Generated: ${report.generatedAt}`,
    '',
    disclosure,
    '',
    report.summary,
    '',
    `Entity: ${report.business.legalName}`,
    `Trade name: ${report.business.tradeName}`,
    `State: ${report.business.registrationState}`,
    '',
    'Observations:',
    ...report.observations.map(
      (item) =>
        `- ${item.label}: ${item.title}. ${item.detail} Confidence: ${item.confidence}. Attribution: ${item.attribution}. Provenance: ${item.provenance}`,
    ),
    '',
    'What we could not find:',
    ...report.cannotFind.map((item) => `- ${item}`),
  ].join('\n');
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
    <div className="grid gap-2 border-t border-[#f0e7ee] py-4 text-sm first:border-t-0 sm:grid-cols-[92px_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
      <div className="font-semibold text-[#8b7c84]">{title}</div>
      <div className="font-medium leading-6 text-[#201b1e]">{detail}</div>
      <span
        className={cn(
          'rounded-full border px-3 py-1 text-xs font-semibold',
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
    <section className="rounded-[26px] bg-white p-5 shadow-[0_20px_70px_rgba(42,24,31,0.08)] sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-[#7a336f] text-white">
          <FileText className="size-4" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase text-[#9b8793]">
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
  const delayed = report.filingPattern.rows.filter(
    (row) => row.gstr1 !== 'filed' || row.gstr3b !== 'filed',
  ).length;
  const flagCount = report.observations.filter(
    (observation) => observation.label === 'FLAG',
  ).length;
  const noteCount = report.observations.filter(
    (observation) => observation.label === 'NOTE',
  ).length;
  const downloadHref = `data:text/plain;charset=utf-8,${encodeURIComponent(
    reportToText(report),
  )}`;
  const identityObservation =
    report.observations.find((item) => item.title.includes('Name')) ??
    report.observations[0];
  const filingObservation =
    report.observations.find((item) => item.title.includes('filing')) ??
    report.observations[1] ??
    report.observations[0];
  const courtObservation =
    report.observations.find((item) => item.title.includes('Public-record')) ??
    report.observations.find((item) => item.title.includes('alias')) ??
    report.observations[report.observations.length - 1];

  return (
    <main className="min-h-screen bg-[var(--parakh-bg)] text-[var(--parakh-ink)]">
      <nav className="sticky top-0 z-30 border-b border-[#efe7ec] bg-[var(--parakh-bg)]/90 px-4 py-3 backdrop-blur-xl print:hidden sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold"
          >
            <span className="grid size-8 place-items-center rounded-full bg-[#7a336f] text-white">
              प
            </span>
            Parakh demo
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#201b1e] px-4 text-sm font-semibold text-white"
            >
              <Printer className="size-4" />
              Print
            </button>
            <a
              href={downloadHref}
              download={`${report.reportId.toLowerCase()}-synthetic-report.txt`}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-3 text-sm font-semibold text-[var(--parakh-plum)] sm:px-4"
            >
              <Download className="size-4" />
              Download
            </a>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
        <div className="rounded-[32px] bg-[radial-gradient(circle_at_top,#fff_0%,#fbf2f7_42%,#f0e1ea_100%)] p-5 shadow-[0_30px_90px_rgba(42,24,31,0.08)] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#7a336f]">
                Synthetic report
              </p>
              <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
                {report.business.tradeName}{' '}
                <span className="font-serif italic text-[#7a336f]">record</span>
              </h1>
              <p className="mt-4 text-base leading-7 text-[#675b63]">
                This report mirrors the Parakh report journey, but every source
                and business fact is synthetic.
              </p>
              <dl className="mt-6 grid gap-3 text-sm">
                <div className="rounded-[18px] bg-white/80 p-4">
                  <dt className="font-semibold text-[#8b7c84]">
                    Synthetic GSTIN
                  </dt>
                  <dd className="mt-1 font-semibold">
                    {report.searchedIdentifier}
                  </dd>
                </div>
                <div className="rounded-[18px] bg-white/80 p-4">
                  <dt className="font-semibold text-[#8b7c84]">Report ID</dt>
                  <dd className="mt-1 font-semibold">{report.reportId}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-[28px] bg-white p-5 shadow-[0_18px_60px_rgba(42,24,31,0.1)]">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#f0e7ee] pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-[#9b8793]">
                    GSTIN {report.searchedIdentifier} ·{' '}
                    {report.business.registrationState}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
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

        <div className="mt-6 rounded-[24px] bg-[#201b1e] p-5 text-sm leading-6 text-white sm:p-6">
          <strong>Synthetic-data disclosure:</strong> {disclosure}
        </div>

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
                ['Status', report.business.registrationStatus],
                ['Address', report.business.syntheticAddress],
                ['Source', report.business.provenance],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[18px] bg-[#fbf8f5] p-4">
                  <div className="font-semibold text-[#8b7c84]">{label}</div>
                  <div className="mt-1 leading-6">{value}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Filing pattern" kicker="Recent return behaviour">
            <div className="mb-4 grid grid-cols-3 gap-3">
              <div className="rounded-[18px] bg-[#fbf8f5] p-4">
                <div className="text-2xl font-semibold">
                  {report.filingPattern.rows.length}
                </div>
                <div className="mt-1 text-xs text-[#7f7279]">periods read</div>
              </div>
              <div className="rounded-[18px] bg-[#fbf8f5] p-4">
                <div className="text-2xl font-semibold">{delayed}</div>
                <div className="mt-1 text-xs text-[#7f7279]">follow-ups</div>
              </div>
              <div className="rounded-[18px] bg-[#fbf8f5] p-4">
                <div className="text-2xl font-semibold">
                  {report.filingPattern.confidence}
                </div>
                <div className="mt-1 text-xs text-[#7f7279]">confidence</div>
              </div>
            </div>
            <div className="overflow-x-auto rounded-[18px] border border-[#f0e7ee]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#fbf8f5] text-[#675b63]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Period</th>
                    <th className="px-4 py-3 font-semibold">GSTR-1</th>
                    <th className="px-4 py-3 font-semibold">GSTR-3B</th>
                    <th className="px-4 py-3 font-semibold">Filed on</th>
                  </tr>
                </thead>
                <tbody>
                  {report.filingPattern.rows.map((row) => (
                    <tr key={row.period} className="border-t border-[#f0e7ee]">
                      <td className="px-4 py-3 font-medium">{row.month}</td>
                      <td className="px-4 py-3 capitalize">{row.gstr1}</td>
                      <td className="px-4 py-3 capitalize">{row.gstr3b}</td>
                      <td className="px-4 py-3">{row.filedOn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard
            title="Public-record signals"
            kicker="Court and record examples"
          >
            <div className="space-y-3">
              {report.publicRecords.length ? (
                report.publicRecords.map((record) => (
                  <div
                    key={record.id}
                    className="rounded-[18px] bg-[#fbf8f5] p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs font-semibold',
                          badgeClass(record.signal),
                        )}
                      >
                        {record.signal}
                      </span>
                      <span className="text-sm font-semibold">{record.id}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#675b63]">
                      {record.summary}
                    </p>
                    <p className="mt-2 text-xs text-[#8b7c84]">
                      {record.date} · Confidence {record.confidence} ·{' '}
                      {record.provenance}
                    </p>
                  </div>
                ))
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
                  className="rounded-[18px] bg-[#fbf8f5] p-4"
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
                    <span className="font-semibold">{item.title}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#675b63]">
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
                  className="flex gap-2 rounded-[16px] bg-[#fbf8f5] p-3 text-sm"
                >
                  <AlertTriangle className="mt-0.5 size-4 text-[#916022]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            title="Try another synthetic GSTIN"
            kicker="Demo scenarios"
          >
            <div className="grid gap-2">
              {SCENARIOS.map((scenario) => (
                <a
                  key={scenario.identifier}
                  href={`/report/${encodeURIComponent(scenario.identifier)}`}
                  aria-current={
                    scenario.identifier === report.searchedIdentifier
                      ? 'page'
                      : undefined
                  }
                  className={cn(
                    'rounded-[18px] border p-3 text-left text-sm transition hover:bg-[#fbf8f5]',
                    scenario.identifier === report.searchedIdentifier
                      ? 'border-[#7a336f] bg-[#fbf2f7]'
                      : 'border-[#f0e7ee] bg-white',
                  )}
                >
                  <span className="font-semibold">{scenario.identifier}</span>
                  <span className="mt-1 block text-[#7f7279]">
                    {scenario.shortName}
                  </span>
                </a>
              ))}
            </div>
          </SectionCard>
        </div>

        <section className="mt-8 rounded-[26px] bg-white p-6 shadow-[0_20px_70px_rgba(42,24,31,0.08)]">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-5 text-[#2d6a48]" />
            <h2 className="text-2xl font-semibold">
              How this report was generated
            </h2>
          </div>
          <ol className="mt-4 grid gap-2 text-sm leading-6 text-[#675b63] sm:grid-cols-2">
            {report.generationSteps.map((step) => (
              <li key={step} className="rounded-[16px] bg-[#fbf8f5] p-3">
                {step}
              </li>
            ))}
          </ol>
          <p className="mt-5 text-sm leading-6 text-[#675b63]">
            Production use would require authorized APIs, consent-aware
            handling, audit logs, rate limits, data provenance, retention
            limits, security controls, and human-readable limitations.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3 print:hidden">
          <Link
            href="/"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#201b1e]"
          >
            <ArrowLeft className="size-4" />
            Back to search
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#201b1e] px-5 text-sm font-semibold text-white"
          >
            <Printer className="size-4" />
            Print report
          </button>
          <a
            href={downloadHref}
            download={`${report.reportId.toLowerCase()}-synthetic-report.txt`}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#7a336f] px-5 text-sm font-semibold text-white"
          >
            <Download className="size-4" />
            Download text
          </a>
        </div>
      </section>
    </main>
  );
}
