import { AbsoluteFill } from "remotion";
import {
  LongFormLayout,
  Label,
  Heading,
  BulletList,
  AnimItem,
  FadeIn,
  SmallCard,
  Warn,
  FONT,
  TEXT,
  TEXT_MUTED,
  BLUE,
} from "../../components/longform";

const MFA_ITEMS = [
  "Supabase Auth MFA API を使用した TOTP 認証",
  "Google Authenticator / 1Password / Authy に対応",
  "QR コード表示 → 認証アプリで読取 → 6桁コードで有効化",
  "QR が読めない環境向けにシークレット手入力にも対応",
  "未検証の factor は初期化時に自動クリーンアップ",
];

const BILLING_ITEMS = [
  "Stripe サブスクリプション管理",
  "プラン確認・アップグレード・ダウングレード",
  "請求書のダウンロード",
  "キャンセル（Stripe Customer Portal）",
];

export const SecurityBilling: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={25} total={25}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "start",
          }}
        >
          {/* Left column — 2FA */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <Label>設定</Label>
              <Heading size={52}>セキュリティ &amp; プラン管理</Heading>
            </div>
            <div>
              <div
                style={{
                  fontSize: 16,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase" as const,
                  color: "#ef4444",
                  fontFamily: "monospace",
                  marginBottom: 14,
                }}
              >
                2 要素認証 /admin/settings/security
              </div>
              <BulletList items={MFA_ITEMS} color="#ef4444" startDelay={4} gap={12} />
            </div>
          </div>

          {/* Right column — プラン・課金 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <AnimItem delay={14}>
              <SmallCard>
                <div
                  style={{
                    fontSize: 16,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase" as const,
                    color: BLUE,
                    fontFamily: "monospace",
                    marginBottom: 16,
                  }}
                >
                  プラン・課金 /admin/billing
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {BILLING_ITEMS.map((item, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: BLUE,
                          opacity: 0.7,
                          flexShrink: 0,
                          marginTop: 9,
                        }}
                      />
                      <span style={{ fontSize: 18, color: TEXT_MUTED, lineHeight: 1.5 }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </SmallCard>
            </AnimItem>

            <FadeIn delay={30}>
              <Warn>
                2FAを有効化すると、ログイン時にパスワードに加えて認証アプリのコードが必要になります。認証アプリのバックアップコードは必ず安全な場所に保存してください
              </Warn>
            </FadeIn>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
