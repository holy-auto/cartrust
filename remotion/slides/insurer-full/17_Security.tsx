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

const SECURITY_BULLETS = [
  "2 要素認証（TOTP）: Google Authenticator / 1Password 対応",
  "セッションタイムアウト: アイドル時の自動ログアウト",
  "ログイン試行制限: ブルートフォース攻撃を防止",
  "IP アドレス制限（オプション）: 社内ネットワークからのみアクセス",
  "パスワードポリシー: 定期変更の強制",
];

const RECOMMENDED = [
  { check: "✅ 必須", desc: "全メンバーに 2FA を有効化" },
  { check: "✅ 推奨", desc: "セッションタイムアウトを 30分に設定" },
  { check: "✅ 推奨", desc: "管理者アカウントは専用にする" },
  { check: "✅ 推奨", desc: "退職者のアカウントを即座に無効化" },
  { check: "✅ 定期", desc: "月次で操作ログを確認" },
];

export const InsurerSecurity: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={18} total={18}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <Label color={CYAN}>セキュリティ /insurer/security</Label>
            <Heading size={52}>セキュリティ設定 & ベストプラクティス</Heading>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
            {/* Left */}
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
                セキュリティ設定
              </div>
              <BulletList items={SECURITY_BULLETS} color={CYAN} startDelay={8} />
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
                    推奨セキュリティ設定
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {RECOMMENDED.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span
                          style={{
                            fontSize: 15,
                            color: CYAN,
                            fontFamily: "monospace",
                            fontWeight: 600,
                            flexShrink: 0,
                            whiteSpace: "nowrap" as const,
                            marginTop: 2,
                          }}
                        >
                          {item.check}
                        </span>
                        <span style={{ fontSize: 17, color: TEXT_MUTED, lineHeight: 1.5 }}>{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </SmallCard>
              </AnimItem>

              <AnimItem delay={32}>
                <Tip color={CYAN}>
                  保険会社の個人情報保護規程に従い、不要になったアカウントは速やかに無効化・削除してください
                </Tip>
              </AnimItem>
            </div>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
