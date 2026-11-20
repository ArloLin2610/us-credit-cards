export type Lang = 'en' | 'zh';
export interface L {
  en: string;
  zh: string;
}
export type Network = 'visa' | 'mastercard' | 'amex' | 'discover' | 'varies';
export type RewardType = 'cashback' | 'miles' | 'points';
export type CardStatus = 'active' | 'suspended' | 'discontinued';
export type Category =
  | 'all' | 'dining' | 'groceries' | 'gas' | 'travel' | 'portal' | 'flights' | 'hotels' | 'airline' | 'hotel_brand'
  | 'streaming' | 'drugstores' | 'online' | 'transit' | 'rotating' | 'choice' | 'entertainment' | 'brand' | 'rent';
/** Tags are derived from card data at build time (see deriveTags in data.ts). */
export type Tag =
  | 'no-annual-fee' | 'dining' | 'groceries' | 'gas' | 'travel' | 'online' | 'streaming' | 'transit'
  | 'no-fx-fee' | 'intro-apr' | 'welcome-offer' | 'airline' | 'hotel' | 'transferable' | 'flat-rate' | 'premium'
  | 'lounge' | 'student' | 'secured' | 'credit-building' | 'no-rewards';

export interface Reward {
  cat: Category;
  rate: number;
  detail?: L;
  cap?: L;
  valid_until?: string;
  featured?: boolean;
}
export interface Credit {
  name: L;
  /** Maximum USD value for the period in `per`. */
  amount?: number;
  per: 'year' | '4years' | 'stay' | 'other';
  detail?: L;
}
export interface Welcome {
  value?: number;
  unit?: 'points' | 'miles' | 'usd' | 'nights';
  spend?: number;
  months?: number;
  extra?: L;
  text?: L;
  limited_time?: boolean;
}
export interface Card {
  id: string;
  issuer: string;
  name: string;
  network: Network;
  annual_fee: { amount: number; first_year?: number; note?: L };
  reward_type: RewardType;
  program: string;
  earn_unit: 'pct' | 'x';
  rewards: Reward[];
  welcome?: Welcome;
  intro_apr?: { months: number; on: 'purchases' | 'bt' | 'both' };
  fx_fee?: number;
  credits?: Credit[];
  highlights: L[];
  tags?: Tag[];
  status: CardStatus;
  status_note?: L;
  status_changed_at?: string;
  apply_url?: string;
  source_url: string;
  image_url?: string;
  image?: string;
  last_verified: string;
  notes?: string;
  needs_review?: boolean;
}
export interface Issuer {
  id: string;
  name: string;
  short_name: string;
  name_zh?: string;
  website: string;
  cards_index_url: string;
  watch_urls?: string[];
  color: string;
  render?: boolean;
  notes?: L;
}
export interface Program {
  id: string;
  name: L;
  kind: 'cash' | 'transferable' | 'bank' | 'airline' | 'hotel' | 'restricted';
  unit: 'points' | 'miles' | 'usd';
  /** Estimated value in US cents per point/mile. */
  cpp: number;
  basis: 'nerdwallet' | 'issuer' | 'fixed' | 'assumed';
  note?: L;
}
export interface ChangelogEntry {
  date: string;
  type: 'added' | 'updated' | 'status' | 'removed';
  issuer: string;
  card_id?: string;
  card_name?: string;
  summary: L;
  source_url?: string;
}

/** Localised, lightweight shape passed to the React islands (one copy per language). */
export interface CardSummary {
  id: string;
  issuer: string;
  issuerName: string;
  issuerColor: string;
  name: string;
  rewardType: RewardType;
  tags: Tag[];
  headline: string;
  /** e.g. "5X" or "3%" — the card's highest category rate */
  topRate: string;
  topLabel: string;
  /** cash-back-equivalent of the top rate, percent */
  topEquiv: number;
  /** "≈ 7%" for non-cash currencies, else undefined */
  topEquivText?: string;
  /** cash-back-equivalent of the everything-else rate, percent (0 when the card has none) */
  baseEquiv: number;
  baseText: string;
  annualFee: number;
  feeText: string;
  welcomeShort?: string;
  status: CardStatus;
  image: string;
  lastVerified: string;
}
