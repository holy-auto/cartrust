/**
 * GET /api/marketing/resources/[key]/pdf
 *
 * Streams a generated PDF for the requested marketing resource. The set of
 * available resources is registered in `src/lib/marketing/resourcePdf.tsx`.
 * Resources not present in the registry return 404.
 *
 * Only "complete" resources with a production-ready PDF document are wired
 * in. Other cards on `/resources` still collect leads but don't auto-start a
 * download until their PDF is authored.
 */

import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { apiNotFound, apiInternalError } from "@/lib/api/response";
import { checkRateLimit } from "@/lib/api/rateLimit";
import { RESOURCE_PDFS } from "@/lib/marketing/resourcePdf";

export const runtime = "nodejs";

export async function GET(request: NextRequest, ctx: { params: Promise<{ key: string }> }) {
  // Public PDF generation is server-expensive (@react-pdf/renderer) — clamp
  // to 10 req / 60s / IP so bulk download abuse cannot DoS the origin.
  const limited = await checkRateLimit(request, "auth");
  if (limited) return limited;

  const { key } = await ctx.params;
  const entry = RESOURCE_PDFS[key];
  if (!entry) {
    return apiNotFound("Unknown resource key");
  }

  try {
    const buffer = await renderToBuffer(entry.doc());
    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${entry.filename}"`,
        "Cache-Control": "public, max-age=600, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    return apiInternalError(err, `resource pdf ${key}`);
  }
}
