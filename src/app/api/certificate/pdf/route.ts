import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { renderCertificatePdf, type CertRow } from "@/lib/pdfCertificate";

type CertPublic = CertRow & {
  status: string | null;
};

async function fetchCertPublic(pid: string): Promise<CertPublic | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("certificates")
    .select("public_id,status,customer_name,vehicle_info_json,content_free_text,content_preset_json,expiry_type,expiry_value,logo_asset_path,created_at")
    .eq("public_id", pid)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as CertPublic | null) ?? null;
}

function getFallbackOrigin(req: Request): string {
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const pid = (url.searchParams.get("pid") ?? "").trim();

  if (!pid) {
    return NextResponse.json({ error: "missing pid" }, { status: 400 });
  }

  const cert = await fetchCertPublic(pid);

  if (!cert) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const certStatus = String(cert.status ?? "").toLowerCase();

  if (certStatus === "void") {
    return NextResponse.json(
      { error: "void_certificate", message: "This certificate has been voided." },
      { status: 410 }
    );
  }

  if (certStatus !== "active") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const origin = getFallbackOrigin(req);
  const publicUrl = `${origin}/c/${cert.public_id}`;

  const buf = await renderCertificatePdf(cert, publicUrl);
  const ab = (buf as any).buffer
    ? (buf as any).buffer.slice(
        (buf as any).byteOffset ?? 0,
        ((buf as any).byteOffset ?? 0) + (buf as any).byteLength
      )
    : buf;

  return new NextResponse(ab as any, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="certificate_${cert.public_id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}