# Research notes — first data load, 2026-11-16

All card data was read from issuer websites on 2026-11-16 with `scripts/research/*` (honest user agent, robots.txt honoured).
`research/seed/*.py` are the one-time scripts that produced `data/cards/*.json`; after seeding, the JSON files are the source of truth.

| Issuer | Cards | How the pages were read | Gaps |
|---|---:|---|---|
| Chase | 31 | Plain HTTP: card index + every product page | FX fee omitted where the product page does not state it (Freedom Unlimited, Freedom Rise, Southwest/Marriott Bountiful/Bold etc. as applicable). Aer Lingus / Iberia FX fee assumed same as British Airways page. Disney Premier 2% categories not itemised. |
| American Express | 13 | Plain HTTP product pages | Welcome offers are personalised and not in page text → not listed. Green, Cash Magnet, EveryDay, EveryDay Preferred product URLs redirected to the index → not listed. Hilton Surpass annual fee not in page text (entered $150, flagged in notes). Blue Cash FX fee text truncated (2.7% flagged in notes). |
| Citi | 14 | Headless Chrome (prices/offers are filled in by JavaScript) | Custom Cash: closed to applications since 2026-05-28 (kept as a discontinued record). FX fee blank for AAdvantage Executive/Globe/MileUp and AT&T Points Plus. Retail store cards not listed. |
| Capital One | 12 | Plain HTTP: compare page + product pages | Partner/retail cards and "for Good Credit" variants not listed. Network not stated on pages (`varies`). |
| Discover | 8 | Plain HTTP: card index | FX fee not stated on index. Quarterly 5% cap amount not stated on index. |
| Wells Fargo | 7 | Plain HTTP: index + 5 product pages | Choice Privileges cards: data from the index only. |
| U.S. Bank | 8 | Headless Chrome index + plain product pages | FX fee stated only for Altitude Connect. |
| Barclays | 14 (1 hidden) | Plain HTTP: index + product pages | Frontier: card-only earn rate on Frontier purchases not broken out → `needs_review`. Wyndham network unconfirmed. Several welcome offers are "after qualifying account activity" with terms behind the application. Retail co-brands not listed. |
| Bilt | 3 | Plain HTTP: card page comparison table | No card-art images exposed; placeholders. |
| Bank of America | 12 (all hidden) | Product pages are ZIP-code gated and built client-side; headless Chrome gets HTTP 403 | Only meta descriptions and card art were readable. All 12 entries are `needs_review` until verified by hand (their summaries are in each card's `notes`). |

Point valuations: NerdWallet, "How Much Are Travel Points and Miles Worth in 2026?", updated 2026-10-13, retrieved 2026-11-16.
Programs without a NerdWallet figure (U.S. Bank Altitude, Miles & More, Frontier, Allegiant) use an assumed 1¢ and are labelled as such on the site.
