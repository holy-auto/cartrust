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

const INVITE_BULLETS = [
  "メールアドレス入力で個別招待",
  "CSV ファイルで一括招待（大規模チーム向け）",
  "招待メールに有効期限（7日間）あり",
  "承認後にロール（権限）を設定",
  "メンバー一覧から随時権限変更・無効化",
];

const ROLES = [
  {
    icon: "👁️",
    label: "閲覧のみ",
    desc: "証明書検索・照会のみ。案件は作成不可",
  },
  {
    icon: "📋",
    label: "案件操作",
    desc: "照会 + 案件作成・更新・メッセージ",
  },
  {
    icon: "⚙️",
    label: "管理者",
    desc: "全機能 + ユーザー管理・設定変更",
  },
];

export const InsurerUsers: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={16} total={18}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <Label color={CYAN}>ユーザー管理 /insurer/users</Label>
            <Heading size={52}>チームメンバーの管理</Heading>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
            {/* Left — invite */}
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
                招待方法
              </div>
              <BulletList items={INVITE_BULLETS} color={CYAN} startDelay={8} />
            </div>

            {/* Right — roles */}
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
                    権限の種類
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {ROLES.map((role, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 20, flexShrink: 0 }}>{role.icon}</span>
                        <div>
                          <div style={{ fontSize: 18, color: CYAN, fontWeight: 600, marginBottom: 2 }}>{role.label}</div>
                          <div style={{ fontSize: 16, color: TEXT_MUTED, lineHeight: 1.5 }}>{role.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </SmallCard>
              </AnimItem>

              <AnimItem delay={32}>
                <Tip color={CYAN}>
                  査定担当者には「案件操作」権限、管理職には「管理者」権限を付与するのが一般的な運用です
                </Tip>
              </AnimItem>
            </div>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
