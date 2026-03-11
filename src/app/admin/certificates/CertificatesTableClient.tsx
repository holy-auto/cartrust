"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminBillingStatus } from "@/lib/billing/useAdminBillingStatus";
import { canUseFeature } from "@/lib/billing/planFeatures";
import { buildBillingDenyUrl } from "@/lib/billing/billingRedirect";

type Row = {
  public_id: string;
  status: string;
  customer_name: string;
  created_at: string;
};

export default function CertificatesTableClient({ rows, q }: { rows: Row[]; q: string }) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [voiding, setVoiding] = useState<Record<string, boolean>>({});

  const bs = useAdminBillingStatus();
  const isActive = bs.data?.is_active ?? true;
  const planTier = bs.data?.plan_tier ?? "pro";
  const denyReason = !isActive ? "inactive" : "plan";

  const returnTo = useMemo(
    () => `/admin/certificates${q ? `?q=${encodeURIComponent(q)}` : ""}`,
    [q]
  );

  const bill = (action: string) =>
    buildBillingDenyUrl({ reason: denyReason, action, returnTo });

  const activeIds = useMemo(
    () =>
      rows
        .filter((r) => String(r.status ?? "").toLowerCase() !== "void")
        .map((r) => r.public_id),
    [rows]
  );

  const selectedIds = useMemo(
    () => activeIds.filter((id) => selected[id]),
    [activeIds, selected]
  );

  const allChecked = activeIds.length > 0 && selectedIds.length === activeIds.length;
  const someChecked = selectedIds.length > 0 && selectedIds.length < activeIds.length;

  const toggleAll = (on: boolean) => {
    const next: Record<string, boolean> = {};
    if (on) {
      for (const id of activeIds) next[id] = true;
    }
    setSelected(next);
  };

  const toggleOne = (id: string, on: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: on }));
  };

  const exportUrl = useMemo(() => {
    const ids = selectedIds.map(encodeURIComponent).join(",");
    return `/admin/certificates/export-selected?ids=${ids}`;
  }, [selectedIds]);

  const pdfZipUrl = useMemo(() => {
    const ids = selectedIds.map(encodeURIComponent).join(",");
    return `/admin/certificates/pdf-selected?ids=${ids}`;
  }, [selectedIds]);

  const canCsvSearch = isActive && canUseFeature(planTier, "export_search_csv");
  const canCsvSelected = isActive && canUseFeature(planTier, "export_selected_csv");
  const canPdfZip = isActive && canUseFeature(planTier, "pdf_zip");
  const canCsvOne = isActive && canUseFeature(planTier, "export_one_csv");
  const canPdfOne = isActive && canUseFeature(planTier, "pdf_one");

  const btnCls =
    (enabled: boolean) =>
      "rounded-xl border px-3 py-2 text-sm font-medium " +
      (enabled
        ? "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100"
        : "border-neutral-200 bg-neutral-100 text-neutral-400");

  const textLinkCls =
    (enabled: boolean) =>
      "text-sm underline " + (enabled ? "text-neutral-700" : "text-neutral-400");

  const hrefOrBill = (enabled: boolean, href: string, action: string) =>
    enabled ? href : bill(action);

  async function handleVoid(publicId: string) {
    const ok = window.confirm(
      `証明書 ${publicId} を削除しますか？\n内部的には void（無効化）として処理されます。`
    );
    if (!ok) return;

    setVoiding((prev) => ({ ...prev, [publicId]: true }));

    try {
      const res = await fetch("/api/certificates/void", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id: publicId }),
      });

      const j = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(j?.error || `HTTP ${res.status}`);
      }

      window.location.reload();
    } catch (e: any) {
      alert(String(e?.message || e));
      setVoiding((prev) => ({ ...prev, [publicId]: false }));
    }
  }

  return (
    <div className="space-y-4">
      {bs.data && !bs.data.is_active ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          お支払い停止中のため、出力（CSV / PDF）はご利用いただけません。{" "}
          <Link className="underline" href="/admin/billing">
            課金ページへ
          </Link>
        </div>
      ) : null}

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm text-neutral-600">
            選択: <span className="font-mono font-semibold">{selectedIds.length}</span> 件
          </div>

          <div className="flex gap-3 items-center flex-wrap">
            <button
              type="button"
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => toggleAll(true)}
              disabled={activeIds.length === 0}
            >
              全選択
            </button>

            <button
              type="button"
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => toggleAll(false)}
              disabled={activeIds.length === 0}
            >
              全解除
            </button>

            <Link
              className={btnCls(selectedIds.length > 0 && canCsvSelected)}
              href={hrefOrBill(
                selectedIds.length > 0 && canCsvSelected,
                exportUrl,
                "export_selected_csv"
              )}
              aria-disabled={!(selectedIds.length > 0 && canCsvSelected)}
              title={
                !(selectedIds.length > 0 && canCsvSelected)
                  ? "利用不可 → 課金ページへ"
                  : ""
              }
            >
              選択CSV
            </Link>

            <Link
              className={btnCls(selectedIds.length > 0 && canPdfZip)}
              href={hrefOrBill(
                selectedIds.length > 0 && canPdfZip,
                pdfZipUrl,
                "pdf_zip"
              )}
              aria-disabled={!(selectedIds.length > 0 && canPdfZip)}
              title={
                !(selectedIds.length > 0 && canPdfZip)
                  ? "利用不可 → 課金ページへ"
                  : ""
              }
            >
              選択PDF（ZIP）
            </Link>

            <Link
              className={textLinkCls(canCsvSearch)}
              href={hrefOrBill(
                canCsvSearch,
                `/admin/certificates/export?q=${encodeURIComponent(q)}`,
                "export_search_csv"
              )}
              aria-disabled={!canCsvSearch}
              title={!canCsvSearch ? "利用不可 → 課金ページへ" : ""}
            >
              CSV（検索結果）
            </Link>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="p-3 text-left w-10">
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={(el) => {
                    if (el) el.indeterminate = someChecked;
                  }}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </th>
              <th className="p-3 text-left whitespace-nowrap">作成日時</th>
              <th className="p-3 text-left whitespace-nowrap">public_id</th>
              <th className="p-3 text-left whitespace-nowrap">お客様名</th>
              <th className="p-3 text-left whitespace-nowrap">status</th>
              <th className="p-3 text-left whitespace-nowrap">操作</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => {
              const publicUrl = `/c/${r.public_id}`;
              const detailUrl = `/admin/certificates/${encodeURIComponent(r.public_id)}`;
              const isVoid = String(r.status ?? "").toLowerCase() === "void";
              const checked = !isVoid && !!selected[r.public_id];
              const busy = !!voiding[r.public_id];

              return (
                <tr key={r.public_id} className="border-t border-neutral-200">
                  <td className="p-3 align-top">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={isVoid}
                      title={isVoid ? "void は選択対象外です" : ""}
                      className={isVoid ? "cursor-not-allowed opacity-50" : ""}
                      onChange={(e) => toggleOne(r.public_id, e.target.checked)}
                    />
                  </td>

                  <td className="p-3 whitespace-nowrap align-top">
                    {new Date(r.created_at).toLocaleString("ja-JP")}
                  </td>

                  <td className="p-3 align-top">
                    <Link
                      className="font-mono underline text-neutral-700"
                      href={detailUrl}
                    >
                      {r.public_id}
                    </Link>
                  </td>

                  <td className="p-3 align-top">{r.customer_name || "-"}</td>

                  <td className="p-3 align-top">
                    <span
                      className={
                        isVoid
                          ? "inline-flex rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-500"
                          : "inline-flex rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700"
                      }
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className="p-3 align-top">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link className="text-sm underline text-neutral-700" href={detailUrl}>
                        詳細
                      </Link>

                      <Link
                        className={!isVoid ? "text-sm underline text-neutral-700" : "text-sm text-neutral-400"}
                        href={detailUrl}
                      >
                        管理表示
                      </Link>

                      {!isVoid ? (
                        <>
                          <Link
                            className="text-sm underline text-neutral-700"
                            href={publicUrl}
                            target="_blank"
                          >
                            公開ページ
                          </Link>

                          <Link
                            className={textLinkCls(canCsvOne)}
                            href={hrefOrBill(
                              canCsvOne,
                              `/admin/certificates/export-one?pid=${encodeURIComponent(r.public_id)}`,
                              "export_one_csv"
                            )}
                            aria-disabled={!canCsvOne}
                            title={!canCsvOne ? "利用不可 → 課金ページへ" : ""}
                          >
                            CSV(1件)
                          </Link>

                          <Link
                            className={textLinkCls(canPdfOne)}
                            href={hrefOrBill(
                              canPdfOne,
                              `/admin/certificates/pdf-one?pid=${encodeURIComponent(r.public_id)}`,
                              "pdf_one"
                            )}
                            aria-disabled={!canPdfOne}
                            title={!canPdfOne ? "利用不可 → 課金ページへ" : ""}
                          >
                            PDF(1件)
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleVoid(r.public_id)}
                            disabled={busy}
                            className="rounded-lg border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {busy ? "処理中..." : "削除"}
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-neutral-400">
                          無効化済みのため公開 / 出力停止
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 ? (
              <tr>
                <td className="p-8 text-neutral-500" colSpan={6}>
                  該当なし
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-neutral-500">
        ※ 選択PDFは ZIP でまとめて出力されます（上限 50 件）。
      </p>

    </div>
  );
}
