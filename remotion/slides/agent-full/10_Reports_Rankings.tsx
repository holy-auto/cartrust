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

const REPORT_ITEMS = [
  "月次・四半期・年次の紹介件数・成約件数",
  "成約率（紹介数÷成約数）の推移",
  "コミッション収入の推移グラフ",
  "紹介リンク別のコンバージョン率",
  "CSV エクスポートで確定申告・経費管理に活用",
];

const RANKS = [
  { icon: "🥇", label: "プラチナ", desc: "月間成約 10件以上 — 特別ボーナス + 優先サポート" },
  { icon: "🥈", label: "ゴールド", desc: "月間成約 5〜9件 — ボーナス率UP" },
  { icon: "🥉", label: "シルバー", desc: "月間成約 2〜4件 — 標準コミッション" },
  { icon: "🏅", label: "ブロンズ", desc: "月間成約 1件 — 標準コミッション" },
];

export const ReportsRankings: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={11} total={16}>
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
              <Label color={VIOLET}>レポート & ランキング</Label>
              <Heading size={52}>実績を可視化して成長につなげる</Heading>
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
                レポート /agent/reports
              </div>
              <BulletList items={REPORT_ITEMS} color={VIOLET} startDelay={8} />
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
                  ランキング /agent/rankings
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {RANKS.map((rank, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{rank.icon}</span>
                      <div>
                        <span
                          style={{
                            fontSize: 17,
                            color: VIOLET,
                            fontFamily: "monospace",
                            marginRight: 8,
                          }}
                        >
                          {rank.label}:
                        </span>
                        <span style={{ fontSize: 17, color: TEXT_MUTED }}>{rank.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </SmallCard>
            </AnimItem>

            <AnimItem delay={36}>
              <Tip color={VIOLET}>
                ランキング上位のエージェントの活動エリア・紹介手法はランキングページで確認できます（匿名）
              </Tip>
            </AnimItem>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
