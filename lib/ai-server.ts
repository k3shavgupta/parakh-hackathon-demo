// Server routes only. Never import this module from a client component.
import { createIpRateLimiter } from './ai-attribution';
export const aiRateLimiter = createIpRateLimiter({
  limit: 10,
  windowMs: 60 * 60 * 1000,
});
export function requestIp(request: Request) {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'local-anonymous'
  );
}
export function serverEnv(
  name:
    | 'OPENAI_API_KEY'
    | 'OPENAI_MODEL'
    | 'OPENAI_BASE_URL'
    | 'OPENAI_API_MODE',
) {
  const processValue =
    typeof process === 'undefined' ? undefined : process.env[name];
  if (processValue) return processValue;
  return (import.meta.env as Record<string, string | undefined>)[name];
}
export function aiOptions() {
  const apiKey = serverEnv('OPENAI_API_KEY');
  if (!apiKey) return null;
  return {
    apiKey,
    model: serverEnv('OPENAI_MODEL') ?? 'gpt-4o-mini',
    baseUrl: serverEnv('OPENAI_BASE_URL'),
    apiMode:
      serverEnv('OPENAI_API_MODE') === 'chat-completions'
        ? ('chat-completions' as const)
        : ('responses' as const),
    timeoutMs: 15_000,
  };
}
