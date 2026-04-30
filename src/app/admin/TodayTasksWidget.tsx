import Link from "next/link";
import { createTenantScopedAdmin } from "@/lib/supabase/admin";
import { deriveTodayTasks, type TaskTile } from "@/lib/admin/todayTasks";

/**
 * 「今日のタスク」ウィジェット (server component)。
 *
 * テナント全体の reservations / invoices / certificates から「今やるべきこと」
 * をカード化して並べる。LLM は使わず、deterministic な signals 抽出だけで動く
 * (deriveTodayTasks)。Suspense fallback として軽量スケルトンを別 export。
 */

const TONE_STYLE: Record<TaskTile["tone"], { ring: string; badge: string; iconBg: string; iconColor: string }> = {
  urgent: {
    ring: "border-red-400/40 hover:border-red-400/60",
    badge: "bg-red-400/15 text-red-400 border-red-400/30",
    iconBg: "bg-red-400/15",
    iconColor: "text-red-400",
  },
  warn: {
    ring: "border-warning/30 hover:border-warning/50",
    badge: "bg-warning-dim text-warning border-warning/30",
    iconBg: "bg-warning-dim",
    iconColor: "text-warning",
  },
  normal: {
    ring: "border-border-default hover:border-accent/40",
    badge: "bg-accent-dim text-accent border-accent/30",
    iconBg: "bg-accent-dim",
    iconColor: "text-accent",
  },
};

function tileIcon(id: TaskTile["id"]): string {
  switch (id) {
    case "in_progress_jobs":
      return "🔧";
    case "today_visits":
      return "🚪";
    case "overdue_invoices":
      return "💰";
    case "unpaid_invoices":
      return "🧾";
    case "expiring_certificates":
      return "⏳";
  }
}

export function TodayTasksWidgetSkeleton() {
  return (
    <div>
      <h2 className="text-sm font-semibold tracking-[0.18em] text-muted mb-3">今日のタスク</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-5 h-24 animate-pulse">
            <div className="h-3 w-1/3 bg-[rgba(0,0,0,0.06)] rounded mb-3" />
            <div className="h-6 w-1/4 bg-[rgba(0,0,0,0.06)] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function TodayTasksWidget({ tenantId }: { tenantId: string }) {
  const { admin } = createTenantScopedAdmin(tenantId);
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // 並列取得。各クエリは LIMIT を強く効かせて、ダッシュボード描画コストを抑える
  // (今日のタスクは件数が増えても 100 件超は基本的に異常事態なので 200 で十分)。
  const [reservationsRes, invoicesRes, certsRes] = await Promise.all([
    admin
      .from("reservations")
      .select("id, status, scheduled_date, title")
      .eq("tenant_id", tenantId)
      .or(`status.eq.in_progress,scheduled_date.eq.${todayStr}`)
      .neq("status", "cancelled")
      .limit(200),
    admin
      .from("documents")
      .select("id, status, total, due_date")
      .eq("tenant_id", tenantId)
      .in("doc_type", ["invoice", "consolidated_invoice"])
      .in("status", ["sent", "overdue"])
      .limit(200),
    admin
      .from("certificates")
      .select("id, status, expiry_date")
      .eq("tenant_id", tenantId)
      .eq("status", "active")
      .not("expiry_date", "is", null)
      .gte("expiry_date", todayStr)
      .limit(200),
  ]);

  const tiles = deriveTodayTasks({
    reservations: reservationsRes.data ?? [],
    invoices: invoicesRes.data ?? [],
    certificates: certsRes.data ?? [],
    now: today,
  });

  // タスク 0 件のときも空のセクションは出さず、ポジティブな 1 行だけ表示
  if (tiles.length === 0) {
    return (
      <div>
        <h2 className="text-sm font-semibold tracking-[0.18em] text-muted mb-3">今日のタスク</h2>
        <div className="glass-card p-5 text-sm text-muted">
          ✅ 急ぎのタスクはありません。クイックアクションから次の作業に進んでください。
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-semibold tracking-[0.18em] text-muted mb-3">今日のタスク</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => {
          const style = TONE_STYLE[tile.tone];
          return (
            <Link
              key={tile.id}
              href={tile.href}
              className={`glass-card p-5 transition-colors block border ${style.ring}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-medium text-muted">{tile.label}</div>
                  <div className="mt-1 text-3xl font-bold text-primary">
                    {tile.count}
                    <span className="ml-1 text-base font-normal text-muted">件</span>
                  </div>
                </div>
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg ${style.iconBg} ${style.iconColor}`}
                  aria-hidden
                >
                  {tileIcon(tile.id)}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted line-clamp-2">{tile.hint}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
