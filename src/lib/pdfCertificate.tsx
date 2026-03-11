import path from "node:path";
import React from "react";
import { Document, Font, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { createSignedAssetUrl } from "@/lib/signedUrl";
import QRCode from "qrcode";

type FieldType = "text" | "textarea" | "number" | "date" | "select" | "multiselect" | "checkbox";

type TemplateSchema = {
  version: number;
  sections: Array<{
    title: string;
    fields: Array<{ key: string; label: string; type: FieldType }>;
  }>;
};

type ThicknessMeasurement = {
  unit?: string | null;
  bonnet?: string | null;
  roof?: string | null;
  left_front_fender?: string | null;
  right_front_fender?: string | null;
  left_front_door?: string | null;
  right_front_door?: string | null;
  left_rear_door?: string | null;
  right_rear_door?: string | null;
  left_rear_fender?: string | null;
  right_rear_fender?: string | null;
  notes?: string | null;
};

export type CertRow = {
  public_id: string;
  tenant_custom_domain?: string | null;
  customer_name: string;
  vehicle_info_json: any;
  content_free_text: string | null;
  content_preset_json: any;
  expiry_type: string | null;
  expiry_value: string | null;
  logo_asset_path: string | null;
  created_at: string;
};

const PDF_FONT_FAMILY = "NotoSansJP";
const FONT_DIR = path.join(process.cwd(), "src", "assets", "fonts");
const FONT_REGULAR = path.join(FONT_DIR, "NotoSansJP-Regular.woff");
const FONT_BOLD = path.join(FONT_DIR, "NotoSansJP-Bold.woff");

const g = globalThis as any;
if (!g.__cartrust_pdf_font_registered__) {
  Font.register({
    family: PDF_FONT_FAMILY,
    fonts: [
      { src: FONT_REGULAR, fontWeight: 400 },
      { src: FONT_BOLD, fontWeight: 700 },
    ],
  });
  g.__cartrust_pdf_font_registered__ = true;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingRight: 28,
    paddingBottom: 28,
    paddingLeft: 28,
    fontSize: 10,
    color: "#111827",
    fontFamily: PDF_FONT_FAMILY,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    height: 26,
    width: 120,
    objectFit: "contain",
    marginRight: 10,
  },
  titleBlock: {
    flexDirection: "column",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 10,
    color: "#4b5563",
    marginTop: 3,
  },
  poweredByHead: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
  },
  meta: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 6,
    lineHeight: 1.45,
  },
  qrWrap: {
    alignItems: "center",
    width: 108,
  },
  qr: {
    width: 90,
    height: 90,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
  },
  qrCaption: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
  },
  card: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingTop: 10,
    paddingRight: 12,
    paddingBottom: 10,
    paddingLeft: 12,
    marginTop: 10,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
    color: "#111827",
  },
  itemRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  itemLabel: {
    width: 110,
    fontSize: 9,
    color: "#6b7280",
  },
  itemValue: {
    flex: 1,
    fontSize: 10,
    color: "#111827",
    lineHeight: 1.45,
  },
  bodyText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: "#111827",
    whiteSpace: "pre-wrap",
  },
  footer: {
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
  },
  footerLine: {
    fontSize: 9,
    color: "#4b5563",
    lineHeight: 1.5,
  },
  poweredByFoot: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 4,
  },
});

function normValue(v: any): string | null {
  if (v === undefined || v === null) return null;
  if (Array.isArray(v)) {
    const s = v.map((x) => String(x)).map((s) => s.trim()).filter(Boolean).join(", ");
    return s || null;
  }
  const s = String(v).trim();
  return s ? s : null;
}

function pickVehicleField(vehicle: Record<string, any>, keys: string[]): string | null {
  for (const key of keys) {
    const v = normValue(vehicle?.[key]);
    if (v) return v;
  }
  return null;
}

function formatDateTime(v?: string | null): string {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString("ja-JP");
}

function buildPresetLines(schema: TemplateSchema | null, values: Record<string, any> | null) {
  if (!schema || !values) return [];
  const lines: Array<{ section: string; label: string; value: string }> = [];
  for (const sec of schema.sections) {
    for (const f of sec.fields) {
      const v = values[f.key];
      if (f.type === "checkbox") {
        if (v) lines.push({ section: sec.title, label: f.label, value: "✓" });
        continue;
      }
      const s = normValue(v);
      if (!s) continue;
      lines.push({ section: sec.title, label: f.label, value: s });
    }
  }
  return lines;
}

function asThickness(v: unknown): ThicknessMeasurement {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as ThicknessMeasurement)
    : {};
}

function buildThicknessLines(m: ThicknessMeasurement) {
  const unit = m.unit || "µm";
  return [
    { label: "ボンネット", value: m.bonnet ? `${m.bonnet} ${unit}` : null },
    { label: "ルーフ", value: m.roof ? `${m.roof} ${unit}` : null },
    { label: "左前フェンダー", value: m.left_front_fender ? `${m.left_front_fender} ${unit}` : null },
    { label: "右前フェンダー", value: m.right_front_fender ? `${m.right_front_fender} ${unit}` : null },
    { label: "左前ドア", value: m.left_front_door ? `${m.left_front_door} ${unit}` : null },
    { label: "右前ドア", value: m.right_front_door ? `${m.right_front_door} ${unit}` : null },
    { label: "左後ドア", value: m.left_rear_door ? `${m.left_rear_door} ${unit}` : null },
    { label: "右後ドア", value: m.right_rear_door ? `${m.right_rear_door} ${unit}` : null },
    { label: "左後フェンダー", value: m.left_rear_fender ? `${m.left_rear_fender} ${unit}` : null },
    { label: "右後フェンダー", value: m.right_rear_fender ? `${m.right_rear_fender} ${unit}` : null },
  ].filter((x) => !!x.value) as Array<{ label: string; value: string }>;
}

export async function renderCertificatePdf(row: CertRow, publicUrl: string) {
  const preset = row.content_preset_json ?? {};
  const schema: TemplateSchema | null = (preset.schema_snapshot as any) ?? null;
  const values: Record<string, any> | null = (preset.values as any) ?? null;
  const presetLines = buildPresetLines(schema, values);

  const thickness = asThickness((preset as any).thickness_measurement);
  const thicknessLines = buildThicknessLines(thickness);

  const vehicle = (row.vehicle_info_json ?? {}) as Record<string, any>;
  const maker = pickVehicleField(vehicle, ["maker", "brand", "manufacturer"]);
  const model = pickVehicleField(vehicle, ["model", "car_model", "vehicle_model"]);
  const year = pickVehicleField(vehicle, ["year", "model_year"]);
  const plate = pickVehicleField(vehicle, ["plate_display", "plate", "plate_no", "number"]);
  const vin = pickVehicleField(vehicle, ["vin", "chassis_no", "frame_no"]);
  const customerName = normValue(row.customer_name) ?? "-";

  const expiryText = [normValue(row.expiry_type), normValue(row.expiry_value)].filter(Boolean).join(" / ") || "-";

  const vehicleLines = [
    { label: "メーカー", value: maker },
    { label: "車種", value: model },
    { label: "年式", value: year },
    { label: "ナンバー", value: plate },
    { label: "VIN / 車台番号", value: vin },
  ].filter((x) => x.value);

  let logoUrl: string | null = null;
  try {
    logoUrl = row.logo_asset_path ? await createSignedAssetUrl(row.logo_asset_path, 3600) : null;
  } catch {
    logoUrl = null;
  }

  const qrDataUrl = await QRCode.toDataURL(publicUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 220,
  });

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.titleRow}>
              {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
              <View style={styles.titleBlock}>
                <Text style={styles.title}>CARTRUST CERT</Text>
                <Text style={styles.subtitle}>車両履歴証明書</Text>
                <Text style={styles.poweredByHead}>powered by certificate.info</Text>
              </View>
            </View>

            <Text style={styles.meta}>公開ID: {row.public_id}</Text>
            <Text style={styles.meta}>発行日: {formatDateTime(row.created_at)}</Text>
          </View>

          <View style={styles.qrWrap}>
            <Image src={qrDataUrl} style={styles.qr} />
            <Text style={styles.qrCaption}>公開ページへアクセス</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>証明情報</Text>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>公開ID</Text>
            <Text style={styles.itemValue}>{row.public_id}</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>顧客名</Text>
            <Text style={styles.itemValue}>{customerName}</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>有効条件</Text>
            <Text style={styles.itemValue}>{expiryText}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>車両情報</Text>
          {vehicleLines.map((line) => (
            <View style={styles.itemRow} key={line.label}>
              <Text style={styles.itemLabel}>{line.label}</Text>
              <Text style={styles.itemValue}>{line.value}</Text>
            </View>
          ))}
        </View>

        {thicknessLines.length > 0 || normValue(thickness.notes) ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>膜厚測定</Text>

            {thicknessLines.map((line) => (
              <View style={styles.itemRow} key={line.label}>
                <Text style={styles.itemLabel}>{line.label}</Text>
                <Text style={styles.itemValue}>{line.value}</Text>
              </View>
            ))}

            {normValue(thickness.notes) ? (
              <View style={styles.itemRow}>
                <Text style={styles.itemLabel}>測定メモ</Text>
                <Text style={styles.itemValue}>{normValue(thickness.notes)}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {normValue(row.content_free_text) ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>施工内容</Text>
            <Text style={styles.bodyText}>{normValue(row.content_free_text)}</Text>
          </View>
        ) : null}

        {presetLines.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>テンプレ入力情報</Text>
            {presetLines.map((line, idx) => (
              <View style={styles.itemRow} key={`${line.section}-${line.label}-${idx}`}>
                <Text style={styles.itemLabel}>{line.label}</Text>
                <Text style={styles.itemValue}>{line.value}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.footerLine}>公開URL: {publicUrl}</Text>
          <Text style={styles.footerLine}>このPDFは CARTRUST の記録出力です。</Text>
          <Text style={styles.poweredByFoot}>powered by certificate.info</Text>
        </View>
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}