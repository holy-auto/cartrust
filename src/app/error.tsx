"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@ledra.co.jp";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base p-8">
      <div className="max-w-md text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10 mx-auto">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-danger">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-text-primary">
          予期しないエラーが発生しました
        </h2>
        <p className="text-sm text-text-secondary">
          申し訳ございません。問題が発生しました。再度お試しいただくか、
          問題が続く場合は下記サポートまでお問い合わせください。
        </p>
        {error.digest && (
          <p className="text-xs text-text-secondary font-mono bg-bg-subtle rounded px-3 py-1 inline-block">
            エラーID: {error.digest}
          </p>
        )}
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={reset}
            className="btn-primary px-6 py-2 w-full"
          >
            再試行
          </button>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=エラー報告${error.digest ? `（ID: ${error.digest}）` : ""}`}
            className="text-sm text-text-secondary hover:text-text-primary underline"
          >
            サポートに問い合わせる
          </a>
        </div>
      </div>
    </div>
  );
}
