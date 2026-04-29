import { AbsoluteFill } from "remotion";
import {
  LongFormLayout,
  Label,
  Heading,
  BulletList,
  AnimItem,
  FadeIn,
  SmallCard,
  Tip,
  FONT,
  TEXT,
  TEXT_MUTED,
  BLUE,
} from "../../components/longform";

const SETTINGS_ITEMS = [
  "店舗名・住所・電話番号・営業時間",
  "ロゴ設定 /admin/logo（証明書・PDF に反映）",
  "ブランド証明書テンプレート /admin/template-options",
  "マルチ店舗管理 /admin/stores（複数店舗を1アカウントで管理）",
  "操作履歴 /admin/audit（全操作ログ）",
];

const PERMISSION_GROUPS = [
  {
    category: "閲覧系",
    color: "#3b82f6",
    perms: "dashboard:view / certificates:view / vehicles:view 等",
  },
  {
    category: "操作系",
    color: "#06b6d4",
    perms: "certificates:create / menu_items:manage / logo:manage 等",
  },
  {
    category: "管理系",
    color: "#8b5cf6",
    perms: "members:view / settings:view / billing:view 等",
  },
  {
    category: "運営系",
    color: "#ef4444",
    perms: "platform:operations / audit:view",
  },
];

export const SettingsMembers: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={24} total={25}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "start",
          }}
        >
          {/* Left column — 店舗設定 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <Label>設定</Label>
              <Heading size={52}>店舗設定 &amp; メンバー管理</Heading>
            </div>
            <div>
              <div
                style={{
                  fontSize: 16,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase" as const,
                  color: BLUE,
                  fontFamily: "monospace",
                  marginBottom: 14,
                }}
              >
                店舗設定 /admin/settings
              </div>
              <BulletList items={SETTINGS_ITEMS} startDelay={4} gap={12} />
            </div>
          </div>

          {/* Right column — メンバー管理 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <AnimItem delay={12}>
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
                  メンバー管理 /admin/members
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {PERMISSION_GROUPS.map((group, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div
                        style={{
                          padding: "3px 12px",
                          borderRadius: 100,
                          background: `${group.color}18`,
                          border: `1px solid ${group.color}40`,
                          color: group.color,
                          fontSize: 14,
                          fontWeight: 600,
                          whiteSpace: "nowrap" as const,
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        {group.category}
                      </div>
                      <span
                        style={{
                          fontSize: 15,
                          color: TEXT_MUTED,
                          lineHeight: 1.55,
                          fontFamily: "monospace",
                        }}
                      >
                        {group.perms}
                      </span>
                    </div>
                  ))}
                </div>
              </SmallCard>
            </AnimItem>

            <FadeIn delay={30}>
              <Tip>
                スタッフには必要最小限の権限のみを付与してください（最小権限の原則）
              </Tip>
            </FadeIn>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
