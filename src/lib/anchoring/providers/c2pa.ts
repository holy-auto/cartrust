/**
 * C2PA content-provenance signing provider.
 *
 * Env: `C2PA_MODE` = "disabled" | "dev-signed" | "production"
 * Default: "disabled"
 *
 * Phase 3a: stub only — always returns unsigned defaults.
 * Phase 3b: imports @contentauth/c2pa-node and performs real signing.
 */

import type { C2paResult } from "./types";

export type C2paMode = "disabled" | "dev-signed" | "production";

function getMode(): C2paMode {
  const raw = process.env.C2PA_MODE;
  if (raw === "dev-signed" || raw === "production") return raw;
  return "disabled";
}

const DISABLED_RESULT: C2paResult = { manifestCid: null, verified: false };

/**
 * Sign an image buffer with a C2PA manifest.
 *
 * @returns C2paResult with manifestCid and verified status.
 */
export async function signC2pa(_buffer: Buffer, _mime: string): Promise<C2paResult> {
  const mode = getMode();
  if (mode === "disabled") return DISABLED_RESULT;

  // Phase 3b: implement dev-signed / production signing here
  console.warn(`[c2pa] mode=${mode} not yet implemented, skipping`);
  return DISABLED_RESULT;
}
