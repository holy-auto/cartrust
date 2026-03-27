import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/api/auth";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

/**
 * GET /api/agent/shared-files
 * List shared files for the current agent. Optional ?direction=to_agent|to_hq
 */
export async function GET(request: NextRequest) {
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

    const direction = request.nextUrl.searchParams.get("direction");

    let query = supabase
      .from("agent_shared_files")
      .select("id, agent_id, uploaded_by, direction, file_name, file_size, file_type, note, created_at")
      .eq("agent_id", agentRow.agent_id)
      .order("created_at", { ascending: false });

    if (direction === "to_agent" || direction === "to_hq") {
      query = query.eq("direction", direction);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ files: data ?? [] });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "internal_error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/agent/shared-files
 * Agent uploads a file (direction: to_hq).
 */
export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get("file");
    const note = formData.get("note") as string | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `ファイルサイズが上限（10MB）を超えています` },
        { status: 400 },
      );
    }
    const contentType = file.type || "application/octet-stream";
    if (!ALLOWED_TYPES.some((t) => contentType.startsWith(t))) {
      return NextResponse.json(
        { error: `許可されていないファイル形式です: ${contentType}` },
        { status: 400 },
      );
    }

    const admin = getAdminClient();
    const uuid = crypto.randomUUID();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${agentRow.agent_id}/to_hq/${uuid}_${safeName}`;

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadErr } = await admin.storage
      .from("agent-shared-files")
      .upload(storagePath, fileBuffer, { contentType, upsert: false });

    if (uploadErr) {
      return NextResponse.json(
        { error: `アップロードに失敗しました: ${uploadErr.message}` },
        { status: 500 },
      );
    }

    const { data: record, error: insertErr } = await admin
      .from("agent_shared_files")
      .insert({
        agent_id: agentRow.agent_id,
        uploaded_by: auth.user.id,
        direction: "to_hq",
        file_name: file.name,
        file_size: file.size,
        file_type: contentType,
        storage_path: storagePath,
        note: note?.trim() || null,
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    return NextResponse.json({ file: record }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "internal_error" },
      { status: 500 },
    );
  }
}
