import { AbsoluteFill } from "remotion";
import { ChapterDivider, FONT } from "../../components/longform";

export const Ch6Divider: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#060a12", fontFamily: FONT }}>
      <ChapterDivider
        chapter="Chapter 6"
        title="BtoB・取引"
        sub="マーケットプレイス・受発注・商談・保険会社"
        color="#8b5cf6"
      />
    </AbsoluteFill>
  );
};
