"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CertificateStatusBadge } from "@/components/StatusBadge";
import { formatDateTime } from "@/lib/format";
import InsurerDashboardCharts from "./InsurerDashboardCharts";
import type { InsurerDashboardStats } from "@/types/insurer";

export default function InsurerDashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const [ready, setReady] = useState(false);
  const [stats, setStats] = useState<InsurerDashboardStats | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        window.location.href = "/insurer/login";
        return;
      }
      setReady(true);
      // ダッシュボードデータ取得
      try {
        const res = await fetch("/api/insurer/dashboard", { cache: "no-store" });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error ?? "dashboard_failed");
        }
        const data = await res.json();
        setStats(data);
      } catch (e: any) {
        setErr(e?.message ?? "dashboard_failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

  const onLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/insurer/login";
  };

  if (!ready) return null;

  return (
    <main className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex rounded-full border border-neutral-300 bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.22em] text-neutral-600">
              INSURER PORTAL
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                ダッシュボード
              </h1>
              <p className="mt-2 text-sm text-neutral-600">
                保険会社ポータル — 閲覧状況・アクティビティの概要
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <Link
              href="/insurer/search"
              className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              証明書検索
            </Link>
            <button
              onClick={onLogout}
              className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              ログアウト
            </button>
          </div>
        </header>

        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}

        {loading && (
          <div className="text-center py-12 text-neutral-500">読み込み中...</div>
        )}

        {/* KPI Cards */}
        {stats && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">TOTAL VIEWS</div>
                <div className="mt-2 text-3xl font-bold text-[#bf5af2]">{stats.total_views.toLocaleString()}</div>
                <div className="mt-1 text-xs text-neutral-500">累計閲覧数</div>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">UNIQUE CERTS</div>
                <div className="mt-2 text-3xl font-bold text-[#0071e3]">{stats.unique_certs.toLocaleString()}</div>
                <div className="mt-1 text-xs text-neutral-500">閲覧済み証明書数</div>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">THIS MONTH</div>
                <div className="mt-2 text-3xl font-bold text-[#30d158]">{stats.month_actions.toLocaleString()}</div>
                <div className="mt-1 text-xs text-neutral-500">今月のアクション数</div>
              </div>
            </div>

            {/* Charts */}
            <InsurerDashboardCharts
              recentActivity={stats.recent_activity}
              actionBreakdown={stats.action_breakdown}
            />

            {/* Recent Certs */}
            {stats.recent_certs.length > 0 && (
              <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="mb-4">
                  <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">RECENT</div>
                  <div className="mt-1 text-base font-semibold text-neutral-900">最近閲覧した証明書</div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-neutral-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="p-3 text-left font-semibold text-neutral-600">証明書 ID</th>
                        <th className="p-3 text-left font-semibold text-neutral-600">顧客名</th>
                        <th className="p-3 text-left font-semibold text-neutral-600">車両</th>
                        <th className="p-3 text-left font-semibold text-neutral-600">ステータス</th>
                        <th className="p-3 text-left font-semibold text-neutral-600">閲覧日時</th>
                        <th className="p-3 text-left font-semibold text-neutral-600">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent_certs.map((r) => (
                        <tr key={r.public_id} className="border-t hover:bg-neutral-50">
                          <td className="p-3 font-mono text-xs text-neutral-700">{r.public_id}</td>
                          <td className="p-3 font-medium text-neutral-900">{r.customer_name}</td>
                          <td className="p-3 text-neutral-600">
                            {[r.vehicle_info_json?.model, r.vehicle_info_json?.plate ?? r.vehicle_info_json?.plate_display].filter(Boolean).join(" / ") || "-"}
                          </td>
                          <td className="p-3">
                            <CertificateStatusBadge status={r.status} />
                          </td>
                          <td className="p-3 whitespace-nowrap text-neutral-600">
                            {formatDateTime(r.viewed_at)}
                          </td>
                          <td className="p-3">
                            <a
                              href={`/insurer/c/${encodeURIComponent(r.public_id)}`}
                              className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                            >
                              詳細
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}

        {/* Quick Actions */}
        <div>
          <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500 mb-3">QUICK ACTIONS</div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/insurer/search"
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm flex items-center gap-4 hover:bg-neutral-50 transition-colors group"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-[#bf5af2]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </span>
              <div>
                <div className="text-sm font-semibold text-neutral-900 group-hover:text-[#bf5af2] transition-colors">証明書検索</div>
                <div className="text-xs text-neutral-500">Search Certificates</div>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
