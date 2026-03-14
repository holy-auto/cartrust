import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function getClientMeta(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? null;
  const ua = req.headers.get("user-agent") ?? null;
  return { ip, ua };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const status = url.searchParams.get("status") ?? "";
  const dateFrom = url.searchParams.get("date_from") ?? "";
  const dateTo = url.searchParams.get("date_to") ?? "";
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10) || 50, 200);
  const offset = Math.max(parseInt(url.searchParams.get("offset") ?? "0", 10) || 0, 0);

  const { ip, ua } = getClientMeta(req);

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Try DB-side filtering first (requires updated RPC function).
  // Falls back to JS filtering if the RPC doesn't accept the new params yet.
  const rpcParams: Record<string, unknown> = {
    p_query: q,
    p_limit: limit,
    p_offset: offset,
    p_ip: ip,
    p_user_agent: ua,
  };

  const hasFilters = !!(status || dateFrom || dateTo);

  if (hasFilters) {
    if (status) rpcParams.p_status = status;
    if (dateFrom) rpcParams.p_date_from = new Date(dateFrom).toISOString();
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      rpcParams.p_date_to = to.toISOString();
    }
  }

  let { data, error } = await supabase.rpc("insurer_search_certificates", rpcParams);

  // Fallback: if RPC rejects new params, retry without them and filter in JS
  let needJsFallback = false;
  if (error && hasFilters) {
    delete rpcParams.p_status;
    delete rpcParams.p_date_from;
    delete rpcParams.p_date_to;
    // Fetch more rows so JS filtering has enough data
    rpcParams.p_limit = Math.min(limit * 4, 800);
    const retry = await supabase.rpc("insurer_search_certificates", rpcParams);
    data = retry.data;
    error = retry.error;
    needJsFallback = true;
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  let rows: any[] = data ?? [];

  // JS fallback filtering (only when DB-side filtering is unavailable)
  if (needJsFallback) {
    if (status) {
      const s = status.toLowerCase();
      rows = rows.filter((r: any) => {
        const rowStatus = String(
          r?.status ??
          r?.latest_active_certificate_status ??
          r?.latest_certificate_status ??
          r?.certificate_status ??
          ""
        ).toLowerCase();
        return rowStatus === s;
      });
    }

    if (dateFrom) {
      const fromTs = new Date(dateFrom).getTime();
      if (!Number.isNaN(fromTs)) {
        rows = rows.filter((r: any) => {
          const createdAt =
            r?.created_at ?? r?.latest_active_certificate_created_at ?? r?.latest_certificate_created_at ?? "";
          if (!createdAt) return true;
          return new Date(createdAt).getTime() >= fromTs;
        });
      }
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      const toTs = to.getTime();
      if (!Number.isNaN(toTs)) {
        rows = rows.filter((r: any) => {
          const createdAt =
            r?.created_at ?? r?.latest_active_certificate_created_at ?? r?.latest_certificate_created_at ?? "";
          if (!createdAt) return true;
          return new Date(createdAt).getTime() <= toTs;
        });
      }
    }

    if (rows.length > limit) {
      rows = rows.slice(0, limit);
    }
  }

  return NextResponse.json({ rows });
}
