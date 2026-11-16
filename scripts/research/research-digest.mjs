#!/usr/bin/env node
// Research helper: fetch product pages listed in a TSV (id \t url) and print a compact digest of
// reward-relevant lines + candidate card-art images. Raw text is kept in research/raw/pages/.
import fs from 'node:fs';
import { fetchPage } from './lib/fetch-page.mjs';
const [listFile, maxLines = '16', width = '240'] = process.argv.slice(2);
const rows = fs.readFileSync(listFile, 'utf8').split('\n').filter(Boolean).map((l) => l.split('\t'));
fs.mkdirSync('research/raw/pages', { recursive: true });
const KEEP = /(\d(\.\d+)?\s?(x|X|%)\s|\d\s?(points?|miles?|Avios)\s(per|for every|on|at|back)|per \$1|cash back|foreign transaction|annual fee|lounge|statement credit|free night|checked bag|anniversary|Global Entry|TSA|intro APR|bonus (points|miles)|no longer|not (currently )?(available|accepting)|new applica)/i;
const DROP = /^(Opens|Links to|Apply|See |Learn|Compare|†|\*|Skip)|APR of|variable APR|Min\. of|cash advance|late payment|penalty|See (your|the) |subject to|will not (earn|qualify)|do not qualify|we reserve|allow (up to )?\d|weeks|statement closing|Rewards Program Agreement/i;
for (const [id, url] of rows) {
  const f = `research/raw/pages/${id}`;
  let p;
  if (fs.existsSync(f + '.json')) p = JSON.parse(fs.readFileSync(f + '.json', 'utf8'));
  else {
    p = await fetchPage(url, { allowBrowser: false });
    fs.writeFileSync(f + '.json', JSON.stringify({ status: p.status, ok: p.ok, finalUrl: p.finalUrl, error: p.error, title: p.title, text: p.text, images: p.images }));
    await new Promise((r) => setTimeout(r, 700));
  }
  const seen = new Set();
  const lines = [];
  for (let l of p.text.split('\n')) {
    l = l.replace(/Opens [^.]*? (window|dialog|overlay)\.?/gi, '').replace(/\s+/g, ' ').trim();
    if (l.length < 12 || !KEEP.test(l) || DROP.test(l)) continue;
    const k = l.slice(0, 50).toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    lines.push(l.slice(0, +width));
    if (lines.length >= +maxLines) break;
  }
  const imgs = p.images.filter((i) => /card[-_ ]?art|cardart|card_|\/cards?\//i.test(i.src) || /card art|credit card$/i.test(i.alt)).slice(0, 3).map((i) => i.src);
  console.log(`\n### ${id} [${p.status}${p.ok ? '' : ' NOT-OK ' + (p.error || '')}] ${p.finalUrl !== url ? '→ ' + p.finalUrl : ''} | ${p.title.slice(0, 70)} | text ${p.text.length}`);
  for (const l of lines) console.log('- ' + l);
  for (const i of imgs) console.log('img ' + i);
}
