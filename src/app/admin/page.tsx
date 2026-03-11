import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const quickActions = [
  { href: "/admin/certificates/new", label: "＋ 証明書を作成" },
  { href: "/admin/vehicles/new", label: "＋ 車両を登録" },
  { href: "/admin/nfc", label: "＋ NFCタグを確認" },
  { href: "/admin/vehicles", label: "＋ 車両一覧を見る" },
] as const;

const menus = [
  { href: "/admin", label: "ダッシュボード" },
  { href: "/admin/certificates", label: "証明書一覧" },
  { href: "/admin/vehicles", label: "車両管理" },
  { href: "/admin/nfc", label: "タグ管理" },
  { href: "/admin/billing", label: "請求管理" },
] as const;

function startOfMonthIso() {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  return d.toISOString();
}

async function getCount(
  query: PromiseLike<{ count: number | null; error?: unknown }> | any
): Promise<number> {
  const res = await query;
  if (res?.error) return 0;
  return Number(res?.count ?? 0);
}

export default async function AdminHomePage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let tenantId: string | null = null;

  if (user) {
    const { data: membership } = await supabase
      .from("tenant_memberships")
      .select("tenant_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    tenantId = membership?.tenant_id ?? null;
  }

  let vehicleCount = 0;
  let activeCertCount = 0;
  let voidCertCount = 0;
  let nfcCount = 0;
  let issuedThisMonthCount = 0;

  if (tenantId) {
    const monthStart = startOfMonthIso();

    const [
      vehiclesRes,
      activeCertsRes,
      voidCertsRes,
      nfcRes,
      monthlyIssuedRes,
    ] = await Promise.all([
      getCount(
        supabase
          .from("vehicles")
          .select("*", { count: "exact", head: true })
          .eq("tenant_id", tenantId)
      ),
      getCount(
        supabase
          .from("certificates")
          .select("*", { count: "exact", head: true })
          .eq("tenant_id", tenantId)
          .eq("status", "active")
      ),
      getCount(
        supabase
          .from("certificates")
          .select("*", { count: "exact", head: true })
          .eq("tenant_id", tenantId)
          .eq("status", "void")
      ),
      getCount(
        supabase
          .from("nfc_tags")
          .select("*", { count: "exact", head: true })
          .eq("tenant_id", tenantId)
      ),
      getCount(
        supabase
          .from("certificates")
          .select("*", { count: "exact", head: true })
          .eq("tenant_id", tenantId)
          .gte("created_at", monthStart)
      ),
    ]);

    vehicleCount = vehiclesRes;
    activeCertCount = activeCertsRes;
    voidCertCount = voidCertsRes;
    nfcCount = nfcRes;
    issuedThisMonthCount = monthlyIssuedRes;
  }

  return (
    <div className="p-6 space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">CARTRUST</div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">施工証明 / 車両履歴管理</h1>
        <p className="mt-2 text-sm text-neutral-600">
          CARTRUST CERT・CARTRUST TAG・CARTRUST RECORD を管理する管理画面です。
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {quickActions.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-neutral-50"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-neutral-500">VEHICLES</div>
          <div className="mt-2 text-3xl font-bold">{vehicleCount}</div>
          <p className="mt-2 text-sm text-neutral-600">登録済み車両数</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-neutral-500">ACTIVE CERT</div>
          <div className="mt-2 text-3xl font-bold">{activeCertCount}</div>
          <p className="mt-2 text-sm text-neutral-600">有効な証明書</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-neutral-500">VOID CERT</div>
          <div className="mt-2 text-3xl font-bold">{voidCertCount}</div>
          <p className="mt-2 text-sm text-neutral-600">無効化された証明書</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-neutral-500">NFC TAG</div>
          <div className="mt-2 text-3xl font-bold">{nfcCount}</div>
          <p className="mt-2 text-sm text-neutral-600">登録済みNFCタグ</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-neutral-500">THIS MONTH</div>
          <div className="mt-2 text-3xl font-bold">{issuedThisMonthCount}</div>
          <p className="mt-2 text-sm text-neutral-600">今月発行した証明書</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-neutral-500">CERT</div>
          <div className="mt-2 text-lg font-bold">CARTRUST CERT</div>
          <p className="mt-2 text-sm text-neutral-600">
            車両に紐づく施工証明を発行し、公開URLとPDFを管理します。
          </p>
          <Link href="/admin/certificates" className="mt-4 inline-block text-sm font-medium underline">
            証明書一覧へ
          </Link>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-neutral-500">RECORD</div>
          <div className="mt-2 text-lg font-bold">CARTRUST RECORD</div>
          <p className="mt-2 text-sm text-neutral-600">
            車両単位で履歴を持ち、証明書・タグ・顧客情報をつなぎます。
          </p>
          <Link href="/admin/vehicles" className="mt-4 inline-block text-sm font-medium underline">
            車両管理へ
          </Link>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-neutral-500">TAG</div>
          <div className="mt-2 text-lg font-bold">CARTRUST TAG</div>
          <p className="mt-2 text-sm text-neutral-600">
            NFCタグの台帳・状態・証明書/車両との紐付けを確認します。
          </p>
          <Link href="/admin/nfc" className="mt-4 inline-block text-sm font-medium underline">
            タグ管理へ
          </Link>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-neutral-500">BILLING</div>
          <div className="mt-2 text-lg font-bold">契約 / 請求</div>
          <p className="mt-2 text-sm text-neutral-600">
            プラン状態・契約状況・請求情報の確認はこちらから行います。
          </p>
          <Link href="/admin/billing" className="mt-4 inline-block text-sm font-medium underline">
            請求管理へ
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold">メニュー</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {menus.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border p-4 text-sm font-medium hover:bg-neutral-50"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold">今月の進行目安</h3>
          <ul className="mt-3 space-y-2 text-sm text-neutral-700">
            <li>・車両登録を先に行い、証明書は vehicle_id 起点で発行する</li>
            <li>・NFCタグは必要時のみ発行し、prepared → written → attached で管理する</li>
            <li>・公開側は /c/public_id で CARTRUST CERT として確認する</li>
          </ul>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold">優先アクション</h3>
          <ul className="mt-3 space-y-2 text-sm text-neutral-700">
            <li>1. 車両を登録</li>
            <li>2. 証明書を発行</li>
            <li>3. NFCタグを必要時に追加</li>
            <li>4. 公開証明ページを確認</li>
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border p-5 space-y-3">
        <div className="text-sm text-neutral-500">CARTRUST</div>
        <h2 className="text-xl font-semibold">CARTRUST 検索</h2>
        <p className="text-sm text-neutral-500">
          plate_display の部分一致、または plate_hash の完全一致で車両を検索します。
        </p>
        <div>
          <Link
            href="/admin/cartrust-search"
            className="inline-flex rounded-lg border px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            CARTRUST検索を開く
          </Link>
        </div>
      </section>
    </div>
  );
}