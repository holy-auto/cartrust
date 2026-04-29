import React from "react";
import { AbsoluteFill } from "remotion";
import { ChapterDivider, FONT } from "../../components/longform";

export const InsurerCh3Divider: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <ChapterDivider
        chapter="Chapter 3"
        title="分析・レポート"
        sub="検索分析・案件統計・施工店別レポート"
        color="#06b6d4"
      />
    </AbsoluteFill>
  );
};
