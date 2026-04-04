import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveCallerWithRole } from "@/lib/auth/checkRole";
import { apiOk, apiUnauthorized, apiInternalError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

/** GET /api/admin/shop/products — アクティブ商品一覧 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const caller = await resolveCallerWithRole(supabase);
    if (!caller) return apiUnauthorized();

    const { data, error } = await supabase
      .from("shop_products")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) return apiInternalError(error, "shop_products select");

    return apiOk({ products: data ?? [] });
  } catch (e) {
    console.error("[admin/shop/products]", e);
    return NextResponse.json(
      { error: "internal_error", message: "内部エラーが発生しました" },
      { status: 500 }
    );
  }
}
