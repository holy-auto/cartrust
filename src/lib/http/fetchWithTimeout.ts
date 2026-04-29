/**
 * fetch() with a hard timeout.
 *
 * 背景:
 *   外部 API (Resend / Square / LINE / Pinata / Hive 等) は無応答で
 *   接続が hang するケースがあり、Vercel function (60s/120s) を
 *   食いつぶして他リクエストの遅延 / function timeout を引き起こす。
 *
 *   `AbortSignal.timeout(ms)` は Node 17.3+ / 全ブラウザでサポートされる。
 *   既に signal が指定されている場合は両方の signal を AND で結合する。
 *
 * 既定値:
 *   - timeoutMs: 10000 (10s) — REST API のリクエストとしては十分長く、
 *     Vercel timeout (60s) の 1/6 程度。長尺ジョブで延ばす場合は明示指定。
 */

const DEFAULT_TIMEOUT_MS = 10_000;

export type FetchWithTimeoutInit = RequestInit & { timeoutMs?: number };

export async function fetchWithTimeout(
  input: string | URL | Request,
  init: FetchWithTimeoutInit = {},
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal: callerSignal, ...rest } = init;
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const signal = callerSignal ? AbortSignal.any([callerSignal, timeoutSignal]) : timeoutSignal;
  return fetch(input, { ...rest, signal });
}

/**
 * Returns true if the error originated from an AbortSignal.timeout.
 * Lets callers distinguish "timed out" from generic network errors.
 */
export function isFetchTimeoutError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const name = (err as { name?: unknown }).name;
  // AbortSignal.timeout produces TimeoutError; user-aborted produces AbortError.
  return name === "TimeoutError" || name === "AbortError";
}
