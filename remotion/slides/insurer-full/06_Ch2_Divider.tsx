import React from "react";
import { AbsoluteFill } from "remotion";
import { ChapterDivider, FONT } from "../../components/longform";

export const InsurerCh2Divider: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <ChapterDivider
        chapter="Chapter 2"
        title="案件管理"
        sub="作成・操作・テンプレート・自動振り分け・SLA"
        color="#06b6d4"
      />
    </AbsoluteFill>
  );
};
