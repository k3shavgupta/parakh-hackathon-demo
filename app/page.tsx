'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  FileSearch,
  FileText,
  Fingerprint,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import {
  SCENARIOS,
  isAllowedSyntheticIdentifier,
} from '@/lib/synthetic-engine';
import { cn } from '@/lib/utils';
import { DemoProductHeader } from '@/components/demo-product-header';

const disclosure =
  'This hackathon demo uses synthetic data only. It does not access live government systems, private records, real GSTINs, PANs, Aadhaar numbers, OTPs, payments, or production Parakh data.';

const journeySteps = [
  {
    number: '01',
    icon: Search,
    title: 'Start with one identifier',
    body: 'A business owner enters one of five visible Demo References from this prototype.',
  },
  {
    number: '02',
    icon: Fingerprint,
    title: 'Make records readable',
    body: 'Parakh normalizes the local business, filing, and public-record fixtures into one evidence trail.',
  },
  {
    number: '03',
    icon: FileText,
    title: 'Read what is known',
    body: 'The report separates FLAG, CLEAR, and NOTE observations from limits and unavailable evidence.',
  },
];

const workingToday = [
  'Local synthetic profile lookup',
  'Normalized filing-pattern evidence',
  'Synthetic public-record examples',
  'Explainable FLAG, CLEAR, and NOTE observations',
  'Dedicated report URLs and scenario switching',
  'Fixture-only A4 PDF download',
];

export default function Home() {
  const router = useRouter();
  const [value, setValue] = useState(SCENARIOS[0].identifier);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [pendingReference, setPendingReference] = useState<string | null>(null);
  const generationTimer = useRef<number | null>(null);

  function runSearch(identifier: string) {
    const normalized = identifier.trim().toUpperCase();

    if (!isAllowedSyntheticIdentifier(normalized)) {
      setError('Real-looking IDs are blocked. Use a listed synthetic demo ID.');
      return;
    }

    if (!SCENARIOS.some((scenario) => scenario.identifier === normalized)) {
      setError('Choose one of the five listed synthetic demo IDs.');
      return;
    }

    setGenerating(true);
    setPendingReference(normalized);
    generationTimer.current = window.setTimeout(
      () => router.push(`/report/${encodeURIComponent(normalized)}`),
      1200,
    );
  }

  function continueToReport() {
    if (!pendingReference) return;
    if (generationTimer.current !== null) {
      window.clearTimeout(generationTimer.current);
    }
    router.push(`/report/${encodeURIComponent(pendingReference)}`);
  }

  function cancelGeneration() {
    if (generationTimer.current !== null) {
      window.clearTimeout(generationTimer.current);
    }
    setGenerating(false);
    setPendingReference(null);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--parakh-bg)] text-[var(--parakh-ink)]">
      {generating ? (
        <div
          aria-live="assertive"
          className="fixed inset-0 z-50 grid place-items-center bg-[#201d1d]/40 px-5 backdrop-blur-sm"
        >
          <section className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_24px_80px_rgba(32,29,29,0.2)]">
            <p className="text-sm font-semibold text-[var(--parakh-plum)]">
              Preparing synthetic report
            </p>
            <ol className="mt-5 space-y-3 text-sm leading-6 text-[#675a62]">
              {[
                'Load synthetic registration evidence',
                'Interpret synthetic filing periods',
                'Resolve synthetic public-record candidates',
                'Assemble findings and limitations',
                'Render report',
              ].map((step, index) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--parakh-wash)] text-xs font-semibold text-[var(--parakh-plum)]">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <p className="mt-5 text-xs leading-5 text-[#8a7982]">
              Reading local fictional fixtures only. No network request is made.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={continueToReport}
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--parakh-plum)] px-4 text-sm font-semibold text-white"
              >
                Continue to report
              </button>
              <button
                type="button"
                onClick={cancelGeneration}
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--parakh-wash)] px-4 text-sm font-semibold text-[var(--parakh-plum-dark)]"
              >
                Back to demo
              </button>
            </div>
          </section>
        </div>
      ) : null}
      <DemoProductHeader />

      <section
        aria-labelledby="build-heading"
        className="demo-production-hero"
      >
        <div className="demo-production-hero__inner">
          <a className="demo-production-hackathon-badge" href="https://buildwhatmovesindia.com/">
            <Sparkles aria-hidden="true" className="size-4" />
            Built for Build What Moves India
          </a>
          <p className="demo-production-eyebrow"><span>प</span> GST + court record check</p>
          <h1 id="build-heading" className="demo-production-heading">
            One GSTIN.<br />The <em>whole record</em>.
          </h1>
          <p className="demo-production-subtitle">
            Before you send goods on credit, check a counterparty reference. This public demo shows how GST and published court-record evidence can become readable, using fictional local fixtures only.
          </p>
          <form
            className="demo-production-search"
            onSubmit={(event) => {
              event.preventDefault();
              runSearch(value);
            }}
          >
            <label htmlFor="demo-reference" className="sr-only">Demo reference</label>
            <input
              id="demo-reference"
              aria-label="Demo reference"
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setError('');
              }}
              placeholder="ENTER DEMO REFERENCE (E.G. DEMO-2026-0001)"
              className="demo-production-search__input"
            />
            <button
              type="submit"
              className="demo-production-search__button"
            >
              Run Parakh Check
              <ArrowRight className="size-4" />
            </button>
          </form>
          <p aria-live="polite" className="demo-production-error">{error}</p>
          <p className="demo-production-micro">✦ Synthetic report only <i>•</i> Five fictional scenarios <i>•</i> Instant local result</p>
          <p className="demo-production-hackathon">Built for Build What Moves India. {disclosure}</p>

          <div className="demo-production-visual" aria-label="Synthetic report preview">
            <div className="demo-production-report">
              <div className="demo-production-report__top">
                <div className="demo-production-report__id">DEMO REFERENCE <b>DEMO-2026-0002</b> <span>· synthetic only</span></div>
                <span className="demo-production-stamp">SPECIMEN</span>
              </div>
              <div className="demo-production-rows">
                <div className="demo-production-row">
                  <span>IDENTITY</span><strong>Fixture profile found and normalized</strong><b className="demo-chip demo-chip--clear">CLEAR</b>
                </div>
                <div className="demo-production-row demo-production-row--filing">
                  <span>FILING</span><strong>Repeated filing delay pattern in fictional periods</strong><b className="demo-chip demo-chip--flag">FLAG</b>
                  <div className="demo-production-strip"><div><i /><i /><i /><i /><i /><i /><i /><i /></div><p>2 of 5 on time <em>synthetic periods only</em></p></div>
                </div>
                <div className="demo-production-row">
                  <span>RECORDS</span><strong>Fictional public-record example with attribution</strong><b className="demo-chip demo-chip--note">NOTE</b>
                </div>
                <div className="demo-production-row">
                  <span>LIMITS</span><strong>No live records, private ledgers, or payment data</strong><b className="demo-chip demo-chip--note">NOTE</b>
                </div>
              </div>
              <div className="demo-production-report__foot"><b>Could not find:</b> anything outside these local fictional fixtures.</div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="journey"
        aria-labelledby="journey-heading"
        className="mx-auto max-w-7xl px-5 py-18 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[var(--parakh-wash)] px-3 text-xs font-semibold text-[var(--parakh-plum-dark)]">
            <Building2 className="size-3.5" />
            The citizen journey
          </p>
          <h2
            id="journey-heading"
            className="mt-5 text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-[1.06] tracking-[-0.025em]"
          >
            Know who you are dealing{' '}
            <span className="font-serif text-[1.04em] font-normal italic text-[var(--parakh-plum)]">
              with.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#675a62]">
            A small business owner needs to check a supplier, buyer, or
            logistics partner before extending credit. This prototype makes that
            one task understandable from start to finish.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {journeySteps.map(({ number, icon: Icon, title, body }) => (
            <article
              key={number}
              className="rounded-[24px] bg-white p-6 shadow-[0_1px_3px_rgba(42,24,31,0.06)]"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-[var(--parakh-wash)] text-[var(--parakh-plum)]">
                  <Icon className="size-5" />
                </span>
                <span className="text-xs font-semibold text-[#9a8992]">
                  {number}
                </span>
              </div>
              <h3 className="mt-7 text-xl font-medium">{title}</h3>
              <p className="mt-3 leading-7 text-[#6b5e66]">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="demo"
        aria-labelledby="demo-heading"
        className="scroll-mt-6 mx-2 rounded-[30px] bg-white px-5 py-16 sm:mx-4 sm:px-8 sm:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.76fr_1.24fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <p className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[var(--parakh-wash)] px-3 text-xs font-semibold text-[var(--parakh-plum-dark)]">
              <FileSearch className="size-3.5" />
              Live synthetic journey
            </p>
            <h2
              id="demo-heading"
              className="mt-5 text-[clamp(2.5rem,4.5vw,4.1rem)] font-medium leading-[1.06] tracking-[-0.025em]"
            >
              Try the report{' '}
              <span className="font-serif text-[1.04em] font-normal italic text-[var(--parakh-plum)]">
                yourself.
              </span>
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-[#675a62]">
              Choose one of five fictional business situations, or type its
              listed demo reference. Each opens a dedicated report page using local
              fixtures only.
            </p>

            <form
              className="mt-7 rounded-[24px] bg-[var(--parakh-blush)] p-3"
              onSubmit={(event) => {
                event.preventDefault();
                runSearch(value);
              }}
            >
              <label htmlFor="scenario-reference" className="sr-only">
                Reference picker
              </label>
              <input
                id="scenario-reference"
                aria-label="Reference picker"
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                  setError('');
                }}
                className="min-h-12 w-full rounded-full border-0 bg-white px-5 text-sm font-semibold text-[var(--parakh-ink)] outline-none ring-[var(--parakh-plum)] focus:ring-2"
              />
              <button
                type="submit"
                className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--parakh-plum)] px-6 text-sm font-semibold text-white transition hover:brightness-95 active:scale-[0.98]"
              >
                Run listed reference
                <ArrowRight className="size-4" />
              </button>
              <p
                aria-live="polite"
                className="min-h-5 px-2 pt-3 text-xs font-medium text-[#9c4350]"
              >
                {error}
              </p>
            </form>
            <p className="mt-4 text-xs leading-5 text-[#81717a]">
              The demo accepts only listed demo references. Real-looking personal
              or government identifiers are blocked.
            </p>
          </div>

          <div className="grid gap-3">
            {SCENARIOS.map((scenario, index) => {
              const Icon = [
                BadgeCheck,
                FileText,
                Fingerprint,
                Scale,
                ShieldCheck,
              ][index];
              return (
                <button
                  key={scenario.identifier}
                  type="button"
                  onClick={() => runSearch(scenario.identifier)}
                  aria-label={`${scenario.identifier}: ${scenario.shortName}, ${scenario.scenarioType}`}
                  className={cn(
                    'group flex min-h-28 items-center gap-4 rounded-[22px] bg-[var(--parakh-bg)] p-4 text-left transition hover:-translate-y-0.5 hover:bg-[var(--parakh-wash)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--parakh-plum)] sm:p-5',
                    value === scenario.identifier &&
                      'ring-1 ring-[var(--parakh-plum)]',
                  )}
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-[var(--parakh-plum)] shadow-[0_1px_3px_rgba(42,24,31,0.05)]">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold text-[#8d7c86]">
                      {scenario.identifier}
                    </span>
                    <span className="mt-1 block text-base font-semibold text-[var(--parakh-ink)]">
                      {scenario.shortName}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-[#6b5e66]">
                      {scenario.scenarioType}
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-[#a88e9f] transition group-hover:translate-x-1 group-hover:text-[var(--parakh-plum)]" />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="method"
        aria-labelledby="clarity-heading"
        className="mx-auto max-w-7xl px-5 py-18 sm:px-8 sm:py-24"
      >
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[var(--parakh-wash)] px-3 text-xs font-semibold text-[var(--parakh-plum-dark)]">
              <Scale className="size-3.5" />
              Why this is clearer
            </p>
            <h2
              id="clarity-heading"
              className="mt-5 text-[clamp(2.5rem,4.5vw,4.1rem)] font-medium leading-[1.06] tracking-[-0.025em]"
            >
              Less hunting. More{' '}
              <span className="font-serif text-[1.04em] font-normal italic text-[var(--parakh-plum)]">
                context.
              </span>
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-[#675a62]">
              Today, a counterparty check can mean portal searches, screenshots,
              filing tables, name variants, and uncertain public-record clues.
              Parakh puts the available evidence beside the language needed to
              interpret it responsibly.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-[24px] bg-white p-6 shadow-[0_1px_3px_rgba(42,24,31,0.06)]">
              <p className="text-xs font-semibold text-[#9a8992]">
                THE MANUAL WAY
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-[#6c5f66]">
                {[
                  'Different portals and screenshots',
                  'Periods that are hard to compare',
                  'Name variations without context',
                  'Missing evidence left unexplained',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#be9daf]" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
            <article className="rounded-[24px] bg-[var(--parakh-wash)] p-6">
              <p className="text-xs font-semibold text-[var(--parakh-plum-dark)]">
                THE PARAKH VIEW
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-[#5d4357]">
                {[
                  'Normalized period-by-period evidence',
                  'Source and provenance labels',
                  'Confidence with attribution',
                  'Clear limits and what was not found',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-[var(--parakh-plum)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section
        id="works"
        aria-labelledby="works-heading"
        className="mx-2 rounded-[30px] bg-[var(--parakh-ink)] px-5 py-16 text-white sm:mx-4 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white/10 px-3 text-xs font-semibold text-[#eed6e9]">
              <BadgeCheck className="size-3.5" />
              What works in this prototype
            </p>
            <h2
              id="works-heading"
              className="mt-5 text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-[1.06] tracking-[-0.025em]"
            >
              A complete journey,{' '}
              <span className="font-serif text-[1.04em] font-normal italic text-[#dba4d0]">
                safely shown.
              </span>
            </h2>
            <p className="mt-5 leading-7 text-white/68">
              Judges can go from one synthetic identifier to a readable report,
              compare situations, and download a fixture-only A4 PDF without a login
              or a live source connection.
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {workingToday.map((item, index) => (
              <div key={item} className="rounded-[22px] bg-white/[0.06] p-5">
                <span className="text-xs font-semibold text-[#dba4d0]">
                  0{index + 1}
                </span>
                <p className="mt-5 text-base font-medium leading-6">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="boundary"
        aria-labelledby="boundary-heading"
        className="mx-2 mt-5 rounded-[30px] bg-[radial-gradient(120%_90%_at_50%_0%,#ffffff_0%,#fbf0f6_55%,#ecd8e6_100%)] px-5 py-16 sm:mx-4 sm:px-8 sm:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white px-3 text-xs font-semibold text-[var(--parakh-plum-dark)]">
              <ShieldCheck className="size-3.5" />
              Mocked, by design
            </p>
            <h2
              id="boundary-heading"
              className="mt-5 text-[clamp(2.5rem,4.5vw,4.1rem)] font-medium leading-[1.06] tracking-[-0.025em]"
            >
              Honest about what is{' '}
              <span className="font-serif text-[1.04em] font-normal italic text-[var(--parakh-plum)]">
                missing.
              </span>
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-7 text-[#62535c] sm:text-base">
            <p className="rounded-[22px] bg-white/80 p-5 font-medium text-[var(--parakh-ink)] shadow-[0_1px_3px_rgba(42,24,31,0.05)]">
              {disclosure}
            </p>
            <p>
              Business facts, filing rows, public-record examples, report IDs,
              confidence language, and provenance labels are all mocked local
              fixtures. The demo is designed to make that boundary easy to see.
            </p>
            <p>
              At scale, production use would require authorized APIs,
              consent-aware handling, audit logs, rate limits, data provenance,
              retention limits, security controls, and human-readable
              limitations.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-2 mt-5 rounded-[30px] bg-white px-5 py-16 sm:mx-4 sm:px-8 sm:py-24">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[var(--parakh-plum)]">Live production preview</p>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.75rem)] font-medium leading-[1.06] tracking-[-0.02em]">
              Continue to the live{' '}
              <span className="font-serif italic text-[var(--parakh-plum)]">Parakh product.</span>
            </h2>
            <p className="mt-4 text-base leading-7 text-[#675a62]">
              This public build uses fictional fixtures only. Production Parakh is separate and requires sign-in for authorized real-data workflows.
            </p>
          </div>
          <a
            href="https://parakh.biz"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-[var(--parakh-ink)] px-5 text-sm font-semibold text-white"
          >
            Head to parakh.biz
            <ArrowRight className="size-4" />
          </a>
        </div>
      </section>

      <footer className="px-5 py-8 text-center text-xs font-semibold text-[#81717a]">
        Standalone Build What Moves India prototype. Production parakh.biz is
        unchanged.
      </footer>
    </main>
  );
}
