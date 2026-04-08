/**
 * Ledra 構造化ロガー
 *
 * - 開発環境: console.* にそのまま出力
 * - 本番環境: Sentry にも転送（error/warn）
 * - 全ログに context プレフィックスを付与
 *
 * 使用例:
 *   import { logger } from '@/lib/logger';
 *   const log = logger('signature/pdfUtils');
 *   log.error('PDF generation failed', { certificateId, error });
 */

type LogLevel  = 'debug' | 'info' | 'warn' | 'error';
type LogData   = Record<string, unknown>;

interface Logger {
  debug: (message: string, data?: LogData) => void;
  info:  (message: string, data?: LogData) => void;
  warn:  (message: string, data?: LogData) => void;
  error: (message: string, errorOrData?: Error | LogData, data?: LogData) => void;
}

/** Sentry のインポートは動的に行う（build time に常に有効でないため） */
async function sentryCapture(
  level:   'warning' | 'error',
  message: string,
  context: string,
  data?:   LogData,
  err?:    Error,
): Promise<void> {
  try {
    // Sentry が未設定の環境ではスキップ
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

    const Sentry = await import('@sentry/nextjs').catch(() => null);
    if (!Sentry) return;

    Sentry.withScope((scope: { setTag: (k: string, v: string) => void; setContext: (k: string, v: LogData) => void; setLevel: (l: 'warning' | 'error') => void }) => {
      scope.setTag('logger_context', context);
      scope.setLevel(level);
      if (data) scope.setContext('log_data', data);

      if (err) {
        Sentry.captureException(err);
      } else {
        Sentry.captureMessage(`[${context}] ${message}`, level);
      }
    });
  } catch {
    // Sentry 送信失敗はサイレントに無視（ロギング自体を止めない）
  }
}

/**
 * コンテキスト付きロガーを生成する。
 *
 * @param context - ログのプレフィックス（例: 'signature/pdfUtils'）
 */
export function logger(context: string): Logger {
  const prefix = `[${context}]`;

  return {
    debug(message: string, data?: LogData) {
      if (process.env.NODE_ENV === 'production') return;
      console.debug(prefix, message, data ?? '');
    },

    info(message: string, data?: LogData) {
      console.info(prefix, message, data ?? '');
    },

    warn(message: string, data?: LogData) {
      console.warn(prefix, message, data ?? '');
      void sentryCapture('warning', message, context, data);
    },

    error(message: string, errorOrData?: Error | LogData, data?: LogData) {
      const isError = errorOrData instanceof Error;
      const err     = isError ? errorOrData : undefined;
      const extra   = isError ? data : (errorOrData as LogData | undefined);

      if (err) {
        console.error(prefix, message, err, extra ?? '');
      } else {
        console.error(prefix, message, extra ?? '');
      }

      void sentryCapture('error', message, context, extra, err);
    },
  };
}

/**
 * グローバルロガー（コンテキスト不要の場合に使用）
 */
export const globalLogger = logger('ledra');
