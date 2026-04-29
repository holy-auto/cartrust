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
  TEXT_MUTED,
} from "../../components/longform";

const VIOLET = "#8b5cf6";

const TRACKING_ITEMS = [
  "紹介一覧でステータス・日付・施工店名でフィルタ",
  "各紹介の詳細ページで進捗タイムラインを確認",
  "運営からのコメント・更新情報をリアルタイムで受信",
  "不成立案件は理由を確認してフォローアップに活用",
  "成約案件からコミッション確定通知を受け取る",
];

const SITUATIONS = [
  { icon: "⏳", text: "「運営コンタクト中」が1週間以上: サポートに問い合わせ" },
  { icon: "❌", text: "「不成立」の理由が「タイミング」: 3ヶ月後に再紹介" },
  { icon: "❌", text: "「不成立」の理由が「機能不足」: 運営に要望として伝える" },
  { icon: "✅", text: "成約後も施工店と関係を維持: 追加紹介・紹介の紹介へ" },
];

export const ReferralTracking: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={8} total={16}>
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
              <Label color={VIOLET}>紹介管理 /agent/referrals</Label>
              <Heading size={52}>紹介案件の追跡と進捗管理</Heading>
            </div>
            <div style={{ marginTop: 8 }}>
              <BulletList items={TRACKING_ITEMS} color={VIOLET} startDelay={8} />
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
                  よくある状況と対処法
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {SITUATIONS.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                      <span style={{ fontSize: 17, color: TEXT_MUTED, lineHeight: 1.5 }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </SmallCard>
            </AnimItem>

            <AnimItem delay={36}>
              <Warn>
                同一施工店への二重紹介は無効になります。登録前に一覧で確認してください
              </Warn>
            </AnimItem>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
