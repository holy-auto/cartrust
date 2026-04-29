import React from "react";
import { AbsoluteFill } from "remotion";
import { ChapterDivider, FONT } from "../../components/longform";

export const AgentCh4Divider: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <ChapterDivider
        chapter="Chapter 4"
        title="成長ツール・サポート"
        sub="研修・FAQ・営業資料・サポートチケット・通知"
        color="#8b5cf6"
      />
    </AbsoluteFill>
  );
};
