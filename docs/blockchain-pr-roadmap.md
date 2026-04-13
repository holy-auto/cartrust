# Ledra ブロックチェーン改良 & PR ロードマップ

> 作成日: 2026-04-13
> 対象ブランチ: `claude/ledra-blockchain-research-3Jq2m`
> 目的: トヨタ含む自動車業界のブロックチェーン動向を踏まえ、Ledra の改良方向と具体 PR 投入順を定義する
> 関連ドキュメント:
> - `docs/research-blockchain-automotive-japan-2026.md`（業界調査レポート）
> - `docs/AUDIT_REPORT_20260329.md`（監査レポート）
> - `docs/architecture-roadmap.md`（アーキテクチャロードマップ）
> - `FEATURES.md`（全機能一覧）

---

## 目次

1. [Ledra の現状（コード実測）](#1-ledra-の現状コード実測)
2. [業界動向の整理（2025 → 2026）](#2-業界動向の整理2025--2026)
3. [未来予測（2026–2028）](#3-未来予測20262028)
4. [Ledra の戦略ポジショニング](#4-ledra-の戦略ポジショニング)
5. [改良テーマ 7 本](#5-改良テーマ-7-本)
6. [PR 投入プラン](#6-pr-投入プラン)
7. [監査指摘との接続](#7-監査指摘との接続)
8. [参考文献](#8-参考文献)

---

## 1. Ledra の現状（コード実測）

### 正体
**holy-auto/Ledra** は Next.js 15 + Supabase で構築された**自動車アフターマーケット向け施工証明書 SaaS**。PPF / セラミックコーティング / ラッピング / 鈑金塗装の施工記録をデジタル証明書として発行するマルチテナント型プラットフォーム。

### アーキテクチャ
- **モノリス Next.js（98,000 行超、6.6MB）**: `apps/mobile` + `src/{app,components,lib}` + Supabase
- **4 ポータル**: Admin（施工店）/ Agent（代理店）/ Insurer（保険会社）/ Customer（顧客）
- **API 276 ルート**、Mobile API 15+、DB マイグレーション 102 件
- Stripe / Square / LINE / Google Calendar / CloudSign / Resend / QStash / Upstash / Sentry / Anthropic 連携

### ブロックチェーン/真正性の実装状況

| 機能 | 状態 | 場所 |
|---|---|---|
| SHA-256 ハッシュ | 本番稼働 | `src/lib/anchoring/authenticityGrade.ts` |
| プロバイダ抽象化層 | Phase 3a 実装済（#156） | `src/lib/anchoring/providers/` |
| C2PA dev-signed 署名 | Phase 3b 実装済（#157） | `src/lib/anchoring/providers/c2paSigner.ts` |
| C2PA production 署名 | env 待ち、TSA 未接続 | `c2paSigner.ts:93` |
| Deepfake 検出（Hive AI） | Phase 4 実装済（#159） | `providers/deepfake.ts` |
| IPFS Pinning（Pinata） | Phase 4 実装済 | `providers/c2pa.ts` |
| **Polygon アンカリング** | **コード完了、env で gated（未有効化）** | `providers/polygon.ts:32` |
| Device Attestation | スタブのみ | `providers/deviceAttestation.ts` |
| 真正性グレード（unverified → basic → verified → premium） | 実装済 | `authenticityGrade.ts:35` |

### 注意点

- **特許出願ロック**: `/pricing`, `/for-shops`, `/for-agents`, `/for-insurers`, `/faq` が Coming Soon（特許出願中）
- **Mobile ネイティブ未着手**: PWA のみ、EAS Build 未設定
- **テスト**: Vitest 36 files / 617 cases、E2E は主要フローにギャップあり
- **監査指摘の未解消 High**: cron 署名検証バグ / 一部 API で tenant access 漏れ

---

## 2. 業界動向の整理（2025 → 2026）

### 日本 OEM の動き

| OEM | 取り組み | 方向性 |
|---|---|---|
| **トヨタ** | MON（Avalanche、$10.8M、2025/8）、ERC-4337 MOA、セキュリティトークン債、Woven City 開業、KINTO × SBT 安全運転証明 | 車両ライフサイクル全体 + 保険・税・安全監査まで統合 |
| **日産** | NISSAN PASSPORT BETA（NFT 5,523 枚）+ トークン報酬 | コミュニティ／ロイヤリティ型 |
| **ホンダ** | MOBI EVGI 策定、ボリビアで Polygon 決済、車両 NFT 特許 3 件 | V2G / 決済 / NFT 軸 |
| **三菱** | 欧州で Vinturas プライベート BC による完成車物流トレーサビリティ | サプライチェーン特化 |

### インフラ・政策

- **MOBI**: 世界自動車生産 70% 超が参加。車両 DID と EVGI を国際標準化中
- **経産省**: ウラノス・エコシステム / モビリティ DX 戦略（2025/6 更新）
- **ABtC**（蓄電池トレーサビリティ、2024/9 認定）— **EU 電池規制 2027/2 対応が業界全体の大波**
- **FIEA・PSA 改正法**（2026 国会提出）: 暗号資産税 55%→20% 検討
- **C2PA**: 6,000+ 組織、Samsung / Google / Sony / Nikon が端末ネイティブ統合

### サービスレイヤー

- **Shelf AP / オートバックスセブン**: BC 中古車マーケットプレイス
- **DIMO × 博報堂KEY3**（2025〜）: 分散型車両データで日本進出
- **日本の中古車市場**: 2025 年 $70.9B → 2034 年 $124.1B、**オドメーター詐称対策で BC 履歴システムが明確なトレンド**

---

## 3. 未来予測（2026–2028）

### 3 年以内に起きる確度の高い変化

1. **車両 DID が国際標準になる** — MOBI 経由で MOA (ERC-4337) / MON との相互運用が進む。OEM 発行の車両ウォレットが普通に
2. **EU DPP の波が日本の部品・アフター市場にも波及** — 2027/2 以降バッテリー以外にも拡張（ESPR）。施工・整備記録もデジタルパスポート的扱いに
3. **中古車査定がオンチェーン記録前提に** — Shelf AP 型が一般化。**「施工歴がオンチェーン証明されているか」で査定金額が変わる**
4. **保険の BC 自動化** — スマートコントラクトでパラメトリック支払。施工品質に基づく保険料割引がプロダクト化
5. **C2PA が "撮影デバイス規格" として浸透** — スマホ撮影に自動付与される時代へ。**施工店が C2PA を付けていないと逆に怪しい**フェーズへ
6. **SDV（Software Defined Vehicle）時代のアフターマーケット分離** — OEM 純正データは MON 系で囲い込まれ、**アフターマーケット独自のオープンな真正性レイヤー**が必要に ← **Ledra の最大の戦略空白地帯**

### 起きにくいこと

- トークンエコノミーのカーオーナー巻き込み（日産 PASSPORT は試行だが一般化は遅い）
- パブリックチェーン上での全データ公開（プライバシー規制で Hybrid / Private が主流に）

---

## 4. Ledra の戦略ポジショニング

> **「SDV 時代にアフターマーケットが失われる前に、"車両ライフサイクルの外側" の真正性レイヤーを先取りする」**

OEM（トヨタ MON 等）は新車 → リース → 自動運転運用の垂直統合を狙う。
**Ledra のチャンス**: OEM が触らない「施工・整備・ダメージ修復」の**横串真正性インフラ**になること。

### 3 つの差別化軸

1. **C2PA × BC の二重証明** — 撮影〜記録〜証明書の改ざん検知が業界最上位
2. **MOBI DID / 車両 NFT との接続先になる** — OEM チェーンが何であれ中立レイヤーで繋ぐ
3. **保険・中古車プラットフォームへのハブ機能** — Ledra が保有する施工証明を外部が検証できる公共 API

---

## 5. 改良テーマ 7 本

### 🥇 S 優先：即 PR

#### Theme A: Polygon アンカリング本番化 + マルチチェーン抽象
- **A1**: Polygon Amoy に `LedraAnchor.sol`（`anchor(bytes32)` + `event Anchored`）をデプロイ
- **A2**: `certificate_anchors` テーブル追加（cert_id / sha256 / tx_hash / chain / block_number / anchored_at、`(cert_id, sha256)` UNIQUE）
- **A3**: QStash 経由のべき等 tx 発火（Supabase 無トランザクション制約への対処）
- **A4**: `AuthenticityBadge.tsx` に tx hash / エクスプローラリンク表示
- **A5**: `providers/chains/{polygon,avalanche,ethereum}.ts` 階層を切る（将来 MON 接続の下地）

#### Theme B: 公開検証ページ `/verify/[sha256]`
- **B1**: `/api/public/verify` — sha256 / public_id / tx_hash 検索の公共 API（要 rate limit）
- **B2**: `/verify/[hash]` ページ（OGP 画像、SNS 共有可、SEO 最適化）
- **B3**: C2PA マニフェスト CID を IPFS gateway 経由で直接 fetch

**戦略的価値**: 特許出願ロックで営業ページが閉じている現状、これが**実質的な市場露出の主戦場**。

---

### 🥈 A 優先：次四半期

#### Theme C: MOBI DID / W3C VC 相互運用
- **C1**: 証明書 metadata に MOBI DID スキーマ準拠 `vehicle_did` フィールド追加
- **C2**: JSON-LD / W3C Verifiable Credentials エクスポート API
- **C3**: Metamask / WalletConnect で顧客が「施工 SBT」を claim できる導線（opt-in）

#### Theme D: 保険会社向け検証 API 高度化
- **D1**: `/api/insurer/verify` — 案件 ID 紐付け証明書の BC 検証結果を一括取得
- **D2**: 保険料割引プリセット（`verified`: 3% / `premium`: 5%）
- **D3**: 将来のスマートコントラクト連携前段として検証イベント Webhook

#### Theme E: 本番 C2PA 署名 + TSA 統合
- **E1**: GMO 等のコードサイニング CA 取得 + TSA URL 設定
- **E2**: `verified` グレードを公式昇格可能に

---

### 🥉 B 優先：中長期仕込み

#### Theme F: EV / バッテリー対応 + ABtC 連携
- EV 関連施工（急速充電器設置、バッテリー交換）の証明書タイプ追加
- ABtC API 連携調査（EU DPP 波及見据え）
- Ledra 証明書を車両向け DPP の "施工履歴セクション" として位置付けるホワイトペーパー

#### Theme G: AI × BC 二重検証
- `src/lib/ai/` の Claude Vision で施工写真品質判定を provider 追加
- Hive AI Deepfake の stub と合流、`premium` グレード到達を現実化
- `apps/mobile` 側に Play Integrity / App Attest を実装（Device Attestation を本物に）

---

## 6. PR 投入プラン

| # | ブランチ | タイトル案 | 依存 | 時期 |
|---|---|---|---|---|
| **0** | `fix/cron-sig-and-tenant-guards` | fix: cron 署名検証 + 一部 API の tenant access 穴塞ぎ | — | 4月前半（Blocker） |
| 1 | `feat/polygon-anchor-mainnet` | feat: Polygon Amoy アンカリング本番化 + マルチチェーン抽象 | #0 | 4月後半 |
| 2 | `feat/public-verify-endpoint` | feat: `/verify/[sha256]` 公共検証ページ & 外部 API | #1 | 4月末–5月頭 |
| 3 | `feat/mobi-did-export` | feat: W3C VC / MOBI DID エクスポート | #2 | 5月 |
| 4 | `feat/insurer-verify-api` | feat: 保険会社向け BC 検証 API + 割引プリセット | #3 | 5月後半 |
| 5 | `feat/c2pa-production-signer` | feat: 本番 C2PA 署名 + TSA 統合 | 独立 | 5–6月 |
| 6 | `feat/ai-vision-provider` | feat: Claude Vision による施工写真品質判定 provider | #1 | 6月 |
| 7 | `feat/device-attestation-mobile` | feat: apps/mobile に Play Integrity / App Attest | EAS Build 設定後 | 6–7月 |
| 8 | `feat/wallet-claim-sbt` | feat: 顧客ウォレット施工 SBT claim（opt-in） | #3 | 7月 |
| 9 | `docs/dpp-roadmap` | docs: EU DPP / ABtC / MON 連携ロードマップ | — | 7月 |

### PR 単位の設計原則

- **1 PR = 1 レビュー可能テーマ**（500–1500 行目安）
- **env フラグで gate** して本番影響ゼロでマージ可能
- **既存テストケース数を減らさない** ことを CI 必須条件に
- 新規コードで **`any` 型を増やさない**（監査指摘のため）
- 新 API は **統一レスポンス形式**で（監査指摘 4 形式混在の収束機会）

---

## 7. 監査指摘との接続

`docs/AUDIT_REPORT_20260329.md` の未解消項目を PR ロードマップに組み込んだ対応：

| 監査指摘 | 対応 PR | 備考 |
|---|---|---|
| 🔴 Cron 署名検証の空文字列ハッシュバグ | PR #0 | オンチェーン tx 発火前に必須 |
| 🔴 一部 API で tenant access control 欠落 | PR #0 | `/verify` 公開前に必須 |
| 🟡 Supabase 無トランザクション | PR #1（QStash べき等キーで代替） | ACID 不要化の設計 |
| 🟡 API レスポンス形式 4 種混在 | PR #2 以降新規 API で統一 | 既存は漸進改善 |
| 🟡 `any` 型 290 個 | 各 PR で増やさない運用 | 既存は別途リファクタ |

---

## 8. 参考文献

### 自動車メーカー
- [Toyota Blockchain Lab 公式](https://global.toyota/en/newsroom/corporate/31827481.html)
- [Toyota MON on Avalanche ($10.8M)](https://www.cryptoninjas.net/news/toyota-unveils-10-8m-vehicle-blockchain-network-on-avalanche-to-reshape-mobility-trust/)
- [Toyota & Avalanche MON Protocol](https://www.team1.blog/p/toyota-and-avalanche-building-the)
- [MOBI 公式（Vehicle Identity）](https://dlt.mobi/)

### 真正性・標準化
- [Content Provenance & Authenticity (C2PA) Standard](https://c2pa.wiki/)
- [Content Authenticity Initiative — How it Works](https://contentauthenticity.org/how-it-works)

### 規制・市場
- [EU Digital Battery Passport 2027 Deadline](https://digiprodpass.com/blogs/battery-passport-deadlines-2027)
- [Japan Used Car Market 2026](https://vocal.media/writers/japan-s-thriving-used-car-market-a-usd-124-1-billion-opportunity-by-2034-sz7dy0wod)
- [Japan 2025 Crypto Reforms (FIEA/PSA)](https://www.gate.com/crypto-wiki/article/japan-2025-crypto-reforms-key-changes-for-web3-and-digital-assets-20251118)
- [Automotive Blockchain Market 2026](https://www.gminsights.com/industry-analysis/automotive-blockchain-technology-market)

### 保険・スマートコントラクト
- [Smart Contracts in Insurance 2026 Guide](https://www.nadcab.com/blog/smart-contracts-in-insurance)
- [IBM — Blockchain Traceability in Automotive](https://newsroom.ibm.com/How-Blockchain-Can-Transform-Traceability-in-the-Automotive-Space)

### 関連内部資料
- `docs/research-blockchain-automotive-japan-2026.md`
- `docs/AUDIT_REPORT_20260329.md`
- `docs/architecture-roadmap.md`
- `FEATURES.md`
