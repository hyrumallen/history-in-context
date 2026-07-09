# Design Spec: Deploy to GitHub Pages

**Date:** 2026-07-09
**Status:** Approved
**Topic:** Ship History in Context as a live, public website on GitHub Pages

## Goal

Turn the project from a `localhost`-only app into a real, shareable website at
`https://hyrumallen.github.io/history-in-context/`, so Allen can send the URL to
others and gather feedback. Deploys should be automatic on every push to
`master`, with a broken build never reaching the live site.

## Background

- Vite + React 19 SPA, no backend, no client-side router. All data is JSON under
  `src/data/`. Repo already on GitHub at `hyrumallen/history-in-context`,
  default branch `master`, currently at tag `v26.9`.
- Nothing is hosted yet; there is no deploy script and no `base` path configured.
- Because there is no client-side routing, no SPA 404 fallback trick is needed —
  this is a clean static-hosting case.

## Requirements

1. **Production base path.** GitHub Pages serves under the `/history-in-context/`
   subpath, so built asset URLs must carry that prefix or the page loads blank.
2. **Local dev unaffected.** `npm run dev` must keep serving at the clean
   `http://localhost:5173/` root — the base path applies to production builds only.
3. **Automated, safe deploys.** Every push to `master` builds and publishes the
   site, but only after the test suite (`npm test`) and lint (`npm run lint`)
   pass. A failing check blocks the deploy.
4. **Pages enabled with "GitHub Actions" as the source** on the repo.
5. **Shareable-link polish.** The page has a real `<title>`, a meta description,
   and Open Graph tags so a pasted link renders a proper title/description
   preview instead of a bare URL.

## Design

### 1. Vite base path (`vite.config.js`)

Use the config-function form so `base` is conditional on the build command:

```js
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/history-in-context/' : '/',
}))
```

This keeps dev at `/` and production assets under `/history-in-context/`.

### 2. GitHub Actions workflow (`.github/workflows/deploy.yml`)

On `push` to `master` (and manual `workflow_dispatch`):

- `actions/checkout`
- `actions/setup-node` (Node 20, npm cache)
- `npm ci`
- `npm run lint`
- `npm test`
- `npm run build`
- `actions/upload-pages-artifact` with `path: dist`
- `actions/deploy-pages` (separate job with `pages: write` + `id-token: write`
  permissions and a `github-pages` environment), so lint/test failures abort
  before anything is published.

Concurrency guard so overlapping pushes don't race a deploy.

### 3. Enable Pages

Set Pages build source to "GitHub Actions" via `gh` CLI
(`gh api ... /pages` with `build_type=workflow`). If the CLI path fails
(auth/permissions), fall back to documented two-click UI instructions:
Repo → Settings → Pages → Source → "GitHub Actions".

### 4. Shareable-link polish (`index.html`)

Add to `<head>`: a descriptive `<title>`, `<meta name="description">`, and
`og:title` / `og:description` / `og:type` tags. Copy describes the app
("See world history as a side-by-side timeline…"). No image asset required for a
minimum viable preview; an `og:image` can be added later.

## Out of Scope

- **Custom domain** — deferred; easy to add later by pointing DNS at the same
  Pages site. No design decision blocked by skipping it now.
- **F5 grid virtualization / performance** — not needed for this work.
- **`og:image` social preview image** — optional future polish.

## Verification / Definition of Done

1. Workflow run on `master` completes green (lint + test + build + deploy).
2. `https://hyrumallen.github.io/history-in-context/` loads with the full
   timeline and map rendering correctly (assets resolve under the base path —
   no blank page, no 404s in console).
3. Map expand, scroll-year sync, and event pins work on the live site.
4. `npm run dev` still serves correctly at the clean localhost root.

## Rollout Notes

Follows Allen's standard flow: work on `feature/github-pages-deploy`, spec + plan
committed under `docs/superpowers/`, merge to `master` with `--no-ff`, tag the
next `v26.x`, push, delete the branch. The first push to `master` after merge is
what triggers the very first live deploy.
