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

const CYAN = "#06b6d4";

const STEPS = [
  { no: "01", desc: "証明書を検索して「案件として登録」ボタンをクリック" },
  { no: "02", desc: "案件タイトル・担当者・優先度を設定" },
  { no: "03", desc: "添付ファイル（査定書・事故報告書など）をアップロード" },
  { no: "04", desc: "施工店へメッセージを送信（テンプレート使用可）" },
  { no: "05", desc: "ステータスを更新しながら案件を進行" },
];

const STATUSES = [
  { label: "未対応", color: "#6b7280", desc: "新規登録・未着手の案件" },
  { label: "対応中", color: "#3b82f6", desc: "担当者が作業中" },
  { label: "確認済み", color: "#f59e0b", desc: "施工店確認待ちまたは内部確認中" },
  { label: "クローズ", color: "#22c55e", desc: "対応完了・解決済み" },
];

export const CaseCreate: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={8} total={18}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <Label color={CYAN}>案件管理 /insurer/cases</Label>
            <Heading size={52}>案件の作成と基本操作</Heading>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
            {/* Left — step list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {STEPS.map((step, i) => (
                <AnimItem key={i} delay={i * 10}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: `${CYAN}20`,
                        border: `1px solid ${CYAN}50`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: 14,
                        fontFamily: "monospace",
                        color: CYAN,
                        fontWeight: 700,
                      }}
                    >
                      {step.no}
                    </div>
                    <span style={{ fontSize: 19, color: TEXT_MUTED, lineHeight: 1.55, paddingTop: 6 }}>
                      {step.desc}
                    </span>
                  </div>
                </AnimItem>
              ))}
            </div>

            {/* Right — status flow */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <AnimItem delay={24}>
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
                    案件ステータスフロー
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {STATUSES.map((s, i) => (
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
                        <span style={{ fontSize: 18, color: TEXT, fontWeight: 600, minWidth: 72 }}>{s.label}</span>
                        <span style={{ fontSize: 16, color: TEXT_MUTED }}>{s.desc}</span>
                      </div>
                    ))}
                  </div>
                </SmallCard>
              </AnimItem>

              <AnimItem delay={36}>
                <Tip color={CYAN}>
                  案件一覧 (/insurer/cases) では「未対応」「対応中」「今日更新」のウィジェットで優先度の高い案件をすぐ把握できます
                </Tip>
              </AnimItem>
            </div>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
