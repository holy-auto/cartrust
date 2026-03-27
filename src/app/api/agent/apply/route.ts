import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit as checkUpstashRateLimit } from "@/lib/api/rateLimit";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { agentApplicationSchema, parseBody } from "@/lib/validation/schemas";
import { notifyApplicationReceived } from "@/lib/agent/email";
import crypto from "crypto";

export const runtime = "nodejs";

/**
 * POST /api/agent/apply
 * Submit a new agent application (no auth required).
 */
export async function POST(req: NextRequest) {
  // Rate limit: Upstash Redis (production) with in-memory fallback
  const upstashDeny = await checkUpstashRateLimit(req, "auth");
  if (upstashDeny) return upstashDeny;

  const ip = getClientIp(req);
  const rl = await checkRateLimit(`apply:${ip}`, { limit: 3, windowSec: 600 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited", message: "申請回数の上限に達しました。しばらくしてから再度お試しください。" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const parsed = parseBody(agentApplicationSchema, rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.errors }, { status: 400 });
  }

  const data = parsed.data;

  if (!data.terms_accepted) {
    return NextResponse.json(
      { error: "terms_required", message: "利用規約への同意が必要です" },
      { status: 400 },
    );
  }

  // Generate application number: AGT-YYYYMMDD-XXXX
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const hex4 = crypto.randomBytes(2).toString("hex").toUpperCase();
  const applicationNumber = `AGT-${dateStr}-${hex4}`;

  const supabase = createAdminClient();

  const { error } = await supabase.from("agent_applications").insert({
    application_number: applicationNumber,
    company_name: data.company_name,
    contact_name: data.contact_name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    industry: data.industry,
    qualifications: data.qualifications,
    track_record: data.track_record,
    documents: data.documents,
    status: "submitted",
    ip_address: ip,
    user_agent: req.headers.get("user-agent") || "",
  });

  if (error) {
    console.error("[agent/apply] insert error:", error.message);

    // Retry with new application number on unique constraint violation
    if (error.code === "23505") {
      const hex4b = crypto.randomBytes(2).toString("hex").toUpperCase();
      const retryNumber = `AGT-${dateStr}-${hex4b}`;
      const { error: retryError } = await supabase.from("agent_applications").insert({
        application_number: retryNumber,
        company_name: data.company_name,
        contact_name: data.contact_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        industry: data.industry,
        qualifications: data.qualifications,
        track_record: data.track_record,
        documents: data.documents,
        status: "submitted",
        ip_address: ip,
        user_agent: req.headers.get("user-agent") || "",
      });
      if (!retryError) {
        await notifyApplicationReceived(data.email, {
          companyName: data.company_name,
          applicationNumber: retryNumber,
        }).catch((e) => console.error("[agent/apply] email error:", e));
        return NextResponse.json({ ok: true, application_number: retryNumber }, { status: 201 });
      }
    }

    return NextResponse.json(
      { error: "submission_failed", message: "申請の送信に失敗しました。しばらくしてから再度お試しください。" },
      { status: 500 },
    );
  }

  // Send confirmation email (fire-and-forget)
  await notifyApplicationReceived(data.email, {
    companyName: data.company_name,
    applicationNumber: applicationNumber,
  }).catch((e) => console.error("[agent/apply] email error:", e));

  return NextResponse.json({ ok: true, application_number: applicationNumber }, { status: 201 });
}
