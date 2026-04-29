import React from "react";
import { AbsoluteFill } from "remotion";
import {
  LongFormLayout,
  Label,
  Heading,
  AnimItem,
  BulletList,
  SmallCard,
  Tip,
  FONT,
  TEXT,
  TEXT_MUTED,
} from "../../components/longform";

const CYAN = "#06b6d4";

const REPORT_BULLETS = [
  "月次・四半期・年次の案件処理件数",
  "SLA 達成率・平均対応時間",
  "ステータス別内訳（クローズ率など）",
  "担当者別パフォーマンス比較",
  "施工メニュー別の案件分布",
];

const EXPORT_SECTIONS = [
  {
    icon: "📊",
    title: "CSV エクスポート",
    items: [
      "案件一覧・検索結果を CSV で出力",
      "社内 BI ツール・Excel に取り込み可",
      "絞り込み条件がそのまま反映",
    ],
  },
  {
    icon: "📄",
    title: "PDF エクスポート",
    items: [
      "報告書・監査資料として提出可能なフォーマット",
      "証明書詳細ページから個別 PDF も生成可",
    ],
  },
];

export const ReportsExport: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={14} total={18}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <Label color={CYAN}>レポート & エクスポート /insurer/reports</Label>
            <Heading size={50}>案件統計のレポート活用</Heading>
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
                案件レポートの内容
              </div>
              <BulletList items={REPORT_BULLETS} color={CYAN} startDelay={8} />
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
                    エクスポート形式
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {EXPORT_SECTIONS.map((section, si) => (
                      <div key={si}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 18 }}>{section.icon}</span>
                          <span style={{ fontSize: 17, color: TEXT, fontWeight: 600 }}>{section.title}:</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 5, paddingLeft: 8 }}>
                          {section.items.map((item, ii) => (
                            <div key={ii} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                              <div
                                style={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: "50%",
                                  background: CYAN,
                                  opacity: 0.6,
                                  flexShrink: 0,
                                  marginTop: 8,
                                }}
                              />
                              <span style={{ fontSize: 16, color: TEXT_MUTED, lineHeight: 1.5 }}>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </SmallCard>
              </AnimItem>

              <AnimItem delay={32}>
                <Tip color={CYAN}>
                  定期的なエクスポートをスケジュール化することで、月次報告の作業を大幅に削減できます
                </Tip>
              </AnimItem>
            </div>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
