import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { CERTIFICATE_IMAGE_BUCKET } from "@/lib/certificateImages";

export async function GET(req: NextRequest) {
  try {
    const pid =
      req.nextUrl.searchParams.get("pid") ??
      req.nextUrl.searchParams.get("public_id");

    if (!pid) {
      return NextResponse.json({ error: "Missing pid" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const cert = await supabase
      .from("certificates")
      .select(`
        id,
        tenant_id,
        public_id,
        vehicle_id,
        status,
        customer_name,
        vehicle_info_json,
        content_free_text,
        content_preset_json,
        expiry_type,
        expiry_value,
        logo_asset_path,
        footer_variant,
        current_version,
        created_at,
        updated_at
      `)
      .eq("public_id", pid)
      .limit(1)
      .maybeSingle();

    if (cert.error) {
      return NextResponse.json(
        { error: "Failed to read certificates", detail: cert.error.message },
        { status: 500 }
      );
    }

    if (!cert.data?.public_id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const tenant = cert.data.tenant_id
      ? await supabase
          .from("tenants")
          .select("name,slug,custom_domain")
          .eq("id", cert.data.tenant_id)
          .limit(1)
          .maybeSingle()
      : { data: null, error: null as any };

    if (tenant.error) {
      return NextResponse.json(
        { error: "Failed to read tenant", detail: tenant.error.message },
        { status: 500 }
      );
    }

    let vehicle: any = null;
    let histories: any[] = [];
    let nfc: any = null;
    let images: any[] = [];

    if (cert.data.vehicle_id) {
      const v = await supabase
        .from("vehicles")
        .select("id,maker,model,year,plate_display,customer_name,customer_email,notes,created_at,updated_at")
        .eq("id", cert.data.vehicle_id)
        .limit(1)
        .maybeSingle();

      if (!v.error && v.data) {
        vehicle = v.data;
      }

      const h = await supabase
        .from("vehicle_histories")
        .select("id,type,title,description,performed_at,certificate_id,created_at")
        .eq("vehicle_id", cert.data.vehicle_id)
        .order("performed_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);

      if (!h.error && Array.isArray(h.data)) {
        histories = h.data;
      }

      const n1 = cert.data.id
        ? await supabase
            .from("nfc_tags")
            .select("id,tag_code,status,written_at,attached_at,vehicle_id,certificate_id,created_at")
            .eq("certificate_id", cert.data.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()
        : { data: null, error: null as any };

      if (!n1.error && n1.data) {
        nfc = n1.data;
      } else {
        const n2 = await supabase
          .from("nfc_tags")
          .select("id,tag_code,status,written_at,attached_at,vehicle_id,certificate_id,created_at")
          .eq("vehicle_id", cert.data.vehicle_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!n2.error && n2.data) {
          nfc = n2.data;
        }
      }
    }

    if (cert.data.id) {
      const img = await supabase
        .from("certificate_images")
        .select("id,file_name,content_type,file_size,sort_order,storage_path,created_at")
        .eq("certificate_id", cert.data.id)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (!img.error && Array.isArray(img.data)) {
        images = await Promise.all(
          img.data.map(async (row: any) => {
            let url: string | null = null;
            try {
              const signed = await supabase.storage
                .from(CERTIFICATE_IMAGE_BUCKET)
                .createSignedUrl(row.storage_path, 3600);
              url = signed.data?.signedUrl ?? null;
            } catch {
              url = null;
            }

            return {
              id: row.id ?? null,
              file_name: row.file_name ?? null,
              content_type: row.content_type ?? null,
              file_size: row.file_size ?? null,
              sort_order: row.sort_order ?? null,
              created_at: row.created_at ?? null,
              url,
            };
          })
        );
      }
    }

    return NextResponse.json({
      ok: true,
      certificate: {
        id: cert.data.id ?? null,
        tenant_id: cert.data.tenant_id ?? null,
        public_id: cert.data.public_id ?? null,
        vehicle_id: cert.data.vehicle_id ?? null,
        status: cert.data.status ?? null,
        customer_name: cert.data.customer_name ?? null,
        created_at: cert.data.created_at ?? null,
        updated_at: cert.data.updated_at ?? null,
        vehicle_info_json: cert.data.vehicle_info_json ?? null,
        content_free_text: cert.data.content_free_text ?? null,
        content_preset_json: cert.data.content_preset_json ?? null,
        expiry_type: cert.data.expiry_type ?? null,
        expiry_value: cert.data.expiry_value ?? null,
        logo_asset_path: cert.data.logo_asset_path ?? null,
        footer_variant: cert.data.footer_variant ?? null,
        current_version: cert.data.current_version ?? null,
      },
      vehicle,
      nfc,
      histories,
      images,
      shop: {
        name: tenant.data?.name ?? null,
        slug: tenant.data?.slug ?? null,
        custom_domain: tenant.data?.custom_domain ?? null,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}