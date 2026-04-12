import { describe, it, expect, vi, beforeEach } from "vitest";

// Dynamically import so env vars take effect per-test
async function loadProviders() {
  // Clear module cache to pick up env changes
  vi.resetModules();
  return import("../index");
}

async function loadGrade() {
  vi.resetModules();
  return import("../../authenticityGrade");
}

describe("invokeAllUploadProviders", () => {
  const dummyBuffer = Buffer.from("test-image-data");

  beforeEach(() => {
    // Reset all provider env vars to disabled
    delete process.env.C2PA_MODE;
    delete process.env.DEEPFAKE_PROVIDER;
    delete process.env.DEVICE_ATTESTATION_ENABLED;
    delete process.env.POLYGON_ANCHOR_ENABLED;
  });

  it("returns safe defaults when all providers are disabled", async () => {
    const { invokeAllUploadProviders } = await loadProviders();
    const result = await invokeAllUploadProviders(dummyBuffer, "image/jpeg", "abc123");

    expect(result.c2pa).toEqual({ manifestCid: null, verified: false });
    expect(result.deepfake).toEqual({ score: null, verdict: null });
    expect(result.deviceAttestation).toEqual({ provider: "none", verified: false });
    expect(result.polygon).toEqual({ txHash: null, anchored: false });
  });

  it("logs warning for unimplemented C2PA mode", async () => {
    process.env.C2PA_MODE = "dev-signed";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { invokeAllUploadProviders } = await loadProviders();
    const result = await invokeAllUploadProviders(dummyBuffer, "image/jpeg", "abc123");

    expect(result.c2pa).toEqual({ manifestCid: null, verified: false });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("[c2pa] mode=dev-signed not yet implemented"));

    warnSpy.mockRestore();
  });

  it("logs warning for unimplemented deepfake provider", async () => {
    process.env.DEEPFAKE_PROVIDER = "hive";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { invokeAllUploadProviders } = await loadProviders();
    const result = await invokeAllUploadProviders(dummyBuffer, "image/jpeg", "abc123");

    expect(result.deepfake).toEqual({ score: null, verdict: null });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("[deepfake] provider=hive not yet implemented"));

    warnSpy.mockRestore();
  });
});

describe("computeAuthenticityGrade with c2paKind", () => {
  it("returns basic when c2paKind is dev-signed even if hasC2pa is true", async () => {
    const { computeAuthenticityGrade } = await loadGrade();

    const grade = computeAuthenticityGrade({
      hasSha256: true,
      hasExif: true,
      hasC2pa: true,
      c2paKind: "dev-signed",
      deviceOk: true,
      deepfakeOk: true,
    });

    expect(grade).toBe("basic");
  });

  it("returns verified when c2paKind is production with C2PA + device OK", async () => {
    const { computeAuthenticityGrade } = await loadGrade();

    const grade = computeAuthenticityGrade({
      hasSha256: true,
      hasExif: true,
      hasC2pa: true,
      c2paKind: "production",
      deviceOk: true,
      deepfakeOk: null,
    });

    expect(grade).toBe("verified");
  });

  it("returns premium with production C2PA + device OK + deepfake OK", async () => {
    const { computeAuthenticityGrade } = await loadGrade();

    const grade = computeAuthenticityGrade({
      hasSha256: true,
      hasExif: true,
      hasC2pa: true,
      c2paKind: "production",
      deviceOk: true,
      deepfakeOk: true,
    });

    expect(grade).toBe("premium");
  });

  it("returns basic when c2paKind is omitted (backward compat)", async () => {
    const { computeAuthenticityGrade } = await loadGrade();

    const grade = computeAuthenticityGrade({
      hasSha256: true,
      hasExif: true,
      hasC2pa: false,
      deviceOk: false,
      deepfakeOk: null,
    });

    expect(grade).toBe("basic");
  });
});
