type Bucket = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 15;
const buckets = new Map<string, Bucket>();

export function checkDwiAiRateLimit(sessionId: string) {
  const now = Date.now();
  const current = buckets.get(sessionId);

  if (!current || current.resetAt <= now) {
    buckets.set(sessionId, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  if (current.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfter: 0 };
}
