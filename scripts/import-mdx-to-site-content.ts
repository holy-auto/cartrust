/**
 * import-mdx-to-site-content.ts
 *
 * 既存の MDX ファイル（src/content/blog/*.mdx, src/content/news/*.mdx）を
 * site_content_posts テーブルに「公開済み」としてインポートします。
 *
 * 前提:
 *   - SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が env に設定されていること
 *   - site_content_posts テーブルが存在し、type に 'news' が許可されていること
 *     （マイグレーション 20260424020000_site_content_posts_add_news_type.sql 適用済み）
 *
 * 実行:
 *   npx tsx scripts/import-mdx-to-site-content.ts
 *
 * 冪等性:
 *   - (type, slug) で upsert するので、何度実行しても重複しない
 *   - 再実行すると frontmatter / body の最新内容で上書き更新される
 *   - 管理画面で編集した内容は再実行で上書きされるため注意
 *
 * オプション:
 *   --dry-run   差分を表示するだけで書き込まない
 *   --collection blog | news   片方だけインポート
 */

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が必要です。");
  process.exit(1);
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const collectionArgIndex = args.indexOf("--collection");
const onlyCollection =
  collectionArgIndex >= 0 && args[collectionArgIndex + 1] ? args[collectionArgIndex + 1] : null;

type Collection = "blog" | "news";
const COLLECTIONS: Collection[] = ["blog", "news"];

if (onlyCollection && !COLLECTIONS.includes(onlyCollection as Collection)) {
  console.error(`❌ --collection は blog または news を指定してください。received: ${onlyCollection}`);
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CONTENT_ROOT = path.join(process.cwd(), "src", "content");

// ---------------------------------------------------------------
// 簡易 YAML frontmatter パーサ（src/lib/marketing/content.ts と同等）
// ---------------------------------------------------------------
function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const fenceMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!fenceMatch) {
    return { data: {}, body: raw };
  }

  const [, yaml, body] = fenceMatch;
  const data: Record<string, unknown> = {};
  let currentListKey: string | null = null;

  for (const line of yaml.split(/\r?\n/)) {
    if (line.trim() === "" || line.trim().startsWith("#")) continue;

    const listItem = line.match(/^\s+-\s+(.+)$/);
    if (listItem && currentListKey) {
      const arr = (data[currentListKey] ??= []) as unknown[];
      arr.push(coerceScalar(listItem[1].trim()));
      continue;
    }

    const kv = line.match(/^([\w-]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    const [, key, rawValue] = kv;
    const value = rawValue.trim();

    if (value === "") {
      data[key] = [];
      currentListKey = key;
    } else {
      data[key] = coerceScalar(value);
      currentListKey = null;
    }
  }

  return { data, body: body ?? "" };
}

function coerceScalar(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

async function safeReaddir(dir: string): Promise<string[]> {
  try {
    return await fs.readdir(dir);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

function toIsoOrNull(v: unknown): string | null {
  if (typeof v !== "string" || v.trim() === "") return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function asString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.trim() !== "");
}

// ---------------------------------------------------------------
// インポート本体
// ---------------------------------------------------------------
async function importCollection(collection: Collection): Promise<{
  inserted: number;
  updated: number;
  skipped: number;
}> {
  const dir = path.join(CONTENT_ROOT, collection);
  const files = (await safeReaddir(dir)).filter(
    (f) => !f.startsWith("_") && !f.startsWith(".") && (f.endsWith(".mdx") || f.endsWith(".md")),
  );

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const file of files) {
    const full = path.join(dir, file);
    const raw = await fs.readFile(full, "utf-8");
    const { data, body } = parseFrontmatter(raw);

    const slug =
      asString(data.slug) ?? file.replace(/\.mdx?$/, "");
    const title = asString(data.title) ?? slug;

    if (data.draft === true) {
      console.log(`  ⏭  ${collection}/${slug} (draft, skipped)`);
      skipped += 1;
      continue;
    }

    const row = {
      tenant_id: null as string | null,
      type: collection,
      status: "published" as const,
      slug,
      title,
      excerpt: asString(data.excerpt),
      body: body ?? "",
      hero_image_url: asString(data.hero) ?? asString(data.ogImage),
      tags: asStringArray(data.tags),
      author: asString(data.author),
      published_at: toIsoOrNull(data.publishedAt),
      event_start_at: null,
      event_end_at: null,
      location: null,
      online_url: null,
      capacity: null,
      registration_url: null,
    };

    if (dryRun) {
      console.log(`  ➤ [dry-run] ${collection}/${slug} — ${title}`);
      continue;
    }

    // (type, slug) で既存判定
    const { data: existing } = await admin
      .from("site_content_posts")
      .select("id")
      .eq("type", row.type)
      .eq("slug", row.slug)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await admin
        .from("site_content_posts")
        .update(row)
        .eq("id", existing.id);
      if (error) {
        console.error(`  ❌ update ${collection}/${slug}: ${error.message}`);
        continue;
      }
      console.log(`  🔄 updated   ${collection}/${slug}`);
      updated += 1;
    } else {
      const { error } = await admin.from("site_content_posts").insert(row);
      if (error) {
        console.error(`  ❌ insert ${collection}/${slug}: ${error.message}`);
        continue;
      }
      console.log(`  ✅ inserted  ${collection}/${slug}`);
      inserted += 1;
    }
  }

  return { inserted, updated, skipped };
}

async function main() {
  console.log(
    `📥 site_content_posts インポート開始${dryRun ? " (dry-run)" : ""}` +
      (onlyCollection ? ` collection=${onlyCollection}` : ""),
  );

  const targets: Collection[] = onlyCollection
    ? [onlyCollection as Collection]
    : COLLECTIONS;

  let totalInserted = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;

  for (const c of targets) {
    console.log(`\n[${c}]`);
    const r = await importCollection(c);
    totalInserted += r.inserted;
    totalUpdated += r.updated;
    totalSkipped += r.skipped;
  }

  console.log(
    `\n✨ 完了: inserted=${totalInserted} updated=${totalUpdated} skipped=${totalSkipped}` +
      (dryRun ? " (dry-run なので書き込みなし)" : ""),
  );
}

main().catch((e) => {
  console.error("💥 unexpected error:", e);
  process.exit(1);
});
