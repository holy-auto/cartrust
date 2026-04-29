import React from "react";
import { AbsoluteFill } from "remotion";
import { ChapterDivider, FONT } from "../../components/longform";

export const InsurerCh4Divider: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <ChapterDivider
        chapter="Chapter 4"
        title="チーム管理・セキュリティ"
        sub="ユーザー管理・権限・操作ログ・通知設定"
        color="#06b6d4"
      />
    </AbsoluteFill>
  );
};
