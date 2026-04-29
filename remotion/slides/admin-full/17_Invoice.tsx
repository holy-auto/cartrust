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

const CREATE_METHODS = [
  {
    title: "案件ワークフローから（推奨）",
    desc: "顧客・車両・施工内容が自動入力",
    color: BLUE,
  },
  {
    title: "/admin/invoices から直接作成",
    desc: "顧客を検索して手動入力",
    color: "#06b6d4",
  },
  {
    title: "合算請求",
    desc: "複数案件・証明書をまとめて1枚の請求書に",
    color: "#8b5cf6",
  },
];

const STATUSES = [
  { label: "下書き", color: "#6b7280", desc: "作成直後の状態" },
  { label: "送信済み", color: "#3b82f6", desc: "顧客へ共有済み" },
  { label: "支払済み", color: "#22c55e", desc: "入金確認済み" },
  { label: "期限超過", color: "#ef4444", desc: "支払期日を超過" },
];

const OUTPUT_ITEMS = [
  "PDF 出力（ロゴ・テンプレート反映）",
  "共有リンク生成（ShareDocumentModal）",
  "メール送信（Resend 連携）",
];

export const Invoice: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <LongFormLayout slideNo={18} total={25}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Header */}
          <div>
            <Label>請求・帳票 /admin/invoices</Label>
            <Heading size={52}>請求書の全機能</Heading>
          </div>

          {/* Three columns */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 28,
              alignItems: "start",
            }}
          >
            {/* Col 1 — 作成方法 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  fontSize: 16,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase" as const,
                  color: BLUE,
                  fontFamily: "monospace",
                  marginBottom: 6,
                }}
              >
                作成方法
              </div>
              {CREATE_METHODS.map((method, i) => (
                <AnimItem key={i} delay={4 + i * 8}>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${method.color}28`,
                      borderRadius: 12,
                      padding: "12px 16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 600,
                        color: method.color,
                        marginBottom: 4,
                      }}
                    >
                      {method.title}
                    </div>
                    <div style={{ fontSize: 16, color: TEXT_MUTED, lineHeight: 1.5 }}>
                      {method.desc}
                    </div>
                  </div>
                </AnimItem>
              ))}
            </div>

            {/* Col 2 — ステータス管理 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  fontSize: 16,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase" as const,
                  color: BLUE,
                  fontFamily: "monospace",
                  marginBottom: 6,
                }}
              >
                ステータス管理
              </div>
              {STATUSES.map((s, i) => (
                <AnimItem key={i} delay={8 + i * 8}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        padding: "4px 14px",
                        borderRadius: 100,
                        background: `${s.color}18`,
                        border: `1px solid ${s.color}40`,
                        color: s.color,
                        fontSize: 16,
                        fontWeight: 600,
                        whiteSpace: "nowrap" as const,
                        flexShrink: 0,
                      }}
                    >
                      {s.label}
                    </div>
                    <span style={{ fontSize: 16, color: TEXT_MUTED }}>{s.desc}</span>
                  </div>
                </AnimItem>
              ))}
            </div>

            {/* Col 3 — 出力・共有 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  fontSize: 16,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase" as const,
                  color: BLUE,
                  fontFamily: "monospace",
                  marginBottom: 6,
                }}
              >
                出力・共有
              </div>
              <AnimItem delay={16}>
                <SmallCard>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {OUTPUT_ITEMS.map((item, i) => (
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
                        <span style={{ fontSize: 17, color: TEXT_MUTED, lineHeight: 1.5 }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </SmallCard>
              </AnimItem>
            </div>
          </div>

          {/* Tip */}
          <FadeIn delay={40}>
            <Tip>
              合算請求書では、複数の施工明細が1枚の PDF にまとまります。顧客の月次精算に便利です
            </Tip>
          </FadeIn>
        </div>
      </LongFormLayout>
    </AbsoluteFill>
  );
};
