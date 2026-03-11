import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const certificateId = String(body?.certificate_id ?? "").trim();
    const publicId = String(body?.public_id ?? "").trim();

    if (!certificateId && !publicId) {
      return NextResponse.json({ error: "certificate_id or public_id is required" }, { status: 400 });
    }

    const { data: membership, error: membershipError } = await supabase
      .from("tenant_memberships")
      .select("tenant_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (membershipError || !membership?.tenant_id) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 403 });
    }

    let query = supabase
      .from("certificates")
      .select("id, tenant_id, vehicle_id, public_id, status")
      .eq("tenant_id", membership.tenant_id)
      .limit(1);

    if (certificateId) {
      query = query.eq("id", certificateId);
    } else {
      query = query.eq("public_id", publicId);
    }

    const existing = await query.maybeSingle();

    if (existing.error) {
      return NextResponse.json({ error: existing.error.message }, { status: 500 });
    }

    if (!existing.data?.id) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    if (String(existing.data.status ?? "").toLowerCase() === "void") {
      return NextResponse.json({ ok: true, already_void: true });
    }

    const nowIso = new Date().toISOString();

    const updated = await supabase
      .from("certificates")
      .update({
        status: "void",
        updated_at: nowIso,
      })
      .eq("tenant_id", membership.tenant_id)
      .eq("id", existing.data.id);

    if (updated.error) {
      return NextResponse.json({ error: updated.error.message }, { status: 500 });
    }

    if (existing.data.vehicle_id) {
      await supabase.from("vehicle_histories").insert({
        tenant_id: membership.tenant_id,
        vehicle_id: existing.data.vehicle_id,
        type: "certificate_voided",
        title: "施工証明書を無効化",
        description: existing.data.public_id
          ? `Public ID: ${existing.data.public_id} / status: void`
          : "status: void",
        performed_at: nowIso,
        certificate_id: existing.data.id,
      });
    }

    return NextResponse.json({
      ok: true,
      certificate_id: existing.data.id,
      public_id: existing.data.public_id,
      status: "void",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}