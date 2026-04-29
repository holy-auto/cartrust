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

const AUDIT_BULLETS = [
  "誰がいつどの証明書を照会したか完全記録",
  "案件の作成・更新・削除の全操作を記録",
  "メッセージ送受信の記録",
  "エクスポート操作の記録",
  "CSVエクスポートして社内監査に提出可能",
];

const NOTIFY_CHANNELS = [
  "メール通知（Resend 連携）",
  "アプリ内通知（/insurer/notifications）",
];

const NOTIFY_TRIGGERS = [
  "担当案件のステータス変更",
  "SLA 期限の近接・超過",
  "ウォッチリストの証明書が変更",
  "新しいメッセージの受信",
];

export const AuditNotifications: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={17} total={18}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <Label color={CYAN}>操作ログ & 通知</Label>
            <Heading size={52}>監査ログと通知の設定</Heading>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
            {/* Left — audit log */}
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
                操作ログ /insurer/audit
              </div>
              <BulletList items={AUDIT_BULLETS} color={CYAN} startDelay={8} />
            </div>

            {/* Right — notifications */}
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
                    通知設定 /insurer/settings
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 15, color: TEXT, fontWeight: 600, marginBottom: 6 }}>通知チャンネル:</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {NOTIFY_CHANNELS.map((ch, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <div
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: CYAN,
                              opacity: 0.7,
                              flexShrink: 0,
                              marginTop: 8,
                            }}
                          />
                          <span style={{ fontSize: 16, color: TEXT_MUTED, lineHeight: 1.5 }}>{ch}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 15, color: TEXT, fontWeight: 600, marginBottom: 6 }}>通知トリガー:</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {NOTIFY_TRIGGERS.map((tr, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <div
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: CYAN,
                              opacity: 0.7,
                              flexShrink: 0,
                              marginTop: 8,
                            }}
                          />
                          <span style={{ fontSize: 16, color: TEXT_MUTED, lineHeight: 1.5 }}>{tr}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </SmallCard>
              </AnimItem>

              <AnimItem delay={32}>
                <Warn>
                  操作ログは変更・削除できません。コンプライアンス要件のある組織での証跡として活用してください
                </Warn>
              </AnimItem>
            </div>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
