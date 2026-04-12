/**
 * Polygon blockchain anchoring provider.
 *
 * Env: `POLYGON_ANCHOR_ENABLED` = "true" | "false"
 * Default: "false"
 *
 * Phase 3a: stub only — always returns unanchored.
 * Phase 3e: submits SHA256 hash to Polygon smart contract.
 */

import type { PolygonAnchorResult } from "./types";

function isEnabled(): boolean {
  return process.env.POLYGON_ANCHOR_ENABLED === "true";
}

const DISABLED_RESULT: PolygonAnchorResult = {
  txHash: null,
  anchored: false,
};

/**
 * Anchor a SHA256 hash to the Polygon blockchain.
 *
 * @param sha256 - The SHA256 hash of the image to anchor.
 * @returns PolygonAnchorResult with txHash and anchored status.
 */
export async function anchorToPolygon(_sha256: string): Promise<PolygonAnchorResult> {
  if (!isEnabled()) return DISABLED_RESULT;

  // Phase 3e: implement Polygon transaction here
  console.warn("[polygon] not yet implemented, skipping");
  return DISABLED_RESULT;
}
