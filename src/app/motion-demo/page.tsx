import type { Metadata } from "next";
import { MotionDemoClient } from "./MotionDemoClient";

export const metadata: Metadata = {
  title: "Motion Demo | Ledra",
  description: "モーションデザインのプロトタイプ",
  robots: { index: false, follow: false },
};

export default function MotionDemoPage() {
  return <MotionDemoClient />;
}
