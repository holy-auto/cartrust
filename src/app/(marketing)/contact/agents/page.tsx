import { redirect } from "next/navigation";

export const metadata = {
  title: "代理店向け資料請求",
  description: "代理店向けの資料請求。",
};

export default function ContactAgentsPage() {
  redirect("/contact");
}
