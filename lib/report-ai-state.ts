import type { AiAttributionResult } from './ai-attribution';
import type { SyntheticLabel } from './synthetic-fixtures';

export type ReportAiReasoningState =
  | { status: 'loading' }
  | { status: 'success'; result: AiAttributionResult }
  | { status: 'fallback'; fixtureSignal: SyntheticLabel };
export type AiSummaryResult = { summary: string; key_signal: string | null };
export type ReportAiSummaryState =
  | { status: 'loading' }
  | { status: 'success'; result: AiSummaryResult }
  | { status: 'fallback' };
export type ReportAiResponse = {
  reasoning: Record<string, ReportAiReasoningState>;
  summary: ReportAiSummaryState;
};
export function summaryCopy(state: ReportAiSummaryState) {
  if (state.status === 'loading')
    return 'Reviewing the synthetic evidence and record attributions…';
  if (state.status === 'fallback')
    return 'AI summary unavailable. Read the fixture findings and evidence limitations below.';
  return state.result.summary;
}
