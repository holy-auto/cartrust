"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Field = {
  key: string;
  type: string;
  label?: string;
  required?: boolean;
  options?: string[];
};

type Section = {
  title?: string;
  fields?: Field[];
};

function pickValues(obj: any): Record<string, any> {
  return (
    obj?.values ??
    obj?.data ??
    obj?.preset_values ??
    obj?.content ??
    obj?.field_values ??
    {}
  );
}

function renderValue(field: Field, raw: any) {
  if (raw === null || raw === undefined) return "";

  if (field.type === "checkbox") return raw ? "はい" : "いいえ";

  if (field.type === "multiselect") {
    if (Array.isArray(raw)) return raw.filter(Boolean).join(", ");
    return String(raw);
  }

  if (field.type === "date") {
    try {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) return d.toLocaleDateString("ja-JP");
    } catch {}
    return String(raw);
  }

  if (field.type === "number") {
    if (typeof raw === "number") return raw.toLocaleString("ja-JP");
    return String(raw);
  }

  return String(raw);
}

export default function InsurerCertificatePage() {
  const supabase = useMemo(() => createClient(), []);
  const params = useParams<{ public_id: string }>();
  const publicId = typeof params?.public_id === "string" ? params.public_id : "";

  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [cert, setCert] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        window.location.href = "/insurer/login";
        return;
      }
      setReady(true);
    })();
  }, [supabase]);

  useEffect(() => {
    if (!ready) return;
    if (!publicId) return;

    (async () => {
      setErr(null);
      setCert(null);
      try {
        const res = await fetch(`/api/insurer/certificate/${encodeURIComponent(publicId)}`, {
          cache: "no-store",
        });
        const j = await res.json();
        if (!res.ok) throw new Error(j?.error ?? "load_failed");
        setCert(j?.certificate ?? null);
      } catch (e: any) {
        setErr(e?.message ?? "load_failed");
      }
    })();
  }, [ready, publicId]);

  if (!ready) return null;

  const csvOneUrl = publicId ? `/api/insurer/export-one?pid=${encodeURIComponent(publicId)}` : "#";
  const pdfOneUrl = publicId ? `/api/insurer/pdf-one?pid=${encodeURIComponent(publicId)}` : "#";
  const publicUrl = publicId ? `/c/${encodeURIComponent(publicId)}` : "#";
  const backToSearchUrl = "/insurer/search";

  const vehicleModel = cert?.vehicle_info_json?.model ?? "";
  const vehiclePlate = cert?.vehicle_info_json?.plate ?? "";

  const snapshot = cert?.content_preset_json?.schema_snapshot ?? {};
  const sections: Section[] = Array.isArray(snapshot?.sections) ? snapshot.sections : [];
  const values = pickValues(cert?.content_preset_json);

  const statusText = String(cert?.status ?? "").toLowerCase();
  const statusStyle =
    statusText === "void"
      ? { color: "#b91c1c", fontWeight: 800 as const }
      : { color: "#047857", fontWeight: 800 as const };

  return (
    <main style={{ maxWidth: 1100, margin: "28px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>証明書閲覧（保険会社）</div>
          <div style={{ opacity: 0.75, marginTop: 4 }}>
            public_id: <span style={{ fontWeight: 700 }}>{publicId}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <a
            href={pdfOneUrl}
            style={{ padding: "10px 14px", fontWeight: 700, display: "inline-block", border: "1px solid #ddd" }}
          >
            1件PDF
          </a>
          <a
            href={csvOneUrl}
            style={{ padding: "10px 14px", fontWeight: 700, display: "inline-block", border: "1px solid #ddd" }}
          >
            1件CSV
          </a>
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            style={{ padding: "10px 14px", fontWeight: 700, display: "inline-block", border: "1px solid #ddd" }}
          >
            公開ページ
          </a>
          <a href={backToSearchUrl} style={{ padding: 10 }}>
            ← 検索へ
          </a>
        </div>
      </div>

      {!publicId && <div style={{ marginTop: 10, color: "crimson" }}>public_id が取得できません</div>}
      {err && <div style={{ color: "crimson", marginTop: 10 }}>{err}</div>}

      {cert && (
        <>
          <div style={{ marginTop: 16, border: "1px solid #eee", padding: 14, background: "#fafafa" }}>
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10, rowGap: 8 }}>
              <div style={{ opacity: 0.7 }}>ステータス</div>
              <div style={statusStyle}>{cert.status}</div>

              <div style={{ opacity: 0.7 }}>顧客名</div>
              <div style={{ fontWeight: 700 }}>{cert.customer_name ?? ""}</div>

              {(vehicleModel || vehiclePlate) ? (
                <>
                  <div style={{ opacity: 0.7 }}>車両</div>
                  <div style={{ fontWeight: 700 }}>{[vehicleModel, vehiclePlate].filter(Boolean).join(" / ")}</div>
                </>
              ) : null}

              <div style={{ opacity: 0.7 }}>有効期限</div>
              <div style={{ fontWeight: 700 }}>{[cert.expiry_type, cert.expiry_value].filter(Boolean).join(" / ")}</div>

              <div style={{ opacity: 0.7 }}>作成</div>
              <div>{cert.created_at ? new Date(cert.created_at).toLocaleString("ja-JP") : ""}</div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>施工内容（テンプレ）</div>
            {sections.length === 0 && (
              <div style={{ marginTop: 10, opacity: 0.7 }}>
                schema_snapshot が見つかりません（content_preset_json.schema_snapshot.sections が空）
              </div>
            )}

            {sections.map((sec, i) => (
              <div key={i} style={{ marginTop: 12, border: "1px solid #eee", padding: 14 }}>
                <div style={{ fontWeight: 800, marginBottom: 10 }}>
                  {sec.title ?? `セクション${i + 1}`}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 10, rowGap: 10 }}>
                  {(sec.fields ?? []).map((f) => {
                    const label = f.label ?? f.key;
                    const raw = values?.[f.key];
                    const val = renderValue(f, raw);

                    if (val === "") return null;

                    return (
                      <div key={f.key} style={{ display: "contents" }}>
                        <div style={{ opacity: 0.75 }}>
                          {label}
                          <span style={{ marginLeft: 8, fontSize: 11, opacity: 0.6 }}>({f.type})</span>
                        </div>
                        <div style={{ fontWeight: 700, whiteSpace: "pre-wrap" }}>{val}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, border: "1px solid #eee", padding: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>施工内容（自由記述）</div>
            <div style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>
              {cert.content_free_text ?? ""}
            </div>
          </div>
        </>
      )}
    </main>
  );
}