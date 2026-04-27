import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { buildSecretWrite, readSecret } from "../tenantSecrets";
import { encryptSecret } from "../secretBox";

const TEST_KEY = "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8=";

describe("tenantSecrets", () => {
  let originalKey: string | undefined;
  beforeEach(() => {
    originalKey = process.env.SECRET_ENCRYPTION_KEY;
    process.env.SECRET_ENCRYPTION_KEY = TEST_KEY;
  });
  afterEach(() => {
    if (originalKey === undefined) delete process.env.SECRET_ENCRYPTION_KEY;
    else process.env.SECRET_ENCRYPTION_KEY = originalKey;
  });

  describe("buildSecretWrite", () => {
    it("returns ciphertext when key is set", async () => {
      const out = await buildSecretWrite("super-secret");
      expect(out.ciphertext).toMatch(/^v1\..+\..+$/);
    });

    it("returns null ciphertext for empty input", async () => {
      expect(await buildSecretWrite(null)).toEqual({ ciphertext: null });
      expect(await buildSecretWrite(undefined)).toEqual({ ciphertext: null });
      expect(await buildSecretWrite("")).toEqual({ ciphertext: null });
    });

    it("throws when key is missing", async () => {
      delete process.env.SECRET_ENCRYPTION_KEY;
      await expect(buildSecretWrite("must-encrypt")).rejects.toThrow(/SECRET_ENCRYPTION_KEY/);
    });
  });

  describe("readSecret", () => {
    it("decrypts a ciphertext envelope", async () => {
      const cipher = await encryptSecret("encrypted-value");
      const result = await readSecret(cipher, "test");
      expect(result).toBe("encrypted-value");
    });

    it("returns null when ciphertext is null/undefined", async () => {
      expect(await readSecret(null, "test")).toBeNull();
      expect(await readSecret(undefined, "test")).toBeNull();
      expect(await readSecret("", "test")).toBeNull();
    });

    it("returns null and logs when decryption fails (e.g. wrong key)", async () => {
      const cipher = await encryptSecret("encrypted-value");
      // 鍵を別のものに変える → 復号失敗
      process.env.SECRET_ENCRYPTION_KEY = "/////////////////////////////////////////w==";
      const result = await readSecret(cipher, "test");
      expect(result).toBeNull();
    });

    it("returns null for malformed envelopes", async () => {
      expect(await readSecret("not-an-envelope", "test")).toBeNull();
      expect(await readSecret("v1.only-one-segment", "test")).toBeNull();
    });
  });
});
