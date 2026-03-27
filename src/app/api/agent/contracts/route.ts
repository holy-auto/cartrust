import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/agent/contracts
 * List signing requests for the current agent.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { data: agentStatus } = await supabase.rpc("get_my_agent_status");
    const agentRow = Array.isArray(agentStatus) ? agentStatus[0] : agentStatus;
    if (!agentRow?.agent_id) {
      return NextResponse.json({ error: "not_agent" }, { status: 403 });
    }

    // RLS ensures only own agent's records
    const { data, error } = await supabase
      .from("agent_signing_requests")
      .select("id, agent_id, template_type, title, status, signer_email, signer_name, sent_at, signed_at, created_at, updated_at")
      .eq("agent_id", agentRow.agent_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ contracts: data ?? [] });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "internal_error" },
      { status: 500 },
    );
  }
}
