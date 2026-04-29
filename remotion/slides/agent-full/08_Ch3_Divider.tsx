import React from "react";
import { AbsoluteFill } from "remotion";
import { ChapterDivider, FONT } from "../../components/longform";

export const AgentCh3Divider: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <ChapterDivider
        chapter="Chapter 3"
        title="コミッション管理"
        sub="明細・入金確認・レポート・ランキング・キャンペーン"
        color="#8b5cf6"
      />
    </AbsoluteFill>
  );
};
