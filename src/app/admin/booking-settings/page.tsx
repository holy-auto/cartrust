import type { Metadata } from "next";
import BookingSettingsClient from "./BookingSettingsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "外部予約受付設定",
};

export default function BookingSettingsPage() {
  return <BookingSettingsClient />;
}
