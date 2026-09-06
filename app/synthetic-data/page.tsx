import {
  BrainCircuit,
  CheckCircle2,
  Database,
  FileText,
  GitBranch,
  Layers3,
  ShieldCheck,
} from 'lucide-react';

import { DemoProductHeader } from '@/components/demo-product-header';
import { SCENARIOS } from '@/lib/synthetic-engine';

const disclosure =
  'This hackathon demo uses synthetic data only. It does not access live government systems, private records, real GSTINs, PANs, Aadhaar numbers, OTPs, payments, or production Parakh data.';

const pipeline = [
  {
    number: '01',
    title: 'fixture',
    detail: 'Five typed, local, obviously fictional business and record scenarios.',
    icon: Database,
  },
  {
    number: '02',
    title: 'adapter',
    detail: 'The selected fixture is shaped into the report engine input contract.',
    icon: GitBranch,
  },
  {
    number: '03',
    title: 'engine',
    detail: 'Names, dates, filings, parties, grades, provenance, and limits are normalized.',
    icon: Layers3,
  },
  {
    number: '04',
    title: 'AI reasoning',
    detail: 'The server sends one synthetic entity/record pair to OpenAI for runtime attribution reasoning.',
    icon: BrainCircuit,
  },
  {
    number: '05',
    title: 'report schema',
    detail: 'The report keeps fixture grades and adds model decision, confidence, or fallback state.',
    icon: FileText,
  },
  {
    number: '06',
    title: 'renderer',
    detail: 'The web report and A4 PDF show evidence, AI reasoning, provenance, and limitations.',
    icon: CheckCircle2,
  },
];

export default function SyntheticDataPage() {
  return (
    <main className="min-h-screen bg-[#fbf8f5] text-[#201b1e]">
      <DemoProductHeader />

      <section className="mx-2 rounded-[30px] bg-[radial-gradient(circle_at_top,#fff_0%,#fbf2f7_48%,#efdfeb_100%)] px-5 py-14 sm:mx-4 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#7a336f]">
            Synthetic data · transparent pipeline
          </p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[1.02] sm:text-7xl">
            See how a report becomes{' '}
            <span className="font-serif italic font-normal text-[#8a3d7f]">
              evidence.
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#675b63] sm:text-lg">
            This lab makes the demo boundary inspectable: the AI step reasons
            over existing synthetic records, never over live court or GST data.
          </p>

          <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {pipeline.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="rounded-[24px] bg-white p-5 shadow-[0_18px_50px_rgba(42,24,31,0.07)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#9b8793]">
                      {step.number}
                    </span>
                    <span className="grid size-9 place-items-center rounded-full bg-[#fbf2f7] text-[#7a336f]">
                      <Icon className="size-4" />
                    </span>
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold">{step.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-[#675b63]">
                    {step.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[26px] bg-white p-6 shadow-[0_20px_70px_rgba(42,24,31,0.08)] sm:p-8">
            <p className="text-xs font-semibold uppercase text-[#9b8793]">
              Five local fixtures
            </p>
            <h2 className="mt-2 text-3xl font-semibold">Nothing is fetched here.</h2>
            <div className="mt-6 grid gap-2">
              {SCENARIOS.map((scenario) => (
                <div key={scenario.identifier} className="rounded-[18px] bg-[#fbf8f5] p-4">
                  <div className="font-semibold">{scenario.shortName}</div>
                  <div className="mt-1 text-sm text-[#675b63]">
                    {scenario.identifier} · {scenario.scenarioType}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[26px] bg-[#201b1e] p-6 text-white shadow-[0_20px_70px_rgba(42,24,31,0.12)] sm:p-8">
            <ShieldCheck className="size-6 text-[#d9a9ca]" />
            <h2 className="mt-5 text-3xl font-semibold">The boundary stays firm.</h2>
            <p className="mt-4 text-sm leading-7 text-white/70">{disclosure}</p>
            <p className="mt-5 text-sm leading-7 text-white/70">
              The OpenAI key is read only by the server route from local
              <code className="mx-1 rounded bg-white/10 px-1.5 py-0.5 text-white">OPENAI_API_KEY</code>
              configuration. It is never sent to the browser.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
