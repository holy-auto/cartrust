import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Build a Content-Security-Policy header value for the given per-request nonce.
 * Eliminates 'unsafe-inline' and 'unsafe-eval' from script-src by using:
 * - 'nonce-X': grants explicit trust to the specific inline script in layout.tsx
 * - 'strict-dynamic': propagates trust to scripts loaded by nonce-trusted scripts
 * Host allowlist is kept as a fallback for older browsers without strict-dynamic.
 */
function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com https://vercel.live https://*.vercel-scripts.com https://*.sentry-cdn.com`,
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
}

const PUBLIC_PREFIXES = [
  "/login",
  "/auth/callback",
  "/c/",
  "/customer/",
  "/insurer/login",
  "/insurer/forgot-password",
  "/insurer/reset-password",
  "/market/login",
  "/market/register",
  "/market/search",
  "/market/p/",
  "/api/",
  "/probe",
  "/agent/apply",
];

const MARKETING_PATHS = [
  "/", "/pricing", "/for-shops", "/for-insurers",
  "/faq", "/contact", "/privacy", "/terms", "/tokusho",
];

/** Unreleased feature routes — redirect to /admin until ready for launch */
const HIDDEN_ADMIN_PREFIXES = [
  "/admin/price-stats",
  "/admin/insurers",
];

/**
 * CSRF protection for API mutation routes.
 * Returns a 403 response if the request is cross-origin, or null to continue.
 */
function csrfCheck(request: NextRequest): NextResponse | null {
  const { method, nextUrl } = request;

  if (!nextUrl.pathname.startsWith("/api/")) return null;
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return null;

  // モバイルアプリは Bearer Token 認証のため CSRF チェック不要
  if (nextUrl.pathname.startsWith("/api/mobile/")) return null;

  // Webhook は外部サービスからの server-to-server コールのため CSRF チェック不要
  if (nextUrl.pathname.startsWith("/api/webhooks/")) return null;

  // Stripe webhook は Stripe SDK で署名検証するため CSRF チェック不要
  if (nextUrl.pathname.startsWith("/api/stripe/webhook")) return null;

  // LINE webhook は LINE SDK で署名検証するため CSRF チェック不要
  if (nextUrl.pathname.startsWith("/api/line/webhook")) return null;

  // Cron は外部スケジューラからの server-to-server コールのため CSRF チェック不要
  if (nextUrl.pathname.startsWith("/api/cron/")) return null;

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) {
    const secFetchSite = request.headers.get("sec-fetch-site");
    if (secFetchSite && secFetchSite !== "same-origin") {
      return NextResponse.json(
        { error: "csrf_rejected", message: "Cross-origin request blocked" },
        { status: 403 },
      );
    }
    return null;
  }

  try {
    const originUrl = new URL(origin);
    if (originUrl.host !== host) {
      console.warn(`[CSRF] Blocked: origin=${origin} host=${host} path=${nextUrl.pathname}`);
      return NextResponse.json(
        { error: "csrf_rejected", message: "Cross-origin request blocked" },
        { status: 403 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "csrf_rejected", message: "Invalid origin" },
      { status: 403 },
    );
  }

  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets — CSP and session refresh are irrelevant for these.
  if (pathname.startsWith("/_next") || pathname === "/favicon.ico" || pathname === "/robots.txt" || pathname === "/sitemap.xml") {
    return NextResponse.next();
  }

  // Generate a per-request nonce for Content-Security-Policy.
  // Server components read it from the x-nonce request header (set below).
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = buildCsp(nonce);

  // Forward nonce to server components via a request header.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // CSRF protection for API mutations (no nonce needed on 403 responses).
  const csrfResponse = csrfCheck(request);
  if (csrfResponse) return csrfResponse;

  // Block unreleased features — redirect to admin dashboard.
  if (HIDDEN_ADMIN_PREFIXES.some((p) => pathname.startsWith(p))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin";
    return NextResponse.redirect(redirectUrl);
  }

  // Block unreleased market routes.
  if (pathname.startsWith("/market") && !pathname.startsWith("/market/login") && !pathname.startsWith("/market/register")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  let response: NextResponse;

  // Marketing pages and public routes: pass through.
  if (MARKETING_PATHS.includes(pathname) || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    response = await refreshSession(request, requestHeaders);
  } else {
    // Protected routes: refresh session then check auth.
    response = await refreshSessionAndProtect(request, requestHeaders);
  }

  // Attach CSP to every HTML (non-redirect) response.
  response.headers.set("Content-Security-Policy", cspHeader);
  return response;
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml (metadata)
     * - Public assets (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
};

/** Refresh Supabase session cookies only when token is near expiry */
async function refreshSession(request: NextRequest, requestHeaders: Headers) {
  const response = NextResponse.next({ request: { headers: requestHeaders } });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  // Check if session token is near expiry before making external call
  const authCookie = request.cookies.getAll().find((c) => c.name.includes("auth-token"));
  if (authCookie?.value) {
    try {
      // Decode JWT payload to check exp (base64url)
      const payload = JSON.parse(atob(authCookie.value.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      const expiresAt = payload.exp * 1000;
      const fiveMinutes = 5 * 60 * 1000;
      // Skip refresh if token has >5 min left
      if (expiresAt - Date.now() > fiveMinutes) {
        return response;
      }
    } catch {
      // If we can't decode, fall through to refresh
    }
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Only called when token is near expiry or cannot be decoded
  await supabase.auth.getUser();

  return response;
}

/** Refresh session + redirect unauthenticated users */
async function refreshSessionAndProtect(request: NextRequest, requestHeaders: Headers) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next({ request: { headers: requestHeaders } });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    if (pathname.startsWith("/admin")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(redirectUrl);
    }
    if (pathname.startsWith("/insurer")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/insurer/login";
      return NextResponse.redirect(redirectUrl);
    }
    if (pathname.startsWith("/market")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/market/login";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}
