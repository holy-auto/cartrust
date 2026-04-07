import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import CertNewFormWrapper from "./CertNewFormWrapper";
import { normalizePlanTier } from "@/lib/billing/planFeatures";
import type { PlanTier } from "@/lib/billing/planFeatures";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tid?: string; vehicle_id?: string; customer_id?: string; edit_draft?: string }>;
}) {
  const sp = await searchParams;
  const selectedTemplateId = sp.tid ?? "";
  const defaultVehicleId = sp.vehicle_id ?? undefined;
  const defaultCustomerId = sp.customer_id ?? undefined;
  const editDraftPublicId = sp.edit_draft ?? undefined;

  const supabase = await createSupabaseServerClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) redirect("/login?next=/admin/certificates/new");

  const { data: mem } = await supabase
    .from("tenant_memberships")
    .select("tenant_id")
    .limit(1)
    .single();

  if (!mem) return <div className="text-sm text-muted">tenant_memberships が見つかりません。</div>;
  const tenantId = mem.tenant_id as string;

  const { data: tenantRow } = await supabase
    .from("tenants")
    .select("logo_asset_path, plan_tier, default_warranty_exclusions")
    .eq("id", tenantId)
    .single();

  const tenantLogoPath = (tenantRow?.logo_asset_path as string | null) ?? null;
  const planTier = normalizePlanTier(tenantRow?.plan_tier) as PlanTier;
  const defaultWarrantyExclusions = (tenantRow?.default_warranty_exclusions as string | null) ?? "";

  // ブランドテンプレート確認
  let hasBrandedTemplate = false;
  try {
    const { data: tos } = await supabase
      .from("tenant_option_subscriptions")
      .select("status")
      .eq("tenant_id", tenantId)
      .in("status", ["active", "past_due"])
      .limit(1)
      .maybeSingle();
    const { data: ttc } = await supabase
      .from("tenant_template_configs")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();
    hasBrandedTemplate = !!tos && !!ttc;
  } catch { /* tables may not exist */ }

  // テナント固有 + 共通テンプレート（tenant_id IS NULL）を取得
  const { data: templates, error: tplErr } = await supabase
    .from("templates")
    .select("id, name, schema_json, category, created_at")
    .or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
    .order("created_at", { ascending: false });

  if (tplErr) return <div className="text-sm text-danger">テンプレ読み込みエラー: {tplErr.message}</div>;

  // 車両一覧（顧客情報を JOIN）
  const { data: vehiclesRaw } = await supabase
    .from("vehicles")
    .select("id, maker, model, year, plate_display, vin_code, customer_id, customer:customers(id, name)")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  // 下書き編集モード: 既存下書きのデータを読み込む
  let draftRow: Record<string, any> | null = null;
  if (editDraftPublicId) {
    const { data } = await supabase
      .from("certificates")
      .select(
        "public_id, customer_name, customer_id, vehicle_id, vehicle_info_json, " +
        "content_free_text, expiry_value, expiry_date, warranty_period_end, " +
        "maintenance_date, warranty_exclusions, remarks, content_preset_json"
      )
      .eq("tenant_id", tenantId)
      .eq("public_id", editDraftPublicId)
      .eq("status", "draft")
      .single();
    draftRow = data ?? null;
  }

  const list = templates ?? [];
  const fallbackId = list[0]?.id ?? "";
  // 下書き編集時はテンプレートIDをpresetsから復元
  const draftTemplateId = draftRow?.content_preset_json?.template_id ?? "";
  const tid = selectedTemplateId || draftTemplateId || fallbackId;
  const selected = list.find((t) => t.id === tid) ?? list[0] ?? null;

  const draftInfo = draftRow?.vehicle_info_json ?? {};
  const initialValues = draftRow ? {
    customer_name: draftRow.customer_name ?? "",
    customer_id: draftRow.customer_id ?? "",
    vehicle_id: draftRow.vehicle_id ?? "",
    vehicle_maker: draftInfo.maker ?? "",
    vehicle_model: draftInfo.model ?? "",
    vehicle_plate: draftInfo.plate ?? "",
    content_free_text: draftRow.content_free_text ?? "",
    expiry_value: draftRow.expiry_value ?? "",
    expiry_date: draftRow.expiry_date ?? "",
    warranty_period_end: draftRow.warranty_period_end ?? "",
    maintenance_date: draftRow.maintenance_date ?? "",
    warranty_exclusions: draftRow.warranty_exclusions ?? "",
    remarks: draftRow.remarks ?? "",
  } : undefined;

  return (
    <div className="space-y-4">
      <PageHeader
        tag="証明書発行"
        title="新規発行"
        description={tenantLogoPath ? undefined : "ロゴ未設定（設定 → ロゴ管理）"}
        actions={
          <div className="flex gap-3 items-center">
            <Link className="btn-ghost" href="/admin/certificates">一覧へ</Link>
          </div>
        }
      />

      {hasBrandedTemplate && (
        <div className="glass-card p-3 text-sm text-accent glow-cyan flex items-center justify-between">
          <span>ブランドテンプレートが適用中です。発行される証明書PDFに自動で反映されます。</span>
          <Link href="/admin/template-options" className="text-xs underline">設定を確認</Link>
        </div>
      )}

      <CertNewFormWrapper
        vehicles={(vehiclesRaw ?? []) as any[]}
        defaultVehicleId={defaultVehicleId}
        defaultCustomerId={defaultCustomerId}
        templates={list as any[]}
        selectedTemplate={selected as any}
        tenantLogoPath={tenantLogoPath}
        planTier={planTier}
        tid={tid}
        serviceType={
          (selected as any)?.category === "ppf" ? "ppf"
          : (selected as any)?.category === "maintenance" ? "maintenance"
          : (selected as any)?.category === "body_repair" ? "body_repair"
          : undefined
        }
        defaultWarrantyExclusions={defaultWarrantyExclusions}
        editPublicId={editDraftPublicId}
        initialValues={initialValues}
      />
    </div>
  );
}
