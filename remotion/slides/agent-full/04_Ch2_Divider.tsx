import React from "react";
import { AbsoluteFill } from "remotion";
import { ChapterDivider, FONT } from "../../components/longform";

export const AgentCh2Divider: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <ChapterDivider
        chapter="Chapter 2"
        title="紹介活動"
        sub="リンク作成・紹介登録・ステータス追跡・コツ"
        color="#8b5cf6"
      />
    </AbsoluteFill>
  );
};
