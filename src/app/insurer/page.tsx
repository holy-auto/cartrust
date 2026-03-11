import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type DashboardCertRow = {
  public_id: string | null;
  status: string | null;
  customer_name: string | null;
  vehicle_info_json: unknown;
  created_at: string | null;
  tenant_id: string | null;
};

function asObj(v: unknown): Record<string, any> {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  return v as Record<string, any>;
}

function asText(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function fmt(v?: string | null): string {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString("ja-JP");
}

function pickVehicleLabel(info: Record<string, any>): string {
  const maker = asText(info.maker || info.brand || info.manufacturer);
  const model = asText(info.model || info.car_model || info.vehicle_model);
  return [maker, model].filter(Boolean).join(" ") || "-";
}

function pickPlate(info: Record<string, any>): string {
  return asText(info.plate_display || info.plate || info.plate_no || info.number) || "-";
}

function getStatusMeta(status?: string | null) {
  const s = String(status ?? "").toLowerCase();

  if (s === "active") {
    return {
      label: "active",
      className: "inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700",
    };
  }

  if (s === "void") {
    return {
      label: "void",
      className: "inline-flex rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700",
    };
  }

  if (s === "expired") {
    return {
      label: "expired",
      className: "inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700",
    };
  }

  return {
    label: status || "-",
    className: "inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-semibold text-neutral-700",
  };
}

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;

  if (!user) {
    redirect("/insurer/login?next=/insurer");
  }

  async function signOut() {
    "use server";
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect("/insurer/login");
  }

  const email = user.email ?? "";

  const { data: insurerUserRow } = await admin
    .from("insurer_users")
    .select("insurer_id,is_active")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  const insurerId = (insurerUserRow?.insurer_id as string | null) ?? null;
  const insurerUserEnabled = insurerUserRow?.is_active !== false;

  if (!insurerId || !insurerUserEnabled) {
    return (
      <main className="min-h-screen bg-neutral-50 p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="rounded-3xl border border-amber-300 bg-white p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-semibold tracking-[0.22em] text-amber-700">
              INSURER ACCOUNT
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900">
              保険会社アカウント未紐付け
            </h1>

            <p className="mt-3 text-sm leading-7 text-neutral-600">
              現在のログインユーザーには有効な保険会社アカウント紐付けがありません。
              <br />
              管理者側で <span className="font-mono">insurer_users</span> への紐付けを確認してください。
            </p>

            <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
              <div className="text-xs font-semibold tracking-[0.16em] text-neutral-500">LOGIN USER</div>
              <div className="mt-2 break-all font-medium text-neutral-900">{email || "-"}</div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/insurer/login"
                className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                ログイン画面へ
              </Link>

              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  ログアウト
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const { data: insurerRow } = await admin
    .from("insurers")
    .select("id,name")
    .eq("id", insurerId)
    .limit(1)
    .maybeSingle();

  const insurerName = (insurerRow?.name as string | null) ?? "保険会社";

  const { data: accessRowsRaw } = await admin
    .from("insurer_tenant_accesses")
    .select("tenant_id")
    .eq("insurer_id", insurerId)
    .eq("is_enabled", true);

  const tenantIds = Array.from(
    new Set(
      ((accessRowsRaw ?? []) as Array<{ tenant_id?: string | null }>)
        .map((x) => x.tenant_id ?? "")
        .filter(Boolean)
    )
  );

  const shopCount = tenantIds.length;

  const tenantNameMap = new Map<string, string>();

  if (tenantIds.length > 0) {
    const { data: tenantRows } = await admin
      .from("tenants")
      .select("id,name")
      .in("id", tenantIds);

    for (const row of (tenantRows ?? []) as Array<{ id?: string | null; name?: string | null }>) {
      if (row.id) tenantNameMap.set(row.id, row.name ?? "-");
    }
  }

  let certificateCount = 0;
  let activeCount = 0;
  let voidCount = 0;
  let recentRows: DashboardCertRow[] = [];

  if (tenantIds.length > 0) {
    const [totalRes, activeRes, voidRes, recentRes] = await Promise.all([
      admin
        .from("certificates")
        .select("id", { head: true, count: "exact" })
        .in("tenant_id", tenantIds),

      admin
        .from("certificates")
        .select("id", { head: true, count: "exact" })
        .in("tenant_id", tenantIds)
        .eq("status", "active"),

      admin
        .from("certificates")
        .select("id", { head: true, count: "exact" })
        .in("tenant_id", tenantIds)
        .eq("status", "void"),

      admin
        .from("certificates")
        .select("public_id,status,customer_name,vehicle_info_json,created_at,tenant_id")
        .in("tenant_id", tenantIds)
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    certificateCount = totalRes.count ?? 0;
    activeCount = activeRes.count ?? 0;
    voidCount = voidRes.count ?? 0;
    recentRows = ((recentRes.data ?? []) as DashboardCertRow[]);
  }

  return (
    <main className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex rounded-full border border-neutral-300 bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.22em] text-neutral-600">
              INSURER DASHBOARD
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                {insurerName}向け管理ダッシュボード
              </h1>
              <p className="mt-2 text-sm text-neutral-600">
                保険会社ポータルの入口です。紐付け済み施工店に関連する証明書をここから確認できます。
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
              <span className="rounded-full border border-neutral-200 bg-white px-3 py-1">
                ログイン: {email || "-"}
              </span>
              <span className="rounded-full border border-neutral-200 bg-white px-3 py-1">
                閲覧可能施工店: {shopCount}社
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/insurer/search"
              className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              証明書検索へ
            </Link>

            <Link
              href="/insurer/access-list"
              className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              閲覧可能施工店へ
            </Link>

            <form action={signOut}>
              <button
                type="submit"
                className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                ログアウト
              </button>
            </form>
          </div>
        </header>

        {tenantIds.length === 0 ? (
          <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
            この保険会社アカウントには、現在閲覧可能な施工店が紐付いていません。
            <br />
            <span className="font-mono">insurer_tenant_accesses</span> の設定を確認してください。
          </section>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">SHOPS</div>
            <div className="mt-2 text-3xl font-bold text-neutral-900">{shopCount}</div>
            <div className="mt-1 text-xs text-neutral-500">閲覧可能な施工店数</div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">CERTIFICATES</div>
            <div className="mt-2 text-3xl font-bold text-neutral-900">{certificateCount}</div>
            <div className="mt-1 text-xs text-neutral-500">閲覧可能な証明書総数</div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold tracking-[0.18em] text-emerald-700">ACTIVE</div>
            <div className="mt-2 text-3xl font-bold text-emerald-700">{activeCount}</div>
            <div className="mt-1 text-xs text-neutral-500">有効な施工証明書</div>
          </div>

          <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold tracking-[0.18em] text-red-700">VOID</div>
            <div className="mt-2 text-3xl font-bold text-red-700">{voidCount}</div>
            <div className="mt-1 text-xs text-neutral-500">無効化済み証明書</div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">RECENT CERTIFICATES</div>
                <div className="mt-1 text-lg font-semibold text-neutral-900">最近の証明書</div>
              </div>

              <Link
                href="/insurer/search"
                className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                検索画面を開く
              </Link>
            </div>

            <div className="mt-4 overflow-x-auto rounded-2xl border border-neutral-200">
              <table className="min-w-full text-sm">
                <thead className="bg-neutral-50">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-medium text-neutral-600">作成日時</th>
                    <th className="px-4 py-3 font-medium text-neutral-600">public_id</th>
                    <th className="px-4 py-3 font-medium text-neutral-600">状態</th>
                    <th className="px-4 py-3 font-medium text-neutral-600">顧客名</th>
                    <th className="px-4 py-3 font-medium text-neutral-600">車両</th>
                    <th className="px-4 py-3 font-medium text-neutral-600">ナンバー</th>
                    <th className="px-4 py-3 font-medium text-neutral-600">施工店</th>
                    <th className="px-4 py-3 font-medium text-neutral-600">操作</th>
                  </tr>
                </thead>

                <tbody>
                  {recentRows.length > 0 ? (
                    recentRows.map((row) => {
                      const info = asObj(row.vehicle_info_json);
                      const statusMeta = getStatusMeta(row.status);
                      const publicId = row.public_id ?? "-";
                      const detailHref = row.public_id ? `/insurer/c/${row.public_id}` : "#";
                      const publicHref = row.public_id ? `/c/${row.public_id}` : "#";

                      return (
                        <tr key={`${row.public_id ?? "row"}-${row.created_at ?? ""}`} className="border-t border-neutral-200">
                          <td className="px-4 py-3 whitespace-nowrap text-neutral-700">{fmt(row.created_at)}</td>
                          <td className="px-4 py-3 font-mono text-neutral-900">{publicId}</td>
                          <td className="px-4 py-3">
                            <span className={statusMeta.className}>{statusMeta.label}</span>
                          </td>
                          <td className="px-4 py-3 text-neutral-900">{row.customer_name || "-"}</td>
                          <td className="px-4 py-3 text-neutral-700">{pickVehicleLabel(info)}</td>
                          <td className="px-4 py-3 text-neutral-700">{pickPlate(info)}</td>
                          <td className="px-4 py-3 text-neutral-700">
                            {row.tenant_id ? tenantNameMap.get(row.tenant_id) ?? "-" : "-"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-3">
                              {row.public_id ? (
                                <>
                                  <Link
                                    href={detailHref}
                                    className="text-sm font-medium text-neutral-900 underline"
                                  >
                                    詳細で開く
                                  </Link>
                                  <Link
                                    href={publicHref}
                                    target="_blank"
                                    className="text-sm font-medium text-neutral-600 underline"
                                  >
                                    公開ページ
                                  </Link>
                                </>
                              ) : (
                                <span className="text-xs text-neutral-400">操作不可</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-neutral-500">
                        表示できる証明書がまだありません。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">ACCOUNT</div>
              <div className="mt-2 text-lg font-semibold text-neutral-900">{insurerName}</div>
              <div className="mt-2 break-all text-sm text-neutral-600">{email || "-"}</div>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-3">
              <div>
                <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">NEXT ACTION</div>
                <div className="mt-1 text-lg font-semibold text-neutral-900">次に使う導線</div>
              </div>

              <div className="grid gap-3">
                <Link
                  href="/insurer/search"
                  className="rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
                >
                  証明書検索
                </Link>

                <Link
                  href="/insurer/access-list"
                  className="rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
                >
                  閲覧可能施工店一覧
                </Link>

                <Link
                  href="/insurer/users"
                  className="rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
                >
                  保険会社ユーザー一覧
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-neutral-900">補足</div>
              <div className="mt-2 text-sm leading-7 text-neutral-600">
                この画面の数値と一覧は、ログイン中ユーザーに紐付いた保険会社に対して
                <span className="font-mono"> insurer_tenant_accesses </span>
                で閲覧許可された施工店のみを対象に集計しています。
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

