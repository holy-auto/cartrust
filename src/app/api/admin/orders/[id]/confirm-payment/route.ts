import { NextRequest } from "next/server";
import { z } from "zod";
import Stripe from "stripe";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveCallerWithRole } from "@/lib/auth/checkRole";
import { createTenantScopedAdmin } from "@/lib/supabase/admin";
import { apiJson, apiUnauthorized, apiNotFound, apiValidationError, apiInternalError } from "@/lib/api/response";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover" as Stripe.LatestApiVersion,
  });
}

/** 支払い確認後に施工店（to_tenant）へ90%自動送金する（fire-and-forget） */
async function triggerOrderPayout(orderId: string, fromTenantId: string): Promise<void> {
  const { admin } = createTenantScopedAdmin(fromTenantId);

  const { data: order } = await admin
    .from("job_orders")
    .select("id, invoice_number, payout_amount, to_tenant_id, payout_stripe_transfer_id")
    .eq("id", orderId)
    .single();

  if (!order?.payout_amount || !order?.to_tenant_id) return;
  // 既に送金済みの場合はスキップ
  if (order.payout_stripe_transfer_id) return;

  const { data: shop } = await admin
    .from("tenants")
    .select("stripe_connect_account_id, stripe_connect_onboarded")
    .eq("id", order.to_tenant_id as string)
    .single();

  if (!shop?.stripe_connect_account_id || !shop?.stripe_connect_onboarded) {
    // Stripe Connect 未設定 → 手動送金フラグを立てる
    await admin
      .from("job_orders")
      .update({ payout_stripe_transfer_id: "manual_required" })
      .eq("id", orderId);
    console.warn("[confirm-payment] payout manual_required — Connect not set up", { orderId });
    return;
  }

  const stripe = getStripe();
  const transfer = await stripe.transfers.create({
    amount: Math.round(order.payout_amount as number),
    currency: "jpy",
    destination: shop.stripe_connect_account_id as string,
    metadata: {
      order_id: orderId,
      invoice_number: (order.invoice_number as string | null) ?? "",
    },
  });

  await admin
    .from("job_orders")
    .update({
      payout_stripe_transfer_id: transfer.id,
      payout_executed_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  console.info("[confirm-payment] payout executed", { orderId, transferId: transfer.id });
}

const confirmPaymentSchema = z.object({
  payment_method: z.string().trim().max(50).optional(),
  amount: z.coerce.number().int().min(0).optional(),
});

/**
 * POST /api/admin/orders/[id]/confirm-payment
 * 支払確認（双方が確認 → both_confirmed → completed）
 * Body: { payment_method?: string, amount?: number }
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const caller = await resolveCallerWithRole(supabase);
    if (!caller) return apiUnauthorized();
    const tenantId = caller.tenantId;

    const { admin } = createTenantScopedAdmin(caller.tenantId);
    const parsed = confirmPaymentSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return apiValidationError(parsed.error.issues[0]?.message ?? "invalid payload");
    }
    const body = parsed.data;

    // 注文取得
    const { data: order, error: fetchErr } = await admin
      .from("job_orders")
      .select(
        "id, status, from_tenant_id, to_tenant_id, payment_method, accepted_amount, payment_confirmed_by_client, payment_confirmed_by_vendor, payment_status",
      )
      .eq("id", id)
      .or(`from_tenant_id.eq.${tenantId},to_tenant_id.eq.${tenantId}`)
      .single();

    if (fetchErr || !order) {
      return apiNotFound("not_found");
    }

    if (!["payment_pending", "completed"].includes(order.status)) {
      return apiValidationError("支払確認は支払待ちまたは完了ステータスの注文のみ可能です");
    }

    const isFrom = order.from_tenant_id === tenantId;
    const isTo = order.to_tenant_id != null && order.to_tenant_id === tenantId;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // 支払方法・金額の記録（初回のみ）
    if (body.payment_method && !order.payment_method) {
      updateData.payment_method = body.payment_method;
    }
    if (body.amount && !order.accepted_amount) {
      updateData.accepted_amount = body.amount;
    }

    // 発注側（client）の確認
    if (isFrom && !order.payment_confirmed_by_client) {
      updateData.payment_confirmed_by_client = true;
    }
    // 受注側（vendor）の確認
    if (isTo && !order.payment_confirmed_by_vendor) {
      updateData.payment_confirmed_by_vendor = true;
    }

    // 双方確認済みかチェック
    const clientConfirmed = isFrom ? true : order.payment_confirmed_by_client;
    const vendorConfirmed = isTo ? true : order.payment_confirmed_by_vendor;

    if (clientConfirmed && vendorConfirmed) {
      updateData.payment_status = "both_confirmed";
      updateData.status = "completed";
      // Stripe Connect 自動送金（fire-and-forget）
      triggerOrderPayout(id, tenantId).catch((e: unknown) =>
        console.error("[confirm-payment] payout failed:", e),
      );
    } else if (isFrom) {
      updateData.payment_status = "confirmed_by_client";
    } else if (isTo) {
      updateData.payment_status = "confirmed_by_vendor";
    }

    // UPDATE にも tenant 検証フィルタをコピー (TOCTOU 対策)。
    // 別テナントの注文を誤って更新しないよう id + or(...) で二重にスコープ。
    const { data, error } = await admin
      .from("job_orders")
      .update(updateData)
      .eq("id", id)
      .or(`from_tenant_id.eq.${tenantId},to_tenant_id.eq.${tenantId}`)
      .select(
        "id, public_id, from_tenant_id, to_tenant_id, title, status, payment_status, payment_method, accepted_amount, payment_confirmed_by_client, payment_confirmed_by_vendor, created_at, updated_at",
      )
      .maybeSingle();

    if (error) {
      return apiInternalError(error, "confirm-payment update");
    }
    if (!data) {
      return apiNotFound("not_found_or_conflict");
    }

    // 監査ログ
    admin
      .from("order_audit_log")
      .insert({
        job_order_id: id,
        actor_user_id: caller.userId,
        actor_tenant_id: tenantId,
        action: "payment_confirmed",
        old_value: { payment_status: order.payment_status },
        new_value: { payment_status: updateData.payment_status ?? order.payment_status },
      })
      .then(() => {}, console.error);

    return apiJson({ ok: true, order: data });
  } catch (e: unknown) {
    return apiInternalError(e, "confirm-payment POST");
  }
}
