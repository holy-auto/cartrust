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

const FEATURE_ITEMS = [
  "予約の作成：日付・時間・施工内容・担当者を入力",
  "ステータス管理：確認済み → 到着 → 作業中 → 完了",
  "Google Calendar 連携：予約を自動同期（設定が必要）",
  "日付・ステータス・担当者でフィルタ・絞り込み",
  "予約キャンセル・編集は詳細パネルから",
  "詳細パネルの「🧭 案件ワークフローを開く」で /admin/jobs/[id] へ遷移",
];

const CALENDAR_STEPS = [
  "/admin/settings で Google アカウントと連携",
  "予約を作成すると自動的にカレンダーに追加",
  "カレンダー上の変更は Ledra に反映されない（一方向同期）",
];

export const ReservationMgmt: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={14} total={25}>
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
              <Label>予約管理 /admin/reservations</Label>
              <Heading size={50}>予約登録・管理の全機能</Heading>
            </div>
            <div style={{ marginTop: 4 }}>
              <BulletList items={FEATURE_ITEMS} startDelay={4} gap={12} />
            </div>
          </div>

          {/* Right column */}
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
                  Google Calendar 連携手順
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {CALENDAR_STEPS.map((step, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: `${BLUE}22`,
                          border: `1px solid ${BLUE}50`,
                          color: BLUE,
                          fontSize: 13,
                          fontWeight: 700,
                          fontFamily: "monospace",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        {i + 1}
                      </div>
                      <span style={{ fontSize: 18, color: TEXT_MUTED, lineHeight: 1.55 }}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </SmallCard>
            </AnimItem>

            <FadeIn delay={28}>
              <Tip>
                ヘッダーの「🏃 飛び込み案件」ボタンから /admin/jobs/new に直接アクセスできます
              </Tip>
            </FadeIn>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
