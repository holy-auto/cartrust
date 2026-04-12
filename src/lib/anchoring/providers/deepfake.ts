/**
 * Deepfake detection provider.
 *
 * Env: `DEEPFAKE_PROVIDER` = "disabled" | "hive" | "sensity"
 * Default: "disabled"
 *
 * Phase 3a: stub only — always returns null (not evaluated).
 * Phase 3c: calls Hive AI or Sensity API.
 */

import type { DeepfakeResult } from "./types";

export type DeepfakeProvider = "disabled" | "hive" | "sensity";

function getProvider(): DeepfakeProvider {
  const raw = process.env.DEEPFAKE_PROVIDER;
  if (raw === "hive" || raw === "sensity") return raw;
  return "disabled";
}

const DISABLED_RESULT: DeepfakeResult = { score: null, verdict: null };

/**
 * Check an image buffer for deepfake indicators.
 *
 * @returns DeepfakeResult with score and verdict.
 */
export async function checkDeepfake(_buffer: Buffer): Promise<DeepfakeResult> {
  const provider = getProvider();
  if (provider === "disabled") return DISABLED_RESULT;

  // Phase 3c: implement hive / sensity API calls here
  console.warn(`[deepfake] provider=${provider} not yet implemented, skipping`);
  return DISABLED_RESULT;
}
