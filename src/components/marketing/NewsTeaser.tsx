import Link from "next/link";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { ScrollReveal } from "./ScrollReveal";
import { listContent } from "@/lib/marketing/content";
import {
  listPrTimesReleases,
  normalizePrTimesRelease,
  type NormalizedNewsEntry,
} from "@/lib/marketing/prtimes";

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${y}年${Number(m)}月${Number(d)}日`;
}

/**
 * Latest-news teaser for the homepage. Hidden when the news collection
 * is empty — we don't want a blank section when there's nothing to say.
 */
export async function NewsTeaser() {
  const [mdxEntries, prTimesReleases] = await Promise.all([
    listContent("news"),
    listPrTimesReleases(10),
  ]);

  const localEntries: NormalizedNewsEntry[] = mdxEntries.map((e) => ({
    slug: e.frontmatter.slug,
    title: e.frontmatter.title,
    publishedAt: e.frontmatter.publishedAt ?? "",
    excerpt: e.frontmatter.excerpt ?? null,
    tags: e.frontmatter.tags ?? [],
  }));

  const prEntries = prTimesReleases.map(normalizePrTimesRelease);
  const allEntries = [...localEntries, ...prEntries]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 3);

  if (allEntries.length === 0) return null;

  return (
    <Section bg="alt" id="news">
      <SectionHeading title="お知らせ" subtitle="Ledra からの最新のリリース情報・プレスリリース。" />
      <div className="mx-auto max-w-3xl divide-y divide-white/[0.06]">
        {allEntries.map((e, i) => {
          const href = e.externalUrl ?? `/news/${e.slug}`;
          const isExternal = !!e.externalUrl;
          return (
            <ScrollReveal key={e.slug} variant="fade-up" delay={i * 60}>
              <Link
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="group block py-6 first:pt-0 hover:bg-white/[0.02] rounded-xl -mx-4 px-4 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/40">
                  {e.publishedAt && (
                    <time dateTime={e.publishedAt}>{formatDate(e.publishedAt)}</time>
                  )}
                  {e.tags.slice(0, 1).map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full border border-white/[0.08] px-2.5 py-0.5 text-[0.688rem] font-medium text-white/60"
                    >
                      {t}
                    </span>
                  ))}
                  {isExternal && (
                    <span className="inline-flex items-center gap-1 text-white/30 text-[0.688rem]">
                      PR TIMES ↗
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-base md:text-lg font-bold text-white group-hover:text-blue-200 transition-colors leading-snug">
                  {e.title}
                </h3>
                {e.excerpt && (
                  <p className="mt-2 text-sm leading-relaxed text-white/55 line-clamp-2">
                    {e.excerpt}
                  </p>
                )}
              </Link>
            </ScrollReveal>
          );
        })}
      </div>
      <div className="mt-10 text-center">
        <Link
          href="/news"
          data-cta-location="home-news-teaser"
          data-cta-label="view-all-news"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          すべてのお知らせを見る →
        </Link>
      </div>
    </Section>
  );
}
