import fs from 'node:fs';
import path from 'node:path';
import issuersJson from '../../data/issuers.json';
import programsJson from '../../data/programs.json';
import changelogJson from '../../data/changelog.json';
import type { Card, CardSummary, ChangelogEntry, Issuer, Lang, Program, Reward, RewardType, Tag } from './types';
import { CAT_LABEL, asset, fmtNum, fmtPct, fmtRate, fmtUsd, tr, UI } from './i18n';

const cardModules = import.meta.glob<Card[]>('../../data/cards/*.json', { eager: true, import: 'default' });

export const issuers: Issuer[] = issuersJson as Issuer[];
export const issuerById = new Map(issuers.map((b) => [b.id, b]));
export const programs: Program[] = (programsJson as { programs: Program[] }).programs;
export const programById = new Map(programs.map((p) => [p.id, p]));
export const valuationSource = (programsJson as any).source as { name: string; url: string; as_of: string; retrieved?: string; method: { en: string; zh: string } };

const everyCard: Card[] = Object.values(cardModules).flat().filter((c) => issuerById.has(c.issuer));
/** Cards shown on the site (needs_review cards stay hidden until a maintainer clears them). */
export const cards: Card[] = everyCard
  .filter((c) => !c.needs_review)
  .sort((a, b) => issuers.findIndex((x) => x.id === a.issuer) - issuers.findIndex((x) => x.id === b.issuer));
export const hiddenCount = (issuerId: string) => everyCard.filter((c) => c.issuer === issuerId && c.needs_review).length;
export const cardById = new Map(cards.map((c) => [c.id, c]));
export const activeCards = cards.filter((c) => c.status === 'active');
export const changelog: ChangelogEntry[] = (changelogJson as ChangelogEntry[]).slice().sort((a, b) => b.date.localeCompare(a.date));
export const cardsOfIssuer = (id: string) => cards.filter((c) => c.issuer === id);
export const cardsOfType = (t: RewardType) => cards.filter((c) => c.reward_type === t);

/* ---------- images ---------- */
const localImages = new Map<string, string>();
try {
  for (const f of fs.readdirSync(path.resolve(process.cwd(), 'public/cards'))) {
    const m = /^(.+)\.(png|jpe?g|webp|svg|avif)$/i.exec(f);
    if (m && !localImages.has(m[1])) localImages.set(m[1], asset(`/cards/${f}`));
  }
} catch {
  /* no local images yet */
}
function placeholderSvg(card: Card, issuer: Issuer | undefined): string {
  const color = issuer?.color ?? '#5b6663';
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const name = card.name.replace(/[®™℠]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 202"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${color}" stop-opacity="0.72"/></linearGradient></defs><rect width="320" height="202" rx="16" fill="url(#g)"/><rect x="24" y="64" width="46" height="34" rx="6" fill="#fff" fill-opacity="0.85"/><text x="24" y="40" font-family="system-ui, sans-serif" font-size="14" fill="#fff" fill-opacity="0.9">${esc(issuer?.short_name ?? card.issuer)}</text><text x="24" y="160" font-family="system-ui, sans-serif" font-size="${name.length > 30 ? 12 : 16}" font-weight="700" fill="#fff">${esc(name.slice(0, 44))}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
/** Resolution order: committed file in public/cards/<id>.* → official image_url → generated placeholder. */
export function cardImage(card: Card): { src: string; isPlaceholder: boolean; isRemote: boolean } {
  const local = card.image ? card.image : localImages.get(card.id);
  if (local) return { src: local, isPlaceholder: false, isRemote: false };
  if (card.image_url) return { src: card.image_url, isPlaceholder: false, isRemote: true };
  return { src: placeholderSvg(card, issuerById.get(card.issuer)), isPlaceholder: true, isRemote: false };
}

/* ---------- rates & valuations ---------- */
export const programOf = (card: Card): Program => programById.get(card.program) ?? programById.get('cash')!;
/** True when the card's currency is not plain cash, so a "≈ %" estimate is worth showing. */
export const needsEstimate = (card: Card) => programOf(card).kind !== 'cash' && programOf(card).kind !== 'restricted';
/** Approximate cash-back percentage of an earn rate: rate × estimated cents per point. */
export const cashEquiv = (card: Card, rate: number) => rate * programOf(card).cpp;
export const baseReward = (card: Card): Reward | undefined => card.rewards.find((r) => r.cat === 'all');
export function topReward(card: Card): Reward | undefined {
  const featured = card.rewards.find((r) => r.featured);
  if (featured) return featured;
  // Housing payments on Bilt cards are capped by other spend, so they never headline.
  const pool = card.rewards.filter((r) => r.cat !== 'rent');
  return pool.reduce<Reward | undefined>((a, b) => (!a || b.rate > a.rate ? b : a), undefined);
}
export function unitWord(card: Card, lang: Lang, n = 2): string {
  const u = programOf(card).unit;
  if (lang === 'zh') return u === 'miles' ? '哩' : u === 'usd' ? '元' : '點';
  if (u === 'usd') return n === 1 ? 'dollar' : 'dollars';
  return u === 'miles' ? (n === 1 ? 'mile' : 'miles') : n === 1 ? 'point' : 'points';
}
/** "5X points" / "3% cash back" / "5X 點" */
export function rateText(card: Card, r: Reward, lang: Lang, withUnit = false): string {
  const base = fmtRate(r.rate, card.earn_unit);
  if (!withUnit) return base;
  if (card.earn_unit === 'pct') return lang === 'zh' ? base : `${base} back`;
  return `${base} ${unitWord(card, lang)}`;
}
export const catLabel = (r: Reward, lang: Lang) => tr(CAT_LABEL[r.cat], lang);

export function headline(card: Card, lang: Lang): string {
  const t = UI[lang];
  if (card.rewards.length === 0) {
    if (card.intro_apr) return t.card.introText(card.intro_apr.months, t.card.introOn[card.intro_apr.on]);
    return tr(card.highlights[0], lang) || t.card.rewardsNone;
  }
  const base = baseReward(card);
  const rest = card.rewards.filter((r) => r.cat !== 'all' && r.cat !== 'rent').sort((a, b) => b.rate - a.rate).slice(0, 2);
  const parts = [...rest, ...(base ? [base] : [])].map((r) => (lang === 'zh' ? `${catLabel(r, lang)} ${rateText(card, r, lang)}` : `${rateText(card, r, lang)} ${catLabel(r, lang).toLowerCase()}`));
  const u = card.earn_unit === 'x' ? (lang === 'zh' ? `（${unitWord(card, lang)}）` : ` (${unitWord(card, lang)})`) : '';
  return parts.join(lang === 'zh' ? '・' : ', ') + u;
}

/* ---------- welcome offers ---------- */
export function welcomeShort(card: Card, lang: Lang): string | undefined {
  const w = card.welcome;
  if (!w?.value || !w.unit) return undefined;
  if (w.unit === 'usd') return fmtUsd(w.value);
  if (w.unit === 'nights') return lang === 'zh' ? `${w.value} 晚免費住宿` : `${w.value} free nights`;
  return lang === 'zh' ? `${fmtNum(w.value)} ${w.unit === 'miles' ? '哩' : '點'}` : `${fmtNum(w.value)} ${w.unit}`;
}
export function welcomeText(card: Card, lang: Lang): string | undefined {
  const w = card.welcome;
  if (!w) return undefined;
  if (w.text) return tr(w.text, lang);
  const what = welcomeShort(card, lang);
  if (!what) return tr(w.extra, lang) || undefined;
  let s = what;
  if (w.spend && w.months) s = lang === 'zh' ? `開卡 ${w.months} 個月內消費滿 ${fmtUsd(w.spend)} 可獲 ${what}` : `${what} after ${fmtUsd(w.spend)} in purchases in the first ${w.months} months`;
  if (w.extra) s += lang === 'zh' ? `（${tr(w.extra, lang)}）` : ` (${tr(w.extra, lang)})`;
  return s;
}
/** Estimated dollar value of a points/miles welcome offer. */
export function welcomeValue(card: Card): number | undefined {
  const w = card.welcome;
  if (!w?.value || (w.unit !== 'points' && w.unit !== 'miles')) return undefined;
  return Math.round((w.value * programOf(card).cpp) / 100 / 5) * 5;
}

/* ---------- fees & tags ---------- */
export function formatFee(card: Card, lang: Lang): string {
  const { amount, first_year } = card.annual_fee;
  if (amount === 0) return lang === 'zh' ? '免年費' : '$0';
  if (first_year !== undefined && first_year !== amount) return lang === 'zh' ? `${fmtUsd(amount)}（首年 ${fmtUsd(first_year)}）` : `${fmtUsd(amount)} (${fmtUsd(first_year)} first year)`;
  return fmtUsd(amount);
}
const TRAVEL_CATS = new Set(['travel', 'portal', 'flights', 'hotels', 'airline', 'hotel_brand']);
export function deriveTags(card: Card): Tag[] {
  const tags = new Set<Tag>(card.tags ?? []);
  const base = baseReward(card)?.rate ?? 0;
  const bonus = (cat: string) => card.rewards.some((r) => r.cat === cat && r.rate > Math.max(base, 1));
  if (card.annual_fee.amount === 0) tags.add('no-annual-fee');
  for (const c of ['dining', 'groceries', 'gas', 'online', 'streaming', 'transit'] as const) if (bonus(c)) tags.add(c);
  if (card.rewards.some((r) => TRAVEL_CATS.has(r.cat) && r.rate > Math.max(base, 1))) tags.add('travel');
  if (card.fx_fee === 0) tags.add('no-fx-fee');
  if (card.intro_apr) tags.add('intro-apr');
  if (card.welcome?.value) tags.add('welcome-offer');
  const kind = programOf(card).kind;
  if (kind === 'airline') tags.add('airline');
  if (kind === 'hotel') tags.add('hotel');
  if (kind === 'transferable') tags.add('transferable');
  if (card.annual_fee.amount >= 395) tags.add('premium');
  if (card.rewards.length > 0 && card.rewards.every((r) => r.cat === 'all' || r.cat === 'portal' || r.cat === 'entertainment') && base >= 1.5) tags.add('flat-rate');
  if (card.rewards.length === 0) tags.add('no-rewards');
  return [...tags];
}
const tagCache = new Map<string, Tag[]>();
export const tagsOf = (card: Card) => tagCache.get(card.id) ?? (tagCache.set(card.id, deriveTags(card)), tagCache.get(card.id)!);
export const cardsWithTag = (tag: Tag) => cards.filter((c) => tagsOf(c).includes(tag));

/* ---------- summaries for the React islands ---------- */
export function toSummary(card: Card, lang: Lang): CardSummary {
  const t = UI[lang];
  const issuer = issuerById.get(card.issuer);
  const top = topReward(card);
  const base = baseReward(card);
  const est = needsEstimate(card);
  const topEquiv = top ? cashEquiv(card, top.rate) : 0;
  return {
    id: card.id,
    issuer: card.issuer,
    issuerName: issuer?.short_name ?? card.issuer,
    issuerColor: issuer?.color ?? '#5b6663',
    name: card.name,
    rewardType: card.reward_type,
    tags: tagsOf(card),
    headline: headline(card, lang),
    topRate: top ? rateText(card, top, lang) : card.intro_apr ? '0% APR' : '—',
    topLabel: top ? `${card.earn_unit === 'x' ? unitWord(card, lang) + (lang === 'zh' ? '・' : ' · ') : ''}${catLabel(top, lang)}` : card.intro_apr ? t.card.introText(card.intro_apr.months, t.card.introOn[card.intro_apr.on]) : '',
    topEquiv,
    topEquivText: top && est ? `≈ ${fmtPct(topEquiv)}` : undefined,
    baseEquiv: base ? cashEquiv(card, base.rate) : 0,
    baseText: base && top && base !== top ? (lang === 'zh' ? `其他 ${rateText(card, base, lang)}` : `${rateText(card, base, lang)} elsewhere`) : '',
    annualFee: card.annual_fee.amount,
    feeText: formatFee(card, lang),
    welcomeShort: welcomeShort(card, lang),
    status: card.status,
    image: cardImage(card).src,
    lastVerified: card.last_verified,
  };
}
const summaryCache = new Map<Lang, CardSummary[]>();
export const summariesFor = (lang: Lang) => summaryCache.get(lang) ?? (summaryCache.set(lang, cards.map((c) => toSummary(c, lang))), summaryCache.get(lang)!);

export const siteStats = {
  issuers: issuers.length,
  cards: cards.length,
  active: activeCards.length,
  lastVerified: cards.reduce((m, c) => (c.last_verified > m ? c.last_verified : m), '0000-00-00'),
};

/* ---------- detail rows shared by the card page and the compare table ---------- */
import { BASIS_LABEL, NETWORK_LABEL, TAG_LABEL } from './i18n';
import type { CompareCard } from '../components/CompareTable';

export function rewardRows(card: Card, lang: Lang) {
  const est = needsEstimate(card);
  const sep = lang === 'zh' ? '；' : '; ';
  return card.rewards.map((r) => ({
    rate: rateText(card, r, lang),
    label: catLabel(r, lang),
    detail: [tr(r.detail, lang), tr(r.cap, lang), r.valid_until ? UI[lang].card.until(r.valid_until) : ''].filter(Boolean).join(sep) || undefined,
    equiv: est ? `≈ ${fmtPct(cashEquiv(card, r.rate))}` : undefined,
    until: r.valid_until,
  }));
}
/** Itemised statement credits, largest annual ones first. */
export function creditRows(card: Card, lang: Lang) {
  const t = UI[lang].card;
  const order = { year: 0, '4years': 1, stay: 2, other: 3 } as const;
  return (card.credits ?? [])
    .slice()
    .sort((a, b) => order[a.per] - order[b.per] || (b.amount ?? 0) - (a.amount ?? 0))
    .map((c) => ({ name: tr(c.name, lang), value: c.amount ? t.creditPer[c.per](fmtUsd(c.amount)) : '', detail: tr(c.detail, lang) || undefined }));
}
/** Sum of the per-year credits (the advertised maximum, not what a typical cardholder realises). */
export const creditsTotal = (card: Card) => (card.credits ?? []).filter((c) => c.per === 'year' && c.amount).reduce((n, c) => n + (c.amount ?? 0), 0);
export function fxText(card: Card, lang: Lang): string {
  const t = UI[lang].card;
  if (card.fx_fee === undefined) return t.fxUnknown;
  return card.fx_fee === 0 ? t.fxNone : `${card.fx_fee}%`;
}
export function introText(card: Card, lang: Lang): string | undefined {
  const t = UI[lang].card;
  return card.intro_apr ? t.introText(card.intro_apr.months, t.introOn[card.intro_apr.on]) : undefined;
}
/** "1.4¢ per point — NerdWallet estimate" for non-cash currencies. */
export function valuationNote(card: Card, lang: Lang): string | undefined {
  if (!needsEstimate(card)) return undefined;
  const p = programOf(card);
  const unit = unitWord(card, lang, 1);
  return lang === 'zh' ? `每${unit}約 ${p.cpp} 美分（${tr(BASIS_LABEL[p.basis], lang)}）；僅為估算` : `${p.cpp}¢ per ${unit} (${tr(BASIS_LABEL[p.basis], lang)}); estimate only`;
}
export function toCompare(card: Card, lang: Lang): CompareCard {
  const t = UI[lang].card;
  const wv = welcomeValue(card);
  return {
    id: card.id,
    name: card.name,
    issuerName: issuerById.get(card.issuer)?.short_name ?? card.issuer,
    imageSrc: cardImage(card).src,
    headline: headline(card, lang),
    rewardType: card.reward_type,
    feeText: formatFee(card, lang),
    feeNote: tr(card.annual_fee.note, lang) || undefined,
    network: tr(NETWORK_LABEL[card.network], lang),
    welcome: welcomeText(card, lang),
    welcomeEst: wv ? t.welcomeEst(fmtUsd(wv)) : undefined,
    rewards: rewardRows(card, lang).map(({ rate, label, detail, equiv }) => ({ rate, label, detail, equiv })),
    equivNote: valuationNote(card, lang),
    fx: fxText(card, lang),
    intro: introText(card, lang),
    credits: creditRows(card, lang),
    creditsTotal: creditsTotal(card) ? t.creditsTotal(fmtUsd(creditsTotal(card))) : undefined,
    highlights: card.highlights.map((h) => tr(h, lang)),
    tags: tagsOf(card).map((x) => tr(TAG_LABEL[x], lang)),
    status: card.status,
    statusNote: tr(card.status_note, lang) || undefined,
    lastVerified: card.last_verified,
    applyUrl: card.apply_url,
    sourceUrl: card.source_url,
  };
}
