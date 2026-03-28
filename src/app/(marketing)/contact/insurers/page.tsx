import { redirect } from "next/navigation";

export const metadata = {
  title: "保険会社向け資料請求",
  description: "保険会社向けの資料請求。",
};

export default function ContactInsurersPage() {
  redirect("/contact");
}
