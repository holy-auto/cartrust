import { Metadata } from "next";
import WorkflowTemplatesClient from "./WorkflowTemplatesClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ワークフローテンプレート | Ledra",
};

export default function WorkflowTemplatesPage() {
  return <WorkflowTemplatesClient />;
}
