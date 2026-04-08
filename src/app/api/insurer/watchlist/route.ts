import { NextRequest, NextResponse } from "next/server";
import { resolveInsurerCaller } from "@/lib/api/insurerAuth";
import { apiUnauthorized, apiValidationError, apiInternalError } from "@/lib/api/response";
import { checkRateLimit } from "@/lib/api/rateLimit";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * Table: insurer_watchlist
 * - id uuid PK default gen_random_uuid()
 * - insurer_id uuid FK → insurers.id
 * - user_id uuid FK → auth.users
 * - target_type text NOT NULL CHECK (certificate|vehicle)
 * - target_id uuid NOT NULL
 * - created_at timestamptz default now()
 * - UNIQUE(user_id, target_type, target_id)
 */

/**
 * GET /api/insurer/watchlist
 * List watchlist items for the current user, enriched with target details.
 */
export async function GET(req: NextRequest) {
  const limited = await checkRateLimit(req, "general");
  if (limited) return limited;

  const caller = await resolveInsurerCaller();
  if (!caller) return apiUnauthorized();

  const admin = createAdminClient();

  try {
    const { data: items, error } = await admin
      .from("insurer_watchlist")
      .select("id, insurer_id, user_id, target_type, target_id, created_at")
      .eq("insurer_id", caller.insurerId)
      .eq("user_id", caller.userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[watchlist] GET error (table may not exist):", error.message);
      return NextResponse.json({ items: [] });
    }

    // ── Enrich with target details using bulk IN queries (N+1 防止) ──
    const watchItems = items ?? [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const certIds    = watchItems.filter((i: any) => i.target_type === "certificate").map((i: any) => i.target_id as string);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vehicleIds = watchItems.filter((i: any) => i.target_type === "vehicle").map((i: any) => i.target_id as string);

    const [certMap, vehicleMap] = await Promise.all([
      certIds.length > 0
        ? admin
            .from("certificates")
            .select("id, public_id, status, updated_at")
            .in("id", certIds)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then(({ data }: { data: any }) =>
              Object.fromEntries((data ?? []).map((c: { id: string; public_id: string; status: string; updated_at: string }) => [c.id, c])),
            )
        : Promise.resolve({}),
      vehicleIds.length > 0
        ? admin
            .from("vehicles")
            .select("id, plate_number, maker, model, updated_at")
            .in("id", vehicleIds)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then(({ data }: { data: any }) =>
              Object.fromEntries((data ?? []).map((v: { id: string; plate_number: string | null; maker: string | null; model: string | null; updated_at: string }) => [v.id, v])),
            )
        : Promise.resolve({}),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enriched = watchItems.map((item: any) => {
      if (item.target_type === "certificate") {
        const cert = (certMap as Record<string, { id: string; public_id: string; status: string; updated_at: string }>)[item.target_id];
        return {
          ...item,
          target_detail: cert
            ? { identifier: cert.public_id, status: cert.status, updated_at: cert.updated_at }
            : null,
        };
      }
      if (item.target_type === "vehicle") {
        const vehicle = (vehicleMap as Record<string, { id: string; plate_number: string | null; maker: string | null; model: string | null; updated_at: string }>)[item.target_id];
        return {
          ...item,
          target_detail: vehicle
            ? {
                identifier: [vehicle.maker, vehicle.model, vehicle.plate_number].filter(Boolean).join(" "),
                status:     null,
                updated_at: vehicle.updated_at,
              }
            : null,
        };
      }
      return { ...item, target_detail: null };
    });

    return NextResponse.json({ items: enriched });
  } catch (err) {
    return apiInternalError(err, "GET /api/insurer/watchlist");
  }
}

/**
 * POST /api/insurer/watchlist
 * Add an item to watchlist.
 */
export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, "general");
  if (limited) return limited;

  const caller = await resolveInsurerCaller();
  if (!caller) return apiUnauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return apiValidationError("Invalid JSON body.");
  }

  const { type, target_id } = body as {
    type?: string;
    target_id?: string;
  };

  const validTypes = ["certificate", "vehicle"];
  if (!type || !validTypes.includes(type)) {
    return apiValidationError("type must be 'certificate' or 'vehicle'.");
  }
  if (!target_id) {
    return apiValidationError("target_id is required.");
  }

  const admin = createAdminClient();

  try {
    const { data, error } = await admin
      .from("insurer_watchlist")
      .insert({
        insurer_id: caller.insurerId,
        user_id: caller.userId,
        target_type: type,
        target_id,
      })
      .select("id, insurer_id, user_id, target_type, target_id, created_at")
      .single();

    if (error) {
      // Handle unique constraint violation gracefully
      if (error.code === "23505") {
        return apiValidationError("このアイテムは既にウォッチリストに登録されています。");
      }
      console.error("[watchlist] POST error:", error.message);
      return apiValidationError(error.message);
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (err) {
    return apiInternalError(err, "POST /api/insurer/watchlist");
  }
}

/**
 * DELETE /api/insurer/watchlist?id=<uuid>
 * Remove an item from watchlist.
 */
export async function DELETE(req: NextRequest) {
  const limited = await checkRateLimit(req, "general");
  if (limited) return limited;

  const caller = await resolveInsurerCaller();
  if (!caller) return apiUnauthorized();

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return apiValidationError("id query parameter is required.");

  const admin = createAdminClient();

  try {
    const { error } = await admin
      .from("insurer_watchlist")
      .delete()
      .eq("id", id)
      .eq("user_id", caller.userId);

    if (error) {
      console.error("[watchlist] DELETE error:", error.message);
      return apiValidationError(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiInternalError(err, "DELETE /api/insurer/watchlist");
  }
}
