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
 * Verify the case exists and belongs to the caller's insurer.
 * Returns the case data or a Response (error).
 */
async function verifyCase(
  admin: ReturnType<typeof createAdminClient>,
  caseId: string,
  insurerId: string,
) {
  const { data, error } = await admin
    .from("insurer_cases")
    .select("id, insurer_id")
    .eq("id", caseId)
    .maybeSingle();

  if (error) return apiValidationError(error.message);
  if (!data) return apiNotFound("ケースが見つかりません。");
  if (data.insurer_id !== insurerId) return apiForbidden();
  return data;
}

/**
 * GET /api/insurer/cases/[id]/messages
 * List messages for a case with sender display info.
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
    const caseOrErr = await verifyCase(admin, id, caller.insurerId);
    if (caseOrErr instanceof Response) return caseOrErr;

    // Fetch messages
    const { data: messages, error } = await admin
      .from("insurer_case_messages")
      .select("*")
      .eq("case_id", id)
      .order("created_at", { ascending: true });

    if (error) return apiValidationError(error.message);

    // Collect unique sender_ids to look up display names from insurer_users
    const senderIds = [
      ...new Set((messages ?? []).map((m) => m.sender_id).filter(Boolean)),
    ];

    let senderMap: Record<string, string> = {};
    if (senderIds.length > 0) {
      const { data: users } = await admin
        .from("insurer_users")
        .select("user_id, display_name")
        .in("user_id", senderIds);

      if (users) {
        senderMap = Object.fromEntries(
          users.map((u) => [u.user_id, u.display_name]),
        );
      }
    }

    // Attach display_name to each message
    const enriched = (messages ?? []).map((m) => ({
      ...m,
      sender_display_name: senderMap[m.sender_id] ?? null,
    }));

    return NextResponse.json({ messages: enriched });
  } catch (err) {
    return apiInternalError(err, "GET /api/insurer/cases/[id]/messages");
  }
}

/**
 * POST /api/insurer/cases/[id]/messages
 * Send a message to a case.
 */
export async function POST(
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

  const { content } = body as { content?: string };

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return apiValidationError("content is required.");
  }

  const admin = createAdminClient();

  try {
    const caseOrErr = await verifyCase(admin, id, caller.insurerId);
    if (caseOrErr instanceof Response) return caseOrErr;

    const { data: message, error } = await admin
      .from("insurer_case_messages")
      .insert({
        case_id: id,
        sender_id: caller.userId,
        sender_type: "insurer",
        content: content.trim(),
      })
      .select("*")
      .single();

    if (error) return apiValidationError(error.message);

    // Log to insurer_access_logs
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const ua = req.headers.get("user-agent") ?? null;

    await admin.from("insurer_access_logs").insert({
      insurer_id: caller.insurerId,
      insurer_user_id: caller.insurerUserId,
      action: "case_message",
      meta: {
        case_id: id,
        message_id: message.id,
        route: "POST /api/insurer/cases/[id]/messages",
      },
      ip,
      user_agent: ua,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    return apiInternalError(err, "POST /api/insurer/cases/[id]/messages");
  }
}
