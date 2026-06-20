# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single product: the **umamichi.moe** personal blog, built with Astro 6 + React 19, deployed to Cloudflare Workers. There is no database/backend to stand up — content lives in `src/content` (Markdown/MDX).

### Services / commands
- **Dev server (primary):** `npm run dev` → Astro at `http://localhost:4321/`. This is all that's needed for normal content/UI work.
- **Type check / lint:** `npx astro check`. Note there are 2 pre-existing type errors (`src/worker.ts` `ctx` cast and `ArticleCopyright.tsx` `CopyrightConfig.statement`) that exist on a clean checkout — they do not block dev or build.
- **Build:** `npm run build` (outputs to `dist/`, runs the Ed25519 out-of-site link post-build step).
- **Cloudflare runtime / API endpoints:** `npm run preview` (= `astro build && wrangler dev`). Only needed to exercise the telemetry endpoints `/api/tikkun` and `/api/hester`, which require the `tikkun` KV binding. Not needed for normal page browsing.

### Non-obvious notes
- `wrangler types` (script: `npm run generate-types`) writes `worker-configuration.d.ts`, which provides the `cloudflare:workers` module + `Env`/`request.cf` types. Without it `astro check` reports extra errors on `src/pages/api/*.ts`. The file is generated (not committed) and is recreated by the update script.
- Env vars (all optional for basic dev) are in `.env.example`; use a local `.env.local`. `PUBLIC_OUT_OF_SITE_LINK_HMAC_KEY` is recommended if you need to test outbound-link (`/out-of-site/`) handling, otherwise external-link clicks hit a 503 recovery page.
- Content images/attachments live under `src/content/**/imgs/` and `src/content/**/files/`; non-markdown assets there are copied to the site root at build. Legacy copies under `public/` are for backward-compatible URLs only.
- Comments use Giscus (external GitHub Discussions) and won't load fully offline — expected.
