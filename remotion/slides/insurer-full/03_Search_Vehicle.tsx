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

const VEHICLE_BULLETS = [
  "車両番号・型式・車台番号・メーカー・年式で検索",
  "1台の車両に紐づく全証明書を一覧表示",
  "施工履歴タイムラインで時系列確認",
  "同一車両の複数施工店による履歴も横断表示",
  "車両詳細 /insurer/vehicles/[id] で詳細情報確認",
];

const STORE_ITEMS = [
  "施工店名・エリア・施工種別で検索",
  "施工店の登録情報・取り扱いメニューを確認",
  "特定施工店が発行した証明書を一括確認",
];

export const SearchVehicle: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={4} total={18}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <Label color={CYAN}>車両検索 /insurer/vehicles</Label>
            <Heading size={52}>車両軸での証明書照会</Heading>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
            {/* Left */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <BulletList items={VEHICLE_BULLETS} color={CYAN} startDelay={8} />
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
                    店舗検索 /insurer/stores
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {STORE_ITEMS.map((item, i) => (
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
                  同一車両に複数の施工証明書がある場合、タイムラインで施工順序・内容の整合性を確認できます
                </Tip>
              </AnimItem>
            </div>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
