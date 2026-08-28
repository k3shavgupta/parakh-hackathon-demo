'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, FileSearch, ShieldCheck } from 'lucide-react';

import {
  SCENARIOS,
  isAllowedSyntheticIdentifier,
} from '@/lib/synthetic-engine';
import { cn } from '@/lib/utils';

const disclosure =
  'This hackathon demo uses synthetic data only. It does not access live government systems, private records, real GSTINs, PANs, Aadhaar numbers, OTPs, payments, or production Parakh data.';

function SpecimenRow({
  label,
  text,
  tone,
}: {
  label: string;
  text: string;
  tone: 'FLAG' | 'CLEAR' | 'NOTE';
}) {
  const toneClass =
    tone === 'FLAG'
      ? 'bg-[#fff3f4] text-[#a33f4a]'
      : tone === 'CLEAR'
        ? 'bg-[#eff9f3] text-[#2d6a48]'
        : 'bg-[#fff8ed] text-[#916022]';

  return (
    <div className="grid grid-cols-[86px_minmax(0,1fr)_auto] items-center gap-3 border-t border-[#f0e7ee] py-3 text-sm first:border-t-0">
      <div className="text-xs font-semibold text-[#9b8793]">{label}</div>
      <div className="font-medium leading-6 text-[#201b1e]">{text}</div>
      <span
        className={cn(
          'rounded-full px-2.5 py-1 text-xs font-semibold',
          toneClass,
        )}
      >
        {tone}
      </span>
    </div>
  );
}

export default function Home() {
  const [value, setValue] = useState(SCENARIOS[0].identifier);
  const [error, setError] = useState('');

  function runSearch(identifier: string) {
    const normalized = identifier.trim().toUpperCase();
    if (!isAllowedSyntheticIdentifier(normalized)) {
      setError(
        'Use one of the listed synthetic GSTIN-style IDs. Real-looking IDs are blocked.',
      );
      return;
    }

    window.location.href = `/report/${encodeURIComponent(normalized)}`;
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbf8f5] text-[#201b1e]">
      <nav className="px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full bg-white/78 px-3 py-2 shadow-[0_1px_2px_rgba(42,24,31,0.05)] backdrop-blur">
          <Link
            href="/"
            className="flex items-center gap-2 pl-1 text-sm font-semibold"
          >
            <span className="grid size-8 place-items-center rounded-full bg-[#7a336f] text-white">
              प
            </span>
            Parakh
          </Link>
          <div className="hidden items-center gap-6 text-xs font-semibold text-[#746a70] md:flex">
            <a href="#how">How it works</a>
            <a href="#sample">Sample report</a>
            <a href="#boundary">Synthetic boundary</a>
          </div>
          <button
            type="button"
            onClick={() => runSearch(value)}
            className="h-9 rounded-full bg-[#201b1e] px-4 text-xs font-semibold text-white"
          >
            Free Check
          </button>
        </div>
      </nav>

      <section className="mx-2 rounded-[30px] bg-[radial-gradient(circle_at_top,#fff_0%,#fbf2f7_48%,#efdfeb_100%)] px-4 pb-14 pt-12 sm:mx-4 sm:px-8 sm:pb-20 sm:pt-16">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#7a336f]">
            <FileSearch className="size-3.5" />
            GST + court record check
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
            One GSTIN.
            <br />
            The{' '}
            <span className="font-serif italic font-normal text-[#8a3d7f]">
              whole record.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#675b63] sm:text-lg">
            Before you send goods on credit, run a synthetic Parakh check. The
            demo opens a real report page using local fixture data only.
          </p>

          <form
            className="mx-auto mt-7 flex max-w-2xl flex-col gap-3 rounded-full bg-white p-2 shadow-[0_18px_50px_rgba(42,24,31,0.1)] sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              runSearch(value);
            }}
          >
            <input
              aria-label="Synthetic firm GSTIN"
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setError('');
              }}
              className="min-h-12 flex-1 rounded-full border-0 bg-[#fbf8f5] px-5 text-sm font-semibold text-[#201b1e] outline-none focus:ring-3 focus:ring-[#d8b6cf]"
            />
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#7a336f] px-6 text-sm font-semibold text-white"
            >
              Run Parakh Check
              <ArrowRight className="size-4" />
            </button>
          </form>
          {error ? (
            <p className="mx-auto mt-3 max-w-2xl rounded-full bg-[#fff3f4] px-4 py-3 text-sm font-semibold text-[#a33f4a]">
              {error}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-semibold text-[#8b7c84]">
            <span>First report free in prototype</span>
            <span>•</span>
            <span>Synthetic data only</span>
            <span>•</span>
            <span>No login</span>
          </div>

          <div className="mx-auto mt-10 max-w-2xl rounded-[28px] bg-white p-5 text-left shadow-[0_24px_70px_rgba(42,24,31,0.13)]">
            <div className="flex items-center justify-between gap-3 border-b border-[#f0e7ee] pb-4">
              <div>
                <p className="text-xs font-semibold text-[#9b8793]">
                  GSTIN SYN-••••••••-001 · synthetic fixture
                </p>
                <h2 className="mt-1 text-xl font-semibold">SPECIMEN</h2>
              </div>
              <span className="rounded-full bg-[#fff8ed] px-3 py-1 text-xs font-semibold text-[#916022]">
                DEMO
              </span>
            </div>
            <SpecimenRow
              label="IDENTITY"
              text="Name on the synthetic GSTIN resolves to a fixture profile"
              tone="CLEAR"
            />
            <SpecimenRow
              label="FILING"
              text="Returns are normalized into period-by-period evidence"
              tone="NOTE"
            />
            <SpecimenRow
              label="LITIGATION"
              text="Synthetic court/public-record signals appear with confidence"
              tone="FLAG"
            />
            <SpecimenRow
              label="LIMITS"
              text="Could not find live GST, bank data, private ledgers, or real records"
              tone="NOTE"
            />
          </div>
        </div>
      </section>

      <section id="sample" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="inline-flex rounded-full bg-[#fbf2f7] px-3 py-1 text-xs font-semibold text-[#7a336f]">
              Choose a synthetic firm
            </p>
            <h2 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
              Search any listed synthetic{' '}
              <span className="font-serif italic font-normal text-[#8a3d7f]">
                GSTIN.
              </span>
            </h2>
            <p className="mt-4 leading-7 text-[#675b63]">
              Judges can type or click these fake identifiers. Each opens its
              own report page, so the prototype feels like the real Parakh
              journey without touching live systems.
            </p>
          </div>
          <div className="grid gap-3">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.identifier}
                type="button"
                onClick={() => runSearch(scenario.identifier)}
                className={cn(
                  'rounded-[22px] border bg-white p-4 text-left shadow-[0_12px_40px_rgba(42,24,31,0.05)] transition hover:-translate-y-0.5',
                  value === scenario.identifier
                    ? 'border-[#7a336f]'
                    : 'border-[#f0e7ee]',
                )}
              >
                <span className="block font-semibold text-[#201b1e]">
                  {scenario.identifier}
                </span>
                <span className="mt-1 block text-sm leading-6 text-[#675b63]">
                  {scenario.shortName} · {scenario.scenarioType}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how"
        className="mx-2 rounded-[30px] bg-[#191517] px-5 py-16 text-white sm:mx-4 sm:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Instant report, not ten days.
            </h2>
            <p className="mt-4 leading-7 text-white/68">
              Enter one synthetic firm GSTIN. The local v4-style engine loads
              fixture profile, filing, and public-record examples, then creates
              an evidence-first report with no score or credit verdict.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              [
                '1',
                'You enter one synthetic GSTIN',
                'A fake identifier from the demo scenarios, never a real GSTIN or PAN.',
              ],
              [
                '2',
                'The engine reads fixtures',
                'Local synthetic profile, return, and public-record rows are normalized.',
              ],
              [
                '3',
                'A report page opens',
                'The screen shows FLAG, CLEAR, and NOTE observations with limits and sources.',
              ],
            ].map(([number, title, body]) => (
              <div key={title} className="rounded-[24px] bg-white/[0.06] p-6">
                <div className="grid size-9 place-items-center rounded-full bg-[#8a3d7f] text-sm font-semibold">
                  {number}
                </div>
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-3 leading-7 text-white/65">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="boundary" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="rounded-[30px] bg-white p-6 shadow-[0_20px_70px_rgba(42,24,31,0.08)] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="inline-flex rounded-full bg-[#fbf2f7] px-3 py-1 text-xs font-semibold text-[#7a336f]">
                Synthetic boundary
              </p>
              <h2 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
                Working prototype,{' '}
                <span className="font-serif italic font-normal text-[#8a3d7f]">
                  clear limits.
                </span>
              </h2>
            </div>
            <div className="space-y-4 text-sm leading-7 text-[#675b63]">
              <p className="rounded-[22px] bg-[#fbf8f5] p-5 font-semibold text-[#201b1e]">
                {disclosure}
              </p>
              <p>
                Production use would require authorized APIs, consent-aware
                handling, audit logs, rate limits, data provenance, retention
                limits, security controls, and human-readable limitations.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  'No Clerk or login',
                  'No payments',
                  'No database',
                  'No production Parakh data',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-full bg-[#fbf2f7] px-4 py-3"
                  >
                    <ShieldCheck className="size-4 text-[#7a336f]" />
                    <span className="font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-5 pb-10 text-center text-xs font-semibold text-[#8b7c84]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 rounded-full bg-white px-4 py-3">
          <Check className="size-4 text-[#2d6a48]" />
          Standalone Build What Moves India prototype. Production parakh.biz is
          unchanged.
        </div>
      </footer>
    </main>
  );
}
