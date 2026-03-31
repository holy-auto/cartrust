/**
 * LedraLogo – 共通ロゴコンポーネント
 * 青グラデーション背景に白の「L」を表示する正方形アイコン。
 * size="sm"  → 28px (サイドバー用)
 * size="md"  → 40px (ログイン・サインアップ等)
 * size="lg"  → 48px (ランディングページ等)
 */

interface Props {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: { box: "w-7 h-7", text: "text-sm", radius: "rounded-lg" },
  md: { box: "w-10 h-10", text: "text-lg", radius: "rounded-xl" },
  lg: { box: "w-12 h-12", text: "text-xl", radius: "rounded-2xl" },
};

export default function LedraLogo({ size = "md", className = "" }: Props) {
  const s = SIZE_MAP[size];
  return (
    <div
      className={`${s.box} ${s.radius} flex items-center justify-center shrink-0 ${className}`}
      style={{ background: "linear-gradient(135deg, #4d9fff 0%, #5856d6 100%)" }}
      aria-label="Ledra"
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[62.5%] h-[62.5%]"
        aria-hidden="true"
      >
        {/* L の字をパスで描画（太め・視認性重視） */}
        <path d="M8 6 L8 26 L24 26 L24 21 L13 21 L13 6 Z" fill="white" />
      </svg>
    </div>
  );
}
