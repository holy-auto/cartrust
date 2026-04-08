import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiUnauthorized, apiForbidden, apiValidationError, apiInternalError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

// ─── GET: List agent members ───
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      return apiUnauthorized();
    }

    const { data: agentData, error: agentErr } = await supabase.rpc("get_my_agent_status");
    if (agentErr || !agentData || (Array.isArray(agentData) && agentData.length === 0)) {
      return apiForbidden("agent_not_found");
    }

    const agent = Array.isArray(agentData) ? agentData[0] : agentData;
    const agentId = agent.agent_id as string;

    // Fetch all agent_users for this agent
    const { data: members, error } = await supabase
      .from("agent_users")
      .select("id, user_id, agent_id, role, display_name, created_at")
      .eq("agent_id", agentId)
      .order("created_at", { ascending: true });

    if (error) {
      return apiInternalError(error, "agent/members query");
    }

    // ── Enrich with email from auth.users (N+1 防止: listUsers 1回で取得) ──
    const admin = createAdminClient();
    const membersList = members ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userIds = membersList.filter((m: any) => m.user_id).map((m: any) => m.user_id as string);

    // listUsers は全ユーザーを返すため、user_id 一致でフィルタリング
    const { data: usersData } = userIds.length > 0
      ? await admin.auth.admin.listUsers({ perPage: 1000 })
      : { data: { users: [] } };

    const userIdToEmail = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (usersData?.users ?? []).filter((u: any) => userIds.includes(u.id))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((u: any) => [u.id, u.email ?? null]),
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enriched = membersList.map((m: any) => ({
      id:           m.id,
      user_id:      m.user_id,
      role:         m.role ?? "viewer",
      display_name: m.display_name ?? null,
      email:        (m.user_id ? userIdToEmail[m.user_id] : null) ?? null,
      created_at:   m.created_at,
      is_self:      m.user_id === auth.user.id,
    }));

    return NextResponse.json({ members: enriched });
  } catch (e: unknown) {
    return apiInternalError(e, "agent/members GET");
  }
}

// ─── POST: Invite / add a member to the agent organization ───
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      return apiUnauthorized();
    }

    const { data: agentData, error: agentErr } = await supabase.rpc("get_my_agent_status");
    if (agentErr || !agentData || (Array.isArray(agentData) && agentData.length === 0)) {
      return apiForbidden("agent_not_found");
    }

    const agent = Array.isArray(agentData) ? agentData[0] : agentData;
    const agentId = agent.agent_id as string;
    const callerRole = agent.role as string;

    // Only admin can invite members
    if (callerRole !== "admin") {
      return apiForbidden("メンバーを招待する権限がありません。");
    }

    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const email = ((body?.email as string) ?? "").trim().toLowerCase();
    const role = ((body?.role as string) ?? "").trim() || "viewer";
    const displayName = ((body?.display_name as string) ?? "").trim() || null;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return apiValidationError("有効なメールアドレスを入力してください。");
    }

    const validRoles = ["admin", "staff", "viewer"];
    if (!validRoles.includes(role)) {
      return apiValidationError("無効なロールです。admin, staff, viewer のいずれかを指定してください。");
    }

    // Upsert the agent user via RPC
    const { data: member, error: upsertErr } = await supabase.rpc("upsert_agent_user", {
      p_agent_id: agentId,
      p_email: email,
      p_role: role,
      p_display_name: displayName,
    });

    if (upsertErr) {
      return apiInternalError(upsertErr, "agent/members upsert");
    }

    return NextResponse.json({ ok: true, member }, { status: 201 });
  } catch (e: unknown) {
    return apiInternalError(e, "agent/members POST");
  }
}
