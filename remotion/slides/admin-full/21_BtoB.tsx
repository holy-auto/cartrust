import { AbsoluteFill } from "remotion";
import {
  LongFormLayout,
  Label,
  Heading,
  BulletList,
  AnimItem,
  FadeIn,
  SmallCard,
  Tip,
  FONT,
  TEXT,
  TEXT_MUTED,
  BLUE,
} from "../../components/longform";

const LISTING_ITEMS = [
  "得意分野（コーティング / PPF / ラッピング等）を選択",
  "対応可能な施工・空き状況を記載",
  "問い合わせ受信 → 見積もり → 受注",
  "パートナーランクに実績が反映される",
];

const ORDER_STEPS = [
  { label: "申請中", color: "#6b7280" },
  { label: "承認", color: "#3b82f6" },
  { label: "作業中", color: "#f59e0b" },
  { label: "完了", color: "#22c55e" },
];

const ORDER_FEATURES = [
  "チャットメッセージで連絡",
  "支払確認・レビュー機能",
  "BtoBHub（在庫共有・商談を1画面で横断）",
];

export const BtoBFull: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={22} total={25}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "start",
          }}
        >
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <Label>取引ハブ /admin/trades → /admin/btob</Label>
              <Heading size={50}>BtoB マーケットプレイスの活用</Heading>
            </div>
            <div>
              <div
                style={{
                  fontSize: 16,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase" as const,
                  color: "#8b5cf6",
                  fontFamily: "monospace",
                  marginBottom: 14,
                }}
              >
                自店の掲載
              </div>
              <BulletList items={LISTING_ITEMS} color="#8b5cf6" startDelay={4} gap={12} />
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <AnimItem delay={14}>
              <SmallCard>
                <div
                  style={{
                    fontSize: 16,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase" as const,
                    color: "#8b5cf6",
                    fontFamily: "monospace",
                    marginBottom: 16,
                  }}
                >
                  受発注管理 /admin/orders
                </div>

                {/* Status flow */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 16,
                    flexWrap: "wrap" as const,
                  }}
                >
                  {ORDER_STEPS.map((step, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div
                        style={{
                          padding: "4px 12px",
                          borderRadius: 100,
                          background: `${step.color}18`,
                          border: `1px solid ${step.color}40`,
                          color: step.color,
                          fontSize: 15,
                          fontWeight: 600,
                          whiteSpace: "nowrap" as const,
                        }}
                      >
                        {step.label}
                      </div>
                      {i < ORDER_STEPS.length - 1 && (
                        <span style={{ fontSize: 12, color: TEXT_MUTED, opacity: 0.5 }}>▶</span>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {ORDER_FEATURES.map((feature, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#8b5cf6",
                          opacity: 0.7,
                          flexShrink: 0,
                          marginTop: 9,
                        }}
                      />
                      <span style={{ fontSize: 18, color: TEXT_MUTED, lineHeight: 1.5 }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </SmallCard>
            </AnimItem>

            <FadeIn delay={32}>
              <Tip>
                取引ハブ (/admin/trades) はリード→商談→受発注→完了のファネルを意識した導線で設計されています
              </Tip>
            </FadeIn>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
