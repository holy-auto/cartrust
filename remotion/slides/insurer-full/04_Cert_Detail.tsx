import React from "react";
import { AbsoluteFill } from "remotion";
import {
  LongFormLayout,
  Label,
  Heading,
  AnimItem,
  BulletList,
  SmallCard,
  Warn,
  FONT,
  TEXT_MUTED,
} from "../../components/longform";

const CYAN = "#06b6d4";

const INFO_BULLETS = [
  "施工内容・使用材料・施工箇所",
  "施工日・発行日・証明書ステータス",
  "施工店情報（店舗名・担当者・連絡先）",
  "車両情報（番号・型式・車台番号・年式）",
  "ビフォーアフター写真（複数枚）",
];

const VERIFY_ITEMS = [
  { icon: "✅", label: "「検証済み」バッジ", desc: "ブロックチェーンハッシュが一致" },
  { icon: "⛓️", label: "Polygon Tx Hash", desc: "PolygonScan で独自検証可能" },
  { icon: "📸", label: "C2PA", desc: "写真の撮影日時・デバイス情報が改ざん防止記録" },
  { icon: "📄", label: "PDF ダウンロード", desc: "証拠資料として保存" },
];

export const CertDetail: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={5} total={18}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <Label color={CYAN}>証明書詳細 /insurer/c/[public_id]</Label>
            <Heading size={52}>証明書詳細ビューの読み方</Heading>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
            {/* Left */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  fontSize: 16,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase" as const,
                  color: CYAN,
                  fontFamily: "monospace",
                  marginBottom: 4,
                }}
              >
                確認できる情報
              </div>
              <BulletList items={INFO_BULLETS} color={CYAN} startDelay={8} />
            </div>

            {/* Right */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <AnimItem delay={20}>
                <SmallCard>
                  <div
                    style={{
                      fontSize: 16,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase" as const,
                      color: CYAN,
                      fontFamily: "monospace",
                      marginBottom: 14,
                    }}
                  >
                    真正性の検証
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {VERIFY_ITEMS.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                        <div>
                          <span style={{ fontSize: 18, color: TEXT_MUTED, fontWeight: 600 }}>{item.label}: </span>
                          <span style={{ fontSize: 17, color: TEXT_MUTED }}>{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </SmallCard>
              </AnimItem>

              <AnimItem delay={34}>
                <Warn>
                  「無効」ステータスの証明書は施工店側で無効化されたものです。無効化理由は施工店に直接確認してください
                </Warn>
              </AnimItem>
            </div>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
