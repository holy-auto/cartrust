import { NextRequest } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveCallerWithRole } from "@/lib/auth/checkRole";
import { canUseFeature, normalizePlanTier } from "@/lib/billing/planFeatures";
import { apiUnauthorized, apiValidationError, apiPlanLimit, apiInternalError, apiOk } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const caller = await resolveCallerWithRole(supabase);
    if (!caller) return apiUnauthorized();

    const { data: tenant } = await supabase.from("tenants").select("plan_tier").eq("id", caller.tenantId).single();

    const planTier = normalizePlanTier(tenant?.plan_tier);

    if (!canUseFeature(planTier, "ai_academy_feedback")) {
      return apiPlanLimit("この機能はStandardプラン以上でご利用いただけます", {
        code: "plan_limit",
      });
    }

    const body = await req.json();
    const { content } = body ?? {};

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return apiValidationError("フィードバック内容を入力してください");
    }

    return apiOk({ received: true });
  } catch (e: unknown) {
    return apiInternalError(e, "academy/feedback");
  }
}
