import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Ledra — 施工証明をデジタルで";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#18181b",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        padding: "72px 80px",
        fontFamily: "sans-serif",
      }}
    >
      {/* Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#27272a",
          border: "1px solid #3f3f46",
          borderRadius: 999,
          padding: "8px 20px",
          marginBottom: 28,
        }}
      >
        <span style={{ color: "#a1a1aa", fontSize: 18, letterSpacing: 2 }}>施工店・保険会社向けSaaS</span>
      </div>

      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginBottom: 20,
        }}
      >
        {/* L icon */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 18,
            background: "linear-gradient(135deg, #4d9fff 0%, #5856d6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="50" height="50" viewBox="0 0 32 32" fill="none">
            <path d="M8 6 L8 26 L24 26 L24 21 L13 21 L13 6 Z" fill="white" />
          </svg>
        </div>
        <span
          style={{
            color: "#ffffff",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1,
          }}
        >
          Ledra
        </span>
      </div>

      {/* Tagline */}
      <div
        style={{
          color: "#a1a1aa",
          fontSize: 30,
          lineHeight: 1.5,
        }}
      >
        施工証明をデジタルで。 施工店と保険会社をつなぐプラットフォーム。
      </div>

      {/* Domain */}
      <div
        style={{
          position: "absolute",
          top: 72,
          right: 80,
          color: "#52525b",
          fontSize: 22,
        }}
      >
        ledra.co.jp
      </div>
    </div>,
    size,
  );
}
