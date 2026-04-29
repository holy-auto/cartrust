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

const WATCH_BULLETS = [
  "気になる証明書をウォッチリストに追加",
  "ステータス変更（有効→無効など）を即座に検知",
  "一覧から証明書詳細へワンクリックで遷移",
  "複数査定担当者でリストを共有可能",
  "追加・削除は証明書詳細ページの「ウォッチ」ボタンから",
];

const SCENE_ITEMS = [
  "保険金請求に関連する証明書をまとめて監視",
  "施工店への問い合わせ中の証明書を追跡",
  "疑義案件のモニタリング",
  "担当案件に紐づく証明書の状態変化を検知",
];

export const Watchlist: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={6} total={18}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <Label color={CYAN}>ウォッチリスト /insurer/watchlist</Label>
            <Heading size={52}>監視対象証明書の管理</Heading>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
            {/* Left */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <BulletList items={WATCH_BULLETS} color={CYAN} startDelay={8} />
            </div>

            {/* Right */}
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
                    活用シーン
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {SCENE_ITEMS.map((item, i) => (
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
                  ウォッチリストの変更はリアルタイム通知（/insurer/notifications）と連動します
                </Tip>
              </AnimItem>
            </div>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
