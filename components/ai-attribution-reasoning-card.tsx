'use client';

import { BrainCircuit, LoaderCircle } from 'lucide-react';

import type { SyntheticLabel } from '@/lib/synthetic-fixtures';
import type { ReportAiReasoningState } from '@/lib/report-pdf';

function decisionLabel(decision: 'ATTRIBUTED' | 'NOT_ATTRIBUTED' | 'UNCERTAIN') {
  if (decision === 'ATTRIBUTED') return 'ATTRIBUTED';
  if (decision === 'NOT_ATTRIBUTED') return 'NOT ATTRIBUTED';
  return 'UNCERTAIN';
}

export function AiAttributionReasoningCard({
  recordId,
  fixtureSignal,
  state,
}: {
  recordId: string;
  fixtureSignal: SyntheticLabel;
  state: ReportAiReasoningState;
}) {
  return (
    <div className="rounded-[18px] border border-[#e7d7e3] bg-[#fbf2f7] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <BrainCircuit className="size-4 text-[#7a336f]" />
        <span className="font-semibold">{recordId}</span>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#7a336f]">
          {state.status === 'loading'
            ? 'THINKING'
            : state.status === 'success'
              ? decisionLabel(state.result.decision)
              : 'FALLBACK'}
        </span>
      </div>
      {state.status === 'loading' ? (
        <div className="mt-3 flex items-center gap-2 text-sm leading-6 text-[#675b63]">
          <LoaderCircle className="size-4 animate-spin text-[#7a336f]" />
          Reviewing the synthetic entity and candidate record…
        </div>
      ) : state.status === 'success' ? (
        <>
          <p className="mt-3 text-sm font-semibold text-[#201b1e]">
            {state.result.justification}
          </p>
          <p className="mt-2 text-xs text-[#8b7c84]">
            Confidence {state.result.confidence} · Decision{' '}
            {decisionLabel(state.result.decision)} · Runtime OpenAI response
          </p>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm font-semibold text-[#916022]">
            AI reasoning unavailable, showing fixture-based grade: {fixtureSignal}
          </p>
          <p className="mt-2 text-xs text-[#8b7c84]">
            The static synthetic signal remains visible; no AI conclusion was substituted.
          </p>
        </>
      )}
    </div>
  );
}
