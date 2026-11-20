import type { CardStatus, Category, L, Lang, Network, RewardType, Tag } from './types';

export const LANGS: Lang[] = ['en', 'zh'];
export const DEFAULT_LANG: Lang = 'en';
export const HTML_LANG: Record<Lang, string> = { en: 'en-US', zh: 'zh-Hant' };
export const SITE_NAME: Record<Lang, string> = { en: 'Kabi US', zh: '卡比美國版' };

export function tr(l: L | undefined, lang: Lang): string {
  return l ? l[lang] || l.en : '';
}
/** Path the site is served under: '' at a domain root, '/<repo>' on GitHub Pages project sites. */
export const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
/** A file in public/ (favicon, card images). */
export const asset = (path: string) => `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
/** Site path for a language: English lives at the root, Chinese under /zh. Always ends with "/". */
export function href(lang: Lang, path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  const loc = lang === DEFAULT_LANG ? p : p === '/' ? '/zh' : `/zh${p}`;
  return `${BASE}${loc.endsWith('/') ? loc : `${loc}/`}`;
}
/** Current URL path → language-neutral page path ('/cards/x', '/'), with the base and /zh removed. */
export function pagePath(pathname: string): string {
  let p = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  p = p.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  if (p === '/zh' || p === '/zh/') return '/';
  p = p.replace(/^\/zh\//, '/');
  return p.length > 1 ? p.replace(/\/$/, '') : '/';
}
/** Astro `[...lang]` param → Lang. */
export function langFromParam(p: string | undefined): Lang {
  return p === 'zh' ? 'zh' : 'en';
}
export const langPaths = () => [{ params: { lang: undefined } }, { params: { lang: 'zh' } }];

export const fmtUsd = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
export const fmtNum = (n: number) => n.toLocaleString('en-US');
export const fmtPct = (n: number) => `${n >= 10 ? n.toFixed(0) : Number(n.toFixed(1))}%`;
export const fmtRate = (rate: number, unit: 'pct' | 'x') => (unit === 'pct' ? `${rate}%` : `${rate}X`);

export const CAT_LABEL: Record<Category, L> = {
  all: { en: 'Everything else', zh: '其他消費' },
  dining: { en: 'Dining', zh: '餐飲' },
  groceries: { en: 'Groceries', zh: '超市' },
  gas: { en: 'Gas', zh: '加油' },
  travel: { en: 'Travel', zh: '旅遊' },
  portal: { en: 'Travel portal', zh: '旅遊平台' },
  flights: { en: 'Flights', zh: '機票' },
  hotels: { en: 'Hotels', zh: '飯店' },
  airline: { en: 'Airline purchases', zh: '航空公司消費' },
  hotel_brand: { en: 'Hotel stays', zh: '品牌飯店住宿' },
  streaming: { en: 'Streaming', zh: '串流' },
  drugstores: { en: 'Drugstores', zh: '藥妝店' },
  online: { en: 'Online shopping', zh: '網購' },
  transit: { en: 'Transit', zh: '交通' },
  rotating: { en: 'Rotating categories', zh: '每季輪替類別' },
  choice: { en: 'Your choice', zh: '自選類別' },
  entertainment: { en: 'Entertainment', zh: '娛樂' },
  brand: { en: 'Partner brand', zh: '合作品牌' },
  rent: { en: 'Rent & mortgage', zh: '房租與房貸' },
};

export const TAG_LABEL: Record<Tag, L> = {
  'no-annual-fee': { en: 'No annual fee', zh: '免年費' },
  dining: { en: 'Dining', zh: '餐飲' },
  groceries: { en: 'Groceries', zh: '超市' },
  gas: { en: 'Gas', zh: '加油' },
  travel: { en: 'Travel', zh: '旅遊' },
  online: { en: 'Online shopping', zh: '網購' },
  streaming: { en: 'Streaming', zh: '串流' },
  transit: { en: 'Transit', zh: '交通' },
  'no-fx-fee': { en: 'No foreign fee', zh: '免海外手續費' },
  'intro-apr': { en: '0% intro APR', zh: '0% 優惠利率' },
  'welcome-offer': { en: 'Welcome offer', zh: '開卡禮' },
  airline: { en: 'Airline card', zh: '航空聯名' },
  hotel: { en: 'Hotel card', zh: '飯店聯名' },
  transferable: { en: 'Transferable points', zh: '可轉點' },
  'flat-rate': { en: 'Flat rate', zh: '不分類別' },
  premium: { en: 'Premium', zh: '高階卡' },
  lounge: { en: 'Lounge access', zh: '機場貴賓室' },
  student: { en: 'Student', zh: '學生' },
  secured: { en: 'Secured', zh: '擔保卡' },
  'credit-building': { en: 'Build credit', zh: '建立信用' },
  'no-rewards': { en: 'No rewards', zh: '無回饋' },
};
/** Quick filters on the explorer, in display order. */
export const SCENE_TAGS: Tag[] = ['dining', 'groceries', 'gas', 'travel', 'online', 'streaming', 'transit', 'no-fx-fee', 'lounge', 'intro-apr', 'student', 'credit-building'];
/** Tags that get their own listing page. */
export const TAG_PAGES: Tag[] = ['no-annual-fee', 'dining', 'groceries', 'gas', 'travel', 'online', 'no-fx-fee', 'lounge', 'intro-apr', 'airline', 'hotel', 'transferable', 'student', 'credit-building', 'flat-rate'];

export const REWARD_TYPE_LABEL: Record<RewardType, L> = {
  cashback: { en: 'Cash back', zh: '現金回饋' },
  miles: { en: 'Miles', zh: '哩程' },
  points: { en: 'Points', zh: '點數' },
};
export const REWARD_TYPE_DESC: Record<RewardType, L> = {
  cashback: {
    en: 'A percentage of what you spend comes back as a statement credit, deposit or check. The simplest kind of reward to value.',
    zh: '消費金額的一定比例以帳單折抵、存入帳戶或支票返還，是最容易估算價值的回饋。',
  },
  miles: {
    en: 'Airline co-brand cards and cards that earn a miles currency. Worth the most when you redeem for flights.',
    zh: '航空公司聯名卡與累積哩程的卡片，用來換機票時價值最高。',
  },
  points: {
    en: 'Bank and hotel point currencies. Bank points can often be transferred to airline and hotel partners; hotel points are redeemed for stays.',
    zh: '銀行點數與飯店點數。銀行點數多半可轉至航空與飯店夥伴，飯店點數用於兌換住宿。',
  },
};
export const STATUS_LABEL: Record<CardStatus, L> = {
  active: { en: 'Open to applications', zh: '開放申請' },
  suspended: { en: 'Applications paused', zh: '暫停申請' },
  discontinued: { en: 'Closed to new applicants', zh: '已停止申請' },
};
export const NETWORK_LABEL: Record<Network, L> = {
  visa: { en: 'Visa', zh: 'Visa' },
  mastercard: { en: 'Mastercard', zh: 'Mastercard' },
  amex: { en: 'American Express', zh: 'American Express' },
  discover: { en: 'Discover', zh: 'Discover' },
  varies: { en: 'Visa or Mastercard (assigned at approval)', zh: 'Visa 或 Mastercard（核卡時決定）' },
};
export const PROGRAM_KIND_LABEL = {
  cash: { en: 'Cash', zh: '現金' },
  transferable: { en: 'Transferable bank points', zh: '可轉點的銀行點數' },
  bank: { en: 'Bank points', zh: '銀行點數' },
  airline: { en: 'Airline', zh: '航空公司' },
  hotel: { en: 'Hotel', zh: '飯店' },
  restricted: { en: 'Restricted credit', zh: '限定用途回饋金' },
} as const;
export const BASIS_LABEL = {
  nerdwallet: { en: 'NerdWallet estimate', zh: 'NerdWallet 估值' },
  issuer: { en: 'Issuer-stated value', zh: '發卡機構標示' },
  fixed: { en: 'Fixed value', zh: '固定價值' },
  assumed: { en: 'Assumed (no published estimate)', zh: '假設值（無公開估值）' },
} as const;

const en = {
  tagline: 'US credit card rewards, side by side',
  metaDesc: 'Compare credit cards from major US issuers by cash back, miles and points — with card art, annual fees, welcome offers and official links. Checked against issuer websites on a schedule.',
  skip: 'Skip to main content',
  nav: { cashback: 'Cash back', miles: 'Miles', points: 'Points', issuers: 'By issuer', valuations: 'Point values', changelog: 'Updates', compare: 'Compare list', menu: 'Menu', about: 'About & sources', allIssuers: 'All issuers' },
  theme: { label: 'Appearance', light: 'Light', auto: 'Auto', dark: 'Dark' },
  langSwitch: '中文',
  heroTitle: 'Pick a credit card without opening ten bank websites.',
  heroBody: (issuers: number, active: number) => `${active} cards you can apply for today from ${issuers} US issuers, sorted into cash back, miles and points. Every number comes from the issuer's own site. Pick up to three to compare side by side.`,
  cardsUnit: 'cards',
  footer1: (issuers: number, cards: number, date: string) => `Kabi US tracks the public terms of ${cards} credit cards from ${issuers} US issuers. All figures come from issuer websites; last checked ${date}.`,
  footer2: 'This is an independent information site. It is not a bank, does not take applications and earns no commission. Rates, offers and eligibility are set by each issuer — confirm on the issuer site before you apply. Card art and trademarks belong to their owners and are shown for identification.',
  footer3: 'Cash-back equivalents for miles and points are estimates, not guaranteed values.',
  recent: 'Recent updates',
  all: 'All',
  home: 'Home',
  scenes: {
    aria: 'Start from a situation',
    travel: ['I travel a lot', 'Travel rewards and no foreign fees'],
    miles: ['I want free flights', 'Airline cards, with a cash estimate per mile'],
    cash: ['Keep it simple', 'Flat-rate cash back, no categories'],
    food: ['Dining & groceries', 'Where most of the budget goes'],
    first: ['My first card', 'Student, secured and credit-building cards'],
  },
  ex: {
    filters: 'Filters', type: 'Reward type', allTypes: 'All types', sceneHint: 'Where do you spend most? Pick any that apply.', scenes: 'Spending', noFee: 'No annual fee',
    welcome: 'Has welcome offer', premium: 'Premium', pickIssuers: 'Choose issuers', issuers: 'Issuers', clear: 'Clear', search: 'Search card or issuer',
    count: (n: number) => `${n} ${n === 1 ? 'card' : 'cards'}`, showInactive: (n: number) => `Show closed / paused cards (${n})`,
    sort: 'Sort', sFeatured: 'Featured', sRate: 'Highest category rate', sBase: 'Best everyday rate', sFee: 'Lowest annual fee', sIssuer: 'Issuer',
    empty: 'No card matches every filter. Try removing one.', added: 'Added', add: '+ Compare', max: (n: number) => `Compare up to ${n}`,
    compareBar: 'Compare list', compareN: (n: number) => `Compare ${n}`, remove: (name: string) => `Remove ${name}`,
    estTitle: 'Cash-back equivalent, estimated from a per-point value. See Point values.', cardArt: 'card art', noFeeShort: 'No annual fee', feeShort: (s: string) => `${s} annual fee`,
    welcomeShort: (s: string) => `Welcome: ${s}`,
  },
  cmp: {
    title: 'Compare side by side', intro: 'Up to three cards. The address carries your picks, so you can share it.', addPh: 'Type a card or issuer to add…', fullPh: (n: number) => `Up to ${n} cards — remove one first`,
    addAria: 'Add a card to compare', emptyA: 'Your compare list is empty. Add cards from the', emptyB: 'or search above.', homeLink: 'home page',
    issuer: 'Issuer', type: 'Reward type', fee: 'Annual fee', network: 'Network', welcome: 'Welcome offer', rewards: 'Rewards', equiv: 'Cash-back equivalent (est.)', fx: 'Foreign transaction fee', introApr: 'Intro APR',
    highlights: 'Highlights', goodFor: 'Good for', status: 'Status', verified: 'Last checked', apply: 'Apply on issuer site', source: 'Official source', detail: 'Card page', removeBtn: 'Remove',
  },
  card: {
    statusBanner: (s: string) => s, placeholder: 'No official card art yet; showing a placeholder.', applyAt: (i: string) => `Apply at ${i}`, addCompare: 'Add to compare',
    source: 'Source', issuerSite: (i: string) => `${i} website`, checked: 'checked',
    top: 'Top rate', base: 'Everything else', fee: 'Annual fee', feeFirst: (s: string) => `${s} the first year`, noFee: 'None',
    equivLine: (pct: string, cpp: string, unit: string) => `≈ ${pct} cash-back equivalent at an estimated ${cpp}¢ per ${unit}`,
    estOnly: 'Estimate only',
    rewards: 'Rewards', rewardsNone: 'This card has no rewards program.', until: (d: string) => `through ${d}`,
    welcome: 'Welcome offer', welcomeEst: (v: string) => `Estimated value ≈ ${v}`, limited: 'Limited-time offer',
    valuation: 'How the cash estimate works',
    valuationBody: (prog: string, cpp: string, basis: string) => `${prog} is valued at ${cpp}¢ each (${basis}). Multiply the earn rate by that value to get an approximate cash-back percentage. What you actually get depends on how you redeem.`,
    valuationLink: 'See all point values',
    highlights: 'Highlights', facts: 'Card facts', issuer: 'Issuer', network: 'Network', program: 'Rewards currency', fx: 'Foreign transaction fee', fxNone: 'None', fxUnknown: 'Not stated on the product page — check the issuer’s rates and fees',
    intro: 'Intro APR', introOn: { purchases: 'purchases', bt: 'balance transfers', both: 'purchases and balance transfers' }, introText: (m: number, on: string) => `0% for ${m} months on ${on}`,
    goodFor: 'Good for', status: 'Status', related: 'Similar cards from other issuers', sameIssuer: (i: string) => `More from ${i}`, breadcrumb: 'Breadcrumb',
    desc: (issuer: string, name: string, headline: string, fee: string, date: string) => `${name} from ${issuer}: ${headline}. Annual fee ${fee}. Card art, full reward rates, welcome offer and the official link; checked ${date}.`,
  },
  cat: { title: (t: string) => `${t} credit cards`, desc: (n: number, t: string) => `${n} ${t.toLowerCase()} credit cards from major US issuers compared.`, estNote: 'Miles and points show a “≈ %” next to each rate: an estimated cash-back equivalent based on a per-point value. It is an estimate — see Point values for the numbers and their source.' },
  tagPage: { title: (t: string) => `${t} credit cards`, desc: (n: number, t: string) => `${n} US credit cards tagged “${t}”.` },
  iss: { title: 'Card issuers', desc: 'Credit cards grouped by the bank or company that issues them.', cards: (n: number) => `${n} cards`, hidden: (n: number) => `${n} awaiting verification`, site: 'Official card page', pageDesc: (i: string, n: number) => `${n} ${i} credit cards compared: rewards, fees, welcome offers.` },
  val: {
    title: 'What a point or mile is worth',
    desc: 'The per-point values this site uses to turn miles and points into an approximate cash-back percentage.',
    intro: 'To put miles and points cards next to cash-back cards, this site multiplies each earn rate by an estimated value per point. Example: a card earning 3 miles per $1 in a program valued at 1.2¢ per mile is shown as ≈ 3.6%.',
    warn: 'These are estimates. A mile is not money: its value changes with the route, the dates and the program’s award prices, and programs can devalue at any time. Treat the “≈ %” figures as a rough guide, not a promise.',
    program: 'Program', kind: 'Type', value: 'Est. value', basis: 'Basis', note: 'Note', each: 'each',
    sourceLine: (name: string, date: string) => `Source for “NerdWallet estimate” rows: ${name}, as published ${date}.`,
  },
  log: { title: 'Updates', desc: 'New cards, cards closed to applications and benefit changes found by the scheduled checks.', types: { added: 'Added', updated: 'Updated', status: 'Status', removed: 'Removed' } },
  about: {
    title: 'About & sources',
    desc: 'Where the data comes from, how it is kept current and what the estimates mean.',
  },
  nf: { title: 'Page not found', body: 'That page does not exist. The card may have been renamed or removed.', back: 'Back to all cards' },
};

type Dict = typeof en;

const zh: Dict = {
  tagline: '美國信用卡福利比較',
  metaDesc: '美國各大發卡機構信用卡福利一次比較：現金回饋、哩程、點數，附卡圖、年費、開卡禮與官方連結，資料定期對照官網更新。',
  skip: '跳到主要內容',
  nav: { cashback: '現金回饋', miles: '哩程', points: '點數', issuers: '依發卡機構', valuations: '點數估值', changelog: '最近更新', compare: '比較清單', menu: '選單', about: '關於與資料來源', allIssuers: '所有發卡機構' },
  theme: { label: '外觀', light: '淺', auto: '自動', dark: '深' },
  langSwitch: 'English',
  heroTitle: '想辦美國信用卡，不用一家一家銀行查。',
  heroBody: (issuers, active) => `${issuers} 家美國發卡機構、${active} 張目前可申請的信用卡，依現金回饋、哩程、點數分類，數字全部來自官網。最多挑三張並排比較。`,
  cardsUnit: '張',
  footer1: (issuers, cards, date) => `本站整理 ${issuers} 家美國發卡機構、${cards} 張信用卡的公開權益，所有數字皆來自各機構官方網站，最近一次對照官網：${date}。`,
  footer2: '本站為獨立資訊整理，不是銀行、不代辦申請，也不收取佣金。回饋、優惠與申請資格以各發卡機構官網為準，申請前請務必再確認。卡面圖與商標屬各權利人所有，僅供辨識。',
  footer3: '哩程與點數換算成現金回饋的數字為估算值，並非保證價值。',
  recent: '最近更新',
  all: '全部',
  home: '首頁',
  scenes: {
    aria: '依情境挑卡',
    travel: ['我常出國旅遊', '旅遊回饋高、免海外手續費'],
    miles: ['我想換機票', '航空聯名卡，附每哩約值多少現金'],
    cash: ['越簡單越好', '不分類別的現金回饋'],
    food: ['餐飲與超市', '日常開銷最大的兩塊'],
    first: ['第一張美國卡', '學生卡、擔保卡與建立信用'],
  },
  ex: {
    filters: '篩選條件', type: '回饋類型', allTypes: '全部類型', sceneHint: '你最常刷哪裡？可以複選。', scenes: '消費場景', noFee: '免年費',
    welcome: '有開卡禮', premium: '高階卡', pickIssuers: '選擇發卡機構', issuers: '發卡機構', clear: '清除', search: '搜尋卡名或發卡機構',
    count: (n) => `${n} 張卡片`, showInactive: (n) => `顯示已停止／暫停申請（${n}）`,
    sort: '排序', sFeatured: '推薦', sRate: '最高類別回饋', sBase: '一般消費回饋最高', sFee: '年費低到高', sIssuer: '發卡機構',
    empty: '沒有符合所有條件的卡片，試著少選一個條件。', added: '已加入', add: '＋ 比較', max: (n) => `最多比較 ${n} 張`,
    compareBar: '比較清單', compareN: (n) => `比較 ${n} 張`, remove: (name) => `移除 ${name}`,
    estTitle: '約略換算成現金回饋，依每點估值估算，詳見「點數估值」。', cardArt: '卡面', noFeeShort: '免年費', feeShort: (s) => `年費 ${s}`,
    welcomeShort: (s) => `開卡禮：${s}`,
  },
  cmp: {
    title: '並排比較', intro: '最多三張。網址會帶著你選的卡片，可以直接分享。', addPh: '輸入卡名或發卡機構加入比較…', fullPh: (n) => `最多比較 ${n} 張，先移除一張`,
    addAria: '加入卡片到比較', emptyA: '比較清單是空的。從', emptyB: '把卡片加進來，或在上方搜尋。', homeLink: '首頁',
    issuer: '發卡機構', type: '回饋類型', fee: '年費', network: '卡組織', welcome: '開卡禮', rewards: '回饋內容', equiv: '約當現金回饋（估算）', fx: '海外交易手續費', introApr: '優惠利率',
    highlights: '亮點', goodFor: '適合', status: '狀態', verified: '最近核對', apply: '前往官網申請', source: '官方資料來源', detail: '卡片詳細頁', removeBtn: '移除',
  },
  card: {
    statusBanner: (s) => s, placeholder: '尚未取得官方卡圖，暫以示意圖代替。', applyAt: (i) => `前往 ${i} 官網申請`, addCompare: '加入比較',
    source: '資料來源', issuerSite: (i) => `${i} 官網`, checked: '核對日',
    top: '最高回饋', base: '其他消費', fee: '年費', feeFirst: (s) => `首年 ${s}`, noFee: '免',
    equivLine: (pct, cpp, unit) => `約略換算 ≈ ${pct} 現金回饋（以每${unit}約 ${cpp} 美分估算）`,
    estOnly: '僅為估算',
    rewards: '回饋內容', rewardsNone: '這張卡沒有回饋計畫。', until: (d) => `至 ${d}`,
    welcome: '開卡禮', welcomeEst: (v) => `估算價值 ≈ ${v}`, limited: '限時優惠',
    valuation: '現金回饋估算怎麼算',
    valuationBody: (prog, cpp, basis) => `${prog} 以每單位 ${cpp} 美分計（${basis}）。把累積倍率乘上這個估值，就是約略的現金回饋率。實際價值取決於你怎麼兌換。`,
    valuationLink: '查看全部點數估值',
    highlights: '亮點', facts: '基本資料', issuer: '發卡機構', network: '卡組織', program: '回饋計畫', fx: '海外交易手續費', fxNone: '免', fxUnknown: '產品頁未載明，請查官網費率表',
    intro: '優惠利率', introOn: { purchases: '消費', bt: '餘額代償', both: '消費與餘額代償' }, introText: (m, on) => `${on} ${m} 個月 0%`,
    goodFor: '適合', status: '申請狀態', related: '其他發卡機構的同類卡片', sameIssuer: (i) => `${i} 的其他卡片`, breadcrumb: '路徑',
    desc: (issuer, name, headline, fee, date) => `${issuer} ${name}：${headline}。年費 ${fee}。卡圖、完整回饋、開卡禮與官方連結，資料核對日 ${date}。`,
  },
  cat: { title: (t) => `${t}信用卡比較`, desc: (n, t) => `美國各大發卡機構 ${n} 張${t}信用卡一次比較。`, estNote: '哩程與點數卡的回饋旁會標示「≈ %」：依每點估值換算的約當現金回饋率。這是估算值，數字與來源見「點數估值」。' },
  tagPage: { title: (t) => `${t}信用卡`, desc: (n, t) => `${n} 張符合「${t}」的美國信用卡。` },
  iss: { title: '發卡機構', desc: '依發卡的銀行或公司分組的信用卡。', cards: (n) => `${n} 張`, hidden: (n) => `${n} 張待核對`, site: '官方信用卡頁面', pageDesc: (i, n) => `${i} ${n} 張信用卡比較：回饋、年費、開卡禮。` },
  val: {
    title: '一點、一哩值多少錢',
    desc: '本站把哩程與點數換算成約當現金回饋率時，所使用的每點估值。',
    intro: '為了讓哩程卡、點數卡能和現金回饋卡放在一起比，本站把每張卡的累積倍率乘上「每點估值」。例如：每 $1 累積 3 哩、該計畫每哩估 1.2 美分，就顯示為 ≈ 3.6%。',
    warn: '這些都是估算。哩程不是現金：價值會隨航線、日期與兌換表變動，計畫也可能隨時貶值。請把「≈ %」當成粗略參考，而不是保證。',
    program: '計畫', kind: '類型', value: '估值', basis: '依據', note: '說明', each: '每單位',
    sourceLine: (name, date) => `標示「NerdWallet 估值」者來源：${name}，發布於 ${date}。`,
  },
  log: { title: '最近更新', desc: '排程核對時發現的新卡、停止申請與權益變動。', types: { added: '新增', updated: '更新', status: '狀態', removed: '移除' } },
  about: { title: '關於與資料來源', desc: '資料從哪裡來、如何保持更新，以及估算值的意義。' },
  nf: { title: '找不到頁面', body: '這個頁面不存在，卡片可能已改名或移除。', back: '回到所有卡片' },
};

export const UI: Record<Lang, Dict> = { en, zh };
export type UIDict = Dict;
