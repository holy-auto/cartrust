/**
 * Marketing resource PDFs — generated server-side via @react-pdf/renderer.
 *
 * Add new PDFs by exporting a Document component and registering it in
 * `RESOURCE_PDFS` below. The API route `/api/marketing/resources/[key]/pdf`
 * reads the registry.
 */

import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import {
  PLANS,
  TEMPLATE_OPTIONS,
  TEMPLATE_ADDITIONAL_WORK,
  ANNUAL_DISCOUNT_PERCENT,
  ADD_ON_OPTIONS,
  NFC_TAG_PRICING,
  LAUNCH_CAMPAIGN,
  FEATURE_COMPARISON,
} from "@/lib/marketing/pricing";

const NOTO = "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-jp@latest/japanese-400-normal.ttf";
const NOTO_BOLD = "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-jp@latest/japanese-700-normal.ttf";

let fontsRegistered = false;
function ensureFonts() {
  if (fontsRegistered) return;
  Font.register({
    family: "NotoSansJP",
    fonts: [
      { src: NOTO, fontWeight: 400 },
      { src: NOTO_BOLD, fontWeight: 700 },
    ],
  });
  fontsRegistered = true;
}

const colors = {
  bg: "#060a12",
  bgAlt: "#0b111c",
  text: "#ffffff",
  mute: "#8e99b0",
  mute2: "#5f6a81",
  accent: "#60a5fa",
  accent2: "#a78bfa",
  border: "#1a2233",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    backgroundColor: colors.bg,
    color: colors.text,
    padding: 48,
  },
  pageTitle: {
    fontSize: 9,
    color: colors.mute2,
    marginBottom: 6,
    letterSpacing: 2,
  },
  h1: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1.25,
    marginBottom: 16,
    color: colors.text,
  },
  h2: {
    fontSize: 15,
    fontWeight: 700,
    marginTop: 18,
    marginBottom: 8,
    color: colors.text,
  },
  lead: {
    fontSize: 12,
    color: colors.mute,
    lineHeight: 1.7,
    marginBottom: 14,
  },
  body: {
    fontSize: 10.5,
    color: "#c8cfdd",
    lineHeight: 1.75,
    marginBottom: 8,
  },
  card: {
    border: `1pt solid ${colors.border}`,
    borderRadius: 6,
    padding: 14,
    marginVertical: 6,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 4,
    color: colors.text,
  },
  cardDesc: {
    fontSize: 10,
    color: colors.mute,
    lineHeight: 1.6,
  },
  grid2: {
    flexDirection: "row",
    gap: 10,
  },
  gridItem: {
    flex: 1,
  },
  gradientBar: {
    height: 3,
    backgroundColor: colors.accent,
    marginBottom: 22,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: colors.mute2,
  },
  tagline: {
    marginTop: 30,
    fontSize: 14,
    fontWeight: 700,
    color: colors.accent2,
  },
  bullet: {
    fontSize: 10.5,
    color: "#c8cfdd",
    lineHeight: 1.7,
    marginBottom: 4,
    paddingLeft: 14,
  },
  priceLine: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 4,
    marginBottom: 6,
  },
  priceMain: {
    fontSize: 18,
    fontWeight: 700,
    color: colors.text,
  },
  priceUnit: {
    fontSize: 9,
    color: colors.mute2,
    marginLeft: 4,
  },
  planDesc: {
    fontSize: 9.5,
    color: colors.mute,
    marginBottom: 6,
    lineHeight: 1.55,
  },
  pill: {
    alignSelf: "flex-start",
    fontSize: 8,
    color: colors.accent,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    paddingVertical: 5,
  },
  tableHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
    paddingBottom: 5,
    marginTop: 8,
  },
  th: {
    fontSize: 9,
    fontWeight: 700,
    color: colors.mute,
  },
  td: {
    fontSize: 9.5,
    color: "#c8cfdd",
    lineHeight: 1.5,
  },
  col1: { flex: 2 },
  col2: { flex: 1, textAlign: "right" },
});

const updated = new Date().toLocaleDateString("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

/* ────────────────────────────────────────────────────────── */

function Footer({ pageLabel }: { pageLabel: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>Ledra | WEB施工証明書SaaS</Text>
      <Text>
        {pageLabel} · 更新: {updated}
      </Text>
    </View>
  );
}

function Page1Cover() {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.pageTitle}>SERVICE OVERVIEW</Text>
      <View style={styles.gradientBar} />
      <Text style={styles.h1}>記録を、業界の共通言語にする。</Text>
      <Text style={styles.lead}>
        Ledra
        は、自動車施工（コーティング・フィルム・ラッピング・板金・整備）の記録を、改ざん不可能なデジタル証明書として発行・共有する
        WEB 施工証明書 SaaS です。
      </Text>
      <Text style={styles.lead}>
        施工店・代理店・保険会社・顧客の4ポータルが、同じ「施工の事実」を役割に応じて閲覧・検証できる設計により、業界全体の記録文化を一段引き上げます。
      </Text>

      <View style={[styles.card, { marginTop: 26 }]}>
        <Text style={styles.cardTitle}>この資料でお伝えすること</Text>
        <Text style={styles.bullet}>• Ledra が解決する3つの業界課題</Text>
        <Text style={styles.bullet}>• 主要機能と、施工店が得られる業務変化</Text>
        <Text style={styles.bullet}>• 信頼の土台を作る技術（Polygon anchoring / C2PA）</Text>
        <Text style={styles.bullet}>• 導入プロセスとサポート体制</Text>
        <Text style={styles.bullet}>• ご相談の窓口と次のステップ</Text>
      </View>

      <Text style={styles.tagline}>WEB施工証明書SaaS — Ledra</Text>
      <Footer pageLabel="1 / 4" />
    </Page>
  );
}

function Page2Problems() {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.pageTitle}>01 PROBLEM</Text>
      <View style={styles.gradientBar} />
      <Text style={styles.h1}>いま、施工現場の記録に起きていること</Text>
      <Text style={styles.lead}>
        職人の仕事は確かでも、その確かさを「あとから証明できない」という課題が業界全体に残っています。
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>① 伝わらない摩擦</Text>
        <Text style={styles.cardDesc}>
          紙・個人スマホ・Excel に散在する施工記録。同じ精度で顧客・保険会社・次の担当者に届ける共通フォーマットがない。
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>② 消える摩擦</Text>
        <Text style={styles.cardDesc}>
          紙はなくなり、担当者は変わる。3年後に「この車両に何の施工をしたか」を確実に答えられる記録が残っていない。
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>③ 疑われる摩擦</Text>
        <Text style={styles.cardDesc}>
          事故や事後対応の場面で、「本当にその時の写真か」「あとから直していないか」という不信に、紙やスマホ写真では十分答えられない。
        </Text>
      </View>

      <Text style={[styles.lead, { marginTop: 18 }]}>
        Ledra はこの3つの摩擦を、記録の「かたち」だけを変えることで解きます。
      </Text>

      <Footer pageLabel="2 / 4" />
    </Page>
  );
}

function Page3Features() {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.pageTitle}>02 WHAT IT DELIVERS</Text>
      <View style={styles.gradientBar} />
      <Text style={styles.h1}>Ledra が提供するもの</Text>
      <Text style={styles.lead}>施工証明だけではありません。現場の1日の時間の形全体を穏やかに更新します。</Text>

      <View style={styles.grid2}>
        <View style={styles.gridItem}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>デジタル施工証明書</Text>
            <Text style={styles.cardDesc}>
              写真・施工内容・施工者・日時を、ワンクリックで発行。QRコードで顧客に即共有。
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>車両・顧客 360° ビュー</Text>
            <Text style={styles.cardDesc}>1台・1人の履歴を、証明書・予約・請求までタイムラインで横断参照。</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>POS・請求書・予約</Text>
            <Text style={styles.cardDesc}>Tap to Pay 決済、請求書 PDF 自動生成、Google Calendar 同期。</Text>
          </View>
        </View>
        <View style={styles.gridItem}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>保険・代理店連携</Text>
            <Text style={styles.cardDesc}>
              保険会社ポータルで検索・査定・案件管理。代理店ポータルで紹介・コミッション管理。
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>改ざん防止（Polygon anchoring / C2PA）</Text>
            <Text style={styles.cardDesc}>
              証明書ハッシュを Polygon に刻印。施工写真には C2PA 署名を付与。第三者が独立に検証可能。
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>既存ツールとの連携</Text>
            <Text style={styles.cardDesc}>
              Stripe / Square / Google Calendar / LINE / CloudSign と接続。置き換えではなく、橋渡し。
            </Text>
          </View>
        </View>
      </View>

      <Footer pageLabel="3 / 4" />
    </Page>
  );
}

function Page4NextSteps() {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.pageTitle}>03 NEXT STEPS</Text>
      <View style={styles.gradientBar} />
      <Text style={styles.h1}>次のステップ</Text>
      <Text style={styles.lead}>無料プランから始められます。導入支援・トレーニングは担当チームが伴走します。</Text>

      <Text style={styles.h2}>導入プログラム（標準4〜6週間）</Text>
      <Text style={styles.bullet}>1. キックオフ・業務棚卸し（1週目）</Text>
      <Text style={styles.bullet}>2. データ移行・メニュー登録（1〜2週目）</Text>
      <Text style={styles.bullet}>3. テナント初期設定（2週目）</Text>
      <Text style={styles.bullet}>4. 現場トレーニング（3週目）</Text>
      <Text style={styles.bullet}>5. ローンチ・運用定着（4週目以降）</Text>

      <Text style={styles.h2}>ご相談の窓口</Text>
      <Text style={styles.body}>Web: https://ledra.co.jp/contact</Text>
      <Text style={styles.body}>Email: info@ledra.co.jp</Text>
      <Text style={styles.body}>資料一覧: https://ledra.co.jp/resources</Text>
      <Text style={styles.body}>ROIシミュレーター: https://ledra.co.jp/roi</Text>

      <Text style={[styles.tagline, { marginTop: 40 }]}>記録を、業界の共通言語にする。</Text>
      <Text style={[styles.body, { color: colors.mute2, marginTop: 4 }]}>— Ledra チーム</Text>

      <Footer pageLabel="4 / 4" />
    </Page>
  );
}

export function ServiceOverviewPdf() {
  ensureFonts();
  return (
    <Document
      title="Ledra サービス概要"
      author="Ledra"
      subject="WEB施工証明書SaaS サービス概要資料"
      creator="Ledra"
      producer="Ledra"
    >
      {Page1Cover()}
      {Page2Problems()}
      {Page3Features()}
      {Page4NextSteps()}
    </Document>
  );
}

/* ══════════════════════════════════════════════════════════════════
 * Pricing Overview — 料金プラン詳細資料
 * ══════════════════════════════════════════════════════════════════ */

function PricingCover() {
  const pageTotal = 5;
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.pageTitle}>PRICING OVERVIEW</Text>
      <View style={styles.gradientBar} />
      <Text style={styles.h1}>料金プラン詳細</Text>
      <Text style={styles.lead}>
        Ledra
        の各プランに含まれる機能・対応件数・サポート範囲・オプション料金・キャンペーン情報を、見積提示にそのまま使える粒度でまとめた一次資料です。
      </Text>

      <View style={[styles.card, { marginTop: 18 }]}>
        <Text style={styles.cardTitle}>この資料の構成</Text>
        <Text style={styles.bullet}>• 4プラン（フリー / スターター / スタンダード / プロ）の料金と上限</Text>
        <Text style={styles.bullet}>• 機能別比較表（10項目）</Text>
        <Text style={styles.bullet}>• ブランド証明書テンプレートのオプション料金</Text>
        <Text style={styles.bullet}>• 追加店舗・ユーザー・サポート等のオプション料金</Text>
        <Text style={styles.bullet}>• NFCタグ価格と初期100店舗限定キャンペーン</Text>
      </View>

      <View style={[styles.card, { marginTop: 12 }]}>
        <Text style={styles.cardTitle}>料金の基本方針</Text>
        <Text style={styles.cardDesc}>
          ・すべて月額税抜表示（別途消費税）。年間契約で{ANNUAL_DISCOUNT_PERCENT}%割引。{"\n"}
          ・証明書発行数はプラン上限内であれば追加料金なし。{"\n"}
          ・フリープランはクレジットカード登録不要でご利用いただけます。
        </Text>
      </View>

      <Text style={styles.tagline}>記録を、業界の共通言語にする。</Text>
      <Footer pageLabel={`1 / ${pageTotal}`} />
    </Page>
  );
}

function PlanCard({
  name,
  price,
  unit,
  annualPrice,
  annualUnit,
  setupFee,
  description,
  certLimit,
  features,
  recommended,
}: {
  name: string;
  price: string;
  unit: string;
  annualPrice?: string;
  annualUnit?: string;
  setupFee?: string;
  description: string;
  certLimit: string;
  features: readonly string[];
  recommended?: boolean;
}) {
  return (
    <View style={[styles.card, { padding: 12, marginVertical: 4 }]}>
      {recommended && <Text style={styles.pill}>RECOMMENDED</Text>}
      <Text style={styles.cardTitle}>{name}</Text>
      <View style={styles.priceLine}>
        <Text style={styles.priceMain}>{price}</Text>
        <Text style={styles.priceUnit}>{unit}</Text>
        {annualPrice && (
          <Text style={[styles.priceUnit, { marginLeft: 10 }]}>
            / 年間契約 {annualPrice}
            {annualUnit}
          </Text>
        )}
      </View>
      {setupFee && <Text style={[styles.cardDesc, { marginBottom: 4 }]}>初期費用: {setupFee}</Text>}
      <Text style={styles.planDesc}>{description}</Text>
      <Text style={[styles.cardDesc, { marginBottom: 4, color: colors.accent }]}>{certLimit}</Text>
      {features.map((f) => (
        <Text key={f} style={[styles.bullet, { fontSize: 9.5, marginBottom: 2 }]}>
          • {f}
        </Text>
      ))}
    </View>
  );
}

function PricingPlans() {
  const pageTotal = 5;
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.pageTitle}>01 PLANS</Text>
      <View style={styles.gradientBar} />
      <Text style={styles.h1}>4プランの基本料金</Text>
      <Text style={[styles.lead, { marginBottom: 10 }]}>
        発行ボリュームと運用規模に合わせて選べる4プランです。年間契約で{ANNUAL_DISCOUNT_PERCENT}%割引が適用されます。
      </Text>

      <View style={styles.grid2}>
        <View style={styles.gridItem}>
          <PlanCard
            name={PLANS.free.name}
            price={PLANS.free.price}
            unit={PLANS.free.unit}
            description={PLANS.free.description}
            certLimit={PLANS.free.certLimit}
            features={PLANS.free.features}
          />
          <PlanCard
            name={PLANS.standard.name}
            price={PLANS.standard.price}
            unit={PLANS.standard.unit}
            annualPrice={PLANS.standard.annualPrice}
            annualUnit={PLANS.standard.annualUnit}
            setupFee={PLANS.standard.setupFee}
            description={PLANS.standard.description}
            certLimit={PLANS.standard.certLimit}
            features={PLANS.standard.features}
            recommended
          />
        </View>
        <View style={styles.gridItem}>
          <PlanCard
            name={PLANS.starter.name}
            price={PLANS.starter.price}
            unit={PLANS.starter.unit}
            annualPrice={PLANS.starter.annualPrice}
            annualUnit={PLANS.starter.annualUnit}
            description={PLANS.starter.description}
            certLimit={PLANS.starter.certLimit}
            features={PLANS.starter.features}
          />
          <PlanCard
            name={PLANS.pro.name}
            price={PLANS.pro.price}
            unit={PLANS.pro.unit}
            annualPrice={PLANS.pro.annualPrice}
            annualUnit={PLANS.pro.annualUnit}
            setupFee={PLANS.pro.setupFee}
            description={PLANS.pro.description}
            certLimit={PLANS.pro.certLimit}
            features={PLANS.pro.features}
          />
        </View>
      </View>

      <Footer pageLabel={`2 / ${pageTotal}`} />
    </Page>
  );
}

function PricingComparison() {
  const pageTotal = 5;
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.pageTitle}>02 COMPARISON</Text>
      <View style={styles.gradientBar} />
      <Text style={styles.h1}>機能別比較表</Text>
      <Text style={[styles.lead, { marginBottom: 6 }]}>各プランで利用できる主要機能・上限を一覧にまとめました。</Text>

      <View style={styles.tableHead}>
        <Text style={[styles.th, { flex: 2.4 }]}>項目</Text>
        <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>フリー</Text>
        <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>スターター</Text>
        <Text style={[styles.th, { flex: 1.2, textAlign: "right" }]}>スタンダード</Text>
        <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>プロ</Text>
      </View>
      {FEATURE_COMPARISON.map((row) => (
        <View key={row.feature} style={styles.tableRow}>
          <Text style={[styles.td, { flex: 2.4 }]}>{row.feature}</Text>
          <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>{row.free}</Text>
          <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>{row.starter}</Text>
          <Text style={[styles.td, { flex: 1.2, textAlign: "right" }]}>{row.standard}</Text>
          <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>{row.pro}</Text>
        </View>
      ))}

      <Text style={[styles.h2, { marginTop: 22 }]}>料金の適用ルール</Text>
      <Text style={styles.bullet}>• 年間契約で{ANNUAL_DISCOUNT_PERCENT}%割引（月額換算比）。</Text>
      <Text style={styles.bullet}>• 上限超過は翌月以降の上位プラン移行を推奨。当月の発行停止はありません。</Text>
      <Text style={styles.bullet}>• プラン間のアップグレードはいつでも可能（日割り計算）。</Text>
      <Text style={styles.bullet}>• ダウングレードは次回更新時から適用されます。</Text>

      <Footer pageLabel={`3 / ${pageTotal}`} />
    </Page>
  );
}

function PricingTemplateAndAddons() {
  const pageTotal = 5;
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.pageTitle}>03 TEMPLATE & OPTIONS</Text>
      <View style={styles.gradientBar} />
      <Text style={styles.h1}>テンプレートとオプション</Text>

      <Text style={styles.h2}>ブランド証明書テンプレート</Text>
      <View style={styles.grid2}>
        <View style={styles.gridItem}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{TEMPLATE_OPTIONS.preset.name}</Text>
            <View style={styles.priceLine}>
              <Text style={styles.priceMain}>{TEMPLATE_OPTIONS.preset.price}</Text>
              <Text style={styles.priceUnit}>/ {TEMPLATE_OPTIONS.preset.unit}</Text>
            </View>
            <Text style={[styles.cardDesc, { marginBottom: 4 }]}>初期費用: {TEMPLATE_OPTIONS.preset.setupFee}</Text>
            <Text style={styles.planDesc}>{TEMPLATE_OPTIONS.preset.description}</Text>
            {TEMPLATE_OPTIONS.preset.features.map((f) => (
              <Text key={f} style={[styles.bullet, { fontSize: 9.5, marginBottom: 2 }]}>
                • {f}
              </Text>
            ))}
          </View>
        </View>
        <View style={styles.gridItem}>
          <View style={styles.card}>
            <Text style={styles.pill}>RECOMMENDED</Text>
            <Text style={styles.cardTitle}>{TEMPLATE_OPTIONS.custom.name}</Text>
            <View style={styles.priceLine}>
              <Text style={styles.priceMain}>{TEMPLATE_OPTIONS.custom.price}</Text>
              <Text style={styles.priceUnit}>/ {TEMPLATE_OPTIONS.custom.unit}</Text>
            </View>
            <Text style={[styles.cardDesc, { marginBottom: 4 }]}>初期費用: {TEMPLATE_OPTIONS.custom.setupFee}</Text>
            <Text style={styles.planDesc}>{TEMPLATE_OPTIONS.custom.description}</Text>
            {TEMPLATE_OPTIONS.custom.features.map((f) => (
              <Text key={f} style={[styles.bullet, { fontSize: 9.5, marginBottom: 2 }]}>
                • {f}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <Text style={styles.h2}>テンプレート追加作業費</Text>
      <View style={styles.tableHead}>
        <Text style={[styles.th, styles.col1]}>作業内容</Text>
        <Text style={[styles.th, styles.col2]}>料金</Text>
      </View>
      {TEMPLATE_ADDITIONAL_WORK.map((r) => (
        <View key={r.item} style={styles.tableRow}>
          <Text style={[styles.td, styles.col1]}>{r.item}</Text>
          <Text style={[styles.td, styles.col2]}>{r.price}</Text>
        </View>
      ))}

      <Text style={styles.h2}>追加オプション</Text>
      <View style={styles.tableHead}>
        <Text style={[styles.th, styles.col1]}>オプション</Text>
        <Text style={[styles.th, styles.col2]}>料金</Text>
      </View>
      {Object.values(ADD_ON_OPTIONS).map((opt) => {
        const hasPack = "packPrice" in opt && opt.packPrice;
        const price = hasPack
          ? `${opt.price}${opt.unit}（${opt.packPrice}${opt.packUnit}パック）`
          : `${opt.price}${opt.unit}`;
        return (
          <View key={opt.name} style={styles.tableRow}>
            <Text style={[styles.td, styles.col1]}>{opt.name}</Text>
            <Text style={[styles.td, styles.col2]}>{price}</Text>
          </View>
        );
      })}

      <Footer pageLabel={`4 / ${pageTotal}`} />
    </Page>
  );
}

function PricingCampaignAndNfc() {
  const pageTotal = 5;
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.pageTitle}>04 NFC & CAMPAIGN</Text>
      <View style={styles.gradientBar} />
      <Text style={styles.h1}>NFCタグ & キャンペーン</Text>

      <Text style={styles.h2}>NFCタグ価格</Text>
      <Text style={styles.body}>
        各テナントには初回 {NFC_TAG_PRICING.freeAllocation} 枚まで無償で配布します（追加購入はパック単位）。
      </Text>
      <View style={styles.tableHead}>
        <Text style={[styles.th, styles.col1]}>枚数</Text>
        <Text style={[styles.th, styles.col2]}>価格</Text>
      </View>
      {NFC_TAG_PRICING.packs.map((p) => (
        <View key={p.quantity} style={styles.tableRow}>
          <Text style={[styles.td, styles.col1]}>{p.quantity}枚パック</Text>
          <Text style={[styles.td, styles.col2]}>{p.price}</Text>
        </View>
      ))}

      <Text style={[styles.h2, { marginTop: 24 }]}>初期{LAUNCH_CAMPAIGN.maxSlots}店舗限定キャンペーン</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>適用条件</Text>
        <Text style={styles.bullet}>• 対象プラン: {LAUNCH_CAMPAIGN.plans.map((p) => PLANS[p].name).join(" / ")}</Text>
        <Text style={styles.bullet}>• 対象枠: 先着 {LAUNCH_CAMPAIGN.maxSlots} 店舗</Text>
        <Text style={styles.bullet}>• 適用期間: 初年度のみ（{LAUNCH_CAMPAIGN.durationMonths}ヶ月）</Text>
        <Text style={styles.bullet}>
          • NFCタグ初回配布数: {LAUNCH_CAMPAIGN.nfcFreeAllocation} 枚（通常 {NFC_TAG_PRICING.freeAllocation} 枚）
        </Text>
      </View>
      <Text style={[styles.cardDesc, { marginTop: 6 }]}>{LAUNCH_CAMPAIGN.description}</Text>

      <Text style={[styles.h2, { marginTop: 20 }]}>見積・契約に関する補足</Text>
      <Text style={styles.bullet}>• 表記はすべて税抜（別途消費税10%）。</Text>
      <Text style={styles.bullet}>• 請求は月末締め・翌月末払い。クレジットカードまたは口座振替にて承ります。</Text>
      <Text style={styles.bullet}>• 大規模導入・グループ法人・業種特化オプションは別途お見積りいたします。</Text>

      <Footer pageLabel={`5 / ${pageTotal}`} />
    </Page>
  );
}

export function PricingOverviewPdf() {
  ensureFonts();
  return (
    <Document
      title="Ledra 料金プラン詳細"
      author="Ledra"
      subject="Ledra 料金プラン・オプション・キャンペーン詳細"
      creator="Ledra"
      producer="Ledra"
    >
      {PricingCover()}
      {PricingPlans()}
      {PricingComparison()}
      {PricingTemplateAndAddons()}
      {PricingCampaignAndNfc()}
    </Document>
  );
}

/* ══════════════════════════════════════════════════════════════════
 * Features Deep Dive — 機能紹介資料
 * ══════════════════════════════════════════════════════════════════ */

type FeatureGroup = {
  id: string;
  title: string;
  subtitle: string;
  features: { title: string; description: string }[];
};

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    id: "certificate",
    title: "施工証明・記録",
    subtitle: "現場の記録を、改ざんできない証明書に変える。",
    features: [
      {
        title: "デジタル施工証明書",
        description: "写真・施工内容・施工者・日時をまとめた証明書をワンクリックで発行。QRコードで顧客に即共有。",
      },
      {
        title: "施工写真の C2PA 署名",
        description: "撮影時に証明書と紐付け、C2PA 規格で署名。後からの差し替え・改変を検知可能にします。",
      },
      {
        title: "Polygon anchoring",
        description:
          "証明書ハッシュを Polygon ブロックチェーンに刻印。監査時に『その時点で存在した』ことを独立に検証できます。",
      },
      {
        title: "バッチ PDF 出力",
        description: "複数証明書の一括 PDF 生成。保険会社・監査機関への一括提出をシンプルに。",
      },
      {
        title: "無効化・再発行・複製",
        description: "誤発行は理由付きで無効化、同じ仕様の別車両は複製で発行。現場の業務実態に即した運用。",
      },
      {
        title: "NFC 対応",
        description: "NFC タグに証明書を紐付け。スマホをかざすだけで施工証明を確認できるプレミアム体験。",
      },
    ],
  },
  {
    id: "vehicle",
    title: "車両・顧客管理",
    subtitle: "一台・一人の履歴を、時系列で全員が見られる。",
    features: [
      {
        title: "車検証 OCR",
        description:
          "車検証をカメラで撮影するだけで車両情報を自動入力。Claude Vision で画像から構造化データを直接抽出。",
      },
      {
        title: "サービス履歴タイムライン",
        description:
          "証明書・予約・作業・NFC 書込を一本の時系列に合成して表示。『他に何が行われたか』が1画面で分かります。",
      },
      {
        title: "顧客 360° ビュー",
        description:
          "基本情報・車両・証明書・予約案件・請求書をタブ切替で横断参照。顧客コンテキストを保持したまま次アクションへ。",
      },
      {
        title: "CSV インポート",
        description: "既存顧客データ・車両データを一括取り込み。初期導入時のデータ移行をスムーズに。",
      },
    ],
  },
  {
    id: "operations",
    title: "予約・作業・会計",
    subtitle: "受付から決済まで、現場の動きそのままに。",
    features: [
      {
        title: "予約・作業管理",
        description: "予約受付からチェックイン、作業進捗、完了までを一元管理。Google カレンダーと双方向同期。",
      },
      {
        title: "POS 会計",
        description: "施工完了後のお会計をその場で。カード決済・現金・QR 決済に対応。Square 連携で端末決済も。",
      },
      {
        title: "請求書・帳票",
        description: "請求書を PDF で自動生成。メール送信や共有リンクで顧客に送付。未回収アラート付き。",
      },
      {
        title: "BtoB 受発注",
        description: "他の施工店と連携。得意分野を活かした仕事の受発注がプラットフォーム上で完結。",
      },
    ],
  },
  {
    id: "analytics",
    title: "経営・分析",
    subtitle: "感覚ではなく、データで判断する。",
    features: [
      {
        title: "ダッシュボード",
        description: "KPI カード、30日間発行推移、ステータス内訳チャート。運営権限では業種別・地域別の全体統計も。",
      },
      {
        title: "パートナーランク",
        description:
          "施工品質・実績に応じたプラチナ/ゴールド/シルバー/ブロンズ/スターターの5段階。保険会社・顧客への信頼指標に。",
      },
      {
        title: "売上分析・顧客分析",
        description: "売上推移・顧客単価・リピート率・キャッシュフローを可視化。データに基づく経営判断を支援。",
      },
      {
        title: "ウィジェットカスタマイズ",
        description: "ダッシュボードの表示項目・順序をユーザーごとに設定可能。役割に応じた画面を。",
      },
    ],
  },
  {
    id: "verification",
    title: "保険・代理店との連携",
    subtitle: "保険会社・代理店を、同じ事実の上に乗せる。",
    features: [
      {
        title: "保険会社ポータル",
        description: "証明書の検索・照会、案件管理、分析を一画面で。査定時に『この車に何が行われたか』を即確認。",
      },
      {
        title: "代理店ポータル",
        description: "施工店の紹介、コミッション管理、レポート。代理店のパフォーマンスを可視化。",
      },
      {
        title: "顧客ポータル",
        description: "エンドユーザーが自分の証明書をスマホで閲覧。QR コード・URL からアクセス。",
      },
      {
        title: "電子署名（自前実装）",
        description:
          "代理店契約・NDA を ECDSA P-256 ベースの自前電子署名で締結。電子署名法準拠、鍵ローテーション・監査ログ対応。",
      },
    ],
  },
  {
    id: "mobile",
    title: "モバイル・オフライン",
    subtitle: "現場のスマホで、現場の速度で。",
    features: [
      {
        title: "モバイル最適化 UI",
        description: "現場スタッフ向けのタブレット・スマホ前提の UI。撮影 → 証明書発行の最短動線。",
      },
      {
        title: "Tap to Pay (iPhone)",
        description: "iPhone をそのままカードリーダーに。追加機材不要で現場決済が可能 (Stripe 連携)。",
      },
      {
        title: "PWA 対応",
        description: "ブラウザから『ホームに追加』でアプリのように起動。Service Worker で通信が不安定な場所でも。",
      },
    ],
  },
  {
    id: "integration",
    title: "連携・API",
    subtitle: "既存の業務と、無理なくつなぐ。",
    features: [
      {
        title: "Stripe / Square",
        description: "Stripe サブスクリプション・請求書、Square POS 端末決済。既存の決済フローに組み込めます。",
      },
      {
        title: "Google Calendar / LINE",
        description: "予約カレンダー同期、顧客 LINE 通知。現場で使っているツールと直接つながります。",
      },
      {
        title: "外部 API",
        description: "テナントごとの外部 API キー発行。自社 CRM・基幹システムとの連携を実装可能。",
      },
      {
        title: "Webhook 配信",
        description: "証明書発行・無効化・予約確定などを Webhook で配信。リアルタイム連携を実現。",
      },
    ],
  },
];

function FeaturesCover() {
  const pageTotal = 2 + FEATURE_GROUPS.length + 1;
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.pageTitle}>FEATURES DEEP DIVE</Text>
      <View style={styles.gradientBar} />
      <Text style={styles.h1}>Ledra 機能紹介</Text>
      <Text style={styles.lead}>
        証明書発行から、車両・顧客管理、POS・帳票、経営分析、保険・代理店連携まで。Ledra
        の全機能を、役割横断でご紹介します。
      </Text>

      <View style={[styles.card, { marginTop: 18 }]}>
        <Text style={styles.cardTitle}>本資料の読み方</Text>
        <Text style={styles.bullet}>• 7カテゴリ、合計約30の機能を、業務の順番に沿って並べています。</Text>
        <Text style={styles.bullet}>• Admin / Agent / Insurer / Customer の4ポータルで利用可能な機能を明示。</Text>
        <Text style={styles.bullet}>• 料金・契約条件は別紙「料金プラン詳細資料」をご参照ください。</Text>
      </View>

      <Text style={[styles.h2, { marginTop: 18 }]}>目次</Text>
      {FEATURE_GROUPS.map((g, i) => (
        <Text key={g.id} style={styles.bullet}>
          {String(i + 1).padStart(2, "0")}. {g.title} — {g.subtitle}
        </Text>
      ))}

      <Text style={styles.tagline}>記録を、業界の共通言語にする。</Text>
      <Footer pageLabel={`1 / ${pageTotal}`} />
    </Page>
  );
}

function FeaturesFourPortal() {
  const pageTotal = 2 + FEATURE_GROUPS.length + 1;
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.pageTitle}>00 OVERVIEW</Text>
      <View style={styles.gradientBar} />
      <Text style={styles.h1}>ひとつの記録を、4ポータルで共有</Text>
      <Text style={styles.lead}>
        施工店・代理店・保険会社・顧客は、同じ「事実」を役割に応じた最適な形で受け取ります。
      </Text>

      <View style={styles.grid2}>
        <View style={styles.gridItem}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Admin（施工店）</Text>
            <Text style={styles.cardDesc}>
              証明書の発行・管理、車両・顧客、予約・作業・POS・請求、経営ダッシュボード。現場運用の中心。
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Insurer（保険会社）</Text>
            <Text style={styles.cardDesc}>
              証明書の検索・照会、案件管理、地域別・パートナー別の集計分析。査定の一次資料として。
            </Text>
          </View>
        </View>
        <View style={styles.gridItem}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Agent（代理店）</Text>
            <Text style={styles.cardDesc}>
              施工店の紹介、コミッション管理、電子署名による契約締結、担当施工店のパフォーマンスレポート。
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Customer（顧客）</Text>
            <Text style={styles.cardDesc}>
              受け取った証明書をスマホで閲覧・共有。QR/URL/NFC の3経路でアクセス。車両の過去履歴も確認。
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.h2, { marginTop: 12 }]}>共通する設計思想</Text>
      <Text style={styles.bullet}>• 「記録は1つ・見え方は4つ」。同じ証明書を役割ごとに最適化して提示。</Text>
      <Text style={styles.bullet}>• RLS（行レベルセキュリティ）で、役割に応じて自動的に見える範囲を絞り込み。</Text>
      <Text style={styles.bullet}>• 4ポータル間の権限委譲・切替はワンクリック。テナント境界は常に明確。</Text>

      <Footer pageLabel={`2 / ${pageTotal}`} />
    </Page>
  );
}

function FeatureGroupPage({ group, index, pageTotal }: { group: FeatureGroup; index: number; pageTotal: number }) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.pageTitle}>
        {String(index + 1).padStart(2, "0")} {group.title.toUpperCase()}
      </Text>
      <View style={styles.gradientBar} />
      <Text style={styles.h1}>{group.title}</Text>
      <Text style={[styles.lead, { marginBottom: 10 }]}>{group.subtitle}</Text>

      <View style={styles.grid2}>
        <View style={styles.gridItem}>
          {group.features
            .filter((_, i) => i % 2 === 0)
            .map((f) => (
              <View key={f.title} style={styles.card}>
                <Text style={styles.cardTitle}>{f.title}</Text>
                <Text style={styles.cardDesc}>{f.description}</Text>
              </View>
            ))}
        </View>
        <View style={styles.gridItem}>
          {group.features
            .filter((_, i) => i % 2 === 1)
            .map((f) => (
              <View key={f.title} style={styles.card}>
                <Text style={styles.cardTitle}>{f.title}</Text>
                <Text style={styles.cardDesc}>{f.description}</Text>
              </View>
            ))}
        </View>
      </View>

      <Footer pageLabel={`${index + 3} / ${pageTotal}`} />
    </Page>
  );
}

function FeaturesClosing() {
  const pageTotal = 2 + FEATURE_GROUPS.length + 1;
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.pageTitle}>{String(FEATURE_GROUPS.length + 1).padStart(2, "0")} NEXT STEPS</Text>
      <View style={styles.gradientBar} />
      <Text style={styles.h1}>次のステップ</Text>
      <Text style={styles.lead}>
        ご興味のある機能について、デモ画面とご一緒にご説明できます。30分のオンラインデモから承ります。
      </Text>

      <Text style={styles.h2}>確認のためのチェックリスト</Text>
      <Text style={styles.bullet}>• 現在の施工記録の保存方法（紙・Excel・他システム）</Text>
      <Text style={styles.bullet}>• 月間の施工件数・車両台数・主な車種</Text>
      <Text style={styles.bullet}>• 既に利用している会計・予約・決済ツール</Text>
      <Text style={styles.bullet}>• 保険会社・代理店との連携状況</Text>
      <Text style={styles.bullet}>• 現場スタッフのモバイル端末利用状況</Text>

      <Text style={[styles.h2, { marginTop: 18 }]}>よくいただくご質問</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Q. 既存の顧客・車両データは移行できますか？</Text>
        <Text style={styles.cardDesc}>
          はい。CSV インポート機能で一括移行可能です。テンプレートをお渡ししますので、移行作業は平均
          1〜2日で完了します。
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Q. 現場スタッフへの教育はどのくらい必要ですか？</Text>
        <Text style={styles.cardDesc}>
          タブレット/スマホ前提の UI なので、初回 30 分のトレーニングで発行フローに慣れていただけます。
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Q. API や Webhook で自社システムと連携できますか？</Text>
        <Text style={styles.cardDesc}>
          プロプランで提供。テナント固有の API キー・Webhook
          エンドポイントで、証明書発行時などをリアルタイム連携可能です。
        </Text>
      </View>

      <Text style={[styles.h2, { marginTop: 18 }]}>ご相談窓口</Text>
      <Text style={styles.body}>Web: https://ledra.co.jp/contact</Text>
      <Text style={styles.body}>Email: info@ledra.co.jp</Text>
      <Text style={styles.body}>料金詳細: https://ledra.co.jp/pricing</Text>

      <Footer pageLabel={`${pageTotal} / ${pageTotal}`} />
    </Page>
  );
}

export function FeaturesDeepDivePdf() {
  ensureFonts();
  const pageTotal = 2 + FEATURE_GROUPS.length + 1;
  return (
    <Document
      title="Ledra 機能紹介資料"
      author="Ledra"
      subject="Ledra の全機能をカテゴリ別に紹介する資料"
      creator="Ledra"
      producer="Ledra"
    >
      {FeaturesCover()}
      {FeaturesFourPortal()}
      {FEATURE_GROUPS.map((g, i) => (
        <React.Fragment key={g.id}>{FeatureGroupPage({ group: g, index: i, pageTotal })}</React.Fragment>
      ))}
      {FeaturesClosing()}
    </Document>
  );
}

/**
 * Registry of available marketing PDFs. Add entries here to expose new
 * downloadable resources; the API route `/api/marketing/resources/[key]/pdf`
 * reads from this map.
 */
export const RESOURCE_PDFS: Record<string, { filename: string; doc: () => React.ReactElement }> = {
  "service-overview": {
    filename: "Ledra_Service_Overview.pdf",
    doc: () => <ServiceOverviewPdf />,
  },
  "pricing-overview": {
    filename: "Ledra_Pricing_Overview.pdf",
    doc: () => <PricingOverviewPdf />,
  },
  "features-deep-dive": {
    filename: "Ledra_Features_Deep_Dive.pdf",
    doc: () => <FeaturesDeepDivePdf />,
  },
};
