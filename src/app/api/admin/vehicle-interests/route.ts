import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

async function resolveCallerTenant(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes?.user) return null;
  const { data: mem } = await supabase
    .from("tenant_memberships")
    .select("tenant_id")
    .eq("user_id", userRes.user.id)
    .limit(1)
    .single();
  if (!mem?.tenant_id) return null;
  return { userId: userRes.user.id, tenantId: mem.tenant_id as string };
}

// GET: List customer interests for a vehicle
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const caller = await resolveCallerTenant(supabase);
    if (!caller) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const vehicleId = new URL(req.url).searchParams.get("vehicle_id");
    if (!vehicleId) return NextResponse.json({ error: "vehicle_id required" }, { status: 400 });

    const { data, error } = await supabase
      .from("vehicle_interests")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .eq("tenant_id", caller.tenantId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ interests: data ?? [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST: Add customer interest
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const caller = await resolveCallerTenant(supabase);
    if (!caller) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await req.json();
    const { vehicle_id, customer_name, customer_phone, customer_email, interest_level, note, follow_up_date } = body;

    if (!vehicle_id || !customer_name) {
      return NextResponse.json({ error: "vehicle_id and customer_name required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("vehicle_interests")
      .insert({
        vehicle_id,
        tenant_id: caller.tenantId,
        customer_name,
        customer_phone: customer_phone || null,
        customer_email: customer_email || null,
        interest_level: interest_level || "warm",
        note: note || null,
        follow_up_date: follow_up_date || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, interest: data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT: Update customer interest
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const caller = await resolveCallerTenant(supabase);
    if (!caller) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("vehicle_interests")
      .update(updates)
      .eq("id", id)
      .eq("tenant_id", caller.tenantId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, interest: data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
