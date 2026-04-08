import { logger } from '@/lib/logger';

const RESEND_API = "https://api.resend.com/emails";

/**
 * Send an alert email when a cron job fails.
 * Falls back to console.error if email config is missing.
 */
export async function sendCronFailureAlert(jobName: string, error: unknown): Promise<void> {
  const log     = logger(`cron/${jobName}`);
  const message = error instanceof Error ? error.message : String(error);
  const stack   = error instanceof Error ? error.stack : undefined;

  log.error('Cron job failed', error instanceof Error ? error : new Error(message), { jobName });

  const apiKey = process.env.RESEND_API_KEY;
  const alertEmail = process.env.CONTACT_EMAIL_TO;
  const from = process.env.RESEND_FROM ?? "noreply@ledra.co.jp";

  if (!apiKey || !alertEmail) return;

  try {
    await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: alertEmail,
        subject: `[Ledra Cron Alert] ${jobName} failed`,
        text: [
          `Cron job "${jobName}" failed at ${new Date().toISOString()}`,
          "",
          `Error: ${message}`,
          ...(stack ? ["", "Stack:", stack] : []),
        ].join("\n"),
      }),
    });
  } catch {
    log.warn('Failed to send cron alert email', { jobName });
  }
}
