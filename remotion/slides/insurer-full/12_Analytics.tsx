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
  TEXT_MUTED,
} from "../../components/longform";

const CYAN = "#06b6d4";

const ANALYTICS_BULLETS = [
  "日次・週次・月次の証明書照会数推移",
  "よく検索される施工店・施工メニュー",
  "照会からウォッチリスト追加・案件化までの転換率",
  "担当者別の案件処理件数・速度",
  "ピーク時間帯（照会が集中する曜日・時間）",
];

const TENANT_ITEMS = [
  "施工店ごとの証明書発行数",
  "照会対象になった件数・率",
  "案件化率（照会→案件の比率）",
  "問題のある施工パターンの早期発見",
];

export const InsurerAnalytics: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={13} total={18}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <Label color={CYAN}>分析 /insurer/analytics</Label>
            <Heading size={52}>検索パターン & 利用動向を読む</Heading>
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
                分析で把握できること
              </div>
              <BulletList items={ANALYTICS_BULLETS} color={CYAN} startDelay={8} />
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
                    施工店別統計 /insurer/tenants
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {TENANT_ITEMS.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: CYAN,
                            opacity: 0.7,
                            flexShrink: 0,
                            marginTop: 8,
                          }}
                        />
                        <span style={{ fontSize: 18, color: TEXT_MUTED, lineHeight: 1.5 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </SmallCard>
              </AnimItem>

              <AnimItem delay={32}>
                <Tip color={CYAN}>
                  照会が多い施工店との連携強化や、照会が少ない施工店への情報提供に役立てられます
                </Tip>
              </AnimItem>
            </div>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
