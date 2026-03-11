import Link from "next/link";
import { Suspense } from "react";
import BillingGate from "./BillingGate";
import AdminRouteGuard from "./AdminRouteGuard";
import BillingFetchGuard from "./BillingFetchGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BillingFetchGuard />
      <BillingGate />

      <Suspense fallback={null}>
        <AdminRouteGuard>
          <div className="space-y-4">
            <div className="rounded-2xl border bg-white/80 p-4 shadow-sm">
              <div className="text-xs font-semibold tracking-[0.18em] text-neutral-500">
                CARTRUST ADMIN BANNER
              </div>
              <div className="mt-1 text-lg font-bold">CARTRUST</div>
              <div className="mt-1 text-sm text-neutral-600">施工証明 / 車両履歴管理</div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/admin"
                  className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
                >
                  ダッシュボード
                </Link>
                <Link
                  href="/admin/certificates"
                  className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
                >
                  証明書一覧
                </Link>
                <Link
                  href="/admin/vehicles"
                  className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
                >
                  車両管理
                </Link>
                <Link
                  href="/admin/nfc"
                  className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
                >
                  タグ管理
                </Link>
                <Link
                  href="/admin/billing"
                  className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
                >
                  請求管理
                </Link>
              </div>
            </div>

            {children}
          </div>
        </AdminRouteGuard>
      </Suspense>
    </>
  );
}
