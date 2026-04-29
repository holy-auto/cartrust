import { AbsoluteFill } from "remotion";
import {
  LongFormLayout,
  Label,
  Heading,
  AnimItem,
  FadeIn,
  SmallCard,
  Tip,
  FONT,
  TEXT,
  TEXT_MUTED,
  BLUE,
} from "../../components/longform";

const STEPS = [
  {
    title: "ダッシュボード or 予約ページから「🏃 飛び込み案件」をクリック",
  },
  {
    title: "案件タイトルを入力（デフォルト：「飛び込み案件 今日の日付」）",
  },
  {
    title: "開始ステータスを選択 — 🚪来店・受付 / 🔧作業中",
  },
  {
    title: "「案件を開始」→ /admin/jobs/[id] に自動リダイレクト",
  },
];

const LATER_ITEMS = [
  "顧客情報（検索 or 新規登録）",
  "車両情報（検索 or 新規登録）",
  "施工内容・備考",
  "証明書・請求書",
];

export const WalkInJob: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={16} total={25}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "start",
          }}
        >
          {/* Left column — step list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <Label>飛び込み案件 /admin/jobs/new</Label>
              <Heading size={52}>予約なしでも即ワークフロー化</Heading>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 4 }}>
              {STEPS.map((step, i) => (
                <AnimItem key={i} delay={4 + i * 10}>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: `${BLUE}20`,
                        border: `1px solid ${BLUE}50`,
                        color: BLUE,
                        fontSize: 15,
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
                    <div style={{ fontSize: 19, color: TEXT_MUTED, lineHeight: 1.55 }}>
                      <span style={{ fontWeight: 600, color: TEXT }}>Step {i + 1}：</span>
                      {step.title}
                    </div>
                  </div>
                </AnimItem>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <AnimItem delay={18}>
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
                  後から追加できるもの
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {LATER_ITEMS.map((item, i) => (
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
                      <span style={{ fontSize: 19, color: TEXT_MUTED, lineHeight: 1.5 }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </SmallCard>
            </AnimItem>

            <FadeIn delay={36}>
              <Tip>
                scheduled_date は自動的に今日の日付でセットされるため、入力不要です
              </Tip>
            </FadeIn>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
