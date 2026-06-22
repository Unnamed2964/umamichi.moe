// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, passthroughImageService, sharpImageService } from 'astro/config';
import umamichiConfig from './umamichi.config.mjs';
import remarkGfm from 'remark-gfm';
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeMermaid from 'rehype-mermaid';
import rehypeWrapEmoji from './scripts/rehype-wrap-emoji.mjs';
import outOfSiteHtmlPostbuildIntegration from './src/integrations/out-of-site-html-postbuild.mjs';
import contentStaticAssetsIntegration from './src/integrations/content-static-assets.mjs';
import { giscusThemeCorsDev } from './scripts/vite-giscus-theme-cors-dev.mjs';
import { loadEnv } from 'vite';

import react from '@astrojs/react';

import cloudflare from '@astrojs/cloudflare';

const site = 'https://umamichi.moe';
const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');
const outOfSitePrivateKey = env.OUT_OF_SITE_ED25519_PRIVATE_KEY ?? '';

/** @type {import('rehype-mermaid').RehypeMermaidOptions} */
const rehypeMermaidOptions = {
  strategy: 'img-svg',
  dark: true,
};

const markdownRehypePlugins = [
  [rehypeMermaid, rehypeMermaidOptions],
  rehypeKatex,
  rehypeWrapEmoji,
];

const mdxRehypePlugins = [
  [rehypeMermaid, rehypeMermaidOptions],
  rehypeWrapEmoji,
];

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [
    mdx({
      remarkPlugins: [remarkGfm, remarkMath],
      rehypePlugins: mdxRehypePlugins,
    }),
    contentStaticAssetsIntegration(),
    outOfSiteHtmlPostbuildIntegration({ site, privateKeyPem: outOfSitePrivateKey }),
    sitemap(),
    react(),
  ],
  adapter: cloudflare(),
  image: {
    service: umamichiConfig.imageOptimization.enabled
      ? sharpImageService()
      : passthroughImageService(),
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
    syntaxHighlight: {
      type: 'shiki',
      excludeLangs: ['mermaid', 'math'],
    },
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: markdownRehypePlugins,
  },
  vite: {
    plugins: [giscusThemeCorsDev()],
  },
});
