import { NextRequest, NextResponse } from "next/server";
import { resolveInsurerCaller } from "@/lib/api/insurerAuth";
import {
  apiUnauthorized,
  apiValidationError,
  apiNotFound,
  apiForbidden,
  apiInternalError,
} from "@/lib/api/response";
import { checkRateLimit } from "@/lib/api/rateLimit";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * GET /api/insurer/cases/[id]
 * Get case detail with messages and attachments.
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const limited = await checkRateLimit(req, "general");
  if (limited) return limited;

  const caller = await resolveInsurerCaller();
  if (!caller) return apiUnauthorized();

  const { id } = await ctx.params;
  const admin = createAdminClient();

  try {
    // Fetch case
    const { data: caseData, error: caseErr } = await admin
      .from("insurer_cases")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (caseErr) return apiValidationError(caseErr.message);
    if (!caseData) return apiNotFound("ケースが見つかりません。");
    if (caseData.insurer_id !== caller.insurerId) return apiForbidden();

    // Fetch messages
    const { data: messages } = await admin
      .from("insurer_case_messages")
      .select("*")
      .eq("case_id", id)
      .order("created_at", { ascending: true });

    // Fetch attachments
    const { data: attachments } = await admin
      .from("insurer_case_attachments")
      .select("*")
      .eq("case_id", id)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      case: caseData,
      messages: messages ?? [],
      attachments: attachments ?? [],
    });
  } catch (err) {
    return apiInternalError(err, "GET /api/insurer/cases/[id]");
  }
}

/**
 * PATCH /api/insurer/cases/[id]
 * Update case fields.
 */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const limited = await checkRateLimit(req, "general");
  if (limited) return limited;

  const caller = await resolveInsurerCaller();
  if (!caller) return apiUnauthorized();

  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return apiValidationError("Invalid JSON body.");
  }

  const admin = createAdminClient();

  try {
    // Verify case belongs to caller's insurer
    const { data: existing, error: fetchErr } = await admin
      .from("insurer_cases")
      .select("id, insurer_id, status")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr) return apiValidationError(fetchErr.message);
    if (!existing) return apiNotFound("ケースが見つかりません。");
    if (existing.insurer_id !== caller.insurerId) return apiForbidden();

    // Build update payload with allowed fields only
    const allowedFields = [
      "title",
      "description",
      "status",
      "priority",
      "category",
      "assigned_to",
    ] as const;

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return apiValidationError("No valid fields to update.");
    }

    // Handle status transition timestamps
    if (
      updateData.status === "resolved" &&
      existing.status !== "resolved"
    ) {
      updateData.resolved_at = new Date().toISOString();
    }
    if (
      updateData.status === "closed" &&
      existing.status !== "closed"
    ) {
      updateData.closed_at = new Date().toISOString();
    }

    updateData.updated_at = new Date().toISOString();

    const { data: updated, error: updateErr } = await admin
      .from("insurer_cases")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (updateErr) return apiValidationError(updateErr.message);

    // Log to insurer_access_logs
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const ua = req.headers.get("user-agent") ?? null;

    await admin.from("insurer_access_logs").insert({
      insurer_id: caller.insurerId,
      insurer_user_id: caller.insurerUserId,
      action: "case_update",
      meta: {
        case_id: id,
        updated_fields: Object.keys(updateData),
        route: "PATCH /api/insurer/cases/[id]",
      },
      ip,
      user_agent: ua,
    });

    return NextResponse.json({ case: updated });
  } catch (err) {
    return apiInternalError(err, "PATCH /api/insurer/cases/[id]");
  }
}
