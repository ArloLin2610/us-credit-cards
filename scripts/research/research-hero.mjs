#!/usr/bin/env node
// Research helper: print the head of saved page text (for pages whose text is one long line).
import fs from 'node:fs';
const [n, ...ids] = process.argv.slice(2);
for (const id of ids) {
  const p = JSON.parse(fs.readFileSync(`research/raw/pages/${id}.json`, 'utf8'));
  let t = p.text.replace(/\n/g, ' | ').replace(/Opens [^.|]*? (window|dialog|overlay)\.?/gi, '').replace(/\s+/g, ' ');
  const cut = t.search(/Begins? Offer Details|Offer Details Overlay/i);
  if (cut > 400) t = t.slice(0, cut);
  console.log(`\n### ${id}\n${t.slice(0, +n)}`);
}
