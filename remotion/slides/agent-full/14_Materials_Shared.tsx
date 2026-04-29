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

const MATERIALS_ITEMS = [
  "Ledra の機能説明 PDF（施工店向け）",
  "料金プラン比較表",
  "導入事例・ROI 試算シート",
  "保険会社連携のメリット説明資料",
  "PowerPoint / Keynote 形式でカスタマイズ可能",
  "最新版に更新されると通知が届く",
];

const SHARED_ITEMS = [
  "運営から代理店全体に共有されるファイル",
  "市場調査データ・競合比較レポート",
  "業界イベント・セミナー情報",
  "法改正・規制変更の影響資料",
];

export const MaterialsShared: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={15} total={16}>
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
              <Label color={VIOLET}>営業資料 & 共有ファイル</Label>
              <Heading size={52}>施工店へのプレゼン資料を活用する</Heading>
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
                営業資料 /agent/materials
              </div>
              <BulletList items={MATERIALS_ITEMS} color={VIOLET} startDelay={8} />
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
                  共有ファイル /agent/shared-files
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {SHARED_ITEMS.map((item, i) => (
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
                面談前に最新の資料をダウンロードしておくことで、古い情報を伝えるリスクを防げます
              </Tip>
            </AnimItem>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
