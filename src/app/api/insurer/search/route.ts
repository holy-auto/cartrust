import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = String(searchParams.get("q") ?? "").trim();
  const limitRaw = Number(searchParams.get("limit") ?? "50");
  const offsetRaw = Number(searchParams.get("offset") ?? "0");
  const status = String(searchParams.get("status") ?? "all").trim() || "all";

  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(limitRaw, 100)) : 50;
  const offset = Number.isFinite(offsetRaw) ? Math.max(0, offsetRaw) : 0;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip")?.trim() ??
    null;
  const ua = req.headers.get("user-agent");

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("insurer_search_vehicles", {
    p_query: q,
    p_limit: limit,
    p_offset: offset,
    p_status: status,
    p_ip: ip,
    p_user_agent: ua,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ rows: data ?? [] });
}