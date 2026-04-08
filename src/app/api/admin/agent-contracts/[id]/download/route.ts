import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/api/auth";
import { resolveCallerWithRole, requireMinRole } from "@/lib/auth/checkRole";
import { apiUnauthorized, apiForbidden, apiInternalError, apiNotFound } from "@/lib/api/response";
import { SIGNED_URL_TTL_SHORT_SECS } from "@/lib/constants";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/agent-contracts/[id]/download
 * Download the signed PDF for a completed signing request.
 */
export async function GET(_request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const supabase = await createClient();
    const caller = await resolveCallerWithRole(supabase);
    if (!caller) return apiUnauthorized();
    if (!requireMinRole(caller, "admin")) return apiForbidden();

    const admin = getAdminClient();
    const { data, error } = await admin
      .from("agent_signing_requests")
      .select("id, signed_pdf_path, title, status")
      .eq("id", id)
      .single();

    if (error || !data) return apiNotFound("contract not found");
    if (data.status !== "signed" || !data.signed_pdf_path) {
      return apiNotFound("署名済みPDFはまだありません");
    }

    const { data: signedData, error: signErr } = await admin.storage
      .from("agent-shared-files")
      .createSignedUrl(data.signed_pdf_path, SIGNED_URL_TTL_SHORT_SECS, {
        download: `${data.title}.pdf`,
      });

    if (signErr || !signedData?.signedUrl) {
      return apiInternalError(signErr, "admin/agent-contracts download signedUrl");
    }

    return NextResponse.json({ url: signedData.signedUrl });
  } catch (e) {
    return apiInternalError(e, "admin/agent-contracts [id] download GET");
  }
}
