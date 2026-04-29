import React from "react";
import { AbsoluteFill } from "remotion";
import {
  LongFormLayout,
  Label,
  Heading,
  AnimItem,
  BulletList,
  SmallCard,
  Warn,
  FONT,
  TEXT,
  TEXT_MUTED,
} from "../../components/longform";

const CYAN = "#06b6d4";

const SLA_BULLETS = [
  "案件種別ごとに対応期限（SLA）を設定",
  "期限が近づくとダッシュボードで警告表示",
  "期限超過で自動エスカレーション（担当者変更・通知）",
  "SLA 達成率をレポートで追跡",
  "平均対応時間・解決時間の統計",
];

const SLA_EXAMPLES = [
  { type: "PPF 施工照会", sla: "1営業日以内" },
  { type: "板金・塗装照会", sla: "2営業日以内" },
  { type: "コーティング照会", sla: "3営業日以内" },
  { type: "疑義案件", sla: "当日対応" },
];

export const SLAManagement: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={11} total={18}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <Label color={CYAN}>SLA 管理 /insurer/sla</Label>
            <Heading size={52}>サービスレベル管理の設定</Heading>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
            {/* Left */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <BulletList items={SLA_BULLETS} color={CYAN} startDelay={8} />
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
                    SLA 設定例
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {SLA_EXAMPLES.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 0",
                          borderBottom: i < SLA_EXAMPLES.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                        }}
                      >
                        <span style={{ fontSize: 17, color: TEXT_MUTED }}>{item.type}</span>
                        <span
                          style={{
                            fontSize: 16,
                            color: CYAN,
                            fontFamily: "monospace",
                            fontWeight: 600,
                            background: `${CYAN}15`,
                            padding: "3px 10px",
                            borderRadius: 6,
                          }}
                        >
                          {item.sla}
                        </span>
                      </div>
                    ))}
                  </div>
                </SmallCard>
              </AnimItem>

              <AnimItem delay={32}>
                <Warn>
                  SLA 超過が多い場合は自動振り分けルールの見直しか、担当者のキャパシティを確認してください
                </Warn>
              </AnimItem>
            </div>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
