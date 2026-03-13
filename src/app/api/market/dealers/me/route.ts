import { NextResponse } from "next/server";
import { getDealerSession } from "@/lib/market/auth";

export async function GET() {
  const session = await getDealerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ dealer: session.dealer, dealer_user: session.dealerUser });
}
