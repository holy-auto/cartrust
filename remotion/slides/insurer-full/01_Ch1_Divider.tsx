import React from "react";
import { AbsoluteFill } from "remotion";
import { ChapterDivider, FONT } from "../../components/longform";

export const InsurerCh1Divider: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <ChapterDivider
        chapter="Chapter 1"
        title="証明書検索・照会"
        sub="検索・フィルタ・詳細・ウォッチリスト"
        color="#06b6d4"
      />
    </AbsoluteFill>
  );
};
