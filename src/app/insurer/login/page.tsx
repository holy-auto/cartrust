import { Suspense } from "react";
import InsurerLoginClient from "./InsurerLoginClient";

function LoginFallback() {
  return (
    <main className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-sm text-neutral-600">ログイン画面を読み込み中...</div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <InsurerLoginClient />
    </Suspense>
  );
}