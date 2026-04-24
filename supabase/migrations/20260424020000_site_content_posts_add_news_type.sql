-- ============================================================
-- site_content_posts.type に 'news' を追加
-- 既存 CHECK 制約を削除 → 再作成
-- ============================================================

ALTER TABLE site_content_posts
  DROP CONSTRAINT IF EXISTS site_content_posts_type_check;

ALTER TABLE site_content_posts
  ADD CONSTRAINT site_content_posts_type_check
  CHECK (type IN ('blog', 'news', 'event', 'webinar'));
