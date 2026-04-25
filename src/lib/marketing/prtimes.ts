/**
 * PR TIMES 連携
 *
 * 環境変数 PRTIMES_COMPANY_ID が設定されている場合のみ有効。
 * 未設定時は空配列を返し、他のコンテンツへの影響なし。
 *
 * API: https://prtimes.jp/api/v2/press_releases/?company_id={id}&per_page={n}
 */

// PR TIMES の公開 API は認証不要。company_id のみ必要。
const PRTIMES_API_BASE = "https://prtimes.jp/api/v2";

export type PrTimesRelease = {
  id: number;
  company_id: number;
  company_name: string;
  subject: string;
  subtitle: string | null;
  thumbnail_image_url: string | null;
  published_at: string;
  url: string;
};

type PrTimesApiResponse = {
  data: PrTimesRelease[];
};

/**
 * PR TIMES から最新プレスリリースを取得する。
 * PRTIMES_COMPANY_ID が未設定の場合は空配列を返す（ビルドが壊れない）。
 */
export async function listPrTimesReleases(limit = 10): Promise<PrTimesRelease[]> {
  const companyId = process.env.PRTIMES_COMPANY_ID;
  if (!companyId) return [];

  const url = `${PRTIMES_API_BASE}/press_releases/?company_id=${encodeURIComponent(companyId)}&per_page=${limit}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.warn(`[prtimes] API responded ${res.status}`);
      return [];
    }
    const json = (await res.json()) as PrTimesApiResponse;
    return Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    console.warn("[prtimes] fetch failed:", err);
    return [];
  }
}

/**
 * PR TIMES リリースを、既存の ContentEntry と同じ形に正規化して返す。
 * news ページで MDX コンテンツと統合して表示するためのアダプター。
 */
export type NormalizedNewsEntry = {
  slug: string;
  title: string;
  publishedAt: string;
  excerpt: string | null;
  tags: string[];
  /** 外部リリースへのリンク（undefined なら内部 /news/[slug] にリンク） */
  externalUrl?: string;
};

export function normalizePrTimesRelease(r: PrTimesRelease): NormalizedNewsEntry {
  // PR TIMES の published_at は "YYYY-MM-DD HH:mm:ss" 形式
  const publishedAt = r.published_at.slice(0, 10);

  return {
    slug: `prtimes-${r.id}`,
    title: r.subject,
    publishedAt,
    excerpt: r.subtitle ?? null,
    tags: ["プレスリリース"],
    externalUrl: r.url,
  };
}
