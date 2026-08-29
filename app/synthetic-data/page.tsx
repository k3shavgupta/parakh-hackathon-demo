'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Copy, Database, GitBranch } from 'lucide-react';

import { RAW_SYNTHETIC_SCENARIOS } from '@/lib/synthetic-fixtures';
import { buildSyntheticReport } from '@/lib/synthetic-engine';

const disclosure =
  'This hackathon demo uses synthetic data only. It does not access live government systems, private records, real GSTINs, PANs, Aadhaar numbers, OTPs, payments, or production Parakh data.';

function JsonPanel({ value }: { value: unknown }) {
  const [copied, setCopied] = useState(false);
  const text = JSON.stringify(value, null, 2);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="overflow-hidden rounded-[18px] bg-[#201d1d]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="text-xs font-semibold text-white/60">Local fixture JSON</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white/10 px-3 text-xs font-semibold text-white transition hover:bg-white/15"
        >
          <Copy className="size-3.5" />
          {copied ? 'Copied' : 'Copy JSON'}
        </button>
      </div>
      <pre className="max-h-80 overflow-auto p-4 text-xs leading-5 text-[#eadce6]">
        {text}
      </pre>
    </div>
  );
}

export default function SyntheticDataPage() {
  return (
    <main className="min-h-screen bg-[var(--parakh-bg)] text-[var(--parakh-ink)]">
      <nav className="border-b border-[#eadfe6] bg-white/90 px-5 py-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid size-8 place-items-center rounded-lg bg-[var(--parakh-plum)] text-white">प</span>
            Parakh demo
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--parakh-ink)] px-4 text-sm font-semibold text-white"
          >
            Back to demo
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </nav>

      <section className="mx-2 mt-2 rounded-[30px] bg-[radial-gradient(110%_100%_at_50%_0%,#fff_0%,#f0e3ec_100%)] px-5 py-16 sm:mx-4 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-[var(--parakh-plum-dark)]">
            <Database className="size-3.5" />
            Local evidence, visible by design
          </p>
          <h1 className="mt-5 text-[clamp(2.75rem,6vw,5.5rem)] font-medium leading-[1.04] tracking-[-0.025em]">
            Synthetic Evidence{' '}
            <span className="font-serif italic text-[var(--parakh-plum)]">Lab</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#675a62] sm:text-lg">
            Inspect the fictional evidence behind each report. This is the full
            local path from fixture to presentation, with no provider call in
            between.
          </p>
          <p className="mx-auto mt-6 max-w-3xl rounded-[18px] bg-white/85 px-4 py-3 text-left text-xs leading-5 text-[#5f5259]">
            {disclosure}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="rounded-[22px] bg-[#201d1d] p-5 text-white sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-[#e8c7df]">
              <GitBranch className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">
                {'Fixture -> adapter -> engine -> report schema -> renderer'}
              </p>
              <p className="mt-1 text-sm text-white/62">A deterministic, fixture-only V4-shaped journey.</p>
            </div>
          </div>
        </div>

        <div className="mt-7 space-y-5">
          {RAW_SYNTHETIC_SCENARIOS.map((scenario) => {
            const report = buildSyntheticReport(scenario.identifier);
            const mapping = report.observations.map((observation) => ({
              label: observation.label,
              observation: observation.title,
              attribution: observation.attribution,
              provenance: observation.provenance,
            }));

            return (
              <article key={scenario.identifier} className="rounded-[24px] bg-white p-5 shadow-[0_1px_3px_rgba(32,29,29,0.07)] sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#efe4e9] pb-5">
                  <div>
                    <p className="text-xs font-semibold text-[var(--parakh-plum)]">{scenario.identifier}</p>
                    <h2 className="mt-1 text-2xl font-medium">{scenario.shortName}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#675a62]">{scenario.judgePrompt}</p>
                  </div>
                  <Link
                    href={`/report/${encodeURIComponent(scenario.identifier)}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--parakh-plum)] px-4 text-sm font-semibold text-white"
                  >
                    Generate {scenario.identifier} report
                    <ArrowRight className="size-4" />
                  </Link>
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                  <div className="space-y-4">
                    <section>
                      <h3 className="text-sm font-semibold">Normalized input</h3>
                      <p className="mt-2 text-sm leading-6 text-[#675a62]">
                        {report.engine.identity.normalizedLegalName} | core name:{' '}
                        {report.engine.identity.coreName}
                      </p>
                    </section>
                    <section>
                      <h3 className="text-sm font-semibold">Derived report fields</h3>
                      <p className="mt-2 text-sm leading-6 text-[#675a62]">
                        {report.filingPattern.rows.length} filing periods;{' '}
                        {report.engine.court.reportable.length} attributable local
                        public-record candidate(s); confidence remains source-bounded.
                      </p>
                    </section>
                    <section>
                      <h3 className="text-sm font-semibold">Why these labels</h3>
                      <ul className="mt-2 space-y-2 text-sm leading-6 text-[#675a62]">
                        {mapping.map((item) => (
                          <li key={`${item.label}-${item.observation}`}>
                            <strong className="text-[var(--parakh-plum-dark)]">{item.label}</strong>{' '}
                            {item.observation}: {item.attribution}.
                          </li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <h3 className="text-sm font-semibold">Unavailable data</h3>
                      <p className="mt-2 text-sm leading-6 text-[#675a62]">
                        {report.cannotFind.join('; ')}.
                      </p>
                    </section>
                  </div>
                  <JsonPanel
                    value={{
                      synthetic: scenario.synthetic,
                      purpose: scenario.judgePrompt,
                      rawEvidence: {
                        business: scenario.business,
                        filings: scenario.filings,
                        publicRecords: scenario.publicRecords,
                        unavailable: scenario.unavailable,
                      },
                      normalized: report.engine,
                      evidenceToReportMapping: mapping,
                    }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
