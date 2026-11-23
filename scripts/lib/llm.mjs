/**
 * Structured extraction with the Claude API. Every function is a no-op
 * (returns null) when ANTHROPIC_API_KEY is not set, so the checker still
 * detects and reports changes without it.
 */
import fs from 'node:fs';
import path from 'node:path';

const MODEL = process.env.LLM_MODEL || 'claude-sonnet-5-5';
export const hasLLM = Boolean(process.env.ANTHROPIC_API_KEY);

let client = null;
async function getClient() {
  if (!hasLLM) return null;
  if (client) return client;
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 3 });
  return client;
}

const root = path.resolve(new URL('../..', import.meta.url).pathname);
const cardSchema = JSON.parse(fs.readFileSync(path.join(root, 'data/schema/card.schema.json'), 'utf8'));
const programIds = JSON.parse(fs.readFileSync(path.join(root, 'data/programs.json'), 'utf8')).programs.map((p) => `${p.id} (${p.name.en})`);

// Tool input schemas must not contain $schema/$id.
function toolSchema(schema) {
  const { $schema, $id, title, ...rest } = schema;
  return rest;
}

async function callTool({ system, user, name, description, schema, maxTokens = 4000 }) {
  const c = await getClient();
  if (!c) return null;
  const res = await c.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    tools: [{ name, description, input_schema: schema }],
    tool_choice: { type: 'tool', name },
    messages: [{ role: 'user', content: user }],
  });
  const block = res.content.find((b) => b.type === 'tool_use');
  return block ? block.input : null;
}

const SYSTEM = `You maintain a database of US consumer credit cards. Answer only from the official page text you are given; never add numbers or conditions that are not on the page. Omit any field you cannot confirm instead of guessing. Bilingual fields take English ("en", close to the issuer's wording but concise) and Traditional Chinese as used in Taiwan ("zh"); keep card and brand names in English inside the Chinese text. Amounts are US dollars.`;

/** Extract the list of consumer credit cards named on an issuer's card-index page. */
export async function extractCardList(issuerName, pageText, links) {
  const linkHints = links
    .filter((l) => /card|credit/i.test(l.href + l.text))
    .slice(0, 150)
    .map((l) => `${l.text} -> ${l.href}`)
    .join('\n');
  return callTool({
    system: SYSTEM,
    user: `Below is the text of ${issuerName}'s official credit-card index page. List every personal (consumer) credit card named on it. Leave out business cards, debit cards, charge accounts for a single store, and loans. Where the link list lets you match a card to its product page, include that URL.\n\n=== PAGE TEXT ===\n${pageText.slice(0, 30000)}\n\n=== LINKS ===\n${linkHints}`,
    name: 'card_list',
    description: 'Return the list of cards',
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['cards'],
      properties: {
        cards: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['name'],
            properties: {
              name: { type: 'string', description: 'Official card name' },
              url: { type: 'string', description: 'Product page URL, if known' },
              status_hint: { enum: ['active', 'suspended', 'discontinued', 'unknown'], description: 'Whether the page says the card is closed to applications' },
            },
          },
        },
      },
    },
  });
}

/** Extract or refresh one card's structured data from its official product page. */
export async function extractCard({ bankId, bankName, url, pageText, existing }) {
  const today = new Date().toISOString().slice(0, 10);
  return callTool({
    system: SYSTEM,
    user: [
      `Issuer: ${bankName} (issuer id: ${bankId})`,
      `Product page: ${url}`,
      existing
        ? `Current database entry — update it from the new page text. Keep id, issuer and source_url unchanged, and keep any field the page no longer mentions only if nothing contradicts it:\n${JSON.stringify(existing, null, 2)}`
        : `This is a new card; build a complete entry. id format: ${bankId}-<lowercase-slug>.`,
      [
        'Field rules:',
        '- reward_type: cashback, miles (airline co-brands and miles currencies) or points (bank and hotel points).',
        `- program: one of ${programIds.join('; ')}. Use "cash" for plain cash back. If none fits, use the closest and say so in notes.`,
        '- earn_unit: "pct" for percent back, "x" for points/miles per $1. rewards[].rate is the card\'s own earn rate; do not use "up to" totals that include loyalty-member or elite earnings — mention those in detail instead.',
        '- rewards: one entry per category; "all" is the everything-else rate. Put what qualifies in detail and spending limits in cap.',
        '- welcome: value + unit + spend + months when the page states them; otherwise text. Set limited_time only if the page says so.',
        '- annual_fee.amount is the ongoing fee; first_year only when an intro fee differs.',
        '- fx_fee: percent, 0 for none; omit if the page does not say.',
        '- credits: every statement credit, voucher and cardholder perk the page names (lounge passes, companion fares or awards, free checked bags, boarding, fee waivers, free nights, elite status, in-flight discounts), one entry each, with the maximum amount for its period and the cadence/conditions in detail. A perk with no dollar amount takes per "other" and no amount. Do not summarise several into one and do not skip small ones.',
        '- highlights: at most 4 points-related features not already covered by rewards or credits (status-point earning, transfer partners, relationship bonuses).',
        '- tags: only lounge / student / secured / credit-building / no-rewards when they apply.',
        '- status: discontinued only if the page says the card is closed to new applicants.',
        `- last_verified: ${today}. image_url: pick the card-art image from the IMAGES list.`,
      ].join('\n'),
      `=== OFFICIAL PAGE TEXT ===\n${pageText.slice(0, 40000)}`,
    ].join('\n\n'),
    name: 'card',
    description: 'Return the card as an object matching the schema',
    schema: toolSchema(cardSchema),
    maxTokens: 6000,
  });
}

/** Decide whether a product page now says the card is closed to applications. */
export async function classifyStatus({ cardName, pageText, httpStatus, stopKeywords }) {
  return callTool({
    system: SYSTEM,
    user: `Card: ${cardName}\nHTTP status: ${httpStatus}\nMatched lines: ${stopKeywords.join(' | ') || 'none'}\n\nFrom the page text below, decide whether this card is still open to new applications. Bonus-eligibility wording ("this offer may not be available if you previously had the card") does not mean the card is closed.\n\n${pageText.slice(0, 20000)}`,
    name: 'status',
    description: 'Classify the application status',
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['status', 'confidence', 'reason'],
      properties: {
        status: { enum: ['active', 'suspended', 'discontinued', 'unknown'] },
        confidence: { type: 'number', minimum: 0, maximum: 1 },
        reason: { type: 'string', description: 'One sentence quoting the page text that decides it' },
        status_note_en: { type: 'string', description: 'Short public note in English' },
        status_note_zh: { type: 'string', description: 'The same note in Traditional Chinese' },
      },
    },
    maxTokens: 800,
  });
}

/** Short Traditional Chinese summary of what changed on a page (for the review PR). */
export async function summarizeChange({ bankName, url, added, removed }) {
  const c = await getClient();
  if (!c) return null;
  const res = await c.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: SYSTEM,
    messages: [
      {
        role: 'user',
        content: `The text of ${bankName}'s page ${url} changed. In 1–3 sentences of Traditional Chinese, summarise what matters to someone applying for a credit card (new card, closed card, earn rates, annual fee, welcome offer, offer dates). If it is only layout or unrelated wording, answer 「無實質變化」.\n\nLines added:\n${added.slice(0, 80).join('\n')}\n\nLines removed:\n${removed.slice(0, 80).join('\n')}`,
      },
    ],
  });
  return res.content.find((b) => b.type === 'text')?.text?.trim() ?? null;
}
