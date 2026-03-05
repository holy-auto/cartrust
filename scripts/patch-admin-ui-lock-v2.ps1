$ErrorActionPreference = "Stop"
Set-Location C:\Users\admin\holy-cert
$root = (Get-Location).Path
$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = Join-Path $root ("_backup\admin_ui_lock_v2_" + $ts)
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

function WriteUtf8([string]$p, [string]$t) {
  $enc = [System.Text.UTF8Encoding]::new($false)
  [System.IO.File]::WriteAllText($p, $t, $enc)
}
function BackupFile([string]$abs) {
  if (!(Test-Path $abs)) { return }
  $dst = Join-Path $backupDir ($abs.Substring($root.Length+1) -replace "[\\/:*?""<>|]", "_")
  Copy-Item -Force $abs $dst
}

# ---- targets (abs) ----
$planFeatures = Join-Path $root "src\lib\billing\planFeatures.ts"
$adminLayout  = Join-Path $root "src\app\admin\layout.tsx"
$guardFile    = Join-Path $root "src\app\admin\AdminRouteGuard.tsx"
$certPage     = Join-Path $root "src\app\admin\certificates\page.tsx"
$certClient   = Join-Path $root "src\app\admin\certificates\CertificatesTableClient.tsx"
$gitignore    = Join-Path $root ".gitignore"

@($planFeatures,$adminLayout,$certPage,$certClient,$gitignore) | ForEach-Object { BackupFile $_ }

# ---- 1) rewrite planFeatures.ts (確実に置換) ----
$pf = @"
export type PlanTier = "mini" | "standard" | "pro";

export type FeatureKey =
  | "issue_certificate"
  | "export_one_csv"
  | "export_search_csv"
  | "export_selected_csv"
  | "pdf_one"
  | "pdf_zip"
  | "manage_templates"
  | "upload_logo";

/**
 * - 不明な plan_tier は "pro" 扱い（UIは緩く→実際の制限はAPI/402で止める）
 * - ここは「見た目の制限」(ボタン無効/画面無効) 用のマトリクス
 */
const MATRIX: Record<PlanTier, Record<FeatureKey, boolean>> = {
  mini: {
    issue_certificate: true,
    export_one_csv: true,
    export_search_csv: false,
    export_selected_csv: false,
    pdf_one: true,
    pdf_zip: false,
    manage_templates: false,
    upload_logo: false,
  },
  standard: {
    issue_certificate: true,
    export_one_csv: true,
    export_search_csv: true,
    export_selected_csv: false,
    pdf_one: true,
    pdf_zip: true,
    manage_templates: true,
    upload_logo: true,
  },
  pro: {
    issue_certificate: true,
    export_one_csv: true,
    export_search_csv: true,
    export_selected_csv: true,
    pdf_one: true,
    pdf_zip: true,
    manage_templates: true,
    upload_logo: true,
  },
};

export function normalizePlanTier(v: any): PlanTier {
  const s = String(v ?? "").toLowerCase();
  if (s === "mini") return "mini";
  if (s === "standard") return "standard";
  return "pro";
}

export function canUseFeature(planTier: any, feature: FeatureKey): boolean {
  const tier = normalizePlanTier(planTier);
  return !!MATRIX[tier]?.[feature];
}

export function featureLabel(feature: FeatureKey): string {
  switch (feature) {
    case "issue_certificate": return "証明書の新規作成";
    case "export_one_csv": return "CSV出力（単体）";
    case "export_search_csv": return "CSV出力（検索結果）";
    case "export_selected_csv": return "CSV出力（選択分）";
    case "pdf_one": return "PDF出力（単体）";
    case "pdf_zip": return "PDF ZIP出力（選択分）";
    case "manage_templates": return "テンプレート管理";
    case "upload_logo": return "ロゴアップロード";
    default: return feature;
  }
}
"@
WriteUtf8 $planFeatures $pf

# ---- 2) add AdminRouteGuard.tsx (新規) ----
$guardDir = Split-Path -Parent $guardFile
New-Item -ItemType Directory -Force -Path $guardDir | Out-Null

$guard = @"
"use client";

import Link from "next/link";
import { ReactNode, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAdminBillingStatus } from "@/lib/billing/useAdminBillingStatus";
import { canUseFeature, featureLabel, normalizePlanTier, type FeatureKey } from "@/lib/billing/planFeatures";

function requiredFeatureForPath(pathname: string): FeatureKey | null {
  if (pathname.startsWith("/admin/templates")) return "manage_templates";
  if (pathname.startsWith("/admin/logo")) return "upload_logo";

  // 作成/出力系（見た目制限）
  if (pathname.startsWith("/admin/certificates/new")) return "issue_certificate";
  if (pathname.startsWith("/admin/certificates/export-selected")) return "export_selected_csv";
  if (pathname.startsWith("/admin/certificates/export-one")) return "export_one_csv";
  if (pathname.startsWith("/admin/certificates/export")) return "export_search_csv";
  if (pathname.startsWith("/admin/certificates/pdf-selected")) return "pdf_zip";
  if (pathname.startsWith("/admin/certificates/pdf-one")) return "pdf_one";

  return null;
}

export default function AdminRouteGuard({ children }: { children: ReactNode }) {
  const bs = useAdminBillingStatus();
  const pathname = usePathname();
  const sp = useSearchParams();

  const feature = requiredFeatureForPath(pathname);

  // billing画面は常に触れる（ループ防止）
  if (!feature || pathname.startsWith("/admin/billing")) return <>{children}</>;

  // 取得できてない間は“誤ブロック”しない
  if (!bs.data) return <>{children}</>;

  const isActive = !!bs.data.is_active;
  const planTier = normalizePlanTier(bs.data.plan_tier ?? "pro");
  const allowed = isActive && canUseFeature(planTier, feature);

  if (allowed) return <>{children}</>;

  const nextUrl = useMemo(() => {
    const qs = sp?.toString();
    return pathname + (qs ? \`?\${qs}\` : "");
  }, [pathname, sp]);

  const title = !isActive
    ? "支払いが停止中のため、この画面の操作は無効です。"
    : \`現在のプラン（\${planTier}）では「\${featureLabel(feature)}」は利用できません。\`;

  const cta = !isActive ? "支払いを再開" : "プランをアップグレード";

  return (
    <div className="space-y-3">
      <div className="rounded border bg-yellow-50 p-3 text-sm">
        <div className="font-semibold">{title}</div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Link className="rounded border bg-white px-3 py-2" href={\`/admin/billing?next=\${encodeURIComponent(nextUrl)}\`}>
            {cta}（/admin/billing）
          </Link>
          <span className="text-xs opacity-70">plan: {planTier} / active: {String(isActive)}</span>
        </div>
      </div>

      <div className="opacity-60 pointer-events-none select-none" aria-disabled="true">
        {children}
      </div>
    </div>
  );
}
"@
WriteUtf8 $guardFile $guard

# ---- 3) admin layout: children を AdminRouteGuard でラップ ----
$lay = Get-Content -Raw -Path $adminLayout

if ($lay -notmatch 'AdminRouteGuard') {
  # import 追加（BillingGateの近く）
  if ($lay -match 'import\s+BillingGate\s+from\s+"\./BillingGate";') {
    $lay = [regex]::Replace($lay, 'import\s+BillingGate\s+from\s+"\./BillingGate";', '$0' + "`r`n" + 'import AdminRouteGuard from "./AdminRouteGuard";', 1)
  } else {
    # フォールバック: 先頭に足す
    $lay = 'import AdminRouteGuard from "./AdminRouteGuard";' + "`r`n" + $lay
  }

  # {children} をラップ（最初の1回だけ）
  $lay = [regex]::Replace($lay, '\{children\}', '<AdminRouteGuard>{children}</AdminRouteGuard>', 1)
}
WriteUtf8 $adminLayout $lay

# ---- 4) certificates: canIssue / canPdf を feature に寄せる（見つかる時だけ） ----
if (Test-Path $certPage) {
  $cp = Get-Content -Raw -Path $certPage
  if ($cp -match 'const\s+canIssue\s*=' -and $cp -notmatch '"issue_certificate"') {
    $cp = [regex]::Replace($cp, 'const\s+canIssue\s*=\s*[^;]+;', 'const canIssue = isActive && canUseFeature(planTier, "issue_certificate");', 1)
    WriteUtf8 $certPage $cp
  }
}

if (Test-Path $certClient) {
  $cc = Get-Content -Raw -Path $certClient
  if ($cc -match 'const\s+canPdfZip\s*=' -and $cc -notmatch '"pdf_zip"') {
    $cc = [regex]::Replace($cc, 'const\s+canPdfZip\s*=\s*[^;]+;', 'const canPdfZip = isActive && canUseFeature(planTier, "pdf_zip");', 1)
  }
  if ($cc -match 'const\s+canPdfOne\s*=' -and $cc -notmatch '"pdf_one"') {
    $cc = [regex]::Replace($cc, 'const\s+canPdfOne\s*=\s*[^;]+;', 'const canPdfOne = isActive && canUseFeature(planTier, "pdf_one");', 1)
  }
  WriteUtf8 $certClient $cc
}

# ---- 5) .gitignore に *.bak.* を追加（再発防止） ----
if (Test-Path $gitignore) {
  $gi = Get-Content -Raw -Path $gitignore
} else {
  $gi = ""
}
if ($gi -notmatch '\*\.bak\.\*') {
  if ($gi -and $gi[-1] -ne "`n") { $gi += "`r`n" }
  $gi += "`r`n# backups`r`n*.bak.*`r`n"
  WriteUtf8 $gitignore $gi
}

"OK: patched v2. backup=" + $backupDir
