/**
 * マルチテナント分離 テスト
 *
 * テナント境界チェック、テナントスコープ付き admin クライアント、
 * および公開 ID の一意性を検証する。
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePublicId } from '../publicId';
import { createTenantScopedAdmin } from '../supabase/admin';

// ── 1. createTenantScopedAdmin のガード ───────────────────

describe('createTenantScopedAdmin', () => {
  it('有効なテナント ID でクライアントを返す', () => {
    const { admin, tenantId } = createTenantScopedAdmin('tenant-uuid-001');
    expect(admin).toBeDefined();
    expect(tenantId).toBe('tenant-uuid-001');
  });

  it('空文字列のテナント ID でエラーをスローする', () => {
    expect(() => createTenantScopedAdmin('')).toThrowError(
      /cross-tenant/i,
    );
  });

  it('null ライクな値を渡すとエラーをスローする', () => {
    // TypeScript 上では型エラーだが JS ランタイムでのガード確認
    expect(() => createTenantScopedAdmin(null as unknown as string)).toThrowError();
    expect(() => createTenantScopedAdmin(undefined as unknown as string)).toThrowError();
  });

  it('スペースのみのテナント ID でエラーをスローする', () => {
    expect(() => createTenantScopedAdmin('   ')).toThrowError(
      /cross-tenant/i,
    );
  });
});

// ── 2. 公開 ID の一意性・フォーマット ─────────────────────

describe('generatePublicId', () => {
  it('32文字の16進数文字列を生成する', () => {
    const id = generatePublicId();
    expect(id).toMatch(/^[a-f0-9]{32}$/);
    expect(id).toHaveLength(32);
  });

  it('連続生成された ID はユニーク', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generatePublicId()));
    expect(ids.size).toBe(1000);
  });

  it('ハイフンを含まない（URL-safe）', () => {
    const id = generatePublicId();
    expect(id).not.toContain('-');
  });
});

// ── 3. テナント境界チェックのパターン ────────────────────

describe('テナント境界チェック パターン', () => {
  /**
   * テナント境界チェックをシミュレート。
   * 実際の Supabase クエリでは `.eq("tenant_id", tenantId)` を必須にするが、
   * ここではそのパターンが正しく機能することをロジックレベルで検証する。
   */
  function simulateTenantBoundaryCheck(
    resourceTenantId: string,
    callerTenantId:   string,
  ): boolean {
    return resourceTenantId === callerTenantId;
  }

  it('同一テナントのリソースにアクセス可能', () => {
    expect(simulateTenantBoundaryCheck('tenant-A', 'tenant-A')).toBe(true);
  });

  it('異なるテナントのリソースにアクセス不可', () => {
    expect(simulateTenantBoundaryCheck('tenant-B', 'tenant-A')).toBe(false);
  });

  it('空のテナント ID では常に失敗', () => {
    expect(simulateTenantBoundaryCheck('tenant-A', '')).toBe(false);
    expect(simulateTenantBoundaryCheck('', 'tenant-A')).toBe(false);
  });
});

// ── 4. 複数テナントの証明書 ID 分離 ──────────────────────

describe('証明書テナント分離（シミュレーション）', () => {
  type Certificate = { id: string; tenant_id: string; public_id: string };

  // テナントをまたいだ証明書が存在するDB状態をシミュレート
  const allCertificates: Certificate[] = [
    { id: 'cert-1', tenant_id: 'tenant-A', public_id: generatePublicId() },
    { id: 'cert-2', tenant_id: 'tenant-A', public_id: generatePublicId() },
    { id: 'cert-3', tenant_id: 'tenant-B', public_id: generatePublicId() },
    { id: 'cert-4', tenant_id: 'tenant-B', public_id: generatePublicId() },
  ];

  function queryCertificatesByTenant(tenantId: string): Certificate[] {
    // 実際の Supabase では .eq("tenant_id", tenantId) でフィルタリング
    return allCertificates.filter((c) => c.tenant_id === tenantId);
  }

  it('テナントAはテナントAの証明書のみ取得できる', () => {
    const certs = queryCertificatesByTenant('tenant-A');
    expect(certs).toHaveLength(2);
    expect(certs.every((c) => c.tenant_id === 'tenant-A')).toBe(true);
  });

  it('テナントBはテナントBの証明書のみ取得できる', () => {
    const certs = queryCertificatesByTenant('tenant-B');
    expect(certs).toHaveLength(2);
    expect(certs.every((c) => c.tenant_id === 'tenant-B')).toBe(true);
  });

  it('テナントAはテナントBの証明書を含まない', () => {
    const tenantACerts = queryCertificatesByTenant('tenant-A');
    const tenantBIds   = new Set(['cert-3', 'cert-4']);
    expect(tenantACerts.some((c) => tenantBIds.has(c.id))).toBe(false);
  });

  it('存在しないテナントは空配列を返す', () => {
    const certs = queryCertificatesByTenant('tenant-nonexistent');
    expect(certs).toHaveLength(0);
  });
});
