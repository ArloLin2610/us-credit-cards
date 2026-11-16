#!/usr/bin/env node
/**
 * Validates data/issuers.json, data/programs.json, data/cards/*.json and
 * data/changelog.json against the JSON schemas plus cross-file rules. Exits 1 on any error.
 */
import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const vIssuer = ajv.compile(read('data/schema/issuer.schema.json'));
const vProgram = ajv.compile(read('data/schema/program.schema.json'));
const vCard = ajv.compile(read('data/schema/card.schema.json'));
const errors = [];
const warn = [];

const issuers = read('data/issuers.json');
if (!vIssuer(issuers)) errors.push(`issuers.json: ${ajv.errorsText(vIssuer.errors, { separator: '\n  ' })}`);
const issuerIds = new Set(issuers.map((b) => b.id));
if (issuerIds.size !== issuers.length) errors.push('issuers.json: duplicate issuer ids');

const prog = read('data/programs.json');
if (!vProgram(prog)) errors.push(`programs.json: ${ajv.errorsText(vProgram.errors, { separator: '\n  ' })}`);
const programs = new Map((prog.programs || []).map((p) => [p.id, p]));
if (!programs.has('cash')) errors.push('programs.json: a "cash" program is required');

const files = fs.readdirSync(path.join(root, 'data/cards')).filter((f) => f.endsWith('.json'));
const seen = new Map();
let total = 0;
let hidden = 0;
for (const f of files) {
  let arr;
  try {
    arr = read(`data/cards/${f}`);
  } catch (e) {
    errors.push(`${f}: invalid JSON — ${e.message}`);
    continue;
  }
  if (!Array.isArray(arr)) {
    errors.push(`${f}: must be a JSON array of cards`);
    continue;
  }
  const expected = f.replace(/\.json$/, '');
  arr.forEach((card, i) => {
    total++;
    const where = `${f}[${i}] ${card?.id ?? '(no id)'}`;
    if (!vCard(card)) {
      errors.push(`${where}: ${ajv.errorsText(vCard.errors, { separator: '; ' })}`);
      return;
    }
    if (card.needs_review) hidden++;
    if (!issuerIds.has(card.issuer)) errors.push(`${where}: unknown issuer "${card.issuer}"`);
    if (card.issuer !== expected) errors.push(`${where}: issuer "${card.issuer}" does not match file name`);
    if (!card.id.startsWith(`${card.issuer}-`)) errors.push(`${where}: id must start with "${card.issuer}-"`);
    if (seen.has(card.id)) errors.push(`${where}: duplicate id (also in ${seen.get(card.id)})`);
    seen.set(card.id, f);
    const p = programs.get(card.program);
    if (!p) errors.push(`${where}: unknown program "${card.program}"`);
    else {
      if (card.reward_type === 'cashback' && card.earn_unit !== 'pct') errors.push(`${where}: cashback cards must use earn_unit "pct"`);
      if (card.earn_unit === 'pct' && p.unit !== 'usd') errors.push(`${where}: earn_unit "pct" needs a dollar-denominated program (got ${p.id})`);
      if (card.earn_unit === 'x' && p.unit === 'usd') errors.push(`${where}: earn_unit "x" needs a points/miles program (got ${p.id})`);
    }
    const cats = card.rewards.map((r) => r.cat);
    if (new Set(cats).size !== cats.length) errors.push(`${where}: duplicate reward category`);
    if (card.rewards.some((r) => r.rate > (card.earn_unit === 'pct' ? 10 : 20))) warn.push(`${where}: unusually high earn rate (${card.rewards.map((r) => r.rate).join(',')})`);
    if (card.rewards.length && !cats.includes('all') && !card.needs_review) warn.push(`${where}: no base ("all") rate`);
    if (card.welcome && !card.welcome.text && !(card.welcome.value && card.welcome.unit)) errors.push(`${where}: welcome needs value+unit or text`);
    if (card.status !== 'active' && !card.status_note) warn.push(`${where}: ${card.status} without status_note`);
    if (!card.image_url && !card.image) warn.push(`${where}: no image_url (placeholder will be shown)`);
    if (card.highlights.length === 0 && !card.needs_review && card.rewards.length === 0) errors.push(`${where}: a card with no rewards needs at least one highlight`);
  });
}

const changelog = read('data/changelog.json');
if (!Array.isArray(changelog)) errors.push('changelog.json must be an array');
else
  changelog.forEach((e, i) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date ?? '')) errors.push(`changelog[${i}]: bad date`);
    if (!['added', 'updated', 'status', 'removed'].includes(e.type)) errors.push(`changelog[${i}]: bad type`);
    if (!issuerIds.has(e.issuer)) errors.push(`changelog[${i}]: unknown issuer ${e.issuer}`);
    if (!e.summary?.en || !e.summary?.zh) errors.push(`changelog[${i}]: summary needs en and zh`);
    if (e.card_id && !seen.has(e.card_id) && e.type !== 'removed') warn.push(`changelog[${i}]: card ${e.card_id} not found`);
  });

for (const w of warn) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(`\n${issuers.length} issuers, ${programs.size} programs, ${total} cards (${hidden} awaiting review) — ${errors.length} errors, ${warn.length} warnings`);
process.exit(errors.length ? 1 : 0);
