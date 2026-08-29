'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
} from 'lucide-react';

import { DemoProductHeader } from '@/components/demo-product-header';
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const delayed = report.filingPattern.rows.filter(
    (row) => row.gstr1 !== 'filed' || row.gstr3b !== 'filed',
  ).length;
  const flagCount = report.observations.filter(
    (observation) => observation.label === 'FLAG',
  ).length;
  const noteCount = report.observations.filter(
    (observation) => observation.label === 'NOTE',
  ).length;
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

  async function downloadPdf() {
    setPdfError('');
    setIsGeneratingPdf(true);

    try {
      const { buildSyntheticPdf, syntheticPdfFilename } = await import(
        '@/lib/synthetic-pdf'
      );
      const pdfBytes = await buildSyntheticPdf(report);
      const url = URL.createObjectURL(
        new Blob([pdfBytes], { type: 'application/pdf' }),
      );
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = syntheticPdfFilename(report);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 500);
    } catch {
      setPdfError('The synthetic PDF could not be generated. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--parakh-bg)] text-[var(--parakh-ink)]">
      <DemoProductHeader
        hideWhenPrinting
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={downloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--parakh-plum)] px-4 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70"
            >
              <Download className="size-4" />
              {isGeneratingPdf ? 'Preparing PDF...' : 'Download PDF report'}
            </button>
          </div>
        }
      />

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
                    Demo reference
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
                    Demo reference {report.searchedIdentifier} ·{' '}
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

        <p className="mt-4 text-center text-xs font-semibold tracking-[0.08em] text-[var(--parakh-plum-dark)]">
          SYNTHETIC DEMO - NOT A REAL REGISTRATION
        </p>

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
                ['Synthetic registry since', report.business.syntheticRegistrationDate],
                ['Activity', report.business.syntheticBusinessActivity],
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
                    <dl className="mt-3 grid gap-x-4 gap-y-2 border-t border-[#eee4ea] pt-3 text-xs leading-5 text-[#675b63] sm:grid-cols-2">
                      <div>
                        <dt className="font-semibold text-[#8b7c84]">Synthetic court</dt>
                        <dd>{record.courtName}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-[#8b7c84]">Reference</dt>
                        <dd className="font-mono text-[11px]">{record.caseReference}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-[#8b7c84]">Name alignment</dt>
                        <dd>{record.matchGrade} · {record.matchBasis}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-[#8b7c84]">Matched party</dt>
                        <dd>{record.matchedParty}</dd>
                      </div>
                    </dl>
                    <p className="mt-2 text-xs text-[#8b7c84]">
                      {record.date} · Filed {record.filingYear} · {record.partySide} · Confidence {record.confidence}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#8b7c84]">
                      {record.resolutionReason} Source: {record.provenance}
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
            title="Try another demo reference"
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

        <div className="mt-8 flex flex-wrap items-center gap-3 print:hidden">
          <Link
            href="/"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#201b1e]"
          >
            <ArrowLeft className="size-4" />
            Back to search
          </Link>
          {pdfError ? (
            <p aria-live="polite" className="w-full text-sm text-[#a33f4a]">
              {pdfError}
            </p>
          ) : null}
        </div>
      </section>
      <footer className="border-t border-[#efe4e9] px-5 py-6 text-center text-xs leading-5 text-[#776973]">
        Synthetic demonstration generated from fictional fixture data. Not a
        live GST, court, or company-record lookup.
      </footer>
    </main>
  );
}
