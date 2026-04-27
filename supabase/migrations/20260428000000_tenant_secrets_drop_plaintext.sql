-- ============================================================
-- Tenant secrets at-rest encryption: STEP 3 / 3 (drop plaintext)
--
-- 平文列をすべて DROP する。idempotent: 既に適用済みの DB に対して
-- 再実行しても安全 (列が無ければ skip / DROP IF EXISTS)。
--
-- このマイグレーションを適用する前に、必ず以下を確認すること:
--
--   1. PR1 (`*_ciphertext` 列追加 + dual-write/read) がデプロイ済み
--   2. PR2 (`/api/cron/encrypt-secrets-backfill`) を実行し、
--      対象 4 列すべてに対して
--      `<plain> IS NOT NULL AND <ciphertext> IS NULL` の行が 0 件
--   3. PR3 のアプリ (ciphertext-only read/write) が全インスタンスに deploy 済み
--
-- 対象:
--   tenants.line_channel_secret
--   tenants.line_channel_access_token
--   square_connections.square_access_token
--   square_connections.square_refresh_token
-- ============================================================

-- 1) Pre-flight: PR1 (ciphertext 列追加) が適用されていることを確認。
--    無ければ明確なメッセージで早期に失敗させる。
DO $$
DECLARE
  missing text[] := ARRAY[]::text[];
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tenants'
      AND column_name = 'line_channel_secret_ciphertext'
  ) THEN
    missing := array_append(missing, 'tenants.line_channel_secret_ciphertext');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tenants'
      AND column_name = 'line_channel_access_token_ciphertext'
  ) THEN
    missing := array_append(missing, 'tenants.line_channel_access_token_ciphertext');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'square_connections'
      AND column_name = 'square_access_token_ciphertext'
  ) THEN
    missing := array_append(missing, 'square_connections.square_access_token_ciphertext');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'square_connections'
      AND column_name = 'square_refresh_token_ciphertext'
  ) THEN
    missing := array_append(missing, 'square_connections.square_refresh_token_ciphertext');
  END IF;

  IF array_length(missing, 1) > 0 THEN
    RAISE EXCEPTION
      'PR1 (20260427000000_tenant_secrets_ciphertext.sql) must be applied before this migration. Missing columns: %',
      array_to_string(missing, ', ');
  END IF;
END
$$;

-- 2) Pre-flight: 平文列がまだ残っている場合のみ、未暗号化行が無いことを確認。
--    既に DROP 済みなら skip (idempotent)。
DO $$
DECLARE
  unencrypted_count integer;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tenants'
      AND column_name = 'line_channel_secret'
  ) THEN
    EXECUTE 'SELECT count(*) FROM tenants WHERE line_channel_secret IS NOT NULL AND line_channel_secret_ciphertext IS NULL'
      INTO unencrypted_count;
    IF unencrypted_count > 0 THEN
      RAISE EXCEPTION
        'Refusing to drop tenants.line_channel_secret: % rows still have plaintext without ciphertext. Run /admin/platform/encrypt-secrets-backfill first.',
        unencrypted_count;
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tenants'
      AND column_name = 'line_channel_access_token'
  ) THEN
    EXECUTE 'SELECT count(*) FROM tenants WHERE line_channel_access_token IS NOT NULL AND line_channel_access_token_ciphertext IS NULL'
      INTO unencrypted_count;
    IF unencrypted_count > 0 THEN
      RAISE EXCEPTION
        'Refusing to drop tenants.line_channel_access_token: % rows still have plaintext without ciphertext.',
        unencrypted_count;
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'square_connections'
      AND column_name = 'square_access_token'
  ) THEN
    EXECUTE 'SELECT count(*) FROM square_connections WHERE square_access_token IS NOT NULL AND square_access_token_ciphertext IS NULL'
      INTO unencrypted_count;
    IF unencrypted_count > 0 THEN
      RAISE EXCEPTION
        'Refusing to drop square_connections.square_access_token: % rows still have plaintext without ciphertext.',
        unencrypted_count;
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'square_connections'
      AND column_name = 'square_refresh_token'
  ) THEN
    EXECUTE 'SELECT count(*) FROM square_connections WHERE square_refresh_token IS NOT NULL AND square_refresh_token_ciphertext IS NULL'
      INTO unencrypted_count;
    IF unencrypted_count > 0 THEN
      RAISE EXCEPTION
        'Refusing to drop square_connections.square_refresh_token: % rows still have plaintext without ciphertext.',
        unencrypted_count;
    END IF;
  END IF;
END
$$;

-- 3) square_connections: 元々 NOT NULL だった列を NULL 許可へ。
--    DROP COLUMN するので実質的には無意味だが、列がまだ存在する場合のみ
--    実行することで idempotent に保つ (列が無いと ALTER は失敗するため)。
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'square_connections'
      AND column_name = 'square_access_token'
  ) THEN
    EXECUTE 'ALTER TABLE square_connections ALTER COLUMN square_access_token DROP NOT NULL';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'square_connections'
      AND column_name = 'square_refresh_token'
  ) THEN
    EXECUTE 'ALTER TABLE square_connections ALTER COLUMN square_refresh_token DROP NOT NULL';
  END IF;
END
$$;

-- 4) 平文列を DROP (idempotent: IF EXISTS)
ALTER TABLE tenants
  DROP COLUMN IF EXISTS line_channel_secret,
  DROP COLUMN IF EXISTS line_channel_access_token;

ALTER TABLE square_connections
  DROP COLUMN IF EXISTS square_access_token,
  DROP COLUMN IF EXISTS square_refresh_token;
