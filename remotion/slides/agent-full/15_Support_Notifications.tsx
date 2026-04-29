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

const SUPPORT_ITEMS = [
  "「新規チケット」から問い合わせを送信",
  "カテゴリ: 紹介に関する質問 / コミッション / 技術的問題 / その他",
  "優先度設定: 通常 / 高",
  "ファイル添付（スクリーンショットなど）",
  "チケット一覧で対応状況・返信を確認",
  "通常 1 営業日以内に初回返信",
];

const NOTIFICATION_TYPES = [
  "紹介ステータスの変更",
  "コミッション確定・入金",
  "新しいキャンペーン開始",
  "研修コンテンツの追加",
  "運営からのお知らせ",
];

export const SupportNotifications: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={16} total={16}>
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
              <Label color={VIOLET}>サポート & 通知</Label>
              <Heading size={52}>困ったときのサポート活用</Heading>
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
                サポートチケット /agent/support
              </div>
              <BulletList items={SUPPORT_ITEMS} color={VIOLET} startDelay={8} />
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
                  通知センター /agent/notifications
                </div>
                <div
                  style={{
                    fontSize: 16,
                    color: VIOLET,
                    fontFamily: "monospace",
                    marginBottom: 10,
                    opacity: 0.8,
                  }}
                >
                  通知の種類:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {NOTIFICATION_TYPES.map((item, i) => (
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
                よく使う操作のショートカットはダッシュボードのクイックリンクにカスタマイズできます
              </Tip>
            </AnimItem>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
