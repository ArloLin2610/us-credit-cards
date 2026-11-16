import { useEffect, useMemo, useState } from 'react';
import type { CardStatus, Lang, RewardType } from '../lib/types';
import { REWARD_TYPE_LABEL, STATUS_LABEL, UI, href, tr } from '../lib/i18n';

/** Fully localised card, prepared at build time (one payload per language). */
export interface CompareCard {
  id: string;
  name: string;
  issuerName: string;
  imageSrc: string;
  headline: string;
  rewardType: RewardType;
  feeText: string;
  feeNote?: string;
  network: string;
  welcome?: string;
  welcomeEst?: string;
  rewards: { rate: string; label: string; detail?: string; equiv?: string }[];
  equivNote?: string;
  fx: string;
  intro?: string;
  highlights: string[];
  tags: string[];
  status: CardStatus;
  statusNote?: string;
  lastVerified: string;
  applyUrl?: string;
  sourceUrl: string;
}
interface Props {
  lang: Lang;
  cards: CompareCard[];
}
const COMPARE_KEY = 'uscards.compare';
const MAX = 3;

function idsFromUrl(): string[] {
  try {
    const p = new URLSearchParams(window.location.search).get('ids');
    return p ? p.split(',').filter(Boolean).slice(0, MAX) : [];
  } catch {
    return [];
  }
}
function idsFromStorage(): string[] {
  try {
    const arr = JSON.parse(localStorage.getItem(COMPARE_KEY) || '[]');
    return Array.isArray(arr) ? arr.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export default function CompareTable({ lang, cards }: Props) {
  const t = UI[lang].cmp;
  const [ids, setIds] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fromUrl = idsFromUrl();
    setIds(fromUrl.length ? fromUrl : idsFromStorage());
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
      const url = new URL(window.location.href);
      if (ids.length) url.searchParams.set('ids', ids.join(','));
      else url.searchParams.delete('ids');
      window.history.replaceState(null, '', url);
    } catch {
      /* ignore */
    }
  }, [ids, ready]);

  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);
  const chosen = ids.map((id) => byId.get(id)).filter(Boolean) as CompareCard[];
  const candidates = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return cards.filter((c) => !ids.includes(c.id) && c.status === 'active' && (c.name.toLowerCase().includes(needle) || c.issuerName.toLowerCase().includes(needle))).slice(0, 8);
  }, [q, cards, ids]);
  const remove = (id: string) => setIds((cur) => cur.filter((x) => x !== id));
  const add = (id: string) => {
    setIds((cur) => (cur.length >= MAX || cur.includes(id) ? cur : [...cur, id]));
    setQ('');
  };

  const rows: { label: string; render: (c: CompareCard) => React.ReactNode }[] = [
    { label: t.issuer, render: (c) => c.issuerName },
    { label: t.type, render: (c) => <span className={`rounded-md px-2 py-0.5 text-xs font-semibold reward-${c.rewardType === 'cashback' ? 'cash' : c.rewardType}`}>{tr(REWARD_TYPE_LABEL[c.rewardType], lang)}</span> },
    { label: t.fee, render: (c) => (<div><div>{c.feeText}</div>{c.feeNote && <div className="mt-1 text-xs text-ink-soft">{c.feeNote}</div>}</div>) },
    { label: t.welcome, render: (c) => (c.welcome ? (<div><div>{c.welcome}</div>{c.welcomeEst && <div className="mt-1 text-xs text-ink-soft">{c.welcomeEst}</div>}</div>) : '—') },
    {
      label: t.rewards,
      render: (c) =>
        c.rewards.length === 0 ? '—' : (
          <ul className="space-y-2">
            {c.rewards.map((r, i) => (
              <li key={i}>
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-lg font-black tracking-tight">{r.rate}</span>
                  <span className="text-sm">{r.label}</span>
                  {r.equiv && <span className="text-xs text-ink-soft">{r.equiv}</span>}
                </div>
                {r.detail && <div className="text-xs text-ink-soft">{r.detail}</div>}
              </li>
            ))}
          </ul>
        ),
    },
    { label: t.equiv, render: (c) => c.equivNote ? <span className="text-sm text-ink-soft">{c.equivNote}</span> : '—' },
    { label: t.fx, render: (c) => c.fx },
    { label: t.introApr, render: (c) => c.intro || '—' },
    { label: t.network, render: (c) => c.network },
    { label: t.highlights, render: (c) => c.highlights.length ? (<ul className="list-disc space-y-1 pl-4 text-sm">{c.highlights.map((h, i) => (<li key={i}>{h}</li>))}</ul>) : '—' },
    { label: t.goodFor, render: (c) => c.tags.join(lang === 'zh' ? '、' : ', ') || '—' },
    { label: t.status, render: (c) => (<span className={c.status === 'active' ? '' : 'font-semibold text-danger'}>{tr(STATUS_LABEL[c.status], lang)}{c.statusNote ? ` — ${c.statusNote}` : ''}</span>) },
    { label: t.verified, render: (c) => c.lastVerified },
    {
      label: '',
      render: (c) => (
        <div className="flex flex-col gap-2">
          {c.applyUrl && c.status === 'active' && (<a href={c.applyUrl} target="_blank" rel="noopener nofollow" className="btn btn-cash text-sm">{t.apply}</a>)}
          <a href={c.sourceUrl} target="_blank" rel="noopener nofollow" className="text-xs text-ink-soft underline">{t.source}</a>
          <a href={href(lang, `/cards/${c.id}`)} className="text-xs underline">{t.detail}</a>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="relative mb-6 max-w-md">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={chosen.length >= MAX ? t.fullPh(MAX) : t.addPh} disabled={chosen.length >= MAX} aria-label={t.addAria} className="w-full rounded-full border border-line bg-surface px-4 py-2.5 text-sm" />
        {candidates.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-line bg-surface shadow-lift">
            {candidates.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => add(c.id)} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-paper-2">
                  <img src={c.imageSrc} alt="" width={44} height={28} className="h-7 w-11 rounded-[3px] object-contain" />
                  <span className="text-ink-soft">{c.issuerName}</span>
                  <span className="font-medium">{c.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {chosen.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-surface p-12 text-center text-ink-soft">
          {t.emptyA} <a href={href(lang, '/')} className="underline">{t.homeLink}</a> {t.emptyB}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="spec min-w-[640px]">
            <thead>
              <tr>
                <th className="!w-28 align-bottom" />
                {chosen.map((c) => (
                  <td key={c.id} className="w-1/3 align-bottom">
                    <div className="card-face mb-3 max-w-[260px]"><img src={c.imageSrc} alt={c.name} width={320} height={202} /></div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs text-ink-soft">{c.issuerName}</div>
                        <div className="text-lg font-bold leading-tight">{c.name}</div>
                      </div>
                      <button type="button" onClick={() => remove(c.id)} className="chip !px-2 !py-1 text-xs">{t.removeBtn}</button>
                    </div>
                    <p className="mt-1 text-sm text-ink-soft">{c.headline}</p>
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <th scope="row">{row.label}</th>
                  {chosen.map((c) => (<td key={c.id}>{row.render(c)}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
