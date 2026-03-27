import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

/**
 * POST /api/agent/apply/status
 * Check agent application status by application number + email.
 * Both must match to prevent enumeration attacks.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await checkRateLimit(`apply-status:${ip}`, { limit: 10, windowSec: 60 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited", message: "しばらくしてから再度お試しください。" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let body: { application_number?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const appNumber = (body.application_number ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();

  if (!appNumber || !email) {
    return NextResponse.json(
      { error: "missing_fields", message: "申請番号とメールアドレスを入力してください" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("agent_applications")
    .select("status, created_at, updated_at, rejection_reason")
    .eq("application_number", appNumber)
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("[agent/apply/status] query error:", error.message);
    return NextResponse.json(
      { error: "query_failed", message: "照会に失敗しました" },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "not_found", message: "該当する申請が見つかりません。申請番号とメールアドレスを確認してください。" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    status: data.status,
    created_at: data.created_at,
    updated_at: data.updated_at,
    rejection_reason: data.rejection_reason,
  });
}
