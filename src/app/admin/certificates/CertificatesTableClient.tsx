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

  const bs = useAdminBillingStatus();
  const isActive = bs.data?.is_active ?? true; // 取得失敗時は従来どおり（APIが最後に止める）
  const planTier = bs.data?.plan_tier ?? "pro";
  const denyReason = !isActive ? "inactive" : "plan";

  const returnTo = useMemo(() => `/admin/certificates${q ? `?q=${encodeURIComponent(q)}` : ""}`, [q]);
  const bill = (action: string) => buildBillingDenyUrl({ reason: denyReason, action, returnTo });

  const allIds = useMemo(() => rows.map((r) => r.public_id), [rows]);
  const selectedIds = useMemo(() => allIds.filter((id) => selected[id]), [allIds, selected]);

  const allChecked = allIds.length > 0 && selectedIds.length === allIds.length;
  const someChecked = selectedIds.length > 0 && selectedIds.length < allIds.length;

  const toggleAll = (on: boolean) => {
    const next: Record<string, boolean> = {};
    if (on) for (const id of allIds) next[id] = true;
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

  const btnCls = (enabled: boolean) => "border rounded px-3 py-2 text-sm " + (enabled ? "" : "opacity-50");
  const linkCls = (enabled: boolean) => "underline " + (enabled ? "" : "opacity-50");

  const hrefOrBill = (enabled: boolean, href: string, action: string) => (enabled ? href : bill(action));

  return (
    <div className="space-y-3">
      {bs.data && !bs.data.is_active ? (
        <div className="border rounded p-3 text-sm bg-amber-50 text-amber-900">
          お支払い停止中のため、出力（CSV/PDF）はご利用いただけません。{" "}
          <Link className="underline" href="/admin/billing">
            課金ページへ
          </Link>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm text-gray-500">
          選択: <span className="font-mono">{selectedIds.length}</span> 件
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          <button type="button" className="border rounded px-3 py-2 text-sm" onClick={() => toggleAll(true)} disabled={allIds.length === 0}>
            全選択
          </button>
          <button type="button" className="border rounded px-3 py-2 text-sm" onClick={() => toggleAll(false)} disabled={allIds.length === 0}>
            全解除
          </button>

          <Link
            className={btnCls(selectedIds.length > 0 && canCsvSelected)}
            href={hrefOrBill(selectedIds.length > 0 && canCsvSelected, exportUrl, "export_selected_csv")}
            aria-disabled={!(selectedIds.length > 0 && canCsvSelected)}
            title={!(selectedIds.length > 0 && canCsvSelected) ? "利用不可 → 課金ページへ" : ""}
          >
            選択CSV
          </Link>

          <Link
            className={btnCls(selectedIds.length > 0 && canPdfZip)}
            href={hrefOrBill(selectedIds.length > 0 && canPdfZip, pdfZipUrl, "pdf_zip")}
            aria-disabled={!(selectedIds.length > 0 && canPdfZip)}
            title={!(selectedIds.length > 0 && canPdfZip) ? "利用不可 → 課金ページへ" : ""}
          >
            選択PDF（ZIP）
          </Link>

          <Link
            className={linkCls(canCsvSearch)}
            href={hrefOrBill(canCsvSearch, `/admin/certificates/export?q=${encodeURIComponent(q)}`, "export_search_csv")}
            aria-disabled={!canCsvSearch}
            title={!canCsvSearch ? "利用不可 → 課金ページへ" : ""}
          >
            CSV（検索結果）
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
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
              <th className="text-left p-3">作成日時</th>
              <th className="text-left p-3">public_id</th>
              <th className="text-left p-3">お客様名</th>
              <th className="text-left p-3">status</th>
              <th className="text-left p-3">操作</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => {
              const url = `/c/${r.public_id}`;
              const isVoid = r.status === "void";
              const checked = !!selected[r.public_id];

              return (
                <tr key={r.public_id} className="border-t">
                  <td className="p-3">
                    <input type="checkbox" checked={checked} onChange={(e) => toggleOne(r.public_id, e.target.checked)} />
                  </td>
                  <td className="p-3 whitespace-nowrap">{new Date(r.created_at).toLocaleString("ja-JP")}</td>
                  <td className="p-3 font-mono">{r.public_id}</td>
                  <td className="p-3">{r.customer_name}</td>
                  <td className="p-3">
                    <span className={isVoid ? "text-gray-400" : ""}>{r.status}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-3 items-center flex-wrap">
                      <Link className="underline" href={url} target="_blank">
                        公開ページ
                      </Link>
                      <Link
                        className={linkCls(canCsvOne)}
                        href={hrefOrBill(canCsvOne, `/admin/certificates/export-one?pid=${encodeURIComponent(r.public_id)}`, "export_one_csv")}
                        aria-disabled={!canCsvOne}
                        title={!canCsvOne ? "利用不可 → 課金ページへ" : ""}
                      >
                        CSV(1件)
                      </Link>
                      <Link
                        className={linkCls(canPdfOne)}
                        href={hrefOrBill(canPdfOne, `/admin/certificates/pdf-one?pid=${encodeURIComponent(r.public_id)}`, "pdf_one")}
                        aria-disabled={!canPdfOne}
                        title={!canPdfOne ? "利用不可 → 課金ページへ" : ""}
                      >
                        PDF(1件)
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td className="p-6 text-gray-500" colSpan={6}>
                  該当なし
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">※ 選択PDFはZIPでまとめて落ちます（上限50件）。</p>
      <p className="text-xs text-gray-400">
        ※ プラン制限の調整は <span className="font-mono">src/lib/billing/planFeatures.ts</span> で行います。
      </p>
    </div>
  );
}
