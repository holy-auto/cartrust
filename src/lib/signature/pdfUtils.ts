/**
 * Ledra 電子署名 - PDF ユーティリティ
 *
 * 証明書 PDF のバイト列生成と、
 * 署名情報が埋め込まれた PDF の再生成を担当する。
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
} from '@react-pdf/renderer';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';

const log = logger('signature/pdfUtils');

const NOTO_SANS_JP =
  'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-jp@latest/japanese-400-normal.ttf';
const NOTO_SANS_JP_BOLD =
  'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-jp@latest/japanese-700-normal.ttf';

Font.register({
  family: 'NotoSansJP',
  fonts: [
    { src: NOTO_SANS_JP, fontWeight: 400 },
    { src: NOTO_SANS_JP_BOLD, fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page:    { padding: 28, fontSize: 10, fontFamily: 'NotoSansJP' },
  title:   { fontSize: 16, marginBottom: 8 },
  label:   { color: '#666', fontSize: 9, marginTop: 10 },
  value:   { fontSize: 11, marginTop: 2 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 16, paddingTop: 12 },
  sigBox:  {
    borderWidth: 1,
    borderColor: '#6366f1',
    borderRadius: 4,
    padding: 10,
    marginTop: 12,
    backgroundColor: '#f5f3ff',
  },
  sigTitle:  { fontSize: 11, color: '#4338ca', marginBottom: 6 },
  sigLabel:  { color: '#555', fontSize: 9, marginTop: 4 },
  sigValue:  { fontSize: 9, marginTop: 1 },
  verifyRow: { marginTop: 8 },
  verifyUrl: { fontSize: 8, color: '#4338ca' },
  smallGray: { fontSize: 8, color: '#888', marginTop: 2 },
});

/** PDF に埋め込む署名情報 */
export interface PdfSignatureInfo {
  signedAt:             string;
  signerEmail:          string;       // 表示用（マスク済み）
  signerName?:          string;
  signaturePreview:     string;       // 署名値の省略形（先頭20文字 + "..."）
  publicKeyFingerprint: string;
  verifyUrl:            string;
  documentHash:         string;
}

// ── 証明書データ取得 ──────────────────────────────────────

type CertData = {
  public_id:         string;
  customer_name:     string | null;
  content_free_text: string | null;
  expiry_type:       string | null;
  expiry_value:      string | null;
  created_at:        string;
  tenant_name:       string | null;
};

async function fetchCertData(certificateId: string): Promise<CertData> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('certificates')
    .select(`
      public_id,
      customer_name,
      content_free_text,
      expiry_type,
      expiry_value,
      created_at,
      tenants ( name )
    `)
    .eq('id', certificateId)
    .single();

  if (error || !data) {
    throw new Error(`[pdfUtils] Certificate not found: ${certificateId}`);
  }

  const tenantRaw = data.tenants;
  const tenantName: string | null = Array.isArray(tenantRaw)
    ? (tenantRaw[0]?.name ?? null)
    : ((tenantRaw as { name?: string } | null)?.name ?? null);

  return {
    public_id:         data.public_id as string,
    customer_name:     (data.customer_name as string | null) ?? null,
    content_free_text: (data.content_free_text as string | null) ?? null,
    expiry_type:       (data.expiry_type as string | null) ?? null,
    expiry_value:      (data.expiry_value as string | null) ?? null,
    created_at:        data.created_at as string,
    tenant_name:       tenantName,
  };
}

// ── PDF ドキュメント要素ビルダー ──────────────────────────

function buildCertDocument(cert: CertData, signatureInfo?: PdfSignatureInfo) {
  const E = React.createElement;
  const issuedAt = cert.created_at
    ? new Date(cert.created_at).toLocaleDateString('ja-JP')
    : '-';

  const expiryLabel =
    cert.expiry_type && cert.expiry_value
      ? `${cert.expiry_type}: ${cert.expiry_value}`
      : '-';

  return E(
    Document,
    null,
    E(
      Page,
      { size: 'A4', style: styles.page },
      E(Text, { style: styles.title }, `${cert.tenant_name ?? '施工店'} 施工証明書`),
      E(Text, { style: styles.label }, '公開 ID'),
      E(Text, { style: styles.value }, cert.public_id),
      E(Text, { style: styles.label }, 'お客様'),
      E(Text, { style: styles.value }, cert.customer_name ?? '-'),
      E(Text, { style: styles.label }, '施工内容'),
      E(Text, { style: styles.value }, cert.content_free_text ?? '-'),
      E(Text, { style: styles.label }, '有効条件'),
      E(Text, { style: styles.value }, expiryLabel),
      E(Text, { style: styles.label }, '発行日'),
      E(Text, { style: styles.value }, issuedAt),

      // 署名情報セクション（署名済みPDF のみ）
      ...(signatureInfo
        ? [
            E(
              View,
              { style: { ...styles.divider } },
              E(
                View,
                { style: styles.sigBox },
                E(Text, { style: styles.sigTitle }, '電子署名情報'),
                E(Text, { style: styles.sigLabel }, '署名日時'),
                E(
                  Text,
                  { style: styles.sigValue },
                  new Date(signatureInfo.signedAt).toLocaleString('ja-JP'),
                ),
                ...(signatureInfo.signerName
                  ? [
                      E(Text, { style: styles.sigLabel }, '署名者'),
                      E(Text, { style: styles.sigValue }, signatureInfo.signerName),
                    ]
                  : []),
                E(Text, { style: styles.sigLabel }, 'メールアドレス（マスク）'),
                E(Text, { style: styles.sigValue }, signatureInfo.signerEmail),
                E(Text, { style: styles.sigLabel }, '文書ハッシュ (SHA-256)'),
                E(Text, { style: styles.sigValue }, signatureInfo.documentHash),
                E(Text, { style: styles.sigLabel }, '署名値プレビュー'),
                E(Text, { style: styles.sigValue }, signatureInfo.signaturePreview),
                E(Text, { style: styles.sigLabel }, '公開鍵フィンガープリント'),
                E(Text, { style: styles.sigValue }, signatureInfo.publicKeyFingerprint),
                E(
                  View,
                  { style: styles.verifyRow },
                  E(Text, { style: styles.sigLabel }, '署名検証 URL'),
                  E(Text, { style: styles.verifyUrl }, signatureInfo.verifyUrl),
                ),
                E(
                  Text,
                  { style: styles.smallGray },
                  '本証明書の電子署名は電子署名法（平成12年法律第102号）第2条に準拠しています。',
                ),
              ),
            ),
          ]
        : []),
    ),
  );
}

// ── 公開 API ────────────────────────────────────────────────

/**
 * 証明書 PDF のバイト列を生成する。
 *
 * 署名前のハッシュ計算に使用する。
 *
 * @param certificateId - 証明書 UUID
 * @returns PDF バイト列（Uint8Array）
 * @throws 証明書が見つからない場合、PDF 生成失敗時
 */
export async function generateCertificatePdfBytes(
  certificateId: string,
): Promise<Uint8Array> {
  const cert = await fetchCertData(certificateId);
  const doc  = buildCertDocument(cert);

  const buf = await renderToBuffer(doc as React.ReactElement);

  // renderToBuffer は Buffer を返す。Uint8Array に変換して返す。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const b = buf as any;
  return buf instanceof Uint8Array
    ? buf
    : new Uint8Array(b.buffer, b.byteOffset ?? 0, b.byteLength);
}

/**
 * 署名情報が埋め込まれた証明書 PDF を再生成する。
 *
 * 署名完了後に呼び出し、Supabase Storage に保存する。
 * 非同期で実行するため、呼び出し元は await せず void で使用すること。
 *
 * @param certificateId - 証明書 UUID
 * @param signatureInfo - 埋め込む署名情報
 */
export async function regenerateSignedPdf(
  certificateId: string,
  signatureInfo:  PdfSignatureInfo,
): Promise<void> {
  const supabase = getSupabaseAdmin();

  try {
    const cert = await fetchCertData(certificateId);
    const doc  = buildCertDocument(cert, signatureInfo);
    const buf  = await renderToBuffer(doc as React.ReactElement);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const b2 = buf as any;
    const pdfBytes = buf instanceof Uint8Array
      ? buf
      : new Uint8Array(b2.buffer, b2.byteOffset ?? 0, b2.byteLength);

    const storagePath = `${certificateId}/signed_certificate.pdf`;

    const { error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(storagePath, pdfBytes, {
        contentType: 'application/pdf',
        upsert:      true,
      });

    if (uploadError) {
      log.error('Storage upload failed', new Error(uploadError.message), { certificateId, storagePath });
      return;
    }

    // certificates テーブルに署名済み PDF のパスを記録
    await supabase
      .from('certificates')
      .update({
        signed_pdf_path: storagePath,
        signed_at:       signatureInfo.signedAt,
      })
      .eq('id', certificateId);

    log.info('Signed PDF regenerated and stored', { certificateId, storagePath });

  } catch (err) {
    log.error('regenerateSignedPdf failed', err instanceof Error ? err : new Error(String(err)), { certificateId });
  }
}
