-- テナントごとの外部 API キーを追加
-- 外部予約 API（/api/external/booking）などで使用するテナント固有の API キー

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS external_api_key TEXT DEFAULT NULL;

-- 既存テナントに自動でランダム API キーを発行（pgcrypto の gen_random_uuid を使用）
UPDATE tenants
SET external_api_key = 'ldk_' || replace(gen_random_uuid()::text, '-', '')
WHERE external_api_key IS NULL;

-- 新規テナント作成時に自動で API キーを生成するトリガー
CREATE OR REPLACE FUNCTION generate_tenant_api_key()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.external_api_key IS NULL THEN
    NEW.external_api_key := 'ldk_' || replace(gen_random_uuid()::text, '-', '');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trg_generate_tenant_api_key ON tenants;
CREATE TRIGGER trg_generate_tenant_api_key
  BEFORE INSERT ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION generate_tenant_api_key();

-- RLS: テナントの API キーはオーナー/管理者のみ参照可能（anon からは見えない）
-- ※ tenants テーブルの既存 RLS を拡張する形で適用済み
-- API キー列は service role のみ直接参照する運用とする

COMMENT ON COLUMN tenants.external_api_key IS
  '外部 API 連携用テナント固有 API キー。/api/external/booking などで x-api-key ヘッダーに使用。プレフィックス: ldk_';
