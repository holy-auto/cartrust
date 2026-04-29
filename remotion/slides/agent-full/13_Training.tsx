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
  TEXT,
  TEXT_MUTED,
} from "../../components/longform";

const VIOLET = "#8b5cf6";

const TRAINING_ITEMS = [
  "Ledra の基本機能説明（デモ動画）",
  "施工店オーナーへの効果的なアプローチ方法",
  "よくある断り文句への切り返しトーク集",
  "保険会社・損保との連携メリットの説明方法",
  "成功事例: トップエージェントの紹介手法",
  "最新アップデート情報・新機能紹介",
];

const FAQ_ITEMS = [
  {
    q: "紹介した施工店が解約したらコミッションは返還？",
    a: "初回決済完了後のコミッションは返還不要",
  },
  {
    q: "1人が複数の施工店を紹介できる？",
    a: "制限なし。件数に応じてランクアップ",
  },
  {
    q: "紹介した施工店から別の施工店を紹介してもらえる？",
    a: "間接紹介はコミッション対象外（直接紹介のみ）",
  },
];

export const Training: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={14} total={16}>
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
              <Label color={VIOLET}>研修 /agent/training</Label>
              <Heading size={52}>成約率を上げる研修コンテンツ</Heading>
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
                研修コンテンツ一覧
              </div>
              <BulletList items={TRAINING_ITEMS} color={VIOLET} startDelay={8} />
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
                  FAQ /agent/faq
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {FAQ_ITEMS.map((item, i) => (
                    <div key={i}>
                      <div
                        style={{
                          fontSize: 17,
                          color: TEXT,
                          lineHeight: 1.4,
                          marginBottom: 4,
                        }}
                      >
                        <span style={{ color: VIOLET, fontFamily: "monospace", marginRight: 6 }}>Q:</span>
                        {item.q}
                      </div>
                      <div
                        style={{
                          fontSize: 16,
                          color: TEXT_MUTED,
                          lineHeight: 1.4,
                          paddingLeft: 20,
                        }}
                      >
                        <span style={{ color: "#22c55e", fontFamily: "monospace", marginRight: 6 }}>A:</span>
                        {item.a}
                      </div>
                    </div>
                  ))}
                </div>
              </SmallCard>
            </AnimItem>

            <AnimItem delay={36}>
              <Tip color={VIOLET}>
                研修を修了するとプロフィールに「認定エージェント」バッジが付与され、信頼性が向上します
              </Tip>
            </AnimItem>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
