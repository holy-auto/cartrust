import { AbsoluteFill } from "remotion";
import { ChapterDivider, FONT } from "../../components/longform";

export const Ch5Divider: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <ChapterDivider
        chapter="Chapter 5"
        title="請求・会計"
        sub="請求書・POS・Square・経営分析"
        color="#22c55e"
      />
    </AbsoluteFill>
  );
};
