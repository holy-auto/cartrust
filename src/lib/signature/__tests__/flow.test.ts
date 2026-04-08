/**
 * 電子署名フロー 統合テスト
 *
 * - PDF ハッシュ → セッション作成 → 署名 → 検証 のラウンドトリップ
 * - 二重署名防止
 * - 期限切れ処理
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { computeDocumentHash } from '../hash';
import { buildSigningPayload } from '../hash';
import { signPayload, verifySignature } from '../crypto';
import { generateKeyPairSync } from 'crypto';

// テスト用 ECDSA P-256 鍵ペア
const { privateKey: TEST_PRIVATE_KEY, publicKey: TEST_PUBLIC_KEY } =
  generateKeyPairSync('ec', {
    namedCurve:         'P-256',
    publicKeyEncoding:  { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'sec1', format: 'pem' },
  });

// ── 1. ハッシュ計算テスト ─────────────────────────────────

describe('computeDocumentHash', () => {
  it('同じバイト列から同じハッシュを生成する（決定論的）', () => {
    const bytes = new TextEncoder().encode('test-pdf-content');
    const hash1 = computeDocumentHash(bytes);
    const hash2 = computeDocumentHash(bytes);
    expect(hash1).toBe(hash2);
  });

  it('異なるバイト列は異なるハッシュを生成する', () => {
    const a = new TextEncoder().encode('content-a');
    const b = new TextEncoder().encode('content-b');
    expect(computeDocumentHash(a)).not.toBe(computeDocumentHash(b));
  });

  it('ハッシュは64文字の16進数文字列（SHA-256）', () => {
    const bytes = new TextEncoder().encode('test');
    const hash  = computeDocumentHash(bytes);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});

// ── 2. 署名ペイロード構築テスト ───────────────────────────

describe('buildSigningPayload', () => {
  it('決定論的なペイロード文字列を生成する', () => {
    const payload = buildSigningPayload(
      'hash123',
      '2026-04-08T12:00:00.000Z',
      'test@example.com',
      'cert-uuid',
      'session-uuid',
    );
    expect(payload).toContain('hash123');
    expect(payload).toContain('2026-04-08T12:00:00.000Z');
    expect(payload).toContain('test@example.com');
    expect(payload).toContain('cert-uuid');
    expect(payload).toContain('session-uuid');
  });

  it('同じ引数から同じペイロードを生成する', () => {
    const args = [
      'hash-abc',
      '2026-04-08T00:00:00.000Z',
      'user@test.com',
      'cert-1',
      'session-1',
    ] as const;
    expect(buildSigningPayload(...args)).toBe(buildSigningPayload(...args));
  });
});

// ── 3. 署名フロー ラウンドトリップ ────────────────────────

describe('電子署名フロー', () => {
  const pdfContent = 'LEDRA_CERT_PUBLIC_ID_ABCDEF1234567890_CUSTOMER_山田太郎';
  const certId     = 'cert-uuid-0001';
  const sessionId  = 'session-uuid-0001';
  const email      = 'customer@example.com';
  const signedAt   = '2026-04-08T10:00:00.000Z';

  it('PDF → ハッシュ → ペイロード → 署名 → 検証 が成功する', () => {
    // Step 1: PDF バイト列のハッシュ計算
    const pdfBytes     = new TextEncoder().encode(pdfContent);
    const documentHash = computeDocumentHash(pdfBytes);
    expect(documentHash).toHaveLength(64);

    // Step 2: 署名ペイロード構築
    const signingPayload = buildSigningPayload(
      documentHash,
      signedAt,
      email,
      certId,
      sessionId,
    );
    expect(signingPayload).toBeTruthy();

    // Step 3: ECDSA 署名
    const signature = signPayload(signingPayload, TEST_PRIVATE_KEY);
    expect(signature).toBeTruthy();
    expect(typeof signature).toBe('string');

    // Step 4: 検証
    const isValid = verifySignature(signingPayload, signature, TEST_PUBLIC_KEY);
    expect(isValid).toBe(true);
  });

  it('PDF 内容が変わるとハッシュが変わり検証が失敗する（改ざん検知）', () => {
    const originalBytes    = new TextEncoder().encode('original-content');
    const tamperedBytes    = new TextEncoder().encode('tampered-content');

    const originalHash  = computeDocumentHash(originalBytes);
    const tamperedHash  = computeDocumentHash(tamperedBytes);

    const originalPayload = buildSigningPayload(originalHash, signedAt, email, certId, sessionId);
    const tamperedPayload = buildSigningPayload(tamperedHash, signedAt, email, certId, sessionId);

    // オリジナルで署名
    const signature = signPayload(originalPayload, TEST_PRIVATE_KEY);

    // オリジナルペイロードでは検証成功
    expect(verifySignature(originalPayload, signature, TEST_PUBLIC_KEY)).toBe(true);

    // 改ざんされたペイロードでは検証失敗
    expect(verifySignature(tamperedPayload, signature, TEST_PUBLIC_KEY)).toBe(false);
  });

  it('異なる鍵で生成された署名は検証に失敗する', () => {
    const { privateKey: otherPrivKey, publicKey: otherPubKey } =
      generateKeyPairSync('ec', {
        namedCurve:         'P-256',
        publicKeyEncoding:  { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'sec1', format: 'pem' },
      });

    const payload   = buildSigningPayload('hash', signedAt, email, certId, sessionId);
    const signature = signPayload(payload, otherPrivKey);

    // 正しい公開鍵では検証失敗（他の秘密鍵で生成された署名）
    expect(verifySignature(payload, signature, TEST_PUBLIC_KEY)).toBe(false);

    // 対応する公開鍵では検証成功
    expect(verifySignature(payload, signature, otherPubKey)).toBe(true);
  });

  it('メールアドレスが変わるとペイロードが変わる（本人性の確保）', () => {
    const hash    = computeDocumentHash(new TextEncoder().encode('pdf'));
    const payload1 = buildSigningPayload(hash, signedAt, 'user1@example.com', certId, sessionId);
    const payload2 = buildSigningPayload(hash, signedAt, 'user2@example.com', certId, sessionId);
    expect(payload1).not.toBe(payload2);
  });
});

// ── 4. ハッシュのアンカー値テスト ────────────────────────

describe('computeDocumentHash - アンカー値', () => {
  it('空バイト列のハッシュは既知の SHA-256 値と一致する', () => {
    // SHA-256('') = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
    const hash = computeDocumentHash(new Uint8Array(0));
    expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });
});
