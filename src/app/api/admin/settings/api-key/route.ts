/**
 * GET  /api/admin/settings/api-key  — テナントの外部 API キーを取得
 * POST /api/admin/settings/api-key  — API キーを再生成する
 *
 * 用途: 外部予約 API (/api/external/booking) で使用するテナント固有 API キーの管理。
 */

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { resolveCallerWithRole } from "@/lib/auth/checkRole";
import { apiOk, apiError, apiUnauthorized, apiInternalError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

/** テナントの API キーを取得 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const caller   = await resolveCallerWithRole(supabase);
  if (!caller) return apiUnauthorized();

  // owner / admin のみ参照可能
  if (!["owner", "admin"].includes(caller.role)) {
    return apiError({ code: "forbidden", message: "権限がありません", status: 403 });
  }

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("tenants")
      .select("external_api_key")
      .eq("id", caller.tenantId)
      .single();

    if (error || !data) return apiInternalError(error, "api-key GET");

    const key = (data as { external_api_key?: string | null }).external_api_key;

    return apiOk({
      api_key:   key ?? null,
      masked:    key ? maskKey(key) : null,
    });
  } catch (e) {
    return apiInternalError(e, "api-key GET");
  }
}

/** API キーを再生成する */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const caller   = await resolveCallerWithRole(supabase);
  if (!caller) return apiUnauthorized();

  // owner のみ再生成可能
  if (caller.role !== "owner") {
    return apiError({ code: "forbidden", message: "オーナー権限が必要です", status: 403 });
  }

  try {
    const admin  = getSupabaseAdmin();
    const newKey = "ldk_" + crypto.randomUUID().replace(/-/g, "");

    const { error } = await admin
      .from("tenants")
      .update({ external_api_key: newKey })
      .eq("id", caller.tenantId);

    if (error) return apiInternalError(error, "api-key POST");

    return apiOk({
      api_key: newKey,
      message: "API キーを再生成しました。旧キーは即座に無効化されます。",
    });
  } catch (e) {
    return apiInternalError(e, "api-key POST");
  }
}

/** API キーをマスク表示する（先頭8文字 + *** + 末尾4文字） */
function maskKey(key: string): string {
  if (key.length <= 12) return key.slice(0, 4) + "***";
  return key.slice(0, 8) + "***" + key.slice(-4);
}
