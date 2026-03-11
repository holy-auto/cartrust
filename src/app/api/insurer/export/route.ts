import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getInsurerSearchRepresentativePublicId } from "@/lib/insurer/searchRows";

export const runtime = "nodejs";

type SearchStatus = "all" | "active" | "void";

type ExportRow = {
  vehicle_id: string | null;
  vehicle_public_id: string | null;
  plate_display: string | null;
  maker: string | null;
  model: string | null;
  year_text: string | null;
  latest_certificate_public_id: string | null;
  latest_active_certificate_public_id: string | null;
  latest_certificate_status: string | null;
  latest_certificate_ts: string | null;
  certificate_count: number | null;
  search_rank: number | null;
};

function csvEscape(v: unknown) {
  const s = (v ?? "").toString();
  const escaped = s.replace(/"/g, '""');
  if (/[",\r\n]/.test(escaped)) return `"${escaped}"`;
  return escaped;
}

function getClientMeta(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? null;
  const ua = req.headers.get("user-agent") ?? null;
  return { ip, ua };
}

function normalizeQuery(raw: string | null) {
  const q = (raw ?? "").trim();
  return q.length > 0 ? q : null;
}

function normalizeStatus(raw: string | null): SearchStatus {
  const v = (raw ?? "all").trim().toLowerCase();
  if (v === "active" || v === "void") return v;
  return "all";
}

function getExportStatus(row: ExportRow): string {
  const s = (row.latest_certificate_status ?? "").trim().toLowerCase();
  if (s === "active" || s === "void") return s;
  if (row.latest_active_certificate_public_id) return "active";
  return s;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = normalizeQuery(url.searchParams.get("q"));
  const status = normalizeStatus(url.searchParams.get("status"));

  const limit = 2000;
  const offset = 0;

  const { ip, ua } = getClientMeta(req);

  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!q) {
    return NextResponse.json({ error: "query_required" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("insurer_search_vehicles", {
    p_query: q,
    p_limit: limit,
    p_offset: offset,
    p_status: status,
    p_ip: ip,
    p_user_agent: ua,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { error: logErr } = await supabase.rpc("insurer_audit_log", {
    p_action: "insurer.export.csv",
    p_target_public_id: null,
    p_query_json: { q, limit, offset, status },
    p_ip: ip,
    p_user_agent: ua,
  });

  if (logErr) {
    return NextResponse.json({ error: logErr.message }, { status: 400 });
  }

  const rows = (data ?? []) as ExportRow[];

  const header = [
    "public_id",
    "status",
    "vehicle_public_id",
    "plate_display",
    "maker",
    "model",
    "year_text",
    "latest_certificate_public_id",
    "latest_active_certificate_public_id",
    "latest_certificate_ts",
    "certificate_count",
    "search_rank"
  ];
  const lines = [header.join(",")];

  for (const row of rows) {
    const representativePublicId = getInsurerSearchRepresentativePublicId(row);
    const statusText = getExportStatus(row);

    lines.push(
      [
        csvEscape(representativePublicId),
        csvEscape(statusText),
        csvEscape(row.vehicle_public_id),
        csvEscape(row.plate_display),
        csvEscape(row.maker),
        csvEscape(row.model),
        csvEscape(row.year_text),
        csvEscape(row.latest_certificate_public_id),
        csvEscape(row.latest_active_certificate_public_id),
        csvEscape(row.latest_certificate_ts),
        csvEscape(row.certificate_count),
        csvEscape(row.search_rank)
      ].join(",")
    );
  }

  const bom = "\uFEFF";
  const body = bom + lines.join("\r\n");

  return new NextResponse(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="insurer_search_results_${Date.now()}.csv"`,
      "cache-control": "no-store",
    },
  });
}