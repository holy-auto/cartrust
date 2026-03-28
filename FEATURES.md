# Ledra — 全機能一覧 & ワークフロー

> WEB施工証明書SaaS プラットフォーム
> 最終更新: 2026-03-29

---

## 目次

1. [プラットフォーム概要](#1-プラットフォーム概要)
2. [施工店ポータル（Admin）](#2-施工店ポータルadmin)
3. [代理店ポータル（Agent）](#3-代理店ポータルagent)
4. [保険会社ポータル（Insurer）](#4-保険会社ポータルinsurer)
5. [顧客ポータル（Customer）](#5-顧客ポータルcustomer)
6. [マーケティングサイト](#6-マーケティングサイト)
7. [外部連携 & Webhook](#7-外部連携--webhook)
8. [モバイルAPI](#8-モバイルapi)
9. [定期処理（Cron）](#9-定期処理cron)
10. [主要ワークフロー](#10-主要ワークフロー)
11. [技術スタック](#11-技術スタック)

---

## 1. プラットフォーム概要

Ledraは自動車施工（コーティング・フィルム・ラッピング等）の記録をデジタル証明書として発行・管理するマルチテナントSaaSです。

### 3つのポータル + 顧客ビュー

| ポータル | 対象ユーザー | 主な役割 |
|---|---|---|
| **Admin（施工店）** | 施工店スタッフ | 証明書発行、車両・顧客管理、請求書、予約、BtoB受発注 |
| **Agent（代理店）** | パートナー代理店 | 施工店紹介、コミッション管理、レポート |
| **Insurer（保険会社）** | 保険会社査定担当 | 証明書検索・照会、案件管理、分析 |
| **Customer（顧客）** | エンドユーザー | 自分の証明書閲覧 |

---

## 2. 施工店ポータル（Admin）

### 2.1 ダッシュボード `/admin`
- パートナーランク表示（プラチナ/ゴールド/シルバー/ブロンズ/スターター）
- KPI カード: 証明書数（合計/有効/無効）、メンバー数、顧客数、請求書数、未回収額
- 予約: 本日の予約数、進行中の予約・作業
- BtoB: 進行中の受発注件数
- 30日間の発行推移チャート、ステータス内訳チャート
- プラットフォーム全体統計（運営権限のみ）: 全体証明書数、業種別・地域別施工店分布
- クイックアクション: 証明書一覧、新規発行、顧客管理、請求書、課金管理
- オンボーディングツアー
- ウィジェットカスタマイズ機能（表示/非表示・並び替え）

### 2.2 証明書管理 `/admin/certificates`
- **一覧**: 検索・フィルタ・ソート、ステータス絞り込み
- **新規発行** `/admin/certificates/new`: 車両情報入力、施工内容記録、写真アップロード、証明書生成
- **発行完了** `/admin/certificates/new/success`: 発行成功画面、QRコード表示
- **詳細** `/admin/certificates/[public_id]`: 証明書詳細閲覧、PDF出力、無効化、複製
- **バッチPDF出力**: 複数証明書の一括PDF生成
- **ステータス変更**: 有効化/無効化
- **証明書複製**: 既存証明書をコピーして新規作成

### 2.3 車両管理 `/admin/vehicles`
- **一覧**: 車両検索・フィルタ
- **新規登録** `/admin/vehicles/new`: 車両情報入力、車検証OCR読取
- **詳細** `/admin/vehicles/[id]`: 車両情報閲覧・編集
- **CSVインポート**: 車両データ一括取り込み
- **車検証OCR**: カメラ/画像から車両サイズ自動読取

### 2.4 顧客管理 `/admin/customers`
- **一覧**: 顧客検索・フィルタ
- **詳細** `/admin/customers/[id]`: 顧客情報、紐づき証明書一覧、サマリー

### 2.5 予約管理 `/admin/reservations`
- 予約一覧（日付・ステータス絞り込み）
- 予約作成・編集・キャンセル
- ステータス管理: 確認済み → 到着 → 作業中 → 完了
- Google Calendar連携

### 2.6 請求・帳票 `/admin/invoices`
- **一覧**: 請求書検索・ステータス絞り込み
- **詳細** `/admin/invoices/[id]`: 請求書詳細、PDF出力
- 請求書作成・編集
- 合算請求書対応
- ステータス管理: 下書き → 送信済み → 支払済み / 期限超過

### 2.7 ドキュメント管理 `/admin/documents`
- 各種帳票の一覧・検索
- **詳細** `/admin/documents/[id]`: ドキュメント閲覧
- 共有リンク生成（ShareDocumentModal）

### 2.8 Square売上連携 `/admin/square`
- Square OAuth接続/切断
- 売上データ同期（自動/手動）
- 注文一覧: 顧客紐付け
- 同期実行履歴

### 2.9 経営分析 `/admin/management`
- 経営KPI: 売上推移、証明書発行数推移
- 顧客単価分析
- リピート率分析

### 2.10 BtoBプラットフォーム `/admin/btob`
- 施工店間のマーケットプレイス
- 自店の得意分野・対応可能な施工をアピール
- 問い合わせ受信・対応

### 2.11 案件受発注 `/admin/orders`
- **一覧**: 受注・発注の両方を管理
- **詳細** `/admin/orders/[id]`: 案件詳細、メッセージ、レビュー
- ステータス管理: 申請中 → 承認 → 作業中 → 完了
- 支払確認
- チャットメッセージ

### 2.12 マーケット車両 `/admin/market-vehicles`
- 車両掲載・写真アップロード
- **新規掲載** `/admin/market-vehicles/new`
- **詳細** `/admin/market-vehicles/[id]`

### 2.13 商談管理 `/admin/deals`
- BtoB商談の進捗管理

### 2.14 ヒアリング `/admin/hearing`
- 顧客ヒアリングフォーム管理
- **導入ヒアリング** `/admin/hearing/branding`: ブランディング関連ヒアリング

### 2.15 品目マスタ `/admin/menu-items`
- 施工メニュー（品目）の管理
- 価格設定、カテゴリ分け

### 2.16 NFC管理 `/admin/nfc`
- NFCタグの登録・管理
- 車両へのNFC紐付け
- NFC書き込み

### 2.17 POS会計 `/admin/pos`
- レジセッション管理（開局/閉局）
- Stripe Terminal連携
- チェックアウト処理
- 日次レポート

### 2.18 施工価格相場 `/admin/price-stats`
- 施工種類別の価格統計

### 2.19 代理店管理 `/admin/agents`
- 代理店一覧・詳細
- 申請承認/却下
- **営業資料管理** `/admin/agents/materials`: 代理店向け資料のアップロード・管理

### 2.20 代理店向け各種管理
- **お知らせ配信** `/admin/agent-announcements`
- **キャンペーン** `/admin/agent-campaigns`
- **FAQ管理** `/admin/agent-faq`
- **請求書管理** `/admin/agent-invoices`
- **通知管理** `/admin/agent-notifications`
- **サポート** `/admin/agent-support`: チケット + メッセージ
- **研修管理** `/admin/agent-training`

### 2.21 保険会社管理 `/admin/insurers`
- 保険会社一覧
- テナントアクセス権管理
- 保険会社向け契約管理

### 2.22 情報管理
- **お知らせ** `/admin/announcements`: 店舗スタッフ向けお知らせ配信
- **業界ニュース** `/admin/news`: 自動取得ニュース配信
- **問い合わせ** `/admin/inquiries`: 外部からの問い合わせ管理

### 2.23 設定
- **店舗設定** `/admin/settings`: 店舗基本情報、デフォルト設定
- **店舗管理** `/admin/stores`: マルチ店舗管理
- **メンバー管理** `/admin/members`: スタッフ招待・権限管理
- **ブランド証明書** `/admin/template-options`: 証明書テンプレートのカスタマイズ
  - テンプレートギャラリー `/admin/template-options/gallery`
  - テンプレート設定 `/admin/template-options/configure`
  - 注文管理 `/admin/template-options/order`
  - メンテナンスURL `/admin/template-options/maintenance-url`
- **ロゴ管理** `/admin/logo`: 店舗ロゴのアップロード・管理
- **ショップ** `/admin/shop`: NFCタグ・グッズ購入ページ
  - 注文一覧 `/admin/shop/orders`
- **請求・プラン** `/admin/billing`: Stripeサブスクリプション管理
- **操作履歴** `/admin/audit`: 操作ログ閲覧
- **ブランド管理** `/admin/settings/brands`: ブランド設定

### 2.24 プラットフォーム運営
- **運営ダッシュボード** `/admin/platform/operations`: 全テナント統計、セキュリティ監査
- **テンプレ管理(運営)** `/admin/platform/template-orders`: テンプレート注文管理

### 2.25 共通UI機能
- **コマンドパレット** `Cmd+K`: 管理画面内のクイック検索・ナビゲーション
- **通知ベル**: リアルタイム通知（Supabase Realtime）
- **サイドバーバッジ**: 予約数・未連携Square注文数をリアルタイム表示
- **テーマ切替**: ライト/ダークモード対応
- **店舗セレクター**: マルチ店舗での店舗切替
- **自動ログアウト**: アイドル時の自動ログアウト

---

## 3. 代理店ポータル（Agent）

### 3.1 ダッシュボード `/agent`
- KPIカード: 紹介総数、契約成立数、成約率、今月/累計コミッション
- コンバージョン率プログレスバー
- 未読お知らせ数
- 最近の紹介一覧テーブル
- 月別コミッション推移チャート
- クイックリンク: 新規紹介、コミッション一覧

### 3.2 紹介管理 `/agent/referrals`
- **一覧**: 紹介案件の検索・フィルタ
- **新規紹介** `/agent/referrals/new`: 施工店紹介フォーム
- **詳細** `/agent/referrals/[id]`: 紹介進捗追跡

### 3.3 コミッション `/agent/commissions`
- コミッション支払履歴・明細

### 3.4 紹介リンク `/agent/referral-links`
- 紹介用トラッキングリンクの生成・管理

### 3.5 レポート `/agent/reports`
- 紹介実績レポート、期間別分析

### 3.6 キャンペーン `/agent/campaigns`
- 進行中のキャンペーン一覧・詳細

### 3.7 ランキング `/agent/rankings`
- エージェント間の実績ランキング

### 3.8 研修 `/agent/training`
- 研修コンテンツの閲覧

### 3.9 情報・サポート
- **お知らせ** `/agent/announcements`
- **営業資料** `/agent/materials`: 資料ダウンロード
- **共有ファイル** `/agent/shared-files`
- **契約書** `/agent/contracts`: 契約書の閲覧
- **FAQ** `/agent/faq`
- **サポート** `/agent/support`: チケット送信
- **通知** `/agent/notifications`
- **請求書** `/agent/invoices`: 自分の請求書確認

### 3.10 管理
- **メンバー管理** `/agent/members`: チームメンバー管理
- **設定** `/agent/settings`: アカウント設定

### 3.11 申請
- **新規申請** `/agent/apply`: 代理店パートナー申請フォーム
- **申請状況** `/agent/apply/status`: 審査状況確認

---

## 4. 保険会社ポータル（Insurer）

### 4.1 ダッシュボード `/insurer`
- 証明書検索（public_id / 顧客名 / 車両型式 / ナンバー）
- ステータス・日付フィルタ
- 検索結果テーブル
- CSV/PDFエクスポート
- 案件サマリーウィジェット: 未対応/対応中/今日更新
- プラン管理（Stripe連携）
- オンボーディングウィザード

### 4.2 検索・照会
- **証明書検索** `/insurer/search`: 高度な証明書検索
- **車両検索** `/insurer/vehicles`: 車両情報から検索
  - **車両詳細** `/insurer/vehicles/[id]`
- **店舗検索** `/insurer/stores`: 施工店情報検索
- **ウォッチリスト** `/insurer/watchlist`: 監視対象の証明書管理
- **証明書詳細** `/insurer/c/[public_id]`: 個別証明書の詳細閲覧

### 4.3 案件管理 `/insurer/cases`
- **一覧**: 案件検索・ステータス絞り込み
- **詳細** `/insurer/cases/[id]`: 案件詳細、添付ファイル、メッセージ
- **一括操作**: 案件の一括ステータス変更
- **テンプレート** `/insurer/templates`: 案件テンプレート管理
- **自動振り分け** `/insurer/rules`: ルールベースの案件自動振り分け
- **SLA管理** `/insurer/sla`: サービスレベルアグリーメント設定

### 4.4 分析
- **検索分析** `/insurer/analytics`: 検索パターン分析
- **案件レポート** `/insurer/reports`: 案件処理統計
- **テナント統計** `/insurer/tenants`: 施工店別統計

### 4.5 管理
- **ユーザー管理** `/insurer/users`: チームメンバー管理、CSV一括インポート
- **操作ログ** `/insurer/audit`: 監査ログ
- **セキュリティ** `/insurer/security`: セキュリティ設定
- **通知設定** `/insurer/settings`: 通知配信設定
- **アカウント** `/insurer/account`: アカウント設定
- **通知センター** `/insurer/notifications`: 通知一覧

---

## 5. 顧客ポータル（Customer）

### 5.1 公開証明書ビュー `/c/[public_id]`
- QRコード/URLから直接アクセス
- 証明書の詳細表示（施工内容、写真、施工店情報）
- 真正性検証
- PDF出力
- OGP画像自動生成

### 5.2 顧客マイページ `/customer/[tenant]`
- テナント別の顧客ログイン
- メール認証（ワンタイムコード）
- 自分の証明書一覧

---

## 6. マーケティングサイト

| ページ | パス | 内容 |
|---|---|---|
| トップ | `/` | ヒーロー、カウントダウン、ポータルログイン、ロール別CTA |
| お問い合わせ | `/contact` | コンタクトフォーム（Resend API連携） |
| 施工店向け | `/for-shops` | Coming Soon |
| 代理店向け | `/for-agents` | Coming Soon |
| 保険会社向け | `/for-insurers` | Coming Soon |
| 料金プラン | `/pricing` | Coming Soon |
| FAQ | `/faq` | Coming Soon |
| 利用規約 | `/terms` | 利用規約全文 |
| プライバシーポリシー | `/privacy` | プライバシーポリシー全文 |
| 特定商取引法 | `/tokusho` | 特商法に基づく表記 |

### 認証ページ
| ページ | パス | 内容 |
|---|---|---|
| 施工店ログイン | `/login` | メール+パスワード認証 |
| 施工店新規登録 | `/signup` | アカウント作成 |
| 保険会社新規登録 | `/join` | 法人番号検索 + ワンタイムコード認証 |
| パスワードリセット | `/forgot-password`, `/reset-password` | パスワード再設定フロー |
| 代理店ログイン | `/agent/login` | 代理店認証 |
| 保険会社ログイン | `/insurer/login` | 保険会社認証 |

---

## 7. 外部連携 & Webhook

### 7.1 Stripe
- **サブスクリプション課金**: 施工店・保険会社のプラン管理
- **Stripe Connect**: 施工店への決済リンク生成
- **Stripe Terminal**: POS端末連携
- **Webhook受信**: 支払い完了、サブスク更新等のイベント処理

### 7.2 Square
- **OAuth連携**: 施工店のSquareアカウント接続
- **売上データ同期**: Squareの注文データを自動取り込み
- **Webhook受信**: Square注文イベント処理

### 7.3 LINE
- **LINE Webhook**: LINEメッセージ受信・処理

### 7.4 Google Calendar
- **予約連携**: 予約データをGoogleカレンダーに同期

### 7.5 CloudSign
- **電子署名Webhook**: 契約書署名完了通知

### 7.6 Resend
- **メール送信**: トランザクションメール（認証コード、通知等）
- **Webhook受信**: メール配信ステータス

### 7.7 QStash
- **非同期タスク**: 保険案件作成通知等の非同期処理

### 7.8 Upstash (Redis)
- **レートリミット**: API呼び出し制限
- **キャッシュ**: 各種データキャッシュ

---

## 8. モバイルAPI

施工現場でのモバイルデバイス利用を想定したAPI群。

| API | 機能 |
|---|---|
| `POST /api/mobile/certificates/[id]/activate` | 証明書のアクティベート |
| `POST /api/mobile/certificates/[id]/void` | 証明書の無効化 |
| `POST /api/mobile/nfc/[id]/attach` | NFCタグを車両に紐付け |
| `POST /api/mobile/nfc/[id]/write` | NFCタグにデータ書き込み |
| `POST /api/mobile/pos/checkout` | POS決済処理 |
| `POST /api/mobile/pos/terminal/*` | Stripe Terminal操作 |
| `PATCH /api/mobile/progress/[reservationId]` | 作業進捗更新 |
| `POST /api/mobile/push/register` | プッシュ通知トークン登録 |
| `POST /api/mobile/registers/[id]/open\|close` | レジ開局/閉局 |
| `POST /api/mobile/reservations/[id]/checkin` | 来店チェックイン |
| `POST /api/mobile/reservations/[id]/start` | 作業開始 |
| `POST /api/mobile/reservations/[id]/complete` | 作業完了 |

---

## 9. 定期処理（Cron）

| Cron | 機能 |
|---|---|
| `billing` | サブスクリプション課金処理 |
| `follow-up` | 顧客フォローアップ通知 |
| `maintenance` | メンテナンスURL期限チェック |
| `monitor` | システム監視 |
| `news` | 業界ニュース自動取得 |
| `square-sync` | Square売上データ定期同期 |

---

## 10. 主要ワークフロー

### 10.1 施工証明書発行フロー

```
顧客来店 → 予約チェックイン → 作業開始
    ↓
車両登録（車検証OCR or 手動入力）
    ↓
施工実施 → 写真撮影・アップロード
    ↓
証明書作成（施工内容・写真・備考入力）
    ↓
証明書発行 → QRコード生成
    ↓
顧客にQRコード/URL共有
    ↓
顧客がスマホで証明書閲覧
    ↓
保険会社が証明書を検索・照会可能に
```

### 10.2 BtoB受発注フロー

```
施工店A: BtoBプラットフォームに自店情報掲載
    ↓
施工店B: 得意分野で検索 → 問い合わせ
    ↓
施工店A: 見積もり提示
    ↓
施工店B: 発注
    ↓
施工店A: 受注承認 → 作業実施
    ↓
作業完了 → レビュー
    ↓
支払確認 → 取引完了
    ↓
パートナーランクに実績反映
```

### 10.3 代理店紹介フロー

```
代理店: パートナー申請 → 審査
    ↓
承認 → 紹介リンク発行
    ↓
代理店: 施工店を見つけてLedraを紹介
    ↓
紹介登録（店舗名・担当者・連絡先）
    ↓
施工店: Ledra登録 → 利用開始
    ↓
紹介ステータス更新: 申請中 → 契約成立
    ↓
コミッション発生 → 代理店に支払い
    ↓
ランキング・レポートに反映
```

### 10.4 保険会社 証明書照会フロー

```
保険金請求 → 施工証明書の真正性確認が必要
    ↓
保険会社ポータルにログイン
    ↓
証明書検索（public_id / 顧客名 / 車両情報）
    ↓
証明書詳細確認（施工内容・写真・施工店情報）
    ↓
案件として登録（案件管理）
    ↓
必要に応じてメッセージ送信
    ↓
査定完了 → 案件クローズ
```

### 10.5 予約〜会計フロー

```
顧客: 外部予約 or 直接来店
    ↓
予約登録（日付・時間・施工内容）
    ↓
Google Calendar同期
    ↓
当日: チェックイン → 作業開始
    ↓
作業進捗更新（モバイルAPI）
    ↓
作業完了
    ↓
POS会計 or 請求書発行
    ↓
Square/Stripe で決済
    ↓
売上データ連携 → 経営分析に反映
```

### 10.6 請求・課金フロー

```
Ledra利用 → 月次課金（Stripe）
    ↓
施工店: 顧客への請求書発行
    ↓
請求書PDF生成 → メール送信 or 共有リンク
    ↓
支払確認 → ステータス更新
    ↓
未回収 → 期限超過アラート
    ↓
Square売上と突合 → 経営分析
```

---

## 11. 技術スタック

| カテゴリ | 技術 |
|---|---|
| **フレームワーク** | Next.js 15 (App Router, React Compiler) |
| **言語** | TypeScript |
| **スタイリング** | Tailwind CSS v4 + Ledraデザインシステム (CSS変数, ライト/ダーク) |
| **データベース** | Supabase (PostgreSQL) |
| **認証** | Supabase Auth |
| **リアルタイム** | Supabase Realtime (postgres_changes) |
| **決済** | Stripe (Subscriptions, Connect, Terminal) |
| **POS連携** | Square API |
| **メール** | Resend |
| **ファイルストレージ** | Supabase Storage |
| **キャッシュ/レートリミット** | Upstash Redis |
| **非同期処理** | QStash |
| **電子署名** | CloudSign |
| **カレンダー** | Google Calendar API |
| **メッセージング** | LINE Messaging API |
| **エラー監視** | Sentry |
| **分析** | Vercel Analytics + Speed Insights |
| **ホスティング** | Vercel |
| **PWA** | manifest.json + メタタグ（ホーム画面追加対応） |

### 権限管理

ロールベースの細粒度権限システム:
- `dashboard:view`, `certificates:view`, `certificates:create`, `vehicles:view`, `customers:view`
- `reservations:view`, `invoices:view`, `payments:view`, `management:view`
- `orders:view`, `market:view`, `menu_items:manage`, `members:view`
- `settings:view`, `stores:view`, `announcements:view`, `news:view`
- `template_options:view`, `template_options:manage`, `billing:view`
- `audit:view`, `logo:manage`, `shop:view`, `insurers:view`
- `register_sessions:operate`, `price_stats:view`, `platform:operations`

### API数

| ポータル | APIルート数 |
|---|---|
| Admin | 100+ |
| Agent | 15+ |
| Insurer | 25+ |
| 共通/Public | 30+ |
| Mobile | 15+ |
| Webhook | 5 |
| Cron | 6 |
| **合計** | **200+** |
