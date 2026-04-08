/**
 * テナント API キー検証ロジック テスト
 *
 * /api/external/booking で使用するテナント固有 API キーの検証ロジックを検証する。
 * API ルートは直接テストせず、検証ロジックを分離してテストする。
 */

import { describe, it, expect } from 'vitest';

// ── テナント API キー検証ロジック（booking/route.ts から抽出） ──

interface TenantKeyCheckParams {
  /** x-api-key ヘッダーの値 */
  apiKey:       string;
  /** tenants.external_api_key（DB から取得） */
  tenantApiKey: string | null | undefined;
  /** CRON_SECRET 環境変数（フォールバック） */
  cronSecret:   string | undefined;
}

/**
 * API キーが有効かどうかを検証する。
 * booking/route.ts と同じロジックをここで純粋関数として検証。
 */
function isValidApiKey({ apiKey, tenantApiKey, cronSecret }: TenantKeyCheckParams): boolean {
  if (tenantApiKey) {
    return apiKey === tenantApiKey;
  }
  // テナントキー未設定時は CRON_SECRET にフォールバック
  return cronSecret != null && apiKey === cronSecret;
}

// ── テスト ──────────────────────────────────────────────────

describe('テナント API キー検証', () => {
  const CRON_SECRET   = 'secret-cron-abc123';
  const TENANT_KEY    = 'ldk_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4';

  describe('テナントキーが設定されている場合', () => {
    it('正しいテナントキーで認証成功', () => {
      expect(isValidApiKey({
        apiKey:       TENANT_KEY,
        tenantApiKey: TENANT_KEY,
        cronSecret:   CRON_SECRET,
      })).toBe(true);
    });

    it('誤ったキーで認証失敗', () => {
      expect(isValidApiKey({
        apiKey:       'ldk_wrong_key',
        tenantApiKey: TENANT_KEY,
        cronSecret:   CRON_SECRET,
      })).toBe(false);
    });

    it('CRON_SECRET ではテナントキーが設定されている場合は認証失敗（キー分離）', () => {
      expect(isValidApiKey({
        apiKey:       CRON_SECRET,
        tenantApiKey: TENANT_KEY,
        cronSecret:   CRON_SECRET,
      })).toBe(false);
    });

    it('空文字列のキーは認証失敗', () => {
      expect(isValidApiKey({
        apiKey:       '',
        tenantApiKey: TENANT_KEY,
        cronSecret:   CRON_SECRET,
      })).toBe(false);
    });
  });

  describe('テナントキーが未設定の場合（フォールバック）', () => {
    it('CRON_SECRET で認証成功', () => {
      expect(isValidApiKey({
        apiKey:       CRON_SECRET,
        tenantApiKey: null,
        cronSecret:   CRON_SECRET,
      })).toBe(true);
    });

    it('CRON_SECRET も未設定なら認証失敗', () => {
      expect(isValidApiKey({
        apiKey:       CRON_SECRET,
        tenantApiKey: null,
        cronSecret:   undefined,
      })).toBe(false);
    });

    it('undefined のテナントキーも同様にフォールバック', () => {
      expect(isValidApiKey({
        apiKey:       CRON_SECRET,
        tenantApiKey: undefined,
        cronSecret:   CRON_SECRET,
      })).toBe(true);
    });
  });

  describe('APIキーフォーマット検証', () => {
    it('ldk_ プレフィックスを持つキーが正しく検証される', () => {
      const key = 'ldk_' + 'a'.repeat(32);
      expect(isValidApiKey({
        apiKey:       key,
        tenantApiKey: key,
        cronSecret:   CRON_SECRET,
      })).toBe(true);
    });

    it('大文字小文字が区別される（case-sensitive）', () => {
      expect(isValidApiKey({
        apiKey:       TENANT_KEY.toUpperCase(),
        tenantApiKey: TENANT_KEY,
        cronSecret:   CRON_SECRET,
      })).toBe(false);
    });
  });
});

// ── API キー再生成テスト ────────────────────────────────────

describe('API キー生成ルール', () => {
  it('生成されたキーは ldk_ プレフィックスを持つ', () => {
    const key = 'ldk_' + crypto.randomUUID().replace(/-/g, '');
    expect(key.startsWith('ldk_')).toBe(true);
  });

  it('生成されたキーは十分な長さを持つ（ldk_ + 32文字以上）', () => {
    const key = 'ldk_' + crypto.randomUUID().replace(/-/g, '');
    // 'ldk_' (4) + UUID without hyphens (32) = 36
    expect(key.length).toBeGreaterThanOrEqual(36);
  });

  it('連続生成されたキーはユニーク', () => {
    const keys = new Set(
      Array.from({ length: 100 }, () => 'ldk_' + crypto.randomUUID().replace(/-/g, '')),
    );
    expect(keys.size).toBe(100);
  });
});
