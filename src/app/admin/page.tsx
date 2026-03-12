import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";

export default function AdminHome() {
  return (
    <main className="space-y-6">
      <PageHeader tag="DASHBOARD" title="ダッシュボード" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/certificates"
          className="glass-card p-5 flex items-center gap-4 hover:bg-surface-hover transition-colors"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-dim text-cyan-400 text-lg">
            📄
          </span>
          <div>
            <div className="text-sm font-semibold text-primary">証明書一覧</div>
            <div className="text-xs text-muted">Certificates</div>
          </div>
        </Link>

        <Link
          href="/admin/billing"
          className="glass-card p-5 flex items-center gap-4 hover:bg-surface-hover transition-colors"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-dim text-emerald-400 text-lg">
            💳
          </span>
          <div>
            <div className="text-sm font-semibold text-primary">請求情報</div>
            <div className="text-xs text-muted">Billing</div>
          </div>
        </Link>

        <Link
          href="/admin/members"
          className="glass-card p-5 flex items-center gap-4 hover:bg-surface-hover transition-colors"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-dim text-amber-400 text-lg">
            👥
          </span>
          <div>
            <div className="text-sm font-semibold text-primary">メンバー管理</div>
            <div className="text-xs text-muted">Members</div>
          </div>
        </Link>
      </div>
    </main>
  );
}
