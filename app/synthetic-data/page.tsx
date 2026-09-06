import {
  ArrowRight,
  BrainCircuit,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Database,
  FileText,
  Fingerprint,
  GitBranch,
  Layers3,
  Scale,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { DemoProductHeader } from '@/components/demo-product-header';
import { SCENARIOS } from '@/lib/synthetic-engine';

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

export default function SyntheticDataPage() {
  return (
    <main className="min-h-screen bg-[#fbf8f5] text-[#201b1e]">
      <DemoProductHeader />

      {/* Hero Header */}
      <section className="mx-2 rounded-[30px] bg-[radial-gradient(circle_at_top,#fff_0%,#fbf2f7_48%,#efdfeb_100%)] px-5 py-14 sm:mx-4 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-[var(--parakh-plum)] shadow-sm">
            <Sparkles className="size-3.5" />
            Evidence Lab · Transparent Pipeline & Architecture
          </p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">
            See how a report becomes{' '}
            <span className="font-serif italic font-normal text-[var(--parakh-plum)]">
              evidence.
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#675b63] sm:text-lg">
            This lab makes the demo boundary inspectable: how raw public records
            transform into explainable counterparty intelligence, and how AI attribution
            powers the core hero feature in Round 2.
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

      {/* Scenarios & Synthetic Boundary (Previously shown) */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[26px] bg-white p-6 shadow-[0_20px_70px_rgba(42,24,31,0.08)] sm:p-8 border border-[#ede3eb]">
            <p className="text-xs font-semibold uppercase text-[#9b8793]">
              Five local fixtures
            </p>
            <h2 className="mt-2 text-3xl font-semibold">Nothing is fetched here.</h2>
            <p className="mt-2 text-sm text-[#675b63]">
              Each fixture models a distinct commercial credit situation with realistic Indian business profiles.
            </p>
            <div className="mt-6 grid gap-2.5">
              {SCENARIOS.map((scenario) => (
                <div
                  key={scenario.identifier}
                  className="rounded-[18px] bg-[#fbf8f5] p-4 border border-[#f0e6ee] hover:bg-[var(--parakh-wash)] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[var(--parakh-ink)]">
                      {scenario.shortName}
                    </span>
                    <ArrowRight className="size-4 text-[#a88e9f]" />
                  </div>
                  <div className="mt-1 text-xs text-[#675b63]">
                    <span className="font-mono font-medium text-[var(--parakh-plum)]">
                      {scenario.identifier}
                    </span>{' '}
                    · {scenario.scenarioType}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[26px] bg-[#201b1e] p-6 text-white shadow-[0_20px_70px_rgba(42,24,31,0.12)] sm:p-8 flex flex-col justify-between">
            <div>
              <ShieldCheck className="size-7 text-[#d9a9ca]" />
              <h2 className="mt-5 text-3xl font-semibold">The boundary stays firm.</h2>
              <p className="mt-4 text-sm leading-7 text-white/70">{disclosure}</p>
              <p className="mt-5 text-sm leading-7 text-white/70">
                The OpenAI key is read only by the server route from local
                <code className="mx-1 rounded bg-white/10 px-1.5 py-0.5 text-white">
                  OPENAI_API_KEY
                </code>
                configuration. It is never sent to the browser.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 text-xs text-white/50">
              Zero live government endpoints queried · Factual synthetic demonstration
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
