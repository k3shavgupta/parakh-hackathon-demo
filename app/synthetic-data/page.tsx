'use client';

/* oxlint-disable no-html-link-for-pages -- Vercel's Vinext adapter requires hard navigation for reliable public routes. */
import { useState } from 'react';
import {
  ArrowRight,
  BrainCircuit,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Copy,
  Database,
  FileText,
  Fingerprint,
  GitBranch,
  Layers3,
  Scale,
  ShieldCheck,
} from 'lucide-react';

import { DemoProductHeader } from '@/components/demo-product-header';
import { RAW_SYNTHETIC_SCENARIOS } from '@/lib/synthetic-fixtures';
import { buildSyntheticReport } from '@/lib/synthetic-engine';

const disclosure =
  'This hackathon demo uses synthetic data only. It does not access live government systems, private records, real GSTINs, PANs, Aadhaar numbers, OTPs, payments, or production Parakh data.';

const pipeline = [
  {
    number: '01',
    title: 'fixture',
    detail:
      'Five typed, local, obviously fictional business and record scenarios.',
    icon: Database,
  },
  {
    number: '02',
    title: 'adapter',
    detail:
      'The selected fixture is shaped into the report engine input contract.',
    icon: GitBranch,
  },
  {
    number: '03',
    title: 'engine',
    detail:
      'Names, dates, filings, parties, grades, provenance, and limits are normalized.',
    icon: Layers3,
  },
  {
    number: '04',
    title: 'AI reasoning',
    detail:
      'The server sends one synthetic entity/record pair to the AI model for runtime attribution reasoning.',
    icon: BrainCircuit,
  },
  {
    number: '05',
    title: 'report schema',
    detail:
      'The report keeps fixture grades and adds model decision, confidence, factors, or fallback state.',
    icon: FileText,
  },
  {
    number: '06',
    title: 'renderer',
    detail:
      'The web report and A4 PDF show evidence, AI reasoning, provenance, and limitations.',
    icon: CheckCircle2,
  },
];

const attributionFactors = [
  {
    title: 'Name similarity',
    badge: 'Factor 1',
    icon: Fingerprint,
    description:
      'Distinguishes exact legal entity names from trade aliases, individual proprietors, and similarly-named regional competitors.',
  },
  {
    title: 'PAN pattern & continuity',
    badge: 'Factor 2',
    icon: Building2,
    description:
      'Cross-checks statutory entity structure (e.g. Company vs. Proprietorship) so separate businesses are never mistakenly merged.',
  },
  {
    title: 'Filing timeline overlap',
    badge: 'Factor 3',
    icon: CalendarCheck,
    description:
      'Compares active GST return history with litigation filing dates to evaluate operational contemporaneity and relevance.',
  },
];

function JsonPanel({ value }: { value: unknown }) {
  const [copied, setCopied] = useState(false);
  const text = JSON.stringify(value, null, 2);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="overflow-hidden rounded-[18px] bg-[#201d1d] shadow-inner">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="text-xs font-semibold text-white/60">Local fixture JSON</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white/10 px-3.5 text-xs font-semibold text-white transition hover:bg-white/15 cursor-pointer"
        >
          <Copy className="size-3.5" />
          {copied ? 'Copied' : 'Copy JSON'}
        </button>
      </div>
      <pre className="max-h-80 overflow-auto p-4 font-mono text-xs leading-5 text-[#eadce6]">
        {text}
      </pre>
    </div>
  );
}

export default function SyntheticDataPage() {
  return (
    <main className="min-h-screen bg-[#fbf8f5] text-[#201b1e]">
      <DemoProductHeader />

      {/* Hero Header */}
      <section className="mx-2 mt-2 rounded-[30px] bg-[radial-gradient(110%_100%_at_50%_0%,#fff_0%,#f0e3ec_100%)] px-5 py-14 sm:mx-4 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-[var(--parakh-plum-dark)] shadow-sm">
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
          <p className="mx-auto mt-6 max-w-3xl rounded-[18px] bg-white/85 px-4 py-3 text-left text-xs leading-5 text-[#5f5259] border border-[#ebd8e5]">
            {disclosure}
          </p>
        </div>
      </section>

      {/* Hero Feature Section: Explainable Counterparty Attribution */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="rounded-[30px] bg-white p-7 sm:p-10 shadow-[0_4px_30px_rgba(42,24,31,0.06)] border border-[#ebd8e5]">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--parakh-wash)] px-3 py-1 text-xs font-semibold text-[var(--parakh-plum-dark)]">
              <Scale className="size-3.5" />
              The Hero Feature of Parakh
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--parakh-ink)]">
              Explainable Counterparty{' '}
              <span className="font-serif italic font-normal text-[var(--parakh-plum)]">
                Attribution.
              </span>
            </h2>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#594b54]">
              In Indian commercial due diligence, finding public records is easy; knowing whether a court case or registry entry actually belongs to your counterparty is the hardest problem. Naive text matches cause false alarms that unfairly freeze credit.
              <br className="hidden sm:block" />
              <strong>Parakh&apos;s hero feature</strong> solves this by evaluating structured corroborating evidence and explaining its reasoning in plain, transparent language.
            </p>
          </div>

          {/* How AI Enables It: 3 Factor Cards */}
          <div className="mt-8">
            <p className="text-xs font-bold tracking-wider text-[var(--parakh-plum-dark)] uppercase">
              How AI powers attribution in Round 2
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {attributionFactors.map((factor) => {
                const Icon = factor.icon;
                return (
                  <div
                    key={factor.title}
                    className="rounded-[22px] bg-[var(--parakh-wash)] p-5 border border-[var(--parakh-blush)] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="grid size-9 place-items-center rounded-xl bg-white text-[var(--parakh-plum)] shadow-sm">
                          <Icon className="size-4" />
                        </span>
                        <span className="text-[11px] font-bold text-[var(--parakh-plum-dark)]">
                          {factor.badge}
                        </span>
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-[var(--parakh-ink)]">
                        {factor.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#675b63]">
                        {factor.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Round 1 vs Round 2 Comparison */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[22px] bg-[#fbf8f5] p-5 border border-[#ede3eb]">
              <span className="text-xs font-bold tracking-wider text-[#82717c] uppercase">
                Round 1 · Deterministic Baseline
              </span>
              <h4 className="mt-2 text-base font-semibold text-[var(--parakh-ink)]">
                Keyword Matching & Raw Signals
              </h4>
              <p className="mt-2 text-sm leading-6 text-[#675b63]">
                Previous iterations relied on static string similarity and fixture fallback grades. Underwriters saw whether a candidate matched text, but lacked plain-language explanation of why records diverged or matched.
              </p>
            </div>
            <div className="rounded-[22px] bg-[radial-gradient(ellipse_at_top_right,#fbf0f6,#f3e1ed)] p-5 border border-[#e2cadc]">
              <span className="text-xs font-bold tracking-wider text-[var(--parakh-plum-dark)] uppercase">
                Round 2 · AI Attribution Reasoning
              </span>
              <h4 className="mt-2 text-base font-semibold text-[var(--parakh-plum-dark)]">
                Structured Evidence + Confidence Reasoning
              </h4>
              <p className="mt-2 text-sm leading-6 text-[#5d4357]">
                AI now acts as a bounded due diligence reviewer. It analyzes Name similarity, PAN patterns, and Filing timelines, yielding explicit factor tags, proportional confidence gauges, and concise human-readable justifications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The 6-Step Pipeline */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div>
          <p className="text-xs font-bold tracking-wider text-[#82717c] uppercase">
            Data Architecture
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--parakh-ink)]">
            The 6-Step Verification Pipeline
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#675b63] max-w-2xl">
            From raw scenario fixture through normalization, runtime AI attribution reasoning, and final dual-output rendering.
          </p>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {pipeline.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="rounded-[24px] bg-white p-5 shadow-[0_12px_40px_rgba(42,24,31,0.05)] border border-[#ede3eb]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#9b8793]">
                    {step.number}
                  </span>
                  <span className="grid size-9 place-items-center rounded-full bg-[#fbf2f7] text-[#7a336f]">
                    <Icon className="size-4" />
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-semibold capitalize">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#675b63]">
                  {step.detail}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Evidence Lab: Deterministic Journey & Scenarios */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="rounded-[22px] bg-[#201d1d] p-5 text-white sm:p-7 shadow-[0_12px_40px_rgba(42,24,31,0.12)]">
          <div className="flex items-center gap-3.5">
            <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-[#e8c7df]">
              <GitBranch className="size-5" />
            </span>
            <div>
              <p className="text-sm sm:text-base font-semibold">
                {'Fixture -> adapter -> engine -> report schema -> renderer'}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-white/65">
                A deterministic, fixture-only V4-shaped journey.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 space-y-6">
          {RAW_SYNTHETIC_SCENARIOS.map((scenario, index) => {
            const demoRef = `DEMO-2026-000${index + 1}`;
            const report = buildSyntheticReport(scenario.identifier);
            const mapping = report.observations.map((observation) => ({
              label: observation.label,
              observation: observation.title,
              attribution: observation.attribution,
              provenance: observation.provenance,
            }));

            return (
              <article
                key={scenario.identifier}
                className="rounded-[26px] bg-white p-6 shadow-[0_1px_4px_rgba(32,29,29,0.06),0_12px_40px_rgba(42,24,31,0.04)] border border-[#ede3eb] sm:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#efe4e9] pb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[var(--parakh-plum)] tracking-wider">
                        {demoRef}
                      </span>
                      <span className="text-xs text-[#b09da8]">·</span>
                      <span className="font-mono text-xs text-[#82717c]">
                        {scenario.identifier}
                      </span>
                    </div>
                    <h2 className="mt-1.5 text-2xl font-semibold text-[var(--parakh-ink)] sm:text-3xl">
                      {scenario.shortName}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#675b63]">
                      {scenario.judgePrompt}
                    </p>
                  </div>
                  <a
                    href={`/report/${encodeURIComponent(demoRef)}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--parakh-plum)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--parakh-plum-dark)]"
                  >
                    Generate {demoRef} report
                    <ArrowRight className="size-4" />
                  </a>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="space-y-5">
                    <section>
                      <h3 className="text-sm font-semibold text-[var(--parakh-ink)]">
                        Normalized input
                      </h3>
                      <p className="mt-1.5 text-sm leading-6 text-[#675b63]">
                        {report.engine.identity.normalizedLegalName} | core name:{' '}
                        {report.engine.identity.coreName}
                      </p>
                    </section>

                    <section>
                      <h3 className="text-sm font-semibold text-[var(--parakh-ink)]">
                        Derived report fields
                      </h3>
                      <p className="mt-1.5 text-sm leading-6 text-[#675b63]">
                        {report.filingPattern.rows.length} filing periods;{' '}
                        {report.engine.court.reportable.length} attributable local
                        public-record candidate(s); confidence remains source-bounded.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-sm font-semibold text-[var(--parakh-ink)]">
                        Why these labels
                      </h3>
                      <ul className="mt-2 space-y-2 text-sm leading-6 text-[#675b63]">
                        {mapping.map((item) => (
                          <li
                            key={`${item.label}-${item.observation}`}
                            className="flex items-start gap-2"
                          >
                            <strong
                              className={
                                item.label === 'CLEAR'
                                  ? 'text-[var(--parakh-plum-dark)] font-bold shrink-0'
                                  : item.label === 'FLAG'
                                    ? 'text-[#a13b3b] font-bold shrink-0'
                                    : 'text-[#855e2d] font-bold shrink-0'
                              }
                            >
                              {item.label}
                            </strong>
                            <span>
                              {item.observation}: {item.attribution}.
                            </span>
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-sm font-semibold text-[var(--parakh-ink)]">
                        Unavailable data
                      </h3>
                      <p className="mt-1.5 text-sm leading-6 text-[#675b63]">
                        {report.cannotFind.join('; ')}.
                      </p>
                    </section>
                  </div>

                  <JsonPanel
                    value={{
                      synthetic: true,
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

      {/* Synthetic Boundary */}
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 sm:pb-24">
        <div className="rounded-[26px] bg-[#201b1e] p-6 text-white shadow-[0_20px_70px_rgba(42,24,31,0.12)] sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-7 text-[#d9a9ca]" />
                <h2 className="text-2xl sm:text-3xl font-semibold">
                  The boundary stays firm.
                </h2>
              </div>
              <p className="mt-4 text-sm leading-7 text-white/70">
                {disclosure}
              </p>
              <p className="mt-3 text-sm leading-7 text-white/70">
                The OpenAI key is read only by the server route from local
                <code className="mx-1 rounded bg-white/10 px-1.5 py-0.5 text-white">
                  OPENAI_API_KEY
                </code>
                configuration. It is never sent to the browser.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-xs leading-5 text-white/60 sm:max-w-xs shrink-0">
              Zero live government endpoints queried · Factual synthetic demonstration
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
