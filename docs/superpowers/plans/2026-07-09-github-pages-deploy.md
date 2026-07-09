# GitHub Pages Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship History in Context as a live, public website at `https://hyrumallen.github.io/history-in-context/` that auto-deploys on every push to `master`.

**Architecture:** A conditional Vite `base` path prefixes production asset URLs with the repo subpath while leaving local dev at the clean root. A GitHub Actions workflow lints, tests, and builds on push to `master`, then publishes `dist/` to GitHub Pages via the official Pages actions — with build failures blocking the deploy. `index.html` gains title/description/Open Graph tags for shareable link previews.

**Tech Stack:** Vite 8, React 19, GitHub Actions, GitHub Pages, oxlint, vitest.

## Global Constraints

- Git repo root is `history-in-context/` (NOT its parent). `.github/` and `package.json` are at repo root; the Pages artifact path is `dist` with no working-directory override.
- Production base path is exactly `/history-in-context/` (matches the repo name). Local dev must remain at `/`.
- Deploys trigger on push to `master` only (plus manual `workflow_dispatch`); lint (`npm run lint`) and test (`npm test`) must pass before build/deploy.
- No client-side router exists — no SPA 404 fallback is needed.
- Node 20 on CI. Install with `npm ci` (a `package-lock.json` is present).
- Follow Allen's flow: feature branch `feature/github-pages-deploy` → merge to `master` with `--no-ff` → tag next `v26.x` → push → delete branch. The first push to `master` is what triggers the first live deploy.

---

### Task 1: Conditional Vite base path

**Files:**
- Modify: `vite.config.js`

**Interfaces:**
- Consumes: nothing (entry task).
- Produces: production builds emit `dist/index.html` whose asset URLs begin with `/history-in-context/`; dev server keeps serving at `/`.

- [ ] **Step 1: Establish the failing check (build without base path)**

Run: `npm run build && grep -c '/history-in-context/assets/' dist/index.html`
Expected: prints `0` (current config has no base path, so no prefixed asset URLs) — this is the pre-change failing state.

- [ ] **Step 2: Update `vite.config.js` to the config-function form**

Replace the entire file with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serves under /history-in-context/. Apply the base only for
  // production builds so `npm run dev` stays at the clean localhost root.
  base: command === 'build' ? '/history-in-context/' : '/',
}))
```

- [ ] **Step 3: Rebuild and verify the base path is applied**

Run: `npm run build && grep -c '/history-in-context/assets/' dist/index.html`
Expected: prints a number `>= 1` (built JS/CSS `<script>`/`<link>` URLs now carry the base prefix).

- [ ] **Step 4: Verify dev server stays at the clean root**

Run: `npm run dev` in the background, then `curl -s http://localhost:5173/ | grep -c '/history-in-context/'`; stop the dev server.
Expected: prints `0` (dev HTML has no base prefix). If curl is unavailable, load `http://localhost:5173/` in a browser and confirm the app renders normally.

- [ ] **Step 5: Confirm lint and tests still pass**

Run: `npm run lint && npm test`
Expected: lint reports no errors; vitest exits `0` with all tests passing.

- [ ] **Step 6: Commit**

```bash
git add vite.config.js
git commit -m "feat: conditional vite base path for GitHub Pages"
```

---

### Task 2: Shareable-link meta tags in `index.html`

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: Task 1's base path (Vite rewrites the `/favicon.svg` and `/src/main.jsx` references under the base at build time; leave those as-is).
- Produces: `<head>` containing `<title>`, `<meta name="description">`, and `og:title`/`og:description`/`og:type`/`og:url` tags.

- [ ] **Step 1: Write the failing check**

Run: `grep -c 'og:title' index.html`
Expected: prints `0` (no Open Graph tags yet) — pre-change failing state.

- [ ] **Step 2: Add the meta tags to `<head>`**

In `index.html`, replace this line:

```html
    <title>History in Context</title>
```

with:

```html
    <meta name="description" content="See world history as a side-by-side timeline grid — 22 nations from 1500 to 2000, their rulers, events, and shifting borders, all in one view." />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="History in Context" />
    <meta property="og:description" content="See world history as a side-by-side timeline grid — 22 nations from 1500 to 2000, their rulers, events, and shifting borders, all in one view." />
    <meta property="og:url" content="https://hyrumallen.github.io/history-in-context/" />
    <title>History in Context</title>
```

- [ ] **Step 3: Verify the tags are present and the build still carries them**

Run: `grep -c 'og:title' index.html && npm run build && grep -c 'og:title' dist/index.html`
Expected: both grep counts are `>= 1` (source has the tag; the built output preserves it).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: title/description/OG tags for shareable link previews"
```

---

### Task 3: GitHub Actions deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: `npm run lint`, `npm test`, `npm run build` scripts (all already in `package.json`); the `dist/` output from Task 1.
- Produces: a two-job workflow (`build` then `deploy`) that publishes `dist/` to the `github-pages` environment on push to `master`. Requires Task 4 to enable Pages before it can succeed end-to-end.

- [ ] **Step 1: Create the workflow file**

Create `.github/workflows/deploy.yml` with exactly:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [master]
  workflow_dispatch:

# Least-privilege permissions the Pages deploy needs.
permissions:
  contents: read
  pages: write
  id-token: write

# One deploy at a time; don't cancel an in-progress production deploy.
concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Validate the YAML parses**

Run: `node -e "const fs=require('fs');const s=fs.readFileSync('.github/workflows/deploy.yml','utf8');if(!/actions\/deploy-pages@v4/.test(s)||!/npm run build/.test(s)){process.exit(1)}console.log('workflow ok')"`
Expected: prints `workflow ok` (file exists and contains the deploy action + build step). This is a structural sanity check; the true end-to-end run happens in Task 4 after merge.

- [ ] **Step 3: Confirm the whole CI command chain passes locally**

Run: `npm ci && npm run lint && npm test && npm run build`
Expected: every command exits `0` — this mirrors exactly what the `build` job runs, so a green local run means CI should build green.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: GitHub Pages deploy workflow (lint + test + build on push to master)"
```

---

### Task 4: Enable Pages, merge, and verify the live site

**Files:**
- None (repo settings + git integration + live verification).

**Interfaces:**
- Consumes: the workflow from Task 3 and the base path / meta tags from Tasks 1–2.
- Produces: a working public site at `https://hyrumallen.github.io/history-in-context/`.

- [ ] **Step 1: Enable GitHub Pages with "GitHub Actions" as the source**

Run: `gh api --method POST repos/hyrumallen/history-in-context/pages -f build_type=workflow`
Expected: JSON response describing the Pages site (or HTTP 409 "already enabled" — also acceptable).
Fallback if this errors on permissions: instruct Allen to open Repo → Settings → Pages → under "Build and deployment" set Source to "GitHub Actions", then continue.

- [ ] **Step 2: Merge the feature branch to `master` (no fast-forward)**

```bash
git checkout master
git merge --no-ff feature/github-pages-deploy -m "Merge feature/github-pages-deploy: live on GitHub Pages"
```

- [ ] **Step 3: Push `master` to trigger the first deploy**

```bash
git push origin master
```

- [ ] **Step 4: Watch the workflow run to completion**

Run: `gh run watch --exit-status $(gh run list --workflow=deploy.yml --branch=master --limit=1 --json databaseId --jq '.[0].databaseId')`
Expected: the run finishes with conclusion `success` (both `build` and `deploy` jobs green). If it fails, read the failing job's logs with `gh run view --log-failed` and fix before proceeding.

- [ ] **Step 5: Verify the live site loads with assets resolving under the base path**

Run: `curl -s -o /dev/null -w "%{http_code}\n" https://hyrumallen.github.io/history-in-context/` and `curl -s https://hyrumallen.github.io/history-in-context/ | grep -c '/history-in-context/assets/'`
Expected: HTTP `200`, and the asset-reference count is `>= 1`. (Pages may take 1–2 minutes after the run to serve the first deploy; retry if the first curl 404s.)

- [ ] **Step 6: Verify the app actually works in a browser**

Load `https://hyrumallen.github.io/history-in-context/`. Confirm: the timeline grid renders with data, the scroll-year badge updates on scroll, the map mini-panel expands, and no red 404 errors appear in the browser console.

- [ ] **Step 7: Tag the release and push the tag**

```bash
git tag v27.0
git push origin v27.0
```

(First public deploy is a milestone — bump the minor to `v27.0`. Confirm the exact tag with Allen if he prefers `v26.10`.)

- [ ] **Step 8: Delete the merged feature branch**

```bash
git branch -d feature/github-pages-deploy
git push origin --delete feature/github-pages-deploy
```

---

## Post-Implementation

- [ ] Update `docs/BACKLOG.md`: add a "Shipped" note that the site is live on GitHub Pages, and record the live URL in `README.md`.
- [ ] Commit the docs update to `master` and push (this will trigger a redeploy — harmless).

## Self-Review Notes

- **Spec coverage:** Requirement 1 (base path) → Task 1; Req 2 (dev unaffected) → Task 1 Step 4; Req 3 (safe automated deploys) → Task 3 + Task 4 Steps 3–4; Req 4 (enable Pages) → Task 4 Step 1; Req 5 (link polish) → Task 2. Verification/DoD items → Task 4 Steps 4–6 and Task 1 Step 4. All covered.
- **Placeholder scan:** No TBD/TODO; every code and command step shows exact content.
- **Type/name consistency:** Base path string `/history-in-context/`, artifact `path: dist`, and script names (`npm run lint`, `npm test`, `npm run build`) are identical across Tasks 1, 3, and 4.
