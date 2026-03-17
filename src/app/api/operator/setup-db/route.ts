import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST() {
  // Must be logged in
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createSupabaseAdminClient();
  const results: string[] = [];

  // Create tables using individual queries (admin client)
  try {
    // 1. support_tickets
    await admin.rpc("exec_sql", {
      query: `
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
      `,
    }).then(() => results.push("support_tickets: OK")).catch(async () => {
      // rpc may not exist, try raw approach via REST
      results.push("support_tickets: using fallback");
    });
  } catch {
    results.push("support_tickets: skip (rpc unavailable)");
  }

  // Since rpc("exec_sql") may not exist, we use a simpler approach:
  // Just try to select from each table to check if it exists, then report
  const tables = ["support_tickets", "support_ticket_messages", "operator_users"];
  const tableStatus: Record<string, boolean> = {};

  for (const table of tables) {
    const { error } = await admin.from(table).select("id").limit(1);
    tableStatus[table] = !error || !error.message.includes("does not exist");
  }

  return NextResponse.json({
    message: "テーブル存在確認結果。存在しない場合はSupabase SQL Editorでマイグレーションを実行してください。",
    tables: tableStatus,
    migration_file: "supabase/migrations/20260317_support_tickets.sql",
  });
}
