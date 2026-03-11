import VehicleSelector from "./VehicleSelector";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { makePublicId } from "@/lib/publicId";
import { normalizePlanTier } from "@/lib/billing/planFeatures";
import {
  CERTIFICATE_IMAGE_ALLOWED_TYPES,
  CERTIFICATE_IMAGE_BUCKET,
  CERTIFICATE_IMAGE_MAX_FILE_BYTES,
  formatCertificateImageBytes,
  getCertificateImageLimit,
  isAllowedCertificateImageType,
  sanitizeCertificateImageName,
} from "@/lib/certificateImages";

type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "multiselect"
  | "checkbox";

type TemplateSchema = {
  version: number;
  sections: Array<{
    title: string;
    fields: Array<{
      key: string;
      label: string;
      type: FieldType;
      options?: string[];
      required?: boolean;
    }>;
  }>;
};

type VehicleRow = {
  id: string;
  maker: string | null;
  model: string | null;
  year: number | null;
  plate_display: string | null;
  customer_name: string | null;
  customer_email: string | null;
  notes: string | null;
  created_at?: string | null;
};

type ThicknessMeasurement = {
  unit: "µm";
  bonnet: string | null;
  roof: string | null;
  left_front_fender: string | null;
  right_front_fender: string | null;
  left_front_door: string | null;
  right_front_door: string | null;
  left_rear_door: string | null;
  right_rear_door: string | null;
  left_rear_fender: string | null;
  right_rear_fender: string | null;
  notes: string | null;
};

function imageTypeLabel() {
  return CERTIFICATE_IMAGE_ALLOWED_TYPES.map((v) => v.replace("image/", "").toUpperCase()).join(" / ");
}

function cleanText(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s || null;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tid?: string; e?: string; vehicle_id?: string }>;
}) {
  const sp = await searchParams;
  const selectedTemplateId = sp.tid ?? "";
  const initialVehicleId = (sp.vehicle_id ?? "").trim();

  const issueError =
    sp.e === "tenant"
      ? "店舗情報を取得できませんでした。ログイン状態を確認してから再実行してください。"
      : sp.e === "1"
        ? "必須項目が不足しています。車両選択とお客様名を確認してください。"
        : sp.e === "2"
          ? "証明書の保存に失敗しました。入力内容を確認して再実行してください。"
          : sp.e === "img_count"
            ? "添付画像の枚数がプラン上限を超えています。"
            : sp.e === "img_type"
              ? `添付画像の形式が不正です。${imageTypeLabel()} のみ利用できます。`
              : sp.e === "img_size"
                ? `添付画像のサイズ上限は 1枚あたり ${formatCertificateImageBytes(CERTIFICATE_IMAGE_MAX_FILE_BYTES)} です。`
                : null;

  const supabase = await createSupabaseServerClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) redirect("/login?next=/admin/certificates/new");

  const { data: mem } = await supabase
    .from("tenant_memberships")
    .select("tenant_id")
    .limit(1)
    .single();

  if (!mem) {
    return <main className="p-6">tenant_memberships が見つかりません。</main>;
  }

  const tenantId = mem.tenant_id as string;

  const { data: tenantRow } = await supabase
    .from("tenants")
    .select("logo_asset_path,plan_tier")
    .eq("id", tenantId)
    .single();

  const tenantLogoPath = (tenantRow?.logo_asset_path as string | null) ?? null;
  const planTier = normalizePlanTier(tenantRow?.plan_tier);
  const imageLimit = getCertificateImageLimit(planTier);

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, maker, model, year, plate_display, customer_name, customer_email, notes, created_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  const vehicleRows = ((vehicles ?? []) as VehicleRow[]);

  const { data: templates, error: tplErr } = await supabase
    .from("templates")
    .select("id,name,schema_json,created_at")
    .eq("scope", "tenant")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (tplErr) {
    return <main className="p-6">テンプレ読み込みエラー: {tplErr.message}</main>;
  }

  const list = templates ?? [];
  const fallbackId = list[0]?.id ?? "";
  const tid = selectedTemplateId || fallbackId;
  const selected = list.find((t) => t.id === tid) ?? list[0];
  const schema = (selected?.schema_json as unknown as TemplateSchema) ?? null;

  const sectionCount = schema?.sections.length ?? 0;
  const totalFieldCount =
    schema?.sections.reduce((sum, sec) => sum + sec.fields.length, 0) ?? 0;
  const requiredFieldCount =
    schema?.sections.reduce(
      (sum, sec) => sum + sec.fields.filter((field) => !!field.required).length,
      0
    ) ?? 0;

  async function createCert(formData: FormData) {
    "use server";

    const supabase = await createSupabaseServerClient();
    const admin = createSupabaseAdminClient();

    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes.user?.id ?? null;

    const { data: mem } = await supabase
      .from("tenant_memberships")
      .select("tenant_id")
      .limit(1)
      .single();

    const tenantId = mem?.tenant_id as string | undefined;
    if (!tenantId) redirect("/admin/certificates/new?e=tenant");

    const { data: tenantRow } = await supabase
      .from("tenants")
      .select("logo_asset_path,plan_tier")
      .eq("id", tenantId)
      .single();

    const tenantLogoPath = (tenantRow?.logo_asset_path as string | null) ?? null;
    const planTier = normalizePlanTier(tenantRow?.plan_tier);
    const imageLimit = getCertificateImageLimit(planTier);

    const template_id = String(formData.get("template_id") || "");
    const template_name = String(formData.get("template_name") || "");

    let schema_snapshot: any = null;
    if (template_id) {
      const { data: tpl } = await supabase
        .from("templates")
        .select("schema_json")
        .eq("id", template_id)
        .eq("tenant_id", tenantId)
        .single();

      schema_snapshot = tpl?.schema_json ?? null;
    }

    const customer_name = String(formData.get("customer_name") || "").trim();
    const vehicle_id = String(formData.get("vehicle_id") || "").trim();
    const issue_nfc = String(formData.get("issue_nfc") || "").trim() === "1";

    const vehicleLookup = await supabase
      .from("vehicles")
      .select("id, tenant_id")
      .eq("id", vehicle_id)
      .maybeSingle();

    const model = String(formData.get("model") || "").trim();
    const plate = String(formData.get("plate") || "").trim();
    const content_free_text = String(formData.get("content_free_text") || "").trim();
    const expiry_value = String(formData.get("expiry_value") || "").trim();

    const thicknessMeasurement: ThicknessMeasurement = {
      unit: "µm",
      bonnet: cleanText(formData.get("thickness_bonnet")),
      roof: cleanText(formData.get("thickness_roof")),
      left_front_fender: cleanText(formData.get("thickness_left_front_fender")),
      right_front_fender: cleanText(formData.get("thickness_right_front_fender")),
      left_front_door: cleanText(formData.get("thickness_left_front_door")),
      right_front_door: cleanText(formData.get("thickness_right_front_door")),
      left_rear_door: cleanText(formData.get("thickness_left_rear_door")),
      right_rear_door: cleanText(formData.get("thickness_right_rear_door")),
      left_rear_fender: cleanText(formData.get("thickness_left_rear_fender")),
      right_rear_fender: cleanText(formData.get("thickness_right_rear_fender")),
      notes: cleanText(formData.get("thickness_notes")),
    };

    const imageFiles = formData
      .getAll("certificate_images")
      .filter((v): v is File => v instanceof File && v.size > 0);

    if (!vehicle_id || !customer_name || !vehicleLookup.data?.tenant_id) {
      redirect(`/admin/certificates/new?tid=${encodeURIComponent(template_id)}&e=1`);
    }

    if (imageFiles.length > imageLimit) {
      redirect(`/admin/certificates/new?tid=${encodeURIComponent(template_id)}&e=img_count`);
    }

    for (const file of imageFiles) {
      if (!isAllowedCertificateImageType(file.type)) {
        redirect(`/admin/certificates/new?tid=${encodeURIComponent(template_id)}&e=img_type`);
      }
      if (file.size > CERTIFICATE_IMAGE_MAX_FILE_BYTES) {
        redirect(`/admin/certificates/new?tid=${encodeURIComponent(template_id)}&e=img_size`);
      }
    }

    const values: Record<string, any> = {};
    for (const [k, v] of formData.entries()) {
      const key = String(k);
      if (!key.startsWith("f__")) continue;
      const fkey = key.slice(3);

      if (v === "on") {
        values[fkey] = true;
        continue;
      }

      const sv = String(v);

      if (values[fkey] === undefined) values[fkey] = sv;
      else if (Array.isArray(values[fkey])) values[fkey].push(sv);
      else values[fkey] = [values[fkey], sv];
    }

    const public_id = makePublicId();

    const { data: createdCert, error } = await supabase
      .from("certificates")
      .insert({
        tenant_id: tenantId,
        public_id,
        vehicle_id,
        status: "active",
        customer_name,
        vehicle_info_json: { model, plate },
        content_free_text,
        content_preset_json: {
          template_id,
          template_name,
          schema_snapshot,
          values,
          thickness_measurement: thicknessMeasurement,
        },
        expiry_type: "text",
        expiry_value,
        footer_variant: "holy",
        logo_asset_path: tenantLogoPath,
        created_by: userId,
      })
      .select("id")
      .single();

    if (error || !createdCert?.id) {
      redirect(`/admin/certificates/new?tid=${encodeURIComponent(template_id)}&e=2`);
    }

    let imagePartial = false;

    if (imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];

        try {
          const safeName = sanitizeCertificateImageName(file.name || `image_${i + 1}`);
          const stamp = `${Date.now()}_${String(i + 1).padStart(2, "0")}`;
          const storagePath = `${tenantId}/${createdCert.id}/${stamp}_${safeName}`;
          const body = new Uint8Array(await file.arrayBuffer());

          const uploadRes = await admin.storage
            .from(CERTIFICATE_IMAGE_BUCKET)
            .upload(storagePath, body, {
              contentType: file.type,
              upsert: false,
            });

          if (uploadRes.error) {
            throw uploadRes.error;
          }

          const insertRes = await admin.from("certificate_images").insert({
            tenant_id: tenantId,
            certificate_id: createdCert.id,
            storage_path: storagePath,
            file_name: safeName,
            content_type: file.type,
            file_size: file.size,
            sort_order: i + 1,
            created_by: userId,
          });

          if (insertRes.error) {
            throw insertRes.error;
          }
        } catch (e) {
          console.error("certificate image upload failed", e);
          imagePartial = true;
        }
      }
    }

    await supabase.from("vehicle_histories").insert({
      tenant_id: vehicleLookup.data.tenant_id,
      vehicle_id,
      type: "certificate_issued",
      title: "施工証明書を発行",
      description: null,
      performed_at: new Date().toISOString(),
      certificate_id: createdCert.id,
    });

    if (issue_nfc) {
      await supabase.from("nfc_tags").insert({
        tenant_id: vehicleLookup.data.tenant_id,
        tag_code: `TAG-${Date.now()}`,
        vehicle_id,
        certificate_id: createdCert.id,
        status: "prepared",
      });
    }

    const notice = imagePartial ? "&notice=image_partial" : "";
    redirect(`/admin/certificates/new/success?pid=${encodeURIComponent(public_id)}${notice}`);
  }

  return (
    <main className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex rounded-full border border-neutral-300 bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.22em] text-neutral-600">
              CARTRUST ISSUE FLOW
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                施工証明書を新規発行
              </h1>
              <p className="mt-2 text-sm text-neutral-600">
                車両選択 → 顧客確認 → テンプレ入力 → 膜厚入力 → 画像添付 → NFC / 発行条件 → 発行 の順で進めます。
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <Link
              className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              href="/admin/certificates"
            >
              一覧へ
            </Link>
            <Link
              className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              href="/admin/templates"
            >
              テンプレ管理
            </Link>
          </div>
        </header>

        {issueError ? (
          <section className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
            {issueError}
          </section>
        ) : null}

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
          <div>
            <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">TEMPLATE</div>
            <div className="mt-1 text-lg font-semibold text-neutral-900">使用テンプレート</div>
            <div className="mt-1 text-sm text-neutral-600">
              現在選択中のテンプレを切り替えてから発行フォームへ進みます。
            </div>
          </div>

          <form
            action="/admin/certificates/new"
            method="get"
            className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px]"
          >
            <select
              name="tid"
              defaultValue={tid}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm"
            >
              {list.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={!list.length}
              className="rounded-xl border border-neutral-300 bg-neutral-900 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              テンプレ反映
            </button>
          </form>
        </section>

        {!list.length ? (
          <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
            <div className="text-lg font-semibold text-amber-900">テンプレートが未登録です</div>
            <div className="mt-2 text-sm text-amber-800">
              先にテンプレートを作成してから証明書発行へ進んでください。
            </div>
            <div className="mt-4">
              <Link
                href="/admin/templates"
                className="inline-flex rounded-xl border border-amber-400 bg-white px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
              >
                テンプレ管理へ移動
              </Link>
            </div>
          </section>
        ) : (
          <form
            action={createCert}
            encType="multipart/form-data"
            className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
          >
            <input type="hidden" name="template_id" value={selected?.id ?? ""} />
            <input type="hidden" name="template_name" value={selected?.name ?? ""} />

            <div className="space-y-6">
              <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
                <div>
                  <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">STEP 1</div>
                  <div className="mt-1 text-lg font-semibold text-neutral-900">車両選択</div>
                  <div className="mt-1 text-sm text-neutral-600">
                    既存車両から選択し、顧客名の自動補完を利用します。
                  </div>
                </div>

                <VehicleSelector initialRows={vehicleRows} initialVehicleId={initialVehicleId} />
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
                <div>
                  <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">STEP 2</div>
                  <div className="mt-1 text-lg font-semibold text-neutral-900">顧客・車両確認</div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-neutral-800">お客様名（必須）</label>
                    <input
                      name="customer_name"
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-800">車種</label>
                    <input
                      name="model"
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-800">ナンバー</label>
                    <input
                      name="plate"
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
                <div>
                  <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">STEP 3</div>
                  <div className="mt-1 text-lg font-semibold text-neutral-900">テンプレ入力</div>
                  <div className="mt-1 text-sm text-neutral-600">
                    選択テンプレートの項目をそのまま証明書スナップショットへ保存します。
                  </div>
                </div>

                {schema ? (
                  <div className="space-y-5">
                    {schema.sections.map((sec) => (
                      <section
                        key={sec.title}
                        className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 space-y-4"
                      >
                        <div className="text-sm font-semibold text-neutral-900">{sec.title}</div>

                        <div className="grid gap-4 md:grid-cols-2">
                          {sec.fields.map((f) => {
                            const fieldKey = `f__${f.key}`;

                            if (f.type === "checkbox") {
                              return (
                                <label
                                  key={fieldKey}
                                  className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm md:col-span-2"
                                >
                                  <input type="checkbox" name={fieldKey} className="h-4 w-4" />
                                  <span>
                                    {f.label}
                                    {f.required ? "（必須）" : ""}
                                  </span>
                                </label>
                              );
                            }

                            if (f.type === "select") {
                              return (
                                <div key={fieldKey} className="space-y-2">
                                  <label className="text-sm font-medium text-neutral-800">
                                    {f.label}
                                    {f.required ? "（必須）" : ""}
                                  </label>
                                  <select
                                    name={fieldKey}
                                    required={!!f.required}
                                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm"
                                  >
                                    <option value="">選択</option>
                                    {(f.options ?? []).map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              );
                            }

                            if (f.type === "multiselect") {
                              return (
                                <div key={fieldKey} className="space-y-2 md:col-span-2">
                                  <label className="text-sm font-medium text-neutral-800">
                                    {f.label}
                                    {f.required ? "（必須）" : ""}
                                  </label>
                                  <select
                                    name={fieldKey}
                                    multiple
                                    required={!!f.required}
                                    className="h-32 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm"
                                  >
                                    {(f.options ?? []).map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="text-xs text-neutral-500">Ctrl / Shift で複数選択</div>
                                </div>
                              );
                            }

                            if (f.type === "textarea") {
                              return (
                                <div key={fieldKey} className="space-y-2 md:col-span-2">
                                  <label className="text-sm font-medium text-neutral-800">
                                    {f.label}
                                    {f.required ? "（必須）" : ""}
                                  </label>
                                  <textarea
                                    name={fieldKey}
                                    rows={4}
                                    required={!!f.required}
                                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm"
                                  />
                                </div>
                              );
                            }

                            if (f.type === "number") {
                              return (
                                <div key={fieldKey} className="space-y-2">
                                  <label className="text-sm font-medium text-neutral-800">
                                    {f.label}
                                    {f.required ? "（必須）" : ""}
                                  </label>
                                  <input
                                    type="number"
                                    name={fieldKey}
                                    required={!!f.required}
                                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm"
                                  />
                                </div>
                              );
                            }

                            if (f.type === "date") {
                              return (
                                <div key={fieldKey} className="space-y-2">
                                  <label className="text-sm font-medium text-neutral-800">
                                    {f.label}
                                    {f.required ? "（必須）" : ""}
                                  </label>
                                  <input
                                    type="date"
                                    name={fieldKey}
                                    required={!!f.required}
                                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm"
                                  />
                                </div>
                              );
                            }

                            return (
                              <div key={fieldKey} className="space-y-2">
                                <label className="text-sm font-medium text-neutral-800">
                                  {f.label}
                                  {f.required ? "（必須）" : ""}
                                </label>
                                <input
                                  name={fieldKey}
                                  required={!!f.required}
                                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-neutral-500">テンプレ項目はありません。</div>
                )}
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
                <div>
                  <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">STEP 4</div>
                  <div className="mt-1 text-lg font-semibold text-neutral-900">膜厚測定</div>
                  <div className="mt-1 text-sm text-neutral-600">
                    測定値は証明書の保存データへ含め、管理詳細・公開ページ・PDFに反映します。
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-800">ボンネット（µm）</label>
                    <input type="number" name="thickness_bonnet" step="1" min="0" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-800">ルーフ（µm）</label>
                    <input type="number" name="thickness_roof" step="1" min="0" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-800">左前フェンダー（µm）</label>
                    <input type="number" name="thickness_left_front_fender" step="1" min="0" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-800">右前フェンダー（µm）</label>
                    <input type="number" name="thickness_right_front_fender" step="1" min="0" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-800">左前ドア（µm）</label>
                    <input type="number" name="thickness_left_front_door" step="1" min="0" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-800">右前ドア（µm）</label>
                    <input type="number" name="thickness_right_front_door" step="1" min="0" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-800">左後ドア（µm）</label>
                    <input type="number" name="thickness_left_rear_door" step="1" min="0" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-800">右後ドア（µm）</label>
                    <input type="number" name="thickness_right_rear_door" step="1" min="0" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-800">左後フェンダー（µm）</label>
                    <input type="number" name="thickness_left_rear_fender" step="1" min="0" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-800">右後フェンダー（µm）</label>
                    <input type="number" name="thickness_right_rear_fender" step="1" min="0" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-neutral-800">測定メモ</label>
                    <textarea
                      name="thickness_notes"
                      rows={3}
                      placeholder="例：再塗装反応なし / 左側面やや高め / 数値は施工前測定"
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
                <div>
                  <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">STEP 5</div>
                  <div className="mt-1 text-lg font-semibold text-neutral-900">施工内容・添付画像</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-800">施工内容（自由記述）</label>
                  <textarea
                    name="content_free_text"
                    rows={4}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-800">有効条件（テキスト）</label>
                  <input
                    name="expiry_value"
                    placeholder="半年ごとにメンテ推奨 など"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm"
                  />
                </div>

                <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 space-y-3">
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">添付画像</div>
                    <div className="mt-1 text-sm text-neutral-600">
                      1証明書あたり <span className="font-semibold">{imageLimit}枚</span> まで添付できます。
                    </div>
                  </div>

                  <input
                    type="file"
                    name="certificate_images"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="block w-full text-sm text-neutral-700"
                  />

                  <div className="text-xs text-neutral-500">
                    利用可能形式: {imageTypeLabel()} / 1枚あたり最大 {formatCertificateImageBytes(CERTIFICATE_IMAGE_MAX_FILE_BYTES)}
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-6 xl:sticky xl:top-6 self-start">
              <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
                <div>
                  <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">SUMMARY</div>
                  <div className="mt-1 text-lg font-semibold text-neutral-900">発行サマリー</div>
                </div>

                <div className="grid gap-3 text-sm">
                  <div className="rounded-xl bg-neutral-50 p-4">
                    <div className="text-xs text-neutral-500">プラン</div>
                    <div className="mt-1 font-medium text-neutral-900">{planTier}</div>
                  </div>

                  <div className="rounded-xl bg-neutral-50 p-4">
                    <div className="text-xs text-neutral-500">画像上限</div>
                    <div className="mt-1 font-medium text-neutral-900">{imageLimit}枚 / 1証明書</div>
                  </div>

                  <div className="rounded-xl bg-neutral-50 p-4">
                    <div className="text-xs text-neutral-500">登録車両数</div>
                    <div className="mt-1 font-medium text-neutral-900">{vehicleRows.length}件</div>
                  </div>

                  <div className="rounded-xl bg-neutral-50 p-4">
                    <div className="text-xs text-neutral-500">テンプレ情報</div>
                    <div className="mt-1 font-medium text-neutral-900">
                      {selected?.name ?? "-"}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      セクション {sectionCount} / 項目 {totalFieldCount} / 必須 {requiredFieldCount}
                    </div>
                  </div>

                  <div className="rounded-xl bg-neutral-50 p-4">
                    <div className="text-xs text-neutral-500">ロゴ設定</div>
                    <div className="mt-1 break-all text-neutral-900">
                      {tenantLogoPath || "未設定（/admin/logo）"}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
                <div className="text-sm font-semibold text-neutral-900">今回の保存内容</div>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li>・テンプレ入力内容</li>
                  <li>・施工内容の自由記述</li>
                  <li>・膜厚測定値</li>
                  <li>・添付画像</li>
                  <li>・証明書 / 履歴 / NFC準備状態</li>
                </ul>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
                <div className="text-sm font-semibold text-neutral-900">発行前確認</div>

                <button
                  type="submit"
                  disabled={!selected?.id}
                  className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
                >
                  この内容で発行する
                </button>

                {!selected?.id ? (
                  <div className="text-xs text-amber-700">
                    テンプレが未選択のため発行できません。先にテンプレを作成または選択してください。
                  </div>
                ) : (
                  <div className="text-xs text-neutral-500">
                    発行後は success 画面へ遷移し、証明書 public_id ベースで確認できます。
                  </div>
                )}
              </section>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}