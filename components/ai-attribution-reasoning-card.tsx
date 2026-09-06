'use client';

import { BrainCircuit, LoaderCircle } from 'lucide-react';

import { confidencePercent } from '../lib/ai-attribution';
import type { SyntheticLabel } from '@/lib/synthetic-fixtures';
import type { ReportAiReasoningState } from '@/lib/report-ai-state';

function decisionLabel(
  decision: 'ATTRIBUTED' | 'NOT_ATTRIBUTED' | 'UNCERTAIN',
) {
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
        <span className="font-semibold">AI Attribution Reasoning</span>
        <span className="text-xs text-[#675b63]">{recordId}</span>
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
          {state.result.factors && state.result.factors.length > 0 ? (
            <div className="mt-3 flex flex-wrap items-center gap-1.5" data-testid="attribution-factors">
              {state.result.factors.map((factor) => (
                <span
                  key={factor.label}
                  className="inline-flex items-center gap-1 rounded-full border border-[#d8b8cf] bg-[#fbf0f6] px-2.5 py-0.5 text-[11px] font-semibold text-[#7a336f]"
                >
                  <span className="font-normal text-[#675b63]">{factor.label}:</span>
                  <span>{factor.verdict}</span>
                </span>
              ))}
            </div>
          ) : null}
          <p className="mt-2.5 text-sm font-semibold text-[#201b1e]">
            {state.result.justification}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#8b7c84]">
            <span className="inline-flex items-center gap-1.5">
              <span>Confidence {state.result.confidence}</span>
              <span
                aria-hidden="true"
                className="inline-flex h-2 w-14 overflow-hidden rounded-full bg-[#f2e3ed]"
                data-testid="confidence-gauge"
              >
                <span
                  className="h-full rounded-full bg-[#7a336f]"
                  style={{
                    width: `${confidencePercent(state.result.confidence)}%`,
                  }}
                />
              </span>
            </span>
            <span>·</span>
            <span>Decision {decisionLabel(state.result.decision)}</span>
            <span>·</span>
            <span>Runtime OpenAI response</span>
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm font-semibold text-[#916022]">
            AI reasoning unavailable, showing fixture-based grade:{' '}
            {fixtureSignal}
          </p>
          <p className="mt-2 text-xs text-[#8b7c84]">
            The static synthetic signal remains visible; no AI conclusion was
            substituted.
          </p>
        </>
      )}
    </div>
  );
}
