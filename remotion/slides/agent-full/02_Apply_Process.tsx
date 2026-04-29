import React from "react";
import { AbsoluteFill } from "remotion";
import {
  LongFormLayout,
  Label,
  Heading,
  AnimItem,
  SmallCard,
  Tip,
  FONT,
  TEXT,
  TEXT_MUTED,
} from "../../components/longform";

const VIOLET = "#8b5cf6";

const STEPS = [
  { no: "01", text: "/agent/apply にアクセス" },
  { no: "02", text: "氏名・会社名・活動エリア・紹介予定件数を入力" },
  { no: "03", text: "利用規約・パートナー契約に同意" },
  { no: "04", text: "申請送信 → 審査中ステータスへ" },
  { no: "05", text: "運営が審査（通常 1〜2 営業日）" },
  { no: "06", text: "承認メール受信 → ポータルが解放" },
];

export const ApplyProcess: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={3} total={16}>
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
              <Label color={VIOLET}>パートナー申請 /agent/apply</Label>
              <Heading size={52}>申請から承認までの流れ</Heading>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
              {STEPS.map((step, i) => (
                <AnimItem key={i} delay={i * 8}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontFamily: "monospace",
                        color: VIOLET,
                        background: `${VIOLET}18`,
                        border: `1px solid ${VIOLET}35`,
                        borderRadius: 6,
                        padding: "3px 9px",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      {step.no}
                    </div>
                    <span style={{ fontSize: 20, color: TEXT_MUTED, lineHeight: 1.5 }}>{step.text}</span>
                  </div>
                </AnimItem>
              ))}
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
                    marginBottom: 14,
                  }}
                >
                  申請状況の確認 /agent/apply/status
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    "申請日・審査中・承認・却下を確認",
                    "却下の場合は理由とともに通知",
                    "再申請は修正後にいつでも可能",
                  ].map((item, i) => (
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
                活動エリアと紹介予定件数を具体的に記入すると審査がスムーズです
              </Tip>
            </AnimItem>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
