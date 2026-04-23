// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import remarkGfm from 'remark-gfm';
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeWrapEmoji from './scripts/rehype-wrap-emoji.mjs';

import react from '@astrojs/react';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://umamichi.moe',
  integrations: [mdx({ rehypePlugins: [rehypeWrapEmoji] }), sitemap(), react()],
  adapter: cloudflare(),
  markdown: {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [rehypeKatex, rehypeWrapEmoji],
  },
});