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

const LINK_ITEMS = [
  "「新規リンクを作成」でリンク名・説明を設定",
  "リンクごとにクリック数・登録数を個別計測",
  "キャンペーン別・媒体別に複数リンクを使い分け",
  "SNS・名刺・チラシ・メールに埋め込み",
  "QR コードとしてダウンロード可能",
  "リンクの無効化・削除で管理を整理",
];

const IDEA_ITEMS = [
  { icon: "🔗", label: "SNS 投稿用", desc: "Instagram・X（Twitter）のプロフィールリンク" },
  { icon: "📇", label: "名刺用", desc: "QR コードを名刺に印刷" },
  { icon: "📧", label: "メール署名用", desc: "営業メールのフッターに貼付" },
  { icon: "🎯", label: "キャンペーン用", desc: "時期・イベントごとに専用リンク" },
];

export const ReferralLinks: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={6} total={16}>
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
              <Label color={VIOLET}>紹介リンク /agent/referral-links</Label>
              <Heading size={52}>トラッキングリンクの作成と管理</Heading>
            </div>
            <div style={{ marginTop: 8 }}>
              <BulletList items={LINK_ITEMS} color={VIOLET} startDelay={8} />
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
                  活用アイデア
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {IDEA_ITEMS.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                      <div>
                        <span
                          style={{
                            fontSize: 17,
                            color: VIOLET,
                            fontFamily: "monospace",
                            marginRight: 8,
                          }}
                        >
                          {item.label}:
                        </span>
                        <span style={{ fontSize: 17, color: TEXT_MUTED }}>{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </SmallCard>
            </AnimItem>

            <AnimItem delay={36}>
              <Tip color={VIOLET}>
                リンク名を「202604_instagram」のように日付+媒体にすると、あとから効果比較がしやすくなります
              </Tip>
            </AnimItem>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
