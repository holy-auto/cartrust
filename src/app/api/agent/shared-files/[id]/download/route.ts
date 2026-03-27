import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/agent/shared-files/[id]/download
 * Generate a signed URL for the agent to download a shared file.
 */
export async function POST(_request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
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

    // RLS ensures agent can only see their own files
    const { data: file, error: fileErr } = await supabase
      .from("agent_shared_files")
      .select("id, storage_path, file_name")
      .eq("id", id)
      .single();

    if (fileErr || !file) {
      return NextResponse.json({ error: "file_not_found" }, { status: 404 });
    }

    const { data: signedData, error: signErr } = await supabase.storage
      .from("agent-shared-files")
      .createSignedUrl(file.storage_path, 300, {
        download: file.file_name,
      });

    if (signErr || !signedData?.signedUrl) {
      return NextResponse.json({ error: "download_url_failed" }, { status: 500 });
    }

    return NextResponse.json({ url: signedData.signedUrl });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "internal_error" },
      { status: 500 },
    );
  }
}
