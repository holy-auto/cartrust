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

const POS_ITEMS = [
  "レジセッションの開局 — 開始金額を入力してセッション開始",
  "Stripe Terminal（物理端末）と連携してカード決済",
  "チェックアウト処理 — 案件・証明書と紐付け",
  "セッション閉局 — 日次レポートを自動生成",
  "モバイル API: POST /api/mobile/pos/checkout",
];

const SQUARE_STEPS = [
  "OAuth 接続（Square アカウントと連携）",
  "売上データが自動同期（定期 Cron: square-sync）",
  "注文一覧で Ledra 顧客と紐付け",
  "経営分析に反映",
];

export const POSSquare: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={19} total={25}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "start",
          }}
        >
          {/* Left column — POS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <Label>POS会計 &amp; Square連携</Label>
              <Heading size={50}>店頭決済の完全フロー</Heading>
            </div>

            <div>
              <div
                style={{
                  fontSize: 16,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase" as const,
                  color: BLUE,
                  fontFamily: "monospace",
                  marginBottom: 14,
                }}
              >
                POS 会計 /admin/pos
              </div>
              <BulletList items={POS_ITEMS} startDelay={4} gap={12} />
            </div>
          </div>

          {/* Right column — Square */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <AnimItem delay={14}>
              <SmallCard>
                <div
                  style={{
                    fontSize: 16,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase" as const,
                    color: "#22c55e",
                    fontFamily: "monospace",
                    marginBottom: 16,
                  }}
                >
                  Square 売上連携 /admin/square
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {SQUARE_STEPS.map((step, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: "rgba(34,197,94,0.15)",
                          border: "1px solid rgba(34,197,94,0.4)",
                          color: "#22c55e",
                          fontSize: 13,
                          fontWeight: 700,
                          fontFamily: "monospace",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        {i + 1}
                      </div>
                      <span style={{ fontSize: 18, color: TEXT_MUTED, lineHeight: 1.55 }}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </SmallCard>
            </AnimItem>

            <FadeIn delay={32}>
              <Tip>
                Square Webhook にも対応しているため、注文が発生すると即座に Ledra に取り込まれます
              </Tip>
            </FadeIn>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
