'use client';
import { BrainCircuit, LoaderCircle } from 'lucide-react';
import { summaryCopy, type ReportAiSummaryState } from '../lib/report-ai-state';

export function AiSummaryCard({ state }: { state: ReportAiSummaryState }) {
  return (
    <section
      className="report-ai-summary"
      aria-labelledby="ai-summary-heading"
      aria-live="polite"
      aria-busy={state.status === 'loading'}
    >
      <div className="report-ai-heading">
        <BrainCircuit size={19} />
        <h2 id="ai-summary-heading">AI Summary</h2>
        <span className="report-ai-status">
          {state.status === 'loading'
            ? 'Thinking'
            : state.status === 'success'
              ? 'AI generated'
              : 'Unavailable'}
        </span>
      </div>
      <p className="report-summary-copy">
        {state.status === 'loading' && (
          <LoaderCircle size={16} className="inline animate-spin" />
        )}{' '}
        {summaryCopy(state)}
      </p>
      {state.status === 'success' && state.result.key_signal && (
        <p className="report-key-signal">
          <strong>Key finding</strong>
          <span>{state.result.key_signal}</span>
        </p>
      )}
      <p className="report-caption">
        {state.status === 'success'
          ? 'Generated from this fictional report and its record attributions. Read with the source limitations below.'
          : 'The synthetic findings remain available while AI synthesis is pending or unavailable.'}
      </p>
    </section>
  );
}
