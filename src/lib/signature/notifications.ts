/**
 * Ledra 電子署名 - 通知モジュール
 *
 * 署名依頼・署名完了の通知を LINE / メール / SMS で送信する。
 */

import { sendSMS } from '@/lib/sms/client';
import { logger } from '@/lib/logger';
import type { SignatureSession } from './types';

const log = logger('signature/notifications');

const RESEND_API = 'https://api.resend.com/emails';
const RESEND_FROM = process.env.RESEND_FROM ?? 'noreply@ledra.co.jp';

// ── メール送信ヘルパー ─────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const res = await fetch(RESEND_API, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: RESEND_FROM, to, subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function emailWrapper(title: string, body: string): string {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px;">
      <div style="border-bottom:2px solid #4f46e5;padding-bottom:12px;margin-bottom:20px;">
        <h2 style="margin:0;color:#1d1d1f;font-size:18px;">${title}</h2>
      </div>
      ${body}
      <div style="border-top:1px solid #e5e5e5;margin-top:24px;padding-top:12px;font-size:12px;color:#86868b;">
        Ledra 電子署名システム
      </div>
    </div>
  `;
}

// ── 署名依頼通知（顧客向け） ──────────────────────────────

/**
 * 署名依頼を顧客に通知する（LINE / メール / SMS）。
 *
 * @param session  - 作成済み署名セッション
 * @param signUrl  - 顧客向け署名 URL
 * @param tenantName - 店舗名
 */
export async function notifySignatureRequest(
  session:    SignatureSession,
  signUrl:    string,
  tenantName: string,
): Promise<void> {
  const { notification_method, signer_email, signer_phone, signer_name } = session;
  const name = signer_name ?? 'お客様';

  if (notification_method === 'email' && signer_email) {
    const html = emailWrapper(
      '【電子署名のご依頼】施工証明書への署名をお願いします',
      `
        <p style="color:#1d1d1f;font-size:14px;">
          ${name} 様<br><br>
          ${tenantName} より、施工証明書への電子署名をお願いしております。<br>
          下記のボタンより署名ページにアクセスしてください。
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${signUrl}"
             style="background:#4f46e5;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:bold;">
            署名ページを開く
          </a>
        </div>
        <p style="color:#86868b;font-size:12px;">
          有効期限: ${new Date(session.expires_at).toLocaleString('ja-JP')}<br>
          このリンクは一度のみ有効です。
        </p>
      `,
    );
    await sendEmail(signer_email, `【署名依頼】${tenantName} 施工証明書`, html);

  } else if (notification_method === 'sms' && signer_phone) {
    const text = [
      `【${tenantName}】電子署名のご依頼`,
      `${name} 様、施工証明書への署名をお願いします。`,
      `署名ページ: ${signUrl}`,
      `有効期限: ${new Date(session.expires_at).toLocaleString('ja-JP')}`,
    ].join('\n');

    await sendSMS(signer_phone, text);
  }
  // LINE は line_user_id が必要なため、session に含まれない場合はスキップ
}

// ── 署名完了通知（施工店向け） ────────────────────────────

/**
 * 署名完了を施工店に通知する。
 *
 * 施工店のオーナー/管理者メールアドレスに完了メールを送信する。
 *
 * @param session - 署名完了済みセッション
 */
export async function notifyShopSignatureComplete(
  session: SignatureSession,
): Promise<void> {
  try {
    const { getSupabaseAdmin } = await import('@/lib/supabase/admin');
    const supabase = getSupabaseAdmin();

    // 施工店のオーナーメールを取得
    const { data: tenantUsers } = await supabase
      .from('tenant_users')
      .select('user_id')
      .eq('tenant_id', session.tenant_id)
      .in('role', ['owner', 'admin'])
      .limit(5);

    if (!tenantUsers || tenantUsers.length === 0) return;

    const userIds = tenantUsers.map((u: { user_id: string }) => u.user_id);

    const { data: users } = await supabase.auth.admin.listUsers();
    const emails = (users?.users ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((u: any) => userIds.includes(u.id) && u.email)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((u: any) => u.email as string);

    if (emails.length === 0) return;

    // 証明書の公開 ID を取得
    const { data: cert } = await supabase
      .from('certificates')
      .select('public_id, customer_name')
      .eq('id', session.certificate_id)
      .single();

    const certLabel = cert?.public_id ?? session.certificate_id;
    const customer  = cert?.customer_name ?? '不明';
    const signedAt  = session.signed_at
      ? new Date(session.signed_at).toLocaleString('ja-JP')
      : '-';

    const verifyBaseUrl = process.env.NEXT_PUBLIC_VERIFY_BASE_URL
      ?? `${process.env.APP_URL ?? 'https://app.ledra.co.jp'}/verify`;
    const verifyUrl = `${verifyBaseUrl}/${session.id}`;

    const html = emailWrapper(
      '【署名完了】お客様が電子署名を完了しました',
      `
        <p style="color:#1d1d1f;font-size:14px;">
          お客様（${customer} 様）が施工証明書への電子署名を完了しました。
        </p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:13px;">
          <tr>
            <td style="padding:8px;background:#f5f5f7;color:#666;width:140px;">証明書 ID</td>
            <td style="padding:8px;border-bottom:1px solid #e5e5e5;">${certLabel}</td>
          </tr>
          <tr>
            <td style="padding:8px;background:#f5f5f7;color:#666;">署名日時</td>
            <td style="padding:8px;border-bottom:1px solid #e5e5e5;">${signedAt}</td>
          </tr>
          <tr>
            <td style="padding:8px;background:#f5f5f7;color:#666;">お客様</td>
            <td style="padding:8px;border-bottom:1px solid #e5e5e5;">${customer}</td>
          </tr>
        </table>
        <div style="text-align:center;margin:24px 0;">
          <a href="${verifyUrl}"
             style="background:#4f46e5;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;font-size:14px;">
            署名を確認する
          </a>
        </div>
      `,
    );

    for (const email of emails) {
      await sendEmail(email, `【署名完了】${customer} 様 - 施工証明書`, html);
    }

  } catch (err) {
    log.error('notifyShopSignatureComplete failed', err instanceof Error ? err : new Error(String(err)));
  }
}

// ── 振込失敗通知（管理者向け） ────────────────────────────

/**
 * Stripe Connect 振込失敗を管理者にメール通知する。
 */
export async function notifyPayoutFailure(params: {
  payoutId:       string;
  accountId:      string;
  tenantId:       string | null;
  agentId:        string | null;
  failureCode:    string | null;
  failureMessage: string | null;
  amount:         number;
}): Promise<void> {
  const alertEmail = process.env.CONTACT_EMAIL_TO;
  if (!alertEmail) return;

  const recipientLabel = params.tenantId
    ? `テナント ID: ${params.tenantId}`
    : params.agentId
      ? `エージェント ID: ${params.agentId}`
      : `アカウント: ${params.accountId}`;

  const html = emailWrapper(
    '【緊急】Stripe Connect 振込失敗',
    `
      <p style="color:#dc2626;font-size:14px;font-weight:bold;">
        振込が失敗しました。至急ご確認ください。
      </p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:13px;">
        <tr>
          <td style="padding:8px;background:#fef2f2;color:#666;width:180px;">Payout ID</td>
          <td style="padding:8px;border-bottom:1px solid #fecaca;">${params.payoutId}</td>
        </tr>
        <tr>
          <td style="padding:8px;background:#fef2f2;color:#666;">受取先</td>
          <td style="padding:8px;border-bottom:1px solid #fecaca;">${recipientLabel}</td>
        </tr>
        <tr>
          <td style="padding:8px;background:#fef2f2;color:#666;">金額</td>
          <td style="padding:8px;border-bottom:1px solid #fecaca;">¥${params.amount.toLocaleString('ja-JP')}</td>
        </tr>
        <tr>
          <td style="padding:8px;background:#fef2f2;color:#666;">エラーコード</td>
          <td style="padding:8px;border-bottom:1px solid #fecaca;">${params.failureCode ?? '-'}</td>
        </tr>
        <tr>
          <td style="padding:8px;background:#fef2f2;color:#666;">エラーメッセージ</td>
          <td style="padding:8px;">${params.failureMessage ?? '-'}</td>
        </tr>
      </table>
    `,
  );

  await sendEmail(alertEmail, `[Ledra 緊急] 振込失敗: ${params.payoutId}`, html);
}
