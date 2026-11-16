#!/usr/bin/env node
// Research helper: node scripts/dump-page.mjs <name> <url>  → research/raw/<name>.{txt,links,imgs}
import fs from 'node:fs';
import { fetchPage, closeBrowser } from './lib/fetch-page.mjs';
const [name, url] = process.argv.slice(2);
const p = await fetchPage(url, { allowBrowser: false });
fs.mkdirSync('research/raw', { recursive: true });
fs.writeFileSync(`research/raw/${name}.txt`, p.text);
fs.writeFileSync(`research/raw/${name}.links`, p.links.map((l) => `${l.text}\t${l.href}`).join('\n'));
fs.writeFileSync(`research/raw/${name}.imgs`, p.images.map((l) => `${l.alt}\t${l.src}`).join('\n'));
console.log(name, p.status, p.ok, p.error || '', 'text', p.text.length, 'links', p.links.length, 'imgs', p.images.length, p.finalUrl);
await closeBrowser();
