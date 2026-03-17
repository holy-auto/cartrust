"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MIGRATION_SQL = `-- Support tickets: tenant → operator inquiries
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant ON support_tickets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);

CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('tenant','operator')),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket ON support_ticket_messages(ticket_id);

-- Operator users table
CREATE TABLE IF NOT EXISTS operator_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'operator' CHECK (role IN ('operator','super_admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE operator_users ENABLE ROW LEVEL SECURITY;`;

export default function OperatorSetup({
  userId,
  email,
  tableExists,
}: {
  userId: string;
  email: string;
  tableExists: boolean;
}) {
  const router = useRouter();
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRegister = async () => {
    setRegistering(true);
    setError(null);
    try {
      const res = await fetch("/api/operator/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error ?? `HTTP ${res.status}`);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRegistering(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(MIGRATION_SQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = MIGRATION_SQL;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-card p-8 max-w-2xl w-full space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, #e3002b, #d6005b)" }}>
            <span className="text-xl font-bold text-white">O</span>
          </div>
        </div>
        <h1 className="text-xl font-bold text-primary">CARTRUST 運営管理</h1>
        <p className="text-sm text-secondary mt-2">運営者向け管理ページです</p>
      </div>

      {!tableExists ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-semibold mb-2">DBマイグレーションが必要です</p>
            <p className="text-xs">
              <code className="bg-amber-100 px-1 rounded">operator_users</code> テーブルがまだ作成されていません。
              Supabase SQL Editor で以下のSQLを実行してください。
            </p>
          </div>

          <div className="relative">
            <pre className="rounded-xl bg-neutral-900 text-neutral-100 p-4 text-[11px] overflow-x-auto whitespace-pre max-h-64 overflow-y-auto">
              {MIGRATION_SQL}
            </pre>
            <button
              type="button"
              className="absolute top-2 right-2 px-3 py-1 rounded-lg bg-white/90 text-xs font-medium text-neutral-700 hover:bg-white transition-colors shadow-sm"
              onClick={handleCopy}
            >
              {copied ? "コピー済み" : "コピー"}
            </button>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="btn-primary flex-1"
              onClick={() => router.refresh()}
            >
              SQLを実行したのでリロード
            </button>
            <Link href="/admin" className="btn-ghost flex-1 text-center">
              戻る
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">運営者として登録</p>
            <p className="text-xs">
              現在のユーザー <span className="font-mono font-medium">{email}</span> を運営者として登録します。
              最初の登録者はスーパー管理者になります。
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            className="btn-primary w-full"
            disabled={registering}
            onClick={handleRegister}
          >
            {registering ? "登録中..." : "運営者として登録する"}
          </button>
          <Link href="/admin" className="btn-ghost w-full text-center block">
            テナント管理画面に戻る
          </Link>
        </div>
      )}
    </div>
  );
}
