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

const SETUP_ITEMS = [
  "プロフィール（氏名・プロフィール画像・自己紹介）",
  "振込先口座情報（コミッション受取用）",
  "通知設定（メール / アプリ内通知）",
  "2 要素認証（TOTP）の有効化",
  "契約書の確認と保存 /agent/contracts",
];

const MATERIALS_ITEMS = [
  "施工店向け説明資料（PDF / PowerPoint）",
  "Ledra の機能一覧・料金表",
  "成功事例・実績データ",
  "活動エリア別の市場データ",
];

export const AccountSetup: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={4} total={16}>
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
              <Label color={VIOLET}>アカウント設定 /agent/settings</Label>
              <Heading size={52}>承認後の初期設定</Heading>
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
                設定すること
              </div>
              <BulletList items={SETUP_ITEMS} color={VIOLET} startDelay={8} />
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
                  営業資料を入手する /agent/materials
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {MATERIALS_ITEMS.map((item, i) => (
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
                承認直後に研修コンテンツ（/agent/training）を確認することで、最初の紹介成功率が上がります
              </Tip>
            </AnimItem>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
