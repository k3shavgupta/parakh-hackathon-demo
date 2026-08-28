'use client';

import { useMemo, useState } from 'react';
import {
  ArrowDown,
  Check,
  Download,
  FileText,
  Gauge,
  LockKeyhole,
  Printer,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  SCENARIOS,
  buildSyntheticReport,
  isAllowedSyntheticIdentifier,
  type SyntheticReport,
} from '@/lib/synthetic-engine';
import { cn } from '@/lib/utils';

const disclosure =
  'This hackathon demo uses synthetic data only. It does not access live government systems, private records, real GSTINs, PANs, Aadhaar numbers, OTPs, payments, or production Parakh data.';

function labelClass(label: 'FLAG' | 'CLEAR' | 'NOTE') {
  if (label === 'FLAG') return 'bg-[#fff1e8] text-[#9b3f18]';
  if (label === 'CLEAR') return 'bg-[#ecf8f0] text-[#236341]';
  return 'bg-[#f3efff] text-[#5f3d88]';
}

function reportToText(report: SyntheticReport) {
  return [
    `Parakh synthetic report ${report.reportId}`,
    `Generated: ${report.generatedAt}`,
    `Identifier: ${report.searchedIdentifier}`,
    '',
    disclosure,
    '',
    report.summary,
    '',
    `Business: ${report.business.legalName}`,
    `Trade name: ${report.business.tradeName}`,
    `State: ${report.business.registrationState}`,
    '',
    'Observations:',
    ...report.observations.map(
      (item) =>
        `- ${item.label}: ${item.title}. ${item.detail} Confidence: ${item.confidence}. Source: ${item.provenance}`,
    ),
    '',
    'What we could not find:',
    ...report.cannotFind.map((item) => `- ${item}`),
  ].join('\n');
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[24px] bg-white p-5 shadow-[0_1px_2px_rgba(42,24,52,0.05)]">
      <div className="text-3xl font-semibold text-[#2f1638]">{value}</div>
      <div className="mt-2 text-sm leading-5 text-[#746576]">{label}</div>
    </div>
  );
}

export default function Home() {
  const [input, setInput] = useState(SCENARIOS[0].identifier);
  const [activeIdentifier, setActiveIdentifier] = useState(
    SCENARIOS[0].identifier,
  );
  const [phase, setPhase] = useState<'ready' | 'generating' | 'blocked'>(
    'ready',
  );

  const activeScenario = SCENARIOS.find(
    (scenario) => scenario.identifier === activeIdentifier,
  );
  const report = useMemo(
    () => buildSyntheticReport(activeIdentifier),
    [activeIdentifier],
  );
  const downloadHref = useMemo(
    () =>
      `data:text/plain;charset=utf-8,${encodeURIComponent(reportToText(report))}`,
    [report],
  );

  function generate(identifier: string) {
    const normalized = identifier.trim().toUpperCase();
    if (!isAllowedSyntheticIdentifier(normalized)) {
      setPhase('blocked');
      return;
    }

    setPhase('generating');
    window.setTimeout(() => {
      setActiveIdentifier(normalized);
      setInput(normalized);
      setPhase('ready');
    }, 650);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fffefd] text-[#2a1834]">
      <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/78 px-4 py-3 backdrop-blur-xl print:hidden sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <a
            href="#demo"
            className="flex items-center gap-3"
            aria-label="Parakh demo home"
          >
            <span className="grid size-10 place-items-center rounded-[14px] bg-[#4a235d] text-sm font-semibold text-white">
              P
            </span>
            <span className="text-lg font-semibold">Parakh</span>
          </a>
          <div className="hidden items-center gap-6 text-sm font-medium text-[#65546b] lg:flex">
            <a href="#why">Why</a>
            <a href="#method">Method</a>
            <a href="#boundary">Boundary</a>
            <a href="#scale">Scale</a>
          </div>
          <Button
            className="h-11 rounded-full bg-[#2a1834] px-5 text-white hover:bg-[#3c2548]"
            onClick={() => generate(input)}
          >
            <Search data-icon="inline-start" />
            Try report
          </Button>
        </div>
      </nav>

      <section
        id="demo"
        className="mx-2 mt-3 rounded-[32px] bg-[radial-gradient(120%_90%_at_50%_0%,#ffffff_0%,#f6edff_58%,#ead9ff_100%)] px-4 py-12 sm:mx-4 sm:px-8 sm:py-16 lg:py-20"
      >
        <div className="mx-auto grid max-w-7xl items-start gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-7 pt-2">
            <Badge className="h-auto rounded-full bg-white px-4 py-2 text-sm font-medium text-[#5d3a70] shadow-[0_1px_2px_rgba(42,24,52,0.05)]">
              Build What Moves India synthetic demo
            </Badge>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold leading-[1.03] sm:text-6xl lg:text-7xl xl:text-8xl">
                Counterparty checks, made{' '}
                <span className="font-serif italic text-[#7b3fa0]">
                  readable
                </span>
                .
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[#5d5062] sm:text-xl">
                Parakh turns scattered GST filing patterns and public-record
                signals into an evidence-first business report that a real
                Indian business owner can actually read.
              </p>
            </div>
            <div className="rounded-[28px] bg-white/82 p-4 text-sm leading-6 text-[#563f60] shadow-[0_20px_70px_rgba(81,41,104,0.12)]">
              <strong className="font-semibold text-[#2a1834]">
                Visible boundary:
              </strong>{' '}
              {disclosure}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Stat value="5" label="fake business scenarios" />
              <Stat value="0" label="logins, payments, live APIs" />
              <Stat value="3" label="labels: FLAG, CLEAR, NOTE" />
            </div>
          </div>

          <section className="rounded-[30px] bg-white p-4 shadow-[0_28px_90px_rgba(67,29,88,0.16)] sm:p-6">
            <div className="flex flex-col gap-4 border-b border-[#eee5f4] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[#7b3fa0]">
                  Instant judge journey
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  Generate a synthetic report
                </h2>
              </div>
              <Badge className="h-auto rounded-full bg-[#f6efff] px-3 py-1.5 text-[#70448e]">
                No login
              </Badge>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {SCENARIOS.map((scenario) => (
                <button
                  key={scenario.identifier}
                  type="button"
                  onClick={() => generate(scenario.identifier)}
                  className={cn(
                    'rounded-[22px] border p-4 text-left transition hover:-translate-y-0.5 focus:outline-none focus:ring-3 focus:ring-[#b98de8]/30',
                    scenario.identifier === activeIdentifier
                      ? 'border-[#8b4cb4] bg-[#f8f0ff]'
                      : 'border-[#efe4f6] bg-[#fffefd]',
                  )}
                >
                  <span className="block text-sm font-semibold text-[#2a1834]">
                    {scenario.shortName}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[#746576]">
                    {scenario.judgePrompt}
                  </span>
                </button>
              ))}
            </div>

            <form
              className="mt-5 flex flex-col gap-3 rounded-[24px] bg-[#faf7fc] p-3 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                generate(input);
              }}
            >
              <Input
                aria-label="Synthetic Parakh identifier"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="h-12 rounded-full border-[#eadff2] bg-white px-5 text-base"
              />
              <Button
                type="submit"
                className="h-12 rounded-full bg-[#8b4cb4] px-6 text-white hover:bg-[#7b3fa0]"
              >
                <Sparkles data-icon="inline-start" />
                Generate
              </Button>
            </form>

            {phase === 'blocked' ? (
              <p className="mt-3 rounded-full bg-[#fff2ee] px-4 py-3 text-sm text-[#913b20]">
                Use one of the obvious synthetic identifiers above. Real-looking
                IDs are rejected.
              </p>
            ) : null}

            <div
              className="mt-6 rounded-[26px] bg-[#2a1834] p-5 text-white"
              aria-live="polite"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white/65">v4-style local engine</p>
                  <h3 className="mt-1 text-2xl font-semibold">
                    {report.reportId}
                  </h3>
                </div>
                <Gauge
                  className={cn(
                    'size-8 text-[#d8b9ff]',
                    phase === 'generating' && 'animate-spin',
                  )}
                />
              </div>
              <ol className="mt-5 grid gap-2 text-sm text-white/78">
                {report.generationSteps.map((step, index) => (
                  <li key={step} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 text-[#d8b9ff]" />
                    <span>
                      {phase === 'generating' && index > 1
                        ? 'Preparing...'
                        : step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-16 sm:px-8 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="space-y-4">
          <Badge className="h-auto rounded-full bg-[#f6efff] px-3 py-1.5 text-[#70448e]">
            {activeScenario?.scenarioType}
          </Badge>
          <h2 className="text-4xl font-semibold leading-[1.06] sm:text-5xl lg:text-6xl">
            Report for{' '}
            <span className="font-serif italic text-[#7b3fa0]">
              {report.business.tradeName}
            </span>
          </h2>
          <p className="text-lg leading-8 text-[#65576b]">{report.summary}</p>
          <div className="flex flex-wrap gap-3 print:hidden">
            <Button
              className="h-11 rounded-full bg-[#2a1834] px-5 text-white hover:bg-[#3c2548]"
              onClick={() => window.print()}
            >
              <Printer data-icon="inline-start" />
              Print report
            </Button>
            <a
              href={downloadHref}
              download={`${report.reportId.toLowerCase()}-synthetic-report.txt`}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-[#f1e4fb] px-5 text-sm font-medium text-[#6f3c8b] transition hover:bg-[#ead8f8] focus:outline-none focus:ring-3 focus:ring-[#b98de8]/30"
            >
              <Download data-icon="inline-start" />
              Download text
            </a>
          </div>
        </div>

        <article className="rounded-[30px] bg-white p-5 shadow-[0_20px_80px_rgba(42,24,52,0.1)] sm:p-7">
          <header className="flex flex-col gap-4 border-b border-[#efe4f6] pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#7b3fa0]">
                Synthetic Parakh report
              </p>
              <h3 className="mt-1 text-3xl font-semibold">
                {report.business.legalName}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#746576]">
                {report.business.constitution} |{' '}
                {report.business.registrationState} |{' '}
                {report.business.registrationStatus}
              </p>
            </div>
            <div className="rounded-[18px] bg-[#faf7fc] px-4 py-3 text-sm text-[#5f4d66]">
              <div className="font-semibold text-[#2a1834]">
                {report.reportId}
              </div>
              <div>{report.generatedAt}</div>
            </div>
          </header>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {report.observations.map((item) => (
              <section
                key={`${item.label}-${item.title}`}
                className="rounded-[24px] bg-[#fbf8fd] p-5"
              >
                <Badge
                  className={cn(
                    'h-auto rounded-full px-3 py-1',
                    labelClass(item.label),
                  )}
                >
                  {item.label}
                </Badge>
                <h4 className="mt-4 text-lg font-semibold">{item.title}</h4>
                <p className="mt-2 text-sm leading-6 text-[#65576b]">
                  {item.detail}
                </p>
                <dl className="mt-4 space-y-2 text-xs text-[#746576]">
                  <div>
                    <dt className="font-semibold text-[#4d3857]">Confidence</dt>
                    <dd>{item.confidence}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#4d3857]">
                      Attribution
                    </dt>
                    <dd>{item.attribution}</dd>
                  </div>
                </dl>
              </section>
            ))}
          </div>

          <section className="mt-7">
            <h4 className="text-xl font-semibold">Business profile summary</h4>
            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              {[
                ['Trade name', report.business.tradeName],
                ['Synthetic address', report.business.syntheticAddress],
                [
                  'Normalized names',
                  report.business.normalizedNames.join(', '),
                ],
                ['Provenance', report.business.provenance],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[20px] bg-[#fbf8fd] p-4">
                  <div className="font-semibold text-[#4d3857]">{label}</div>
                  <div className="mt-1 leading-6 text-[#65576b]">{value}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-7">
            <h4 className="text-xl font-semibold">Filing pattern</h4>
            <p className="mt-1 text-sm text-[#746576]">
              {report.filingPattern.explanation} Confidence:{' '}
              {report.filingPattern.confidence}.
            </p>
            <div className="mt-4 overflow-x-auto rounded-[22px] border border-[#efe4f6]">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-[#faf7fc] text-[#4d3857]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Period</th>
                    <th className="px-4 py-3 font-semibold">GSTR-1</th>
                    <th className="px-4 py-3 font-semibold">GSTR-3B</th>
                    <th className="px-4 py-3 font-semibold">Filed on</th>
                  </tr>
                </thead>
                <tbody>
                  {report.filingPattern.rows.map((row) => (
                    <tr key={row.period} className="border-t border-[#efe4f6]">
                      <td className="px-4 py-3 font-medium">{row.month}</td>
                      <td className="px-4 py-3 capitalize text-[#65576b]">
                        {row.gstr1}
                      </td>
                      <td className="px-4 py-3 capitalize text-[#65576b]">
                        {row.gstr3b}
                      </td>
                      <td className="px-4 py-3 text-[#65576b]">
                        {row.filedOn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-7 grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-xl font-semibold">
                Public-record/court signals
              </h4>
              <div className="mt-3 space-y-3">
                {report.publicRecords.length ? (
                  report.publicRecords.map((record) => (
                    <div
                      key={record.id}
                      className="rounded-[22px] bg-[#fbf8fd] p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          className={cn(
                            'h-auto rounded-full px-3 py-1',
                            labelClass(record.signal),
                          )}
                        >
                          {record.signal}
                        </Badge>
                        <span className="text-sm font-semibold">
                          {record.id}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[#65576b]">
                        {record.summary}
                      </p>
                      <p className="mt-2 text-xs text-[#746576]">
                        {record.date} | Confidence: {record.confidence} |{' '}
                        {record.provenance}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[22px] bg-[#fbf8fd] p-4 text-sm leading-6 text-[#65576b]">
                    No synthetic public-record signal is present in this
                    fixture.
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-xl font-semibold">What we could not find</h4>
              <ul className="mt-3 space-y-2">
                {report.cannotFind.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 rounded-[18px] bg-[#fbf8fd] p-3 text-sm text-[#65576b]"
                  >
                    <ArrowDown className="mt-0.5 size-4 text-[#8b4cb4]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-7 rounded-[24px] bg-[#f6efff] p-5">
            <h4 className="text-xl font-semibold">
              How this report was generated
            </h4>
            <p className="mt-2 text-sm leading-6 text-[#5f4d66]">
              The v4-style demo accepts a synthetic identifier, loads local
              fixtures, normalizes business names, dates, periods, and record
              parties, then emits observations with confidence, attribution,
              provenance, limitations, and no score.
            </p>
            <p className="mt-4 text-sm font-semibold leading-6 text-[#4d3857]">
              {report.syntheticDisclosure}
            </p>
          </section>
        </article>
      </section>

      <section
        id="why"
        className="mx-2 rounded-[32px] bg-[#2a1834] px-5 py-16 text-white sm:mx-4 sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto grid size-10 place-items-center rounded-[14px] bg-white text-[#2a1834]">
              <FileText className="size-5" />
            </div>
            <h2 className="mt-6 text-4xl font-semibold leading-[1.06] sm:text-5xl lg:text-6xl">
              Public checks are{' '}
              <span className="font-serif italic text-[#d8b9ff]">
                fragmented
              </span>
              .
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/70">
              Small teams still jump across portals, PDFs, screenshots,
              half-matching names, and uncertain filing timelines. Parakh makes
              the evidence readable before money, goods, or trust moves.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              [
                'Who it helps',
                'Procurement teams, SMEs, lenders, marketplaces, and operations teams checking a counterparty before action.',
              ],
              [
                'What it clarifies',
                'Identity, filing patterns, public-record signals, source labels, confidence, and missing evidence.',
              ],
              [
                'What it avoids',
                'No scores, trust ratings, credit verdicts, or synthetic claims presented as live government facts.',
              ],
            ].map(([title, body]) => (
              <div key={title} className="rounded-[24px] bg-white/[0.06] p-6">
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-3 leading-7 text-white/68">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="method"
        className="mx-auto grid max-w-7xl gap-6 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:py-24"
      >
        <div>
          <Badge className="h-auto rounded-full bg-[#f6efff] px-3 py-1.5 text-[#70448e]">
            How Parakh makes it clearer
          </Badge>
          <h2 className="mt-5 text-4xl font-semibold leading-[1.06] sm:text-5xl lg:text-6xl">
            Evidence before{' '}
            <span className="font-serif italic text-[#7b3fa0]">opinion</span>.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            [
              '1',
              'Read inputs',
              'Start with a business identifier and known aliases.',
            ],
            [
              '2',
              'Normalize records',
              'Standardize names, periods, dates, and parties before comparison.',
            ],
            [
              '3',
              'Explain signals',
              'Convert patterns into FLAG, CLEAR, or NOTE observations with provenance.',
            ],
            [
              '4',
              'Show limits',
              'State missing data, confidence, and production safety requirements plainly.',
            ],
          ].map(([number, title, body]) => (
            <div key={title} className="rounded-[24px] bg-[#fbf8fd] p-6">
              <div className="grid size-9 place-items-center rounded-[13px] bg-[#8b4cb4] text-sm font-semibold text-white">
                {number}
              </div>
              <h3 className="mt-5 text-xl font-semibold">{title}</h3>
              <p className="mt-2 leading-7 text-[#65576b]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="boundary"
        className="mx-2 rounded-[32px] bg-[radial-gradient(110%_85%_at_50%_0%,#ffffff_0%,#f7efff_60%,#ecddff_100%)] px-5 py-16 sm:mx-4 sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto grid size-10 place-items-center rounded-[14px] bg-[#8b4cb4] text-white">
              <LockKeyhole className="size-5" />
            </div>
            <h2 className="mt-6 text-4xl font-semibold leading-[1.06] sm:text-5xl lg:text-6xl">
              Working demo,{' '}
              <span className="font-serif italic text-[#7b3fa0]">bounded</span>{' '}
              data.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#65576b]">
              {disclosure}
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-[26px] bg-white p-6">
              <h3 className="text-xl font-semibold">Working in this demo</h3>
              <ul className="mt-4 space-y-3 text-[#65576b]">
                {[
                  'No-login public scenario picker',
                  'Synthetic v4-style engine flow',
                  'Local business, filing, and court-signal fixtures',
                  'Report rendering, scenario switching, print, and text download',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <ShieldCheck className="mt-1 size-4 text-[#7b3fa0]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[26px] bg-white p-6">
              <h3 className="text-xl font-semibold">Synthetic or mocked</h3>
              <ul className="mt-4 space-y-3 text-[#65576b]">
                {[
                  'Every business, filing row, and public-record example',
                  'Report ID generation and source provenance labels',
                  'The generation animation and evidence snapshot',
                  'All identifiers, addresses, cases, and party names',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <RefreshCcw className="mt-1 size-4 text-[#7b3fa0]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        id="scale"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24"
      >
        <div className="rounded-[32px] bg-white p-6 shadow-[0_20px_80px_rgba(42,24,52,0.08)] sm:p-10">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-semibold leading-[1.06] sm:text-5xl lg:text-6xl">
              Safe scale needs{' '}
              <span className="font-serif italic text-[#7b3fa0]">
                discipline
              </span>
              .
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#65576b]">
              Production Parakh would require authorized APIs, consent-aware
              handling, audit logs, rate limits, data provenance, retention
              limits, security controls, and human-readable limitations. This
              demo shows the journey without touching any live system.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              'Authorized data routes',
              'Consent and purpose limits',
              'Audit logs and retention',
              'Human-readable caveats',
            ].map((item) => (
              <div
                key={item}
                className="rounded-full bg-[#f6efff] px-5 py-4 text-sm font-semibold text-[#5f3d88]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
