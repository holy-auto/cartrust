import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT, TEXT, TEXT_MUTED, TEXT_DIM } from "../../components/longform";

const CYAN = "#06b6d4";

const CHAPTERS = [
  "1. 証明書検索・照会",
  "2. 案件管理",
  "3. 分析・レポート",
  "4. チーム管理",
];

export const InsurerFullIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (delay: number) =>
    spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 18 }, durationInFrames: 22 });
  const lineW = interpolate(Math.max(0, frame - 60), [0, 35], [0, 100], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "#060a12",
        fontFamily: FONT,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 28,
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px)",
          backgroundSize: "80px 80px",
          pointerEvents: "none",
        }}
      />

      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${CYAN}1c 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Label */}
      <div
        style={{
          opacity: s(0),
          fontSize: 20,
          letterSpacing: "0.3em",
          textTransform: "uppercase" as const,
          color: CYAN,
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        保険会社ポータル — 完全ガイド
      </div>

      {/* Big title */}
      <div
        style={{
          opacity: s(12),
          transform: `scale(${s(12)})`,
          position: "relative",
        }}
      >
        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            color: TEXT,
            letterSpacing: "-3px",
            lineHeight: 1.1,
            whiteSpace: "pre-line",
          }}
        >
          {"Insurer\nポータル"}
        </div>
      </div>

      {/* Subtitle */}
      <div style={{ opacity: s(28), position: "relative", maxWidth: 760 }}>
        <p style={{ fontSize: 26, color: TEXT_MUTED, lineHeight: 1.6, margin: 0 }}>
          証明書照会から案件管理・チーム運用まで完全解説
        </p>
      </div>

      {/* Divider line */}
      <div
        style={{
          width: lineW,
          height: 2,
          background: `${CYAN}70`,
          borderRadius: 2,
          position: "relative",
        }}
      />

      {/* Chapter pills */}
      <div
        style={{
          opacity: s(44),
          position: "relative",
          display: "flex",
          flexWrap: "wrap" as const,
          gap: 12,
          justifyContent: "center",
          maxWidth: 860,
        }}
      >
        {CHAPTERS.map((ch, i) => (
          <div
            key={i}
            style={{
              padding: "8px 20px",
              borderRadius: 100,
              background: `${CYAN}18`,
              border: `1px solid ${CYAN}40`,
              color: TEXT_MUTED,
              fontSize: 18,
              fontFamily: "monospace",
            }}
          >
            {ch}
          </div>
        ))}
      </div>

      {/* Running time */}
      <div
        style={{
          opacity: s(56),
          position: "relative",
          fontSize: 18,
          color: TEXT_DIM,
          fontFamily: "monospace",
          letterSpacing: "0.15em",
        }}
      >
        約 12 分
      </div>
    </AbsoluteFill>
  );
};
