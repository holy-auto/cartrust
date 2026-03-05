$ErrorActionPreference = "Stop"
Set-Location C:\Users\admin\holy-cert
$root = (Get-Location).Path
$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = Join-Path $root ("_backup\exclude_fix_" + $ts)
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

function WriteUtf8([string]$p, [string]$t) {
  $enc = [System.Text.UTF8Encoding]::new($false)
  [System.IO.File]::WriteAllText($p, $t, $enc)
}
function Backup([string]$rel) {
  $abs = Join-Path $root $rel
  if (Test-Path $abs) { Copy-Item -Force $abs (Join-Path $backupDir ($rel -replace "[\\/:*?""<>|]", "_")) }
}

# ---- 1) tsconfig/jsconfig に exclude 追加 ----
$configRel = $null
if (Test-Path (Join-Path $root "tsconfig.json")) { $configRel = "tsconfig.json" }
elseif (Test-Path (Join-Path $root "jsconfig.json")) { $configRel = "jsconfig.json" }
else { throw "tsconfig.json / jsconfig.json が見つかりません" }

Backup $configRel
$configPath = Join-Path $root $configRel

$json = Get-Content -Raw -Path $configPath | ConvertFrom-Json

# exclude 無ければ作成、あればマージ
$need = @("_backup","_diag",".next","node_modules")
if ($null -eq $json.exclude) {
  $json | Add-Member -NotePropertyName exclude -NotePropertyValue @()
}

# 文字列配列に統一して追加（重複排除）
$cur = @()
foreach ($x in $json.exclude) { $cur += [string]$x }

foreach ($x in $need) {
  if ($cur -notcontains $x) { $cur += $x }
}
$json.exclude = $cur

# JSON 書き戻し
$out = $json | ConvertTo-Json -Depth 50
WriteUtf8 $configPath ($out + "`r`n")

# ---- 2) 本体 src 側の FeatureKey ミスを修正（存在する場合のみ） ----
$clientRel = "src\app\admin\certificates\CertificatesTableClient.tsx"
$clientPath = Join-Path $root $clientRel
if (Test-Path $clientPath) {
  Backup $clientRel
  $c = Get-Content -Raw -Path $clientPath
  if ($c -match '"pdf_zip_selected"') {
    $c = $c.Replace('"pdf_zip_selected"', '"pdf_zip"')
    WriteUtf8 $clientPath $c
  }
}

"OK: patched exclude + optional pdf key fix. backup=" + $backupDir
