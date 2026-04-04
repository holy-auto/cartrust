-- ============================================================
-- signature_sessions テーブル拡張マイグレーション
-- 自動通知・顧客紐付け・リマインダー管理のためのカラム追加
-- ============================================================

-- 顧客IDとの紐付け（customers テーブル外部キー）
ALTER TABLE signature_sessions
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- LINE ユーザーID（LINE チャネルで通知する際の送信先）
ALTER TABLE signature_sessions
  ADD COLUMN IF NOT EXISTS line_user_id TEXT;

-- リマインダー送信回数（期限前リマインド管理）
ALTER TABLE signature_sessions
  ADD COLUMN IF NOT EXISTS remind_count INTEGER NOT NULL DEFAULT 0;

-- 最終リマインダー送信日時
ALTER TABLE signature_sessions
  ADD COLUMN IF NOT EXISTS last_reminded_at TIMESTAMPTZ;

-- 通知チャネル記録（実際に送信されたチャネル）
ALTER TABLE signature_sessions
  ADD COLUMN IF NOT EXISTS notified_channel TEXT;

-- ============================================================
-- インデックス追加（パフォーマンス最適化）
-- ============================================================

-- customer_id によるルックアップ（顧客ポータルでの確認用）
CREATE INDEX IF NOT EXISTS idx_signature_sessions_customer_id
  ON signature_sessions(customer_id)
  WHERE customer_id IS NOT NULL;

-- status + expires_at による期限切れバッチ処理用
CREATE INDEX IF NOT EXISTS idx_signature_sessions_status_expires
  ON signature_sessions(status, expires_at)
  WHERE status = 'pending';

-- リマインダー対象の抽出用インデックス
CREATE INDEX IF NOT EXISTS idx_signature_sessions_remind
  ON signature_sessions(status, expires_at, remind_count)
  WHERE status = 'pending';

-- ============================================================
-- signature_audit_logs にリマインダーイベントを追加
-- （CHECK 制約は変更できないので、カラムコメントで記録）
-- ============================================================
COMMENT ON TABLE signature_audit_logs IS
  'イベント種別: session_created, notification_sent, reminder_sent, page_opened, signed, verified, expired, cancelled';

-- ============================================================
-- 既存データの notification_sent_at → notified_at の整合性確認
-- （新規カラムではなく既存カラムを活用するため変更なし）
-- ============================================================

-- notification_sent_at カラムのコメント更新
COMMENT ON COLUMN signature_sessions.notification_sent_at IS
  '最初の通知送信日時（LINE/メール）。リマインダーは last_reminded_at を参照。';

-- remind_count カラムのコメント
COMMENT ON COLUMN signature_sessions.remind_count IS
  '送信済みリマインダー回数。期限24時間前・48時間前に各1回ずつ送信（最大2回）。';
