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

const CAMPAIGN_ITEMS = [
  "進行中のキャンペーン一覧と残り期間を確認",
  "対象条件（紹介件数・エリア・施工メニューなど）",
  "通常コミッションへの上乗せボーナス率",
  "キャンペーン期間中の自分の達成状況",
  "過去キャンペーンの参加結果・獲得ボーナス履歴",
];

const EXAMPLES = [
  { icon: "🌸", label: "新規エリア開拓", desc: "未開拓エリアからの成約で +50% ボーナス" },
  { icon: "⚡", label: "スプリント", desc: "月内 3件以上成約で一括ボーナス" },
  { icon: "🎯", label: "特定メニュー", desc: "PPF 施工店紹介で +30% ボーナス" },
  { icon: "🔥", label: "シーズン", desc: "繁忙期（春・秋）の成約率アップ企画" },
];

export const Campaigns: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={12} total={16}>
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
              <Label color={VIOLET}>キャンペーン /agent/campaigns</Label>
              <Heading size={52}>期間限定ボーナスを最大活用する</Heading>
            </div>
            <div style={{ marginTop: 8 }}>
              <BulletList items={CAMPAIGN_ITEMS} color={VIOLET} startDelay={8} />
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
                  キャンペーン例
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {EXAMPLES.map((ex, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{ex.icon}</span>
                      <div>
                        <span
                          style={{
                            fontSize: 17,
                            color: VIOLET,
                            fontFamily: "monospace",
                            marginRight: 8,
                          }}
                        >
                          {ex.label}:
                        </span>
                        <span style={{ fontSize: 17, color: TEXT_MUTED }}>{ex.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </SmallCard>
            </AnimItem>

            <AnimItem delay={36}>
              <Tip color={VIOLET}>
                キャンペーン開始の通知は /agent/notifications と登録メールに届きます。見逃さないよう通知設定を確認してください
              </Tip>
            </AnimItem>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
