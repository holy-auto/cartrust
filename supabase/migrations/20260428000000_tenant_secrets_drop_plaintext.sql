-- ============================================================
-- Tenant secrets at-rest encryption: STEP 3 / 3 (drop plaintext)
--
-- 平文列をすべて DROP する。
-- このマイグレーションを適用する前に、必ず以下を確認すること:
--
--   1. PR1 (`*_ciphertext` 列追加 + dual-write/read) がデプロイ済み
--   2. PR2 (`/api/cron/encrypt-secrets-backfill`) を実行し、
--      対象 4 列すべてに対して
--      `<plain> IS NOT NULL AND <ciphertext> IS NULL` の行が 0 件
--   3. PR3 のアプリ (ciphertext-only read/write) が全インスタンスに deploy 済み
--
-- 実行順を間違えると、古いインスタンスが平文列に書き込もうとして失敗する。
--
-- 対象:
--   tenants.line_channel_secret
--   tenants.line_channel_access_token
--   square_connections.square_access_token
--   square_connections.square_refresh_token
-- ============================================================

-- 1) Pre-flight check: 暗号化されていない平文がまだ残っていないか確認
DO $$
DECLARE
  unencrypted_count integer;
BEGIN
  SELECT count(*) INTO unencrypted_count
  FROM tenants
  WHERE (line_channel_secret IS NOT NULL AND line_channel_secret_ciphertext IS NULL)
     OR (line_channel_access_token IS NOT NULL AND line_channel_access_token_ciphertext IS NULL);
  IF unencrypted_count > 0 THEN
    RAISE EXCEPTION
      'Refusing to drop tenant secret plaintext columns: % rows still have plaintext without ciphertext. Run /api/cron/encrypt-secrets-backfill first.',
      unencrypted_count;
  END IF;

  SELECT count(*) INTO unencrypted_count
  FROM square_connections
  WHERE (square_access_token IS NOT NULL AND square_access_token_ciphertext IS NULL)
     OR (square_refresh_token IS NOT NULL AND square_refresh_token_ciphertext IS NULL);
  IF unencrypted_count > 0 THEN
    RAISE EXCEPTION
      'Refusing to drop square_connections plaintext columns: % rows still have plaintext without ciphertext.',
      unencrypted_count;
  END IF;
END
$$;

-- 2) square_connections: 元々 NOT NULL だった列を NULL 許可へ
--    (DROP COLUMN するので実質的には無意味だが、定義の整合性のため明示)
ALTER TABLE square_connections
  ALTER COLUMN square_access_token DROP NOT NULL,
  ALTER COLUMN square_refresh_token DROP NOT NULL;

-- 3) 平文列を DROP
ALTER TABLE tenants
  DROP COLUMN IF EXISTS line_channel_secret,
  DROP COLUMN IF EXISTS line_channel_access_token;

ALTER TABLE square_connections
  DROP COLUMN IF EXISTS square_access_token,
  DROP COLUMN IF EXISTS square_refresh_token;
