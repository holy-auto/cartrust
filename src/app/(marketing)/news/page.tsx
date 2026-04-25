import Link from "next/link";
import { PageHero } from "@/components/marketing/PageHero";
import { Section } from "@/components/marketing/Section";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { CTABanner } from "@/components/marketing/CTABanner";
import { listContent } from "@/lib/marketing/content";
import {
  listPrTimesReleases,
  normalizePrTimesRelease,
  type NormalizedNewsEntry,
} from "@/lib/marketing/prtimes";

export const metadata = {
  title: "お知らせ",
  description: "Ledra からのプレスリリース・製品アップデート・イベント情報をお届けします。",
  alternates: { canonical: "/news" },
};

export default async function NewsPage() {
  const [mdxEntries, prTimesReleases] = await Promise.all([
    listContent("news"),
    listPrTimesReleases(20),
  ]);

  // MDX エントリを NormalizedNewsEntry に変換
  const localEntries: NormalizedNewsEntry[] = mdxEntries.map((e) => ({
    slug: e.frontmatter.slug,
    title: e.frontmatter.title,
    publishedAt: e.frontmatter.publishedAt ?? "",
    excerpt: e.frontmatter.excerpt ?? null,
    tags: e.frontmatter.tags ?? [],
  }));

  // PR TIMES リリースを正規化して統合し、日付降順でソート
  const prEntries = prTimesReleases.map(normalizePrTimesRelease);
  const allEntries = [...localEntries, ...prEntries].sort((a, b) => {
    if (a.publishedAt === b.publishedAt) return a.title.localeCompare(b.title);
    return b.publishedAt.localeCompare(a.publishedAt);
  });

  return (
    <>
      <PageHero
        badge="NEWS"
        title="お知らせ"
        subtitle="Ledra からのリリース・アップデート・プレス情報を、順次お届けしてまいります。"
      />

      <Section>
        {allEntries.length === 0 ? (
          <div className="mx-auto max-w-xl text-center rounded-2xl border border-white/[0.08] bg-white/[0.03] p-12">
            <p className="text-sm text-white/50 leading-relaxed">
              近日、最初のお知らせを公開いたします。
              <br />
              しばらくお待ちください。
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl divide-y divide-white/[0.06]">
            {allEntries.map((e, i) => (
              <ScrollReveal key={e.slug} variant="fade-up" delay={i * 50}>
                <NewsEntryRow entry={e} />
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

function NewsEntryRow({ entry }: { entry: NormalizedNewsEntry }) {
  const href = entry.externalUrl ?? `/news/${entry.slug}`;
  const isExternal = !!entry.externalUrl;

  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group block py-8 first:pt-0 hover:bg-white/[0.02] rounded-xl -mx-4 px-4 transition-colors"
    >
      <div className="flex flex-wrap items-center gap-3 text-xs text-white/40">
        {entry.publishedAt && (
          <time dateTime={entry.publishedAt}>{formatDate(entry.publishedAt)}</time>
        )}
        {entry.tags.map((t) => (
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
      <h2 className="mt-3 text-lg md:text-xl font-bold text-white group-hover:text-blue-200 transition-colors leading-snug">
        {entry.title}
      </h2>
      {entry.excerpt && (
        <p className="mt-3 text-sm leading-relaxed text-white/60">{entry.excerpt}</p>
      )}
    </Link>
  );
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${y}年${Number(m)}月${Number(d)}日`;
}
