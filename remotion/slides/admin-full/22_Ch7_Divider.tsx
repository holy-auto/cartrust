import { AbsoluteFill } from "remotion";
import { ChapterDivider, FONT } from "../../components/longform";

export const Ch7Divider: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <ChapterDivider
        chapter="Chapter 7"
        title="設定・セキュリティ"
        sub="店舗設定・メンバー・2FA・プラン管理"
        color="#ef4444"
      />
    </AbsoluteFill>
  );
};
