-- ============================================================
-- agent_signing_requests テーブル拡張
-- CloudSign → Ledra 自前電子署名への移行対応
-- ============================================================

-- Ledra 署名セッション ID（signature_sessions.id）
ALTER TABLE agent_signing_requests
  ADD COLUMN IF NOT EXISTS ledra_session_id UUID REFERENCES signature_sessions(id) ON DELETE SET NULL;

-- ワンタイム署名 URL（代理店へ送るリンク）
ALTER TABLE agent_signing_requests
  ADD COLUMN IF NOT EXISTS sign_url TEXT;

-- 最終通知日時
ALTER TABLE agent_signing_requests
  ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ;

-- 通知チャネル（email / line）
ALTER TABLE agent_signing_requests
  ADD COLUMN IF NOT EXISTS notified_channel TEXT;

-- signature_sessions 経由で検証済みか（ECDSA 検証完了フラグ）
ALTER TABLE agent_signing_requests
  ADD COLUMN IF NOT EXISTS ledra_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- 使用エンジン記録（'cloudsign' or 'ledra'）
ALTER TABLE agent_signing_requests
  ADD COLUMN IF NOT EXISTS sign_engine TEXT NOT NULL DEFAULT 'cloudsign';

-- ============================================================
-- インデックス
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_asr_ledra_session
  ON agent_signing_requests(ledra_session_id)
  WHERE ledra_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_asr_engine
  ON agent_signing_requests(sign_engine, status);

-- ============================================================
-- コメント
-- ============================================================
COMMENT ON COLUMN agent_signing_requests.sign_engine IS
  'cloudsign: CloudSign API 経由, ledra: Ledra 自前 ECDSA 署名';
COMMENT ON COLUMN agent_signing_requests.ledra_session_id IS
  'Ledra 自前署名の場合に参照する signature_sessions.id';
COMMENT ON COLUMN agent_signing_requests.sign_url IS
  'Ledra 署名エンジン使用時のワンタイム URL（/agent-sign/[token]）';
