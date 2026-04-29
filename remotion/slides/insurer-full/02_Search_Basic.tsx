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
  BLUE,
} from "../../components/longform";

const CYAN = "#06b6d4";

const SEARCH_KEYS = [
  {
    icon: "🔢",
    title: "証明書番号 (public_id)",
    desc: "LC-YYYYMMDD-XXXX 形式で完全一致・前方一致検索。最速で目的の証明書に到達",
  },
  {
    icon: "👤",
    title: "顧客名 / フリガナ",
    desc: "漢字・カナ・ローマ字いずれでも検索可能。部分一致対応",
  },
  {
    icon: "🚗",
    title: "車両ナンバー / 型式",
    desc: "ナンバープレート（品川300あ1234）または型式（ZVW50）で検索",
  },
];

const FILTER_ITEMS = [
  "発行日範囲（From / To）",
  "ステータス（有効 / 無効 / 全て）",
  "施工店名フィルタ",
  "施工メニューカテゴリ",
  "ソート: 発行日降順（デフォルト）/ 顧客名 / 施工店名",
];

export const SearchBasic: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={3} total={18}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <Label color={CYAN}>証明書検索 /insurer/search</Label>
            <Heading size={52}>基本検索 — 3つの検索キー</Heading>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
            {/* Left — search key cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {SEARCH_KEYS.map((key, i) => (
                <AnimItem key={i} delay={i * 10}>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${CYAN}30`,
                      borderRadius: 12,
                      padding: "14px 18px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 22 }}>{key.icon}</span>
                      <span style={{ fontSize: 19, fontWeight: 700, color: TEXT }}>{key.title}</span>
                    </div>
                    <span style={{ fontSize: 17, color: TEXT_MUTED, lineHeight: 1.5 }}>{key.desc}</span>
                  </div>
                </AnimItem>
              ))}
            </div>

            {/* Right — filter card */}
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
                      marginBottom: 14,
                    }}
                  >
                    絞り込みフィルタ
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {FILTER_ITEMS.map((item, i) => (
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

              <AnimItem delay={30}>
                <Tip color={CYAN}>
                  public_id は保険金請求書に記載してもらうよう施工店に依頼すると、照会速度が大幅に向上します
                </Tip>
              </AnimItem>
            </div>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
