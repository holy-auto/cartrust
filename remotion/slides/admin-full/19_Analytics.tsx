import { AbsoluteFill } from "remotion";
import {
  LongFormLayout,
  Label,
  Heading,
  AnimItem,
  FadeIn,
  SmallCard,
  Tip,
  FONT,
  TEXT,
  TEXT_MUTED,
  BLUE,
} from "../../components/longform";

const KPI_ITEMS = [
  { icon: "📈", label: "売上推移グラフ（月次・週次）", color: BLUE },
  { icon: "🪪", label: "証明書発行数推移", color: "#06b6d4" },
  { icon: "💰", label: "顧客単価分析（平均・中央値・分布）", color: "#f59e0b" },
  { icon: "🔄", label: "リピート率分析（初回 vs リピート比率）", color: "#8b5cf6" },
  { icon: "📊", label: "施工メニュー別売上比率", color: "#22c55e" },
];

const PRICE_STATS_ITEMS = [
  "施工種類別の市場価格統計",
  "自店の価格を市場と比較",
  "匿名集計データを活用",
];

export const Analytics: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={20} total={25}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "start",
          }}
        >
          {/* Left column — KPI グラフ一覧 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <Label>経営分析 /admin/management</Label>
              <Heading size={52}>経営 KPI を読む</Heading>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
              {KPI_ITEMS.map((item, i) => (
                <AnimItem key={i} delay={4 + i * 8}>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${item.color}22`,
                      borderRadius: 12,
                      padding: "12px 18px",
                      display: "flex",
                      gap: 14,
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ fontSize: 19, color: TEXT_MUTED, lineHeight: 1.4 }}>
                      {item.label}
                    </span>
                  </div>
                </AnimItem>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <AnimItem delay={16}>
              <SmallCard>
                <div
                  style={{
                    fontSize: 16,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase" as const,
                    color: BLUE,
                    fontFamily: "monospace",
                    marginBottom: 16,
                  }}
                >
                  施工価格相場 /admin/price-stats
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {PRICE_STATS_ITEMS.map((item, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: BLUE,
                          opacity: 0.7,
                          flexShrink: 0,
                          marginTop: 9,
                        }}
                      />
                      <span style={{ fontSize: 18, color: TEXT_MUTED, lineHeight: 1.5 }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </SmallCard>
            </AnimItem>

            <FadeIn delay={32}>
              <Tip>
                Square 売上と Ledra 請求書を両方連携することで、より精度の高い経営分析が可能になります
              </Tip>
            </FadeIn>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
