import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/settings");

  const { data: membership } = await supabase
    .from("tenant_memberships")
    .select("tenant_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership?.tenant_id) {
    return <main className="p-6 text-sm text-neutral-600">tenant が見つかりません。</main>;
  }
  const tenantId = membership.tenant_id as string;

  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("id,name,contact_email,contact_phone,address,plan_tier,logo_asset_path,created_at")
    .eq("id", tenantId)
    .single();

  if (error || !tenant) {
    return <main className="p-6 text-sm text-red-700">テナント情報の取得に失敗しました。</main>;
  }

  const name = (tenant.name as string | null) ?? "";
  const contactEmail = (tenant.contact_email as string | null) ?? null;
  const contactPhone = (tenant.contact_phone as string | null) ?? null;
  const address = (tenant.address as string | null) ?? null;
  const planTier = (tenant.plan_tier as string | null) ?? "—";
  const hasLogo = !!(tenant.logo_asset_path as string | null);
  const createdAt = (tenant.created_at as string | null);

  return (
    <main className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex rounded-full border border-neutral-300 bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.22em] text-neutral-600">
              SETTINGS
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900">テナント設定</h1>
              <p className="mt-2 text-sm text-neutral-600">
                店舗情報の編集・プラン確認を行います。
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
          >
            ダッシュボード
          </Link>
        </header>

        {/* Plan info */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">PLAN</div>
            <div className="mt-1 text-base font-semibold text-neutral-900">プラン情報</div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <div className="rounded-xl bg-neutral-50 p-4">
              <div className="text-xs text-neutral-500">現在のプラン</div>
              <div className="mt-1 font-semibold text-neutral-900 uppercase">{planTier}</div>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4">
              <div className="text-xs text-neutral-500">ロゴ設定</div>
              <div className={`mt-1 font-semibold ${hasLogo ? "text-emerald-700" : "text-amber-600"}`}>
                {hasLogo ? "設定済み" : "未設定"}
              </div>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4">
              <div className="text-xs text-neutral-500">テナントID</div>
              <div className="mt-1 font-mono text-[11px] text-neutral-500 break-all">{tenantId.slice(0, 16)}…</div>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Link
              href="/admin/billing"
              className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              プラン・請求管理
            </Link>
            <Link
              href="/admin/logo"
              className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              ロゴを設定
            </Link>
          </div>
        </section>

        {/* Tenant info form */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">SHOP INFO</div>
            <div className="mt-1 text-base font-semibold text-neutral-900">店舗情報</div>
          </div>

          <SettingsForm
            name={name}
            contactEmail={contactEmail}
            contactPhone={contactPhone}
            address={address}
          />
        </section>

        {/* Danger zone */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">ACCOUNT</div>
            <div className="mt-1 text-base font-semibold text-neutral-900">アカウント情報</div>
          </div>
          <div className="space-y-2 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">ログイン中:</span>
              <span className="font-medium text-neutral-900">{user.email ?? user.id}</span>
            </div>
            {createdAt && (
              <div className="flex items-center gap-2">
                <span className="text-neutral-400">テナント作成日:</span>
                <span>{new Date(createdAt).toLocaleDateString("ja-JP")}</span>
              </div>
            )}
          </div>
          <div className="mt-4">
            <Link
              href="/api/auth/signout"
              className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              ログアウト
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
