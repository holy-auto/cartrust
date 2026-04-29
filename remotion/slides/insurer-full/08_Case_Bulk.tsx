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

const BULK_BULLETS = [
  "案件一覧でチェックボックスを選択",
  "一括ステータス変更（未対応→対応中 など）",
  "一括担当者変更",
  "一括エクスポート（CSV/PDF）",
  "一括アーカイブ",
];

const MESSAGE_ITEMS = [
  "案件詳細の「メッセージ」タブから送信",
  "テキスト・添付ファイル対応",
  "全メッセージが案件に紐付いて記録（監査証跡）",
  "既読・未読管理",
  "メール通知と連動（Resend）",
];

export const CaseBulk: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={9} total={18}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <Label color={CYAN}>案件管理</Label>
            <Heading size={52}>一括操作 & メッセージング</Heading>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
            {/* Left — bulk ops */}
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
                一括操作
              </div>
              <BulletList items={BULK_BULLETS} color={CYAN} startDelay={8} />
            </div>

            {/* Right — messaging */}
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
                    施工店へのメッセージ
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {MESSAGE_ITEMS.map((item, i) => (
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
                  メッセージは案件に紐付いて永続保存されます。電話・メールより証跡が残りやすいため積極的に活用してください
                </Tip>
              </AnimItem>
            </div>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
