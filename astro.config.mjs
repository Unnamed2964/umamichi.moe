// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import remarkGfm from 'remark-gfm';
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeWrapEmoji from './scripts/rehype-wrap-emoji.mjs';
import rehypeOutOfSiteLinks from './src/lib/rehype-out-of-site-links.mjs';
import { loadEnv } from 'vite';
import svgr from "vite-plugin-svgr";

import react from '@astrojs/react';

import cloudflare from '@astrojs/cloudflare';

const site = 'https://umamichi.moe';
const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');
const outOfSitePrivateKey = env.OUT_OF_SITE_ED25519_PRIVATE_KEY ?? '';

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [mdx({ rehypePlugins: [rehypeWrapEmoji, [rehypeOutOfSiteLinks, { site, privateKeyPem: outOfSitePrivateKey }]] }), sitemap(), react()],
  adapter: cloudflare(),
  vite: {
    plugins: [svgr()],
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [rehypeKatex, rehypeWrapEmoji, [rehypeOutOfSiteLinks, { site, privateKeyPem: outOfSitePrivateKey }]],
  },
});