import { NextRequest, NextResponse } from "next/server";

/**
 * Generates a cryptographic nonce and sets it as a request header so that
 * server components (e.g. RootLayout) can read it and attach it to inline
 * scripts.  The same nonce is written into the Content-Security-Policy
 * response header, replacing the blanket 'unsafe-inline' that was previously
 * needed for the theme-initialisation inline script.
 *
 * CSP is intentionally set here (middleware) rather than in next.config.ts so
 * that it can be dynamic (per-request nonce).  Static security headers that
 * do not change per request remain in next.config.ts.
 *
 * Policy notes:
 * - 'strict-dynamic': trust propagates from nonce-approved scripts to the
 *   scripts they dynamically load; host allowlist kept as fallback for older
 *   browsers that don't implement strict-dynamic.
 * - 'unsafe-eval' removed: not required by Next.js production builds, Stripe,
 *   Vercel Analytics / Speed Insights, or Sentry (they work without it).
 * - 'unsafe-inline' for style-src: still required because Tailwind CSS v4 and
 *   Next.js inject inline <style> tags; nonce for styles would require
 *   additional build tooling changes.
 */
export function middleware(request: NextRequest) {
  // Base64-encoded UUID gives 24 random bytes of entropy per request.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const cspDirectives = [
    "default-src 'self'",
    // Nonce grants explicit trust to specific inline / external scripts.
    // strict-dynamic propagates that trust to scripts they load dynamically.
    // Host allowlist is a fallback for browsers without strict-dynamic support.
    `script-src 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com https://vercel.live https://*.vercel-scripts.com https://*.sentry-cdn.com`,
    // Inline styles unavoidable with Tailwind v4 + Next.js SSR style injection.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://api.qrserver.com",
    "font-src 'self' data: https://cdn.jsdelivr.net",
    "connect-src 'self' https://*.supabase.co https://*.supabase.in https://api.stripe.com https://*.sentry.io https://*.ingest.sentry.io https://vercel.live https://*.vercel-scripts.com https://*.upstash.io",
    "frame-src https://js.stripe.com https://hooks.stripe.com https://vercel.live",
    "media-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  // Forward nonce to server components via a request header.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Set CSP on the response so the browser enforces it.
  response.headers.set("Content-Security-Policy", cspDirectives);

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on all routes EXCEPT:
     * - _next/static  (pre-built assets — no HTML, CSP irrelevant)
     * - _next/image   (image optimisation endpoint)
     * - favicon.ico   (static icon)
     * - Common static asset extensions
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
