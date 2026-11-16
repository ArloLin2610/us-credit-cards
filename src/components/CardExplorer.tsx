import { useEffect, useMemo, useState } from 'react';
import type { CardSummary, Lang, RewardType, Tag } from '../lib/types';
import { REWARD_TYPE_LABEL, SCENE_TAGS, STATUS_LABEL, TAG_LABEL, UI, href, tr } from '../lib/i18n';

interface IssuerOpt {
  id: string;
  short_name: string;
}
interface Props {
  lang: Lang;
  cards: CardSummary[];
  issuers: IssuerOpt[];
  /** Lock the reward type (category pages). */
  fixedType?: RewardType;
  /** Lock a tag (tag pages). */
  fixedTag?: Tag;
  /** Lock an issuer (issuer pages). */
  fixedIssuer?: string;
  showHero?: boolean;
}
type Sort = 'featured' | 'rate' | 'base' | 'fee' | 'issuer';
const COMPARE_KEY = 'uscards.compare';
const MAX_COMPARE = 3;

function readCompare(): string[] {
  try {
    const arr = JSON.parse(localStorage.getItem(COMPARE_KEY) || '[]');
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string').slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
}
function writeCompare(ids: string[]) {
  try {
    localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

export default function CardExplorer({ lang, cards, issuers, fixedType, fixedTag, fixedIssuer, showHero = false }: Props) {
  const t = UI[lang].ex;
  const [type, setType] = useState<RewardType | 'all'>(fixedType ?? 'all');
  const [tags, setTags] = useState<Tag[]>(fixedTag ? [fixedTag] : []);
  const [issuerSel, setIssuerSel] = useState<string[]>(fixedIssuer ? [fixedIssuer] : []);
  const [freeOnly, setFreeOnly] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('featured');
  const [compare, setCompare] = useState<string[]>([]);
  const [moreFilters, setMoreFilters] = useState(false);
  const [ready, setReady] = useState(false);

  // Filter presets from the URL (?type=cashback&tags=dining,travel&free=1&q=...)
  useEffect(() => {
    setCompare(readCompare());
    try {
      const sp = new URLSearchParams(window.location.search);
      const ty = sp.get('type');
      if (!fixedType && (ty === 'cashback' || ty === 'miles' || ty === 'points')) setType(ty);
      const tg = sp.get('tags');
      if (!fixedTag && tg) setTags(tg.split(',').filter((x): x is Tag => x in TAG_LABEL));
      const is = sp.get('issuers');
      if (!fixedIssuer && is) setIssuerSel(is.split(',').filter(Boolean));
      if (sp.get('free') === '1') setFreeOnly(true);
      if (sp.get('q')) setQ(sp.get('q') || '');
      const so = sp.get('sort');
      if (so === 'rate' || so === 'base' || so === 'fee' || so === 'issuer') setSort(so);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  // Keep the URL in sync so a filtered view can be shared.
  useEffect(() => {
    if (!ready) return;
    try {
      const url = new URL(window.location.href);
      const set = (k: string, v: string | null) => (v ? url.searchParams.set(k, v) : url.searchParams.delete(k));
      set('type', !fixedType && type !== 'all' ? type : null);
      set('tags', !fixedTag && tags.length ? tags.join(',') : null);
      set('issuers', !fixedIssuer && issuerSel.length ? issuerSel.join(',') : null);
      set('free', freeOnly ? '1' : null);
      set('q', q.trim() || null);
      set('sort', sort !== 'featured' ? sort : null);
      window.history.replaceState(null, '', url);
    } catch {
      /* ignore */
    }
  }, [ready, type, tags, issuerSel, freeOnly, q, sort]);

  const toggleTag = (x: Tag) => setTags((cur) => (cur.includes(x) ? cur.filter((y) => y !== x) : [...cur, x]));
  const toggleIssuer = (b: string) => setIssuerSel((cur) => (cur.includes(b) ? cur.filter((x) => x !== b) : [...cur, b]));
  const toggleCompare = (id: string) =>
    setCompare((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= MAX_COMPARE ? cur : [...cur, id];
      writeCompare(next);
      return next;
    });

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = cards.filter((c) => {
      if (!showInactive && c.status !== 'active') return false;
      if (type !== 'all' && c.rewardType !== type) return false;
      if (tags.length && !tags.every((x) => c.tags.includes(x))) return false;
      if (issuerSel.length && !issuerSel.includes(c.issuer)) return false;
      if (freeOnly && c.annualFee !== 0) return false;
      if (needle && !(c.name.toLowerCase().includes(needle) || c.issuerName.toLowerCase().includes(needle) || c.headline.toLowerCase().includes(needle))) return false;
      return true;
    });
    const by = (f: (a: CardSummary, b: CardSummary) => number) => list.slice().sort(f);
    switch (sort) {
      case 'rate':
        // topEquiv / baseEquiv are % cash back; miles and points are converted with an estimated per-point value
        return by((a, b) => b.topEquiv - a.topEquiv || a.annualFee - b.annualFee);
      case 'base':
        return by((a, b) => b.baseEquiv - a.baseEquiv || a.annualFee - b.annualFee);
      case 'fee':
        return by((a, b) => a.annualFee - b.annualFee || b.topEquiv - a.topEquiv);
      case 'issuer':
        return by((a, b) => a.issuerName.localeCompare(b.issuerName) || a.name.localeCompare(b.name));
      default:
        return by((a, b) => Number(b.status === 'active') - Number(a.status === 'active'));
    }
  }, [cards, type, tags, issuerSel, freeOnly, showInactive, q, sort]);

  const inactiveCount = cards.filter((c) => c.status !== 'active').length;
  const compareCards = compare.map((id) => cards.find((c) => c.id === id)).filter(Boolean) as CardSummary[];

  return (
    <div>
      <section aria-label={t.filters} className="space-y-4">
        {!fixedType && (
          <div className="flex flex-wrap gap-2" role="group" aria-label={t.type}>
            {(['all', 'cashback', 'miles', 'points'] as const).map((x) => (
              <button key={x} type="button" className="chip" aria-pressed={type === x} onClick={() => setType(x)}>
                {x === 'all' ? t.allTypes : tr(REWARD_TYPE_LABEL[x], lang)}
              </button>
            ))}
          </div>
        )}
        {!fixedTag && (
          <div>
            {showHero && <p className="mb-2 text-sm text-ink-soft">{t.sceneHint}</p>}
            <div className="flex flex-wrap gap-2" role="group" aria-label={t.scenes}>
              {SCENE_TAGS.map((x) => (
                <button key={x} type="button" className="chip" aria-pressed={tags.includes(x)} onClick={() => toggleTag(x)}>
                  {tr(TAG_LABEL[x], lang)}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <label className="chip cursor-pointer">
            <input type="checkbox" className="accent-ink" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} />
            {t.noFee}
          </label>
          {!fixedTag && (
            <>
              <button type="button" className="chip" aria-pressed={tags.includes('welcome-offer')} onClick={() => toggleTag('welcome-offer')}>
                {t.welcome}
              </button>
              <button type="button" className="chip" aria-pressed={tags.includes('premium')} onClick={() => toggleTag('premium')}>
                {t.premium}
              </button>
            </>
          )}
          {!fixedIssuer && (
            <button type="button" className="chip" aria-expanded={moreFilters} onClick={() => setMoreFilters((v) => !v)}>
              {t.pickIssuers}
              {issuerSel.length ? ` (${issuerSel.length})` : ''}
            </button>
          )}
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} aria-label={t.search} className="ml-auto w-full rounded-full border border-line bg-surface px-4 py-2 text-sm sm:w-60" />
        </div>
        {moreFilters && !fixedIssuer && (
          <div className="flex flex-wrap gap-2 rounded-xl border border-line bg-surface p-3" role="group" aria-label={t.issuers}>
            {issuers.map((b) => (
              <button key={b.id} type="button" className="chip" aria-pressed={issuerSel.includes(b.id)} onClick={() => toggleIssuer(b.id)}>
                {b.short_name}
              </button>
            ))}
            {issuerSel.length > 0 && (
              <button type="button" className="chip" onClick={() => setIssuerSel([])}>
                {t.clear}
              </button>
            )}
          </div>
        )}
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-ink-soft">
        <span aria-live="polite">
          {t.count(filtered.length)}
          {inactiveCount > 0 && (
            <>
              {' · '}
              <label className="cursor-pointer">
                <input type="checkbox" className="mr-1 accent-ink" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
                {t.showInactive(inactiveCount)}
              </label>
            </>
          )}
        </span>
        <label className="ml-auto flex items-center gap-2">
          {t.sort}
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-md border border-line bg-surface px-2 py-1">
            <option value="featured">{t.sFeatured}</option>
            <option value="rate">{t.sRate}</option>
            <option value="base">{t.sBase}</option>
            <option value="fee">{t.sFee}</option>
            <option value="issuer">{t.sIssuer}</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line bg-surface p-10 text-center text-ink-soft">{t.empty}</div>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const selected = compare.includes(c.id);
            const full = compare.length >= MAX_COMPARE && !selected;
            const rewardClass = `reward-${c.rewardType === 'cashback' ? 'cash' : c.rewardType}`;
            return (
              <li key={c.id} className={`tile relative p-3 ${selected ? 'is-selected' : ''} ${c.status !== 'active' ? 'opacity-70' : ''}`}>
                <a href={href(lang, `/cards/${c.id}`)} className="block">
                  <div className="card-face">
                    <img src={c.image} alt={`${c.name} ${t.cardArt}`} loading="lazy" decoding="async" width={320} height={202} />
                    {c.status !== 'active' && <span className="absolute left-2 top-2 rounded-md bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">{tr(STATUS_LABEL[c.status], lang)}</span>}
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-ink-soft">
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: c.issuerColor }} aria-hidden="true" />
                        {c.issuerName}
                      </div>
                      <h3 className="line-clamp-2 text-base font-bold leading-snug">{c.name}</h3>
                    </div>
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${rewardClass}`}>{tr(REWARD_TYPE_LABEL[c.rewardType], lang)}</span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-2">
                    <span className="text-2xl font-black tracking-tight">
                      {c.topRate}
                      {c.topEquivText && (
                        <span className="ml-1.5 text-xs font-medium text-ink-soft" title={t.estTitle}>
                          {c.topEquivText}
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-ink-soft">{c.annualFee === 0 ? t.noFeeShort : t.feeShort(c.feeText)}</span>
                  </div>
                  <div className="text-xs text-ink-soft">
                    {c.topLabel}
                    {c.baseText && ` · ${c.baseText}`}
                  </div>
                  {c.welcomeShort && <div className="mt-1 text-xs text-ink-soft">{t.welcomeShort(c.welcomeShort)}</div>}
                </a>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {c.tags
                      .filter((x) => x !== 'no-annual-fee' && x !== 'welcome-offer')
                      .slice(0, 3)
                      .map((x) => (
                        <span key={x} className="rounded bg-paper-2 px-1.5 py-0.5 text-[11px] text-ink-soft">
                          {tr(TAG_LABEL[x], lang)}
                        </span>
                      ))}
                  </div>
                  <button type="button" onClick={() => toggleCompare(c.id)} disabled={full} aria-pressed={selected} className="chip shrink-0 !px-2.5 !py-1 text-xs" title={full ? t.max(MAX_COMPARE) : undefined}>
                    {selected ? t.added : t.add}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {compareCards.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur" role="region" aria-label={t.compareBar}>
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <ul className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
              {compareCards.map((c) => (
                <li key={c.id} className="flex shrink-0 items-center gap-2 rounded-lg border border-line bg-paper px-2 py-1 text-sm">
                  <img src={c.image} alt="" width={38} height={24} className="h-6 w-[38px] rounded-[3px] object-contain" />
                  <span className="max-w-[11rem] truncate">{c.name}</span>
                  <button type="button" onClick={() => toggleCompare(c.id)} aria-label={t.remove(c.name)} className="text-ink-soft hover:text-ink">
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <a href={`${href(lang, '/compare')}?ids=${compareCards.map((c) => c.id).join(',')}`} className="btn btn-primary shrink-0 text-sm">
              {t.compareN(compareCards.length)}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
