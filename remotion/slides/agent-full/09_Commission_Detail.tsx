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

const VIOLET = "#8b5cf6";

const DETAIL_ITEMS = [
  "紹介案件ごとのコミッション金額",
  "コミッション確定日・入金予定日・入金日",
  "累計コミッション・今月のコミッション",
  "支払い状態（確定中 / 入金済み / 保留中）",
  "月次・年次の集計サマリー",
];

const CYCLE_ITEMS = [
  "毎月末締め・翌月15日払い（振込）",
  "振込先は /agent/settings で設定",
  "振込通知メールを自動送信",
  "源泉徴収の対応（請求書発行 /agent/invoices）",
];

export const CommissionDetail: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={10} total={16}>
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
              <Label color={VIOLET}>コミッション /agent/commissions</Label>
              <Heading size={52}>コミッション明細と入金確認</Heading>
            </div>
            <div style={{ marginTop: 8 }}>
              <div
                style={{
                  fontSize: 17,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase" as const,
                  color: VIOLET,
                  fontFamily: "monospace",
                  marginBottom: 14,
                  opacity: 0.85,
                }}
              >
                明細で確認できること
              </div>
              <BulletList items={DETAIL_ITEMS} color={VIOLET} startDelay={8} />
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <AnimItem delay={20}>
              <SmallCard>
                <div
                  style={{
                    fontSize: 16,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase" as const,
                    color: VIOLET,
                    fontFamily: "monospace",
                    marginBottom: 16,
                  }}
                >
                  支払いサイクル
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {CYCLE_ITEMS.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: VIOLET,
                          opacity: 0.7,
                          flexShrink: 0,
                          marginTop: 8,
                        }}
                      />
                      <span style={{ fontSize: 19, color: TEXT_MUTED, lineHeight: 1.5 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </SmallCard>
            </AnimItem>

            <AnimItem delay={36}>
              <Tip color={VIOLET}>
                コミッション確定は施工店が Ledra を契約・初回決済した時点です。試用期間中はコミッションが発生しません
              </Tip>
            </AnimItem>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
