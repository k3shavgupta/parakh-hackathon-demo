import {
  createIpRateLimiter,
  requestAiAttribution,
} from '../../../lib/ai-attribution';
import { getSyntheticScenario } from '../../../lib/synthetic-engine';

const rateLimiter = createIpRateLimiter({
  limit: 10,
  windowMs: 60 * 60 * 1000,
});

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function requestIp(request: Request) {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'local-anonymous'
  );
}

function serverEnv(
  name: 'OPENAI_API_KEY' | 'OPENAI_MODEL' | 'OPENAI_BASE_URL',
) {
  const processValue =
    typeof process === 'undefined' ? undefined : process.env[name];
  if (processValue) return processValue;

  // Cloudflare's local worker runtime does not expose arbitrary shell env
  // values through process.env. Static import.meta.env references are kept in
  // the server bundle and are never included in the client bundle.
  const importMetaEnv = import.meta.env as ImportMetaEnv &
    Record<string, string | undefined>;
  return importMetaEnv[name];
}

function isAttributionRequest(
  value: unknown,
): value is { identifier: string; recordId: string } {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate = value as { identifier?: unknown; recordId?: unknown };
  return (
    typeof candidate.identifier === 'string' &&
    typeof candidate.recordId === 'string' &&
    candidate.identifier.length <= 80 &&
    candidate.recordId.length <= 100
  );
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  if (!isAttributionRequest(payload)) {
    return json({ error: 'identifier and recordId are required.' }, 400);
  }

  const scenario = getSyntheticScenario(payload.identifier);
  const record = scenario?.publicRecords.find(
    (candidate) => candidate.id === payload.recordId,
  );
  if (!scenario || !record) {
    return json({ error: 'Synthetic fixture record not found.' }, 404);
  }

  const rate = rateLimiter.check(requestIp(request));
  if (!rate.allowed) {
    return json(
      { error: 'AI reasoning limit reached. Please try again later.' },
      429,
    );
  }

  const apiKey = serverEnv('OPENAI_API_KEY');
  if (!apiKey) {
    return json({ error: 'AI reasoning is not configured.' }, 503);
  }

  try {
    const result = await requestAiAttribution(scenario, record, {
      apiKey,
      model: serverEnv('OPENAI_MODEL') ?? 'gpt-4o-mini',
      baseUrl: serverEnv('OPENAI_BASE_URL'),
      timeoutMs: 15_000,
    });
    return json(result);
  } catch (error) {
    console.error(
      '[ai-attribution] provider failure',
      error instanceof Error ? error.message : 'unknown provider error',
    );
    return json({ error: 'AI reasoning is temporarily unavailable.' }, 502);
  }
}
