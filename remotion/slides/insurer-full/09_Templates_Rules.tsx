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

const TEMPLATE_BULLETS = [
  "よく使うメッセージ文面を登録",
  "案件作成時にワンクリックで適用",
  "施工内容別・ステータス別にテンプレートを整理",
  "チーム全体で共有可能",
];

const RULE_ITEMS = [
  "施工メニュー = PPF → 担当者Aに自動アサイン",
  "施工店エリア = 関東 → チームBのキューへ",
  "保険金額 > 50万円 → 優先度「高」で作成",
  "発行日から30日以上経過 → 自動エスカレーション",
];

export const TemplatesRules: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={10} total={18}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <Label color={CYAN}>テンプレート & 自動振り分け</Label>
            <Heading size={48}>定型文と自動化で業務を効率化</Heading>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
            {/* Left — templates */}
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
                テンプレート /insurer/templates
              </div>
              <BulletList items={TEMPLATE_BULLETS} color={CYAN} startDelay={8} />
            </div>

            {/* Right — rules */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <AnimItem delay={18}>
                <SmallCard>
                  <div
                    style={{
                      fontSize: 16,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase" as const,
                      color: CYAN,
                      fontFamily: "monospace",
                      marginBottom: 10,
                    }}
                  >
                    自動振り分けルール /insurer/rules
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      color: TEXT_MUTED,
                      marginBottom: 12,
                      fontFamily: "monospace",
                    }}
                  >
                    ルールの条件例:
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {RULE_ITEMS.map((item, i) => (
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
                        <span style={{ fontSize: 17, color: TEXT_MUTED, lineHeight: 1.5, fontFamily: "monospace" }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </SmallCard>
              </AnimItem>

              <AnimItem delay={30}>
                <Tip color={CYAN}>
                  ルールは上から順に評価されます。より具体的な条件を上位に配置してください
                </Tip>
              </AnimItem>
            </div>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
