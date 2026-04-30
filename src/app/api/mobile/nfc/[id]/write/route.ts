import { NextRequest } from "next/server";
import { resolveMobileCaller } from "@/lib/auth/mobileAuth";
import { hasPermission } from "@/lib/auth/permissions";
import {
  apiOk,
  apiUnauthorized,
  apiForbidden,
  apiNotFound,
  apiValidationError,
  apiInternalError,
} from "@/lib/api/response";

export const dynamic = "force-dynamic";

// ─── POST: Record NFC write event ───
//
// Path param `[id]` is the physical NFC UID (hex string), NOT the nfc_tags
// PK uuid. Mobile clients only know the physical UID after touching the tag.
//
// 動作:
//  1. uid で既存行を検索。あれば prepared/written 状態を更新
//  2. 無ければ tenant の prepared 在庫から最古の1件を消費し、uid を割当てる
//     (Stripe webhook で事前プロビジョニングされた tag_code のスロット)
//  3. prepared 在庫が無ければ 422
//
// 同じ uid に対して同じ certificate_id で再呼び出しされた場合は冪等。
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const caller = await resolveMobileCaller(request);
    if (!caller) return apiUnauthorized();
    if (!hasPermission(caller.role, "certificates:edit")) return apiForbidden();

    const { id: physicalUid } = await params;
    if (!physicalUid) {
      return apiValidationError("Physical NFC UID is required");
    }

    const body = (await request.json().catch(() => ({}))) as {
      certificate_id?: string;
    };
    const certificateId = body.certificate_id ?? null;

    // 1) uid で既存行を検索
    const { data: existing } = await caller.supabase
      .from("nfc_tags")
      .select("id, status, certificate_id")
      .eq("uid", physicalUid)
      .eq("tenant_id", caller.tenantId)
      .maybeSingle();

    let tagRowId: string;

    if (existing) {
      // 冪等: 同じ certificate_id で written 済みなら現状を返す
      if (existing.status === "written" && existing.certificate_id === certificateId) {
        return apiOk({
          nfc_tag: {
            id: existing.id,
            status: existing.status,
            certificate_id: existing.certificate_id,
            uid: physicalUid,
          },
        });
      }

      if (existing.status !== "prepared") {
        return apiValidationError(`Cannot write: current status is "${existing.status}", expected "prepared"`);
      }
      tagRowId = existing.id;
    } else {
      // 2) 在庫から最古の prepared を1件消費
      const { data: spare, error: spareErr } = await caller.supabase
        .from("nfc_tags")
        .select("id")
        .eq("tenant_id", caller.tenantId)
        .eq("status", "prepared")
        .is("uid", null)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (spareErr) return apiInternalError(spareErr, "nfc.write.lookup");
      if (!spare) {
        return apiValidationError("利用可能なNFCタグ在庫がありません。タグを発注してください。");
      }
      tagRowId = spare.id;
    }

    // 3) 状態遷移 prepared → written + uid/certificate_id 紐付け
    const { data, error } = await caller.supabase
      .from("nfc_tags")
      .update({
        status: "written",
        uid: physicalUid,
        certificate_id: certificateId,
        written_at: new Date().toISOString(),
      })
      .eq("id", tagRowId)
      .eq("tenant_id", caller.tenantId)
      .select("id, status, written_at, certificate_id, uid")
      .single();

    if (error) return apiInternalError(error, "nfc.write");

    // Audit log (uuid PK で記録)
    await caller.supabase.from("audit_logs").insert({
      tenant_id: caller.tenantId,
      table_name: "nfc_tags",
      record_id: tagRowId,
      action: "nfc_tag_written",
      performed_by: caller.userId,
      ip_address: request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip"),
    });

    return apiOk({ nfc_tag: data });
  } catch (e) {
    return apiInternalError(e, "nfc.write");
  }
}
