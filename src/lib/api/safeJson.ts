/**
 * Safe JSON response helpers.
 *
 * Motivation:
 * The idiom `await res.json().catch((): null => null)` hides every parse
 * failure behind a silent `null`. When a route returns an HTML error page
 * (eg. Vercel 502, misconfigured rewrite, CSP-blocked request) the client
 * reads `null` and the UI shows "no records" instead of "fetch failed".
 * This module keeps the drop-in shape but routes every failure through the
 * structured logger so the silent bug leaves a breadcrumb.
 */

import { logger } from "@/lib/logger";

/**
 * Parse the JSON body of a Response *or* Request, returning null on parse error.
 *
 * Drop-in replacement for `xxx.json().catch((): null => null)`. On parse
 * failure a warn-level log entry is emitted (url + HTTP status when
 * available + error message); return value is still `null` so caller code
 * needs no further changes.
 *
 * Accepts both `Response` (outgoing fetch reply) and `Request` (incoming
 * handler body) — `.json()` is the same duck-typed method on both.
 *
 * @example
 * ```ts
 * const res = await fetch("/api/admin/foo");
 * if (!res.ok) return;
 * const data = await parseJsonSafe<FooResponse>(res);
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function parseJsonSafe<T = any>(source: Response | Request): Promise<T | null> {
  try {
    return (await source.json()) as T;
  } catch (err) {
    logger.warn("parseJsonSafe: failed to parse JSON body", {
      url: source.url,
      // Response has .status; Request does not.
      status: "status" in source ? (source as Response).status : undefined,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

/**
 * Structured result of `safeFetchJson`. Discriminated on `ok` so callers
 * only see `data: T` after narrowing with `if (result.ok)`.
 */
export type SafeJsonResult<T> =
  | { ok: true; status: number; data: T }
  | {
      ok: false;
      status: number;
      /** Parsed body if the server returned JSON; null on network / parse failure */
      data: T | null;
      error: { kind: "network" | "parse" | "non_ok"; message: string };
    };

/**
 * Fetch wrapper that returns a discriminated result instead of throwing.
 *
 * Surfaces every failure mode distinctly:
 *   - `network` — fetch itself rejected (offline, CORS, DNS)
 *   - `parse`   — HTTP response received but body was not valid JSON
 *   - `non_ok`  — HTTP response received, body parsed, but status was not 2xx
 *     (the parsed `data` is still exposed so callers can render `data.error`)
 *
 * Prefer this in new code when the caller wants to render different UI
 * per failure kind. For existing `fetch + .json().catch` callsites,
 * `parseJsonSafe(res)` is the minimal drop-in.
 */
export async function safeFetchJson<T = unknown>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<SafeJsonResult<T>> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn("safeFetchJson: network error", {
      url: String(input),
      error: message,
    });
    return {
      ok: false,
      status: 0,
      data: null,
      error: { kind: "network", message },
    };
  }

  let data: T | null = null;
  try {
    data = (await res.json()) as T;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn("safeFetchJson: JSON parse failed", {
      url: res.url,
      status: res.status,
      error: message,
    });
    return {
      ok: false,
      status: res.status,
      data: null,
      error: { kind: "parse", message },
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      data,
      error: { kind: "non_ok", message: `HTTP ${res.status}` },
    };
  }

  return { ok: true, status: res.status, data };
}
