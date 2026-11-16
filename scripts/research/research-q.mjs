#!/usr/bin/env node
// Research helper: node scripts/research-q.mjs <id> <regex> [width=170] [max=4] — show matches in a saved page.
import fs from 'node:fs';
const [id, re, w = '170', max = '4'] = process.argv.slice(2);
const t = JSON.parse(fs.readFileSync(`research/raw/pages/${id}.json`, 'utf8')).text.replace(/\s+/g, ' ');
const out = [];
const r = new RegExp(re, 'gi');
let m, last = -1e9;
while ((m = r.exec(t)) && out.length < +max) {
  if (m.index - last < +w) continue;
  last = m.index;
  out.push(t.slice(Math.max(0, m.index - 30), m.index + +w));
}
console.log(`## ${id}` + (out.length ? '' : ' — no match'));
for (const o of out) console.log(' · ' + o);
