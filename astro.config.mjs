// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages serves a project site under /<repo-name>/. The deploy workflow sets both variables;
// locally they default to a root-served site.
//   SITE_URL  — origin, e.g. https://arlolin2610.github.io
//   BASE_PATH — e.g. /us-credit-cards   (leave empty when using a custom domain)
const site = process.env.SITE_URL || 'https://example.com';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [react(), sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en-US', zh: 'zh-Hant' } } })],
  vite: { plugins: [tailwindcss()] },
});
