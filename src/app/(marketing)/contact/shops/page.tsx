import { redirect } from "next/navigation";

export const metadata = {
  title: "施工店向け資料請求",
  description: "施工店向けの資料請求。",
};

export default function ContactShopsPage() {
  redirect("/contact");
}
