/**
 * テナント秘密情報 (LINE / Square) の **DB 書き込み・読み出しヘルパー**。
 *
 * STEP 3 / 3: 平文列を DROP したため、書き込み・読み出しともに
 * 暗号化列のみを扱う。
 *
 * ## SECRET_ENCRYPTION_KEY が未設定の場合
 *
 *  - 書き込みは throw する。テナント機微情報を平文 DB に書き込む経路は
 *    既に存在しないため、env 未設定環境では設定エラーとして即座に失敗
 *    させて気付けるようにする。
 */

import { encryptSecret, decryptSecret } from "./secretBox";
import { logger } from "@/lib/logger";

/**
 * 書き込み用の payload を生成する。
 *
 * @example
 *   const { ciphertext } = await buildSecretWrite(secretValue);
 *   await admin.from("tenants").update({
 *     line_channel_secret_ciphertext: ciphertext,
 *   }).eq("id", tenantId);
 *
 * - value が null / 空文字なら ciphertext は null (clear 操作)。
 * - SECRET_ENCRYPTION_KEY 未設定なら encryptSecret が throw する。
 */
export async function buildSecretWrite(value: string | null | undefined): Promise<{ ciphertext: string | null }> {
  if (!value) return { ciphertext: null };
  const ciphertext = await encryptSecret(value);
  return { ciphertext };
}

/**
 * 暗号化列を読み出して平文を返す。
 *
 * @example
 *   const channelSecret = await readSecret(
 *     row.line_channel_secret_ciphertext,
 *     "tenants.line_channel_secret",
 *   );
 *
 * @param ciphertext DB から取得した暗号化列の値 (nullable)
 * @param label      ログ用ラベル (テーブル/列名など)
 * @returns 復号成功した平文、復号失敗 / null なら null
 */
export async function readSecret(ciphertext: string | null | undefined, label: string): Promise<string | null> {
  if (!ciphertext) return null;
  try {
    return await decryptSecret(ciphertext);
  } catch (err) {
    logger.error("tenantSecrets: decryption failed", err, { label });
    return null;
  }
}
