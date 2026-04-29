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
  { no: "01", text: "「新規紹介」ボタン → /agent/referrals/new へ" },
  { no: "02", text: "施工店名・担当者名・電話番号・メールを入力" },
  { no: "03", text: "活動エリア・主要施工メニューを選択" },
  { no: "04", text: "紹介メモ（担当者の関心・課題）を任意入力" },
  { no: "05", text: "送信 → 運営がコンタクトを開始" },
];

const STATUS_FLOW = [
  { label: "申請中", color: "#64748b" },
  { label: "運営コンタクト中", color: "#3b82f6" },
  { label: "商談中", color: "#f59e0b" },
  { label: "契約成立", color: "#22c55e" },
  { label: "不成立", color: "#ef4444" },
];

export const ReferralRegister: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={7} total={16}>
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
              <Label color={VIOLET}>紹介登録 /agent/referrals/new</Label>
              <Heading size={52}>施工店を紹介する — 完全手順</Heading>
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
                    marginBottom: 16,
                  }}
                >
                  ステータスの流れ
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {STATUS_FLOW.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: s.color,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: 19, color: TEXT_MUTED }}>{s.label}</span>
                      {i < STATUS_FLOW.length - 2 && (
                        <span style={{ fontSize: 14, color: TEXT_MUTED, opacity: 0.4, marginLeft: 4 }}>→</span>
                      )}
                    </div>
                  ))}
                </div>
              </SmallCard>
            </AnimItem>

            <AnimItem delay={36}>
              <Tip color={VIOLET}>
                紹介メモに「保険会社対応に困っている」「売上データ管理を自動化したい」などの具体的な課題を書くと成約率が上がります
              </Tip>
            </AnimItem>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
