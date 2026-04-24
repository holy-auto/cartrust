import Link from "next/link";
import { PageHero } from "@/components/marketing/PageHero";
import { Section } from "@/components/marketing/Section";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { CTABanner } from "@/components/marketing/CTABanner";
import { listContent } from "@/lib/marketing/content";
import { listPublishedPosts } from "@/lib/marketing/site-content-posts";

export const metadata = {
  title: "お知らせ",
  description: "Ledra からのプレスリリース・製品アップデート・イベント情報をお届けします。",
  alternates: { canonical: "/news" },
};

type Item = {
  slug: string;
  title: string;
  excerpt?: string;
  publishedAt?: string;
  tags?: string[];
};

export default async function NewsPage() {
  const [mdxEntries, dbPosts] = await Promise.all([listContent("news"), listPublishedPosts(["news"], { limit: 100 })]);

  const seen = new Set<string>();
  const items: Item[] = [];

  for (const p of dbPosts) {
    if (seen.has(p.slug)) continue;
    seen.add(p.slug);
    items.push({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt ?? undefined,
      publishedAt: p.published_at ?? undefined,
      tags: p.tags,
    });
  }

  for (const e of mdxEntries) {
    if (seen.has(e.frontmatter.slug)) continue;
    seen.add(e.frontmatter.slug);
    items.push({
      slug: e.frontmatter.slug,
      title: e.frontmatter.title,
      excerpt: e.frontmatter.excerpt,
      publishedAt: e.frontmatter.publishedAt,
      tags: e.frontmatter.tags,
    });
  }

  items.sort((a, b) => {
    const da = a.publishedAt ?? "";
    const db = b.publishedAt ?? "";
    if (da === db) return a.slug.localeCompare(b.slug);
    return db.localeCompare(da);
  });

  return (
    <>
      <PageHero
        badge="NEWS"
        title="お知らせ"
        subtitle="Ledra からのリリース・アップデート・プレス情報を、順次お届けしてまいります。"
      />

      <Section>
        {items.length === 0 ? (
          <div className="mx-auto max-w-xl text-center rounded-2xl border border-white/[0.08] bg-white/[0.03] p-12">
            <p className="text-sm text-white/50 leading-relaxed">
              近日、最初のお知らせを公開いたします。
              <br />
              しばらくお待ちください。
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl divide-y divide-white/[0.06]">
            {items.map((e, i) => (
              <ScrollReveal key={e.slug} variant="fade-up" delay={i * 50}>
                <Link
                  href={`/news/${e.slug}`}
                  className="group block py-8 first:pt-0 hover:bg-white/[0.02] rounded-xl -mx-4 px-4 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/40">
                    {e.publishedAt && <time dateTime={e.publishedAt}>{formatDate(e.publishedAt)}</time>}
                    {e.tags?.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center rounded-full border border-white/[0.08] px-2.5 py-0.5 text-[0.688rem] font-medium text-white/60"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <h2 className="mt-3 text-lg md:text-xl font-bold text-white group-hover:text-blue-200 transition-colors leading-snug">
                    {e.title}
                  </h2>
                  {e.excerpt && <p className="mt-3 text-sm leading-relaxed text-white/60">{e.excerpt}</p>}
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}
      </Section>

      <CTABanner
        title="最新のお知らせをメールでお届け"
        subtitle="フッターのメルマガ登録から、リリース情報・事例・アップデートをお受け取りいただけます。"
        primaryLabel="資料ダウンロード"
        primaryHref="/resources"
        secondaryLabel="お問い合わせ"
        secondaryHref="/contact"
      />
    </>
  );
}

function formatDate(iso: string): string {
  const datePart = iso.slice(0, 10);
  const [y, m, d] = datePart.split("-");
  if (!y || !m || !d) return iso;
  return `${y}年${Number(m)}月${Number(d)}日`;
}
