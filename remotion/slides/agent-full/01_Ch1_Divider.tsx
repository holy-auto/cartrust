import React from "react";
import { AbsoluteFill } from "remotion";
import { ChapterDivider, FONT } from "../../components/longform";

export const AgentCh1Divider: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <ChapterDivider
        chapter="Chapter 1"
        title="申請・アカウント設定"
        sub="パートナー申請・審査・契約・初期設定"
        color="#8b5cf6"
      />
    </AbsoluteFill>
  );
};
