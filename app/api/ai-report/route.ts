import { requestAiReport } from '../../../lib/ai-report';
import { aiOptions, aiRateLimiter, requestIp } from '../../../lib/ai-server';
import { getSyntheticScenario } from '../../../lib/synthetic-engine';

const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }
  if (
    !payload ||
    typeof payload !== 'object' ||
    Array.isArray(payload) ||
    Object.keys(payload).join() !== 'identifier' ||
    typeof (payload as { identifier?: unknown }).identifier !== 'string'
  )
    return json({ error: 'A synthetic identifier is required.' }, 400);
  const identifier = (payload as { identifier: string }).identifier;
  const scenario =
    identifier.length <= 80 ? getSyntheticScenario(identifier) : undefined;
  if (!scenario) return json({ error: 'Synthetic fixture not found.' }, 404);
  if (!aiRateLimiter.check(requestIp(request)).allowed)
    return json(
      { error: 'AI reasoning limit reached. Please try again later.' },
      429,
    );
  const options = aiOptions();
  if (!options) return json({ error: 'AI reasoning is not configured.' }, 503);
  return json(await requestAiReport(scenario, options));
}
