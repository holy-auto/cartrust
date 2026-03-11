import Link from "next/link";
import { headers } from "next/headers";
import { qrSvgDataUrl } from "@/lib/qr";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ pid?: string; notice?: string }>;
}) {
  const sp = await searchParams;
  const pid = (sp.pid ?? "").trim();
  const notice = (sp.notice ?? "").trim();

  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${proto}://${host}`;

  const publicPath = pid ? `/c/${pid}` : "";
  const publicUrl = pid ? `${baseUrl}${publicPath}` : "";
  const pdfPath = pid ? `/api/certificate/pdf?pid=${encodeURIComponent(pid)}` : "";
  const pdfUrl = pid ? `${baseUrl}${pdfPath}` : "";
  const qr = pid ? await qrSvgDataUrl(publicUrl) : "";

  return (
    <main className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-[0.22em] text-emerald-700">
              ISSUE COMPLETED
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900">施工証明書を発行しました</h1>
              <p className="mt-2 text-sm text-neutral-600">
                発行後の確認・共有・次の発行作業をこの画面から進められます。
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <Link
              className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              href="/admin/certificates/new"
            >
              続けて発行
            </Link>
            <Link
              className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              href="/admin/certificates"
            >
              一覧へ
            </Link>
          </div>
        </header>

        {notice === "image_partial" ? (
          <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
            証明書本体の発行は完了しましたが、一部画像の保存に失敗した可能性があります。管理詳細画面で添付枚数を確認してください。
          </section>
        ) : null}

        {pid ? (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">PUBLIC ID</div>
                <div className="mt-2 break-all font-mono text-sm text-neutral-900">{pid}</div>
                <div className="mt-1 text-xs text-neutral-500">公開証明書識別子</div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">PUBLIC PAGE</div>
                <div className="mt-2 text-sm font-medium text-neutral-900">閲覧URL発行済み</div>
                <div className="mt-1 text-xs text-neutral-500">お客様向け公開ページへ遷移可能</div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">PDF</div>
                <div className="mt-2 text-sm font-medium text-neutral-900">即時表示可能</div>
                <div className="mt-1 text-xs text-neutral-500">active 状態の証明書のみ表示</div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
                  <div>
                    <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">NEXT ACTION</div>
                    <div className="mt-1 text-lg font-semibold text-neutral-900">発行後アクション</div>
                    <div className="mt-1 text-sm text-neutral-600">
                      公開確認、PDF確認、次の発行作業へそのまま進めます。
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <Link
                      href={publicPath}
                      target="_blank"
                      className="rounded-2xl border border-neutral-300 bg-white p-4 hover:bg-neutral-50"
                    >
                      <div className="text-sm font-semibold text-neutral-900">公開ページを開く</div>
                      <div className="mt-1 text-xs text-neutral-500">/c/{pid}</div>
                    </Link>

                    <Link
                      href={pdfPath}
                      target="_blank"
                      className="rounded-2xl border border-neutral-300 bg-white p-4 hover:bg-neutral-50"
                    >
                      <div className="text-sm font-semibold text-neutral-900">PDFを開く</div>
                      <div className="mt-1 text-xs text-neutral-500">/api/certificate/pdf?pid={pid}</div>
                    </Link>

                    <Link
                      href={`/admin/certificates/${encodeURIComponent(pid)}`}
                      className="rounded-2xl border border-neutral-300 bg-white p-4 hover:bg-neutral-50"
                    >
                      <div className="text-sm font-semibold text-neutral-900">管理詳細を開く</div>
                      <div className="mt-1 text-xs text-neutral-500">添付画像も確認可能</div>
                    </Link>

                    <Link
                      href="/admin/certificates/new"
                      className="rounded-2xl border border-neutral-300 bg-white p-4 hover:bg-neutral-50"
                    >
                      <div className="text-sm font-semibold text-neutral-900">続けて発行する</div>
                      <div className="mt-1 text-xs text-neutral-500">新しい証明書作成画面へ戻る</div>
                    </Link>
                  </div>
                </section>

                <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
                  <div>
                    <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">SHARE DATA</div>
                    <div className="mt-1 text-lg font-semibold text-neutral-900">共有情報</div>
                    <div className="mt-1 text-sm text-neutral-600">
                      店舗確認用に public_id / 公開URL / PDF URL を表示します。
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-xl bg-neutral-50 p-4">
                      <div className="text-xs font-semibold tracking-[0.14em] text-neutral-500">PUBLIC ID</div>
                      <div className="mt-2 break-all font-mono text-sm text-neutral-900">{pid}</div>
                    </div>

                    <div className="rounded-xl bg-neutral-50 p-4">
                      <div className="text-xs font-semibold tracking-[0.14em] text-neutral-500">PUBLIC URL</div>
                      <div className="mt-2 break-all text-sm text-neutral-900">{publicUrl}</div>
                    </div>

                    <div className="rounded-xl bg-neutral-50 p-4">
                      <div className="text-xs font-semibold tracking-[0.14em] text-neutral-500">PDF URL</div>
                      <div className="mt-2 break-all text-sm text-neutral-900">{pdfUrl}</div>
                    </div>
                  </div>
                </section>
              </div>

              <aside className="space-y-4 xl:sticky xl:top-6 self-start">
                <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
                  <div>
                    <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">QR</div>
                    <div className="mt-1 text-lg font-semibold text-neutral-900">公開ページ用QR</div>
                  </div>

                  <div className="flex flex-col items-center rounded-2xl bg-neutral-50 p-4">
                    <img src={qr} alt="QR" className="h-48 w-48 rounded-xl border border-neutral-200 bg-white p-2" />
                    <div className="mt-3 text-xs text-neutral-500">読み取りで公開ページへ即移動</div>
                  </div>
                </section>
              </aside>
            </section>
          </>
        ) : (
          <section className="rounded-2xl border border-red-300 bg-red-50 p-5 shadow-sm space-y-4">
            <div>
              <div className="text-lg font-semibold text-red-700">発行完了情報を取得できませんでした</div>
              <div className="mt-1 text-sm text-red-600">
                `pid` が見つからないため、公開URLやPDF導線を表示できません。
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                href="/admin/certificates/new"
              >
                新規発行へ戻る
              </Link>
              <Link
                className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                href="/admin/certificates"
              >
                一覧へ
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}