"use client";

import { useState, useRef } from "react";

const INDUSTRY_OPTIONS = [
  { value: "", label: "選択してください" },
  { value: "car_dealer", label: "自動車販売" },
  { value: "insurance_agent", label: "保険代理店" },
  { value: "body_shop", label: "ボディーショップ" },
  { value: "coating_shop", label: "コーティング専門店" },
  { value: "car_wash", label: "洗車・カーケア" },
  { value: "other", label: "その他" },
];

type UploadedFile = {
  name: string;
  storage_path: string;
  content_type: string;
  file_size: number;
};

export default function AgentApplyPage() {
  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    address: "",
    industry: "",
    qualifications: "",
    track_record: "",
    terms_accepted: false,
  });
  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<{ application_number: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (documents.length + files.length > 5) {
      setErrors(["ファイルは5個まで添付できます"]);
      return;
    }

    setUploading(true);
    setErrors([]);

    const fd = new FormData();
    for (let i = 0; i < files.length; i++) {
      fd.append("files", files[i]);
    }

    try {
      const res = await fetch("/api/agent/apply/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setErrors([data.message || "アップロードに失敗しました"]);
        return;
      }
      setDocuments((prev) => [...prev, ...data.files]);
    } catch {
      setErrors(["アップロードに失敗しました"]);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeDoc = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setErrors([]);

    // Client-side validation
    const errs: string[] = [];
    if (!form.company_name.trim()) errs.push("会社名は必須です");
    if (!form.contact_name.trim()) errs.push("担当者名は必須です");
    if (!form.email.trim()) errs.push("メールアドレスは必須です");
    if (!form.phone.trim()) errs.push("電話番号は必須です");
    if (!form.address.trim()) errs.push("住所は必須です");
    if (!form.terms_accepted) errs.push("利用規約への同意が必要です");
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/agent/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, documents }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.details ?? [data.message ?? "送信に失敗しました"]);
        return;
      }
      setResult({ application_number: data.application_number });
    } catch {
      setErrors(["送信に失敗しました"]);
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (result) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-base p-6">
        <div className="glass-card w-full max-w-lg space-y-6 p-8 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <span className="text-xl font-bold text-primary tracking-wide">CARTRUST</span>
          </div>

          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-primary">申請を受け付けました</h1>

          <div className="bg-inset rounded-xl p-4">
            <p className="text-sm text-muted">申請番号</p>
            <p className="text-2xl font-mono font-bold text-primary mt-1">{result.application_number}</p>
          </div>

          <p className="text-sm text-secondary">
            審査には通常3〜5営業日ほどお時間をいただきます。結果はメールにてお知らせいたします。
          </p>

          <div className="flex gap-3 justify-center">
            <a href="/agent/apply/status" className="btn-secondary text-sm">
              申請状況を確認
            </a>
            <a href="/agent/login" className="btn-primary text-sm">
              ログインへ
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-base p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Branding */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-lg">
            C
          </div>
          <span className="text-xl font-bold text-primary tracking-wide">CARTRUST</span>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">代理店パートナー申請</h1>
          <p className="text-sm text-muted mt-1">
            CARTRUSTの代理店パートナーとして申請いただけます。審査完了後、ポータルへのアクセス情報をお送りします。
          </p>
        </div>

        {/* Section 1: Company Info */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="section-tag">会社情報</h2>

          <label>
            <div className="text-sm text-secondary mb-1">
              会社名 <span className="text-red-500">*</span>
            </div>
            <input
              value={form.company_name}
              onChange={(e) => set("company_name", e.target.value)}
              className="input-field w-full"
              placeholder="株式会社○○"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label>
              <div className="text-sm text-secondary mb-1">
                担当者名 <span className="text-red-500">*</span>
              </div>
              <input
                value={form.contact_name}
                onChange={(e) => set("contact_name", e.target.value)}
                className="input-field w-full"
                placeholder="山田 太郎"
              />
            </label>
            <label>
              <div className="text-sm text-secondary mb-1">
                メールアドレス <span className="text-red-500">*</span>
              </div>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="input-field w-full"
                placeholder="email@example.com"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label>
              <div className="text-sm text-secondary mb-1">
                電話番号 <span className="text-red-500">*</span>
              </div>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="input-field w-full"
                placeholder="03-1234-5678"
              />
            </label>
            <label>
              <div className="text-sm text-secondary mb-1">業種</div>
              <select
                value={form.industry}
                onChange={(e) => set("industry", e.target.value)}
                className="select-field w-full"
              >
                {INDUSTRY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <div className="text-sm text-secondary mb-1">
              住所 <span className="text-red-500">*</span>
            </div>
            <textarea
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              className="input-field w-full"
              rows={2}
              placeholder="東京都渋谷区..."
            />
          </label>
        </div>

        {/* Section 2: Qualifications & Track Record */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="section-tag">資格・実績</h2>

          <label>
            <div className="text-sm text-secondary mb-1">保有資格・免許</div>
            <textarea
              value={form.qualifications}
              onChange={(e) => set("qualifications", e.target.value)}
              className="input-field w-full"
              rows={3}
              placeholder="古物商許可証、損害保険募集人資格 など"
            />
          </label>

          <label>
            <div className="text-sm text-secondary mb-1">紹介実績・事業経歴</div>
            <textarea
              value={form.track_record}
              onChange={(e) => set("track_record", e.target.value)}
              className="input-field w-full"
              rows={3}
              placeholder="営業年数、月間紹介件数の目安 など"
            />
          </label>
        </div>

        {/* Section 3: Documents */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="section-tag">書類添付</h2>
          <p className="text-sm text-muted">
            登記事項証明書、古物商許可証などをアップロードしてください（PDF・JPEG・PNG、各10MB以下、最大5ファイル）
          </p>

          {documents.length > 0 && (
            <ul className="space-y-2">
              {documents.map((doc, i) => (
                <li key={i} className="flex items-center gap-2 text-sm bg-inset rounded-lg px-3 py-2">
                  <svg className="w-4 h-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="flex-1 truncate text-primary">{doc.name}</span>
                  <span className="text-muted text-xs">{(doc.file_size / 1024).toFixed(0)} KB</span>
                  <button
                    onClick={() => removeDoc(i)}
                    className="text-red-500 hover:text-red-700 text-xs"
                    type="button"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          )}

          {documents.length < 5 && (
            <label className="block">
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={handleUpload}
                className="hidden"
              />
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-default rounded-xl p-6 text-center cursor-pointer hover:border-accent transition-colors"
              >
                {uploading ? (
                  <p className="text-sm text-muted">アップロード中...</p>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-muted mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                    </svg>
                    <p className="text-sm text-muted">クリックしてファイルを選択</p>
                  </>
                )}
              </div>
            </label>
          )}
        </div>

        {/* Section 4: Terms & Submit */}
        <div className="glass-card p-6 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.terms_accepted}
              onChange={(e) => set("terms_accepted", e.target.checked)}
              className="mt-1 accent-[var(--accent-blue)]"
            />
            <span className="text-sm text-secondary">
              <a href="/terms" target="_blank" rel="noopener" className="text-accent hover:underline">
                利用規約
              </a>
              および
              <a href="/privacy" target="_blank" rel="noopener" className="text-accent hover:underline">
                プライバシーポリシー
              </a>
              に同意します
            </span>
          </label>

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
              {errors.map((e, i) => (
                <p key={i} className="text-sm text-red-600">{e}</p>
              ))}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? "送信中..." : "申請を送信"}
          </button>
        </div>

        <p className="text-center text-sm text-muted">
          既にアカウントをお持ちの方は{" "}
          <a href="/agent/login" className="text-accent hover:underline">
            ログイン
          </a>
        </p>
      </div>
    </main>
  );
}
