#!/usr/bin/env node
// Research helper: render pages (id \t url TSV) in headless Chrome and save innerText + images to research/raw/pages/<id>.json
import fs from 'node:fs';
import { chromium } from 'playwright';
const [listFile, force] = process.argv.slice(2);
const rows = fs.readFileSync(listFile, 'utf8').split('\n').filter(Boolean).map((l) => l.split('\t'));
const opts = { headless: true };
if (process.env.CHROME_PATH) opts.executablePath = process.env.CHROME_PATH;
if (process.env.HTTPS_PROXY) opts.proxy = { server: process.env.HTTPS_PROXY };
const b = await chromium.launch(opts);
const ctx = await b.newContext({ locale: 'en-US', viewport: { width: 1280, height: 900 } });
fs.mkdirSync('research/raw/pages', { recursive: true });
for (const [id, url] of rows) {
  const f = `research/raw/pages/${id}.json`;
  if (!force && fs.existsSync(f) && JSON.parse(fs.readFileSync(f, 'utf8')).rendered) continue;
  const p = await ctx.newPage();
  try {
    const res = await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 }).catch(() => null);
    await p.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await p.waitForTimeout(1200);
    const data = await p.evaluate(() => ({
      text: document.body.innerText,
      title: document.title,
      images: [...document.images].map((i) => ({ alt: i.alt || '', src: i.currentSrc || i.src })).filter((i) => i.src.startsWith('http')),
    }));
    fs.writeFileSync(f, JSON.stringify({ status: res ? res.status() : 0, ok: !!res, finalUrl: p.url(), rendered: true, ...data }));
    console.log(id, res ? res.status() : 0, data.text.length, p.url() !== url ? '→ ' + p.url() : '');
  } catch (e) {
    console.log(id, 'ERR', e.message.slice(0, 120));
  }
  await p.close();
}
await b.close();
