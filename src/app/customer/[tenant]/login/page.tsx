"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

export default function CustomerLoginPage() {
  const router = useRouter();
  const params = useParams() as any;
  const tenant = useMemo(() => (params?.tenant ?? "").toString(), [params]);

  const [email, setEmail] = useState("");
  const [last4, setLast4] = useState("");
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<"request" | "verify">("request");
  const [msg, setMsg] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<"error" | "success">("error");
  const [busy, setBusy] = useState(false);

  const sp = useSearchParams();

  useEffect(() => {
    const qe = sp.get("email");
    const ql = sp.get("last4");
    const qc = sp.get("code");
    const qp = sp.get("phase");
    if (qe) setEmail(qe);
    if (ql) setLast4(ql);
    if (qc) setCode(qc);
    if (qp === "verify" || qc) setPhase("verify");
  }, [sp]);

  async function requestCode() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/customer/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_slug: tenant, email, phone_last4: last4 }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error ?? "request failed");
      setPhase("verify");
      setMsgType("success");
      setMsg("メールに6桁コードを送信しました。");
    } catch (e: any) {
      setMsgType("error");
      setMsg(e?.message ?? "error");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/customer/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_slug: tenant, email, phone_last4: last4, code }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error ?? "verify failed");
      router.push(`/customer/${tenant}`);
    } catch (e: any) {
      setMsgType("error");
      setMsg(e?.message ?? "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-base p-6">
      <div className="glass-card w-full max-w-md space-y-6 p-8">
        {/* Branding */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500 flex items-center justify-center text-white font-bold text-lg">
            C
          </div>
          <span className="text-xl font-bold text-primary tracking-wide">CARTRUST</span>
        </div>

        <div className="text-center">
          <h1 className="text-xl font-bold text-primary">お客様ログイン</h1>
          <div className="text-sm text-muted mt-1">店舗: {tenant}</div>
        </div>

        <div className="grid gap-4">
          <label>
            <div className="text-sm text-secondary mb-1">メール</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full"
            />
          </label>

          <label>
            <div className="text-sm text-secondary mb-1">電話番号 下4桁</div>
            <input
              value={last4}
              onChange={(e) => setLast4(e.target.value)}
              inputMode="numeric"
              className="input-field w-full"
            />
          </label>

          {phase === "verify" && (
            <label>
              <div className="text-sm text-secondary mb-1">メールに届いた6桁コード</div>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                className="input-field w-full"
              />
            </label>
          )}

          {phase === "request" ? (
            <button disabled={busy} onClick={requestCode} className="btn-primary w-full">
              {busy ? "..." : "コード送信"}
            </button>
          ) : (
            <button disabled={busy} onClick={verifyCode} className="btn-primary w-full">
              {busy ? "..." : "ログイン"}
            </button>
          )}
        </div>

        {msg && (
          <div
            className={`text-sm text-center ${
              msgType === "success" ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {msg}
          </div>
        )}
      </div>
    </main>
  );
}
