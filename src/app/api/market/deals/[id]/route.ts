import { NextRequest, NextResponse } from "next/server";
import { getDealerSession } from "@/lib/market/auth";
import { updateDealStatus } from "@/lib/market/db";

type Params = { params: Promise<{ id: string }> };

// PATCH: 商談ステータス更新
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getDealerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const validStatuses = ["agreed", "completed", "cancelled"] as const;
  if (!validStatuses.includes(body.status)) {
    return NextResponse.json(
      { error: `status must be one of: ${validStatuses.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const deal = await updateDealStatus(id, session.dealer.id, body.status);
    return NextResponse.json({ deal });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message.includes("forbidden") || message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
