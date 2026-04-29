import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from "remotion";
import {
  LongFormLayout,
  Label,
  Heading,
  AnimItem,
  FadeIn,
  SmallCard,
  Warn,
  FONT,
  TEXT,
  TEXT_MUTED,
  TEXT_DIM,
  BLUE,
} from "../../components/longform";

const STATUSES = [
  { key: "confirmed", label: "確認済み", color: "#3b82f6" },
  { key: "arrived", label: "到着", color: "#06b6d4" },
  { key: "in_progress", label: "作業中", color: "#f59e0b" },
  { key: "completed", label: "完了", color: "#22c55e" },
];

const TABS = [
  {
    title: "サマリタブ",
    desc: "予約日時・概算金額・備考・施工メニュー一覧",
    color: BLUE,
  },
  {
    title: "顧客・車両タブ",
    desc: "紐付く顧客・車両の詳細カード",
    color: "#06b6d4",
  },
  {
    title: "証明書タブ",
    desc: "この案件の証明書一覧（public_id / ステータス / 発行日 / 金額）",
    color: "#8b5cf6",
  },
  {
    title: "請求・見積タブ",
    desc: "請求書・見積書・領収書・納品書を集約",
    color: "#22c55e",
  },
];

const NEXT_ACTIONS = [
  { icon: "🪪", label: "証明書を発行", desc: "vehicle_id & customer_id 自動引継ぎ" },
  { icon: "💰", label: "請求書を作成", desc: "金額・顧客情報を自動反映" },
  { icon: "👤", label: "顧客詳細", desc: "/admin/customers/[id] へ" },
  { icon: "🚗", label: "車両詳細", desc: "/admin/vehicles/[id] へ" },
];

export const JobWorkflow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={15} total={25}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Header */}
          <div>
            <Label>案件ワークフロー /admin/jobs/[id]</Label>
            <Heading size={48}>統合ワークスペースの全機能</Heading>
          </div>

          {/* Status stepper */}
          <AnimItem delay={6}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 0,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "14px 20px",
              }}
            >
              {STATUSES.map((s, i) => (
                <div key={s.key} style={{ display: "flex", alignItems: "center", flex: i < STATUSES.length - 1 ? 1 : undefined }}>
                  <div
                    style={{
                      padding: "6px 18px",
                      borderRadius: 100,
                      background: `${s.color}20`,
                      border: `1px solid ${s.color}50`,
                      color: s.color,
                      fontSize: 17,
                      fontWeight: 600,
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    {s.label}
                  </div>
                  {i < STATUSES.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: 1,
                        background: "rgba(255,255,255,0.12)",
                        margin: "0 8px",
                        position: "relative",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          right: -6,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: TEXT_DIM,
                          fontSize: 14,
                        }}
                      >
                        ▶
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </AnimItem>

          {/* Two columns */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 40,
              alignItems: "start",
            }}
          >
            {/* Left — Tab cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {TABS.map((tab, i) => (
                <AnimItem key={i} delay={14 + i * 8}>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${tab.color}25`,
                      borderRadius: 12,
                      padding: "12px 18px",
                      display: "flex",
                      gap: 14,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: tab.color,
                        flexShrink: 0,
                        marginTop: 7,
                      }}
                    />
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: TEXT, marginBottom: 3 }}>
                        {tab.title}
                      </div>
                      <div style={{ fontSize: 16, color: TEXT_MUTED, lineHeight: 1.5 }}>
                        {tab.desc}
                      </div>
                    </div>
                  </div>
                </AnimItem>
              ))}
            </div>

            {/* Right — Next action panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <AnimItem delay={20}>
                <SmallCard>
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
                    次アクションパネル
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {NEXT_ACTIONS.map((action, i) => (
                      <div
                        key={i}
                        style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
                      >
                        <span style={{ fontSize: 18, flexShrink: 0 }}>{action.icon}</span>
                        <div>
                          <span style={{ fontSize: 18, color: TEXT, fontWeight: 600 }}>
                            {action.label}
                          </span>
                          <span style={{ fontSize: 16, color: TEXT_MUTED, marginLeft: 8 }}>
                            — {action.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </SmallCard>
              </AnimItem>

              <FadeIn delay={36}>
                <Warn>
                  有効な証明書がある場合は「(発行済)」、入金済み請求がある場合は「(入金済あり)」が表示され過剰発行を防ぎます
                </Warn>
              </FadeIn>
            </div>
          </div>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
