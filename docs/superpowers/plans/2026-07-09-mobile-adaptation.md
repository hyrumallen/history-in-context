# Mobile Adaptation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the timeline usable on phones by adapting the layout at ≤ 640px — narrower swipeable columns, a hidden floating map, a fitted header, and an overlay Countries sidebar — while leaving desktop unchanged.

**Architecture:** A `useIsMobile()` hook (built on a pure, unit-tested `isMobileWidth()` helper + a resize listener) reports phone-width viewports. `TimelineGrid` and `App` read it and switch a handful of inline-style values; `CountrySidebar` gains an `overlay` prop. No new dependencies, no separate mobile view. The user keeps their full country selection and swipes horizontally through columns (native horizontal scroll + CSS scroll-snap).

**Tech Stack:** React 19, Vite 8, vitest (existing no-DOM/node test env), inline styles (existing pattern).

## Global Constraints

- Mobile breakpoint is **≤ 640px** (inclusive). Desktop is > 640px and must be visually and behaviorally unchanged.
- Mobile column sizing: year gutter `44px` (from `60px`), country column `150px` (from `180px`). Desktop keeps `60px` / `180px`.
- No new npm dependencies. Tests run in the existing environment; test only pure logic (the codebase has no component-render test infra, and adding it is out of scope).
- Follow Allen's flow: branch `feature/mobile-adaptation` → merge to `master` with `--no-ff` → tag next `v26.x` → push → delete branch. Merging to `master` auto-deploys via the Pages workflow.
- `src/hooks/` already exists (`useMapTransform.js`). Header height is `52px` (used for the overlay sidebar's `top`).

---

### Task 1: `useIsMobile` hook + pure `isMobileWidth` helper

**Files:**
- Create: `src/hooks/useIsMobile.js`
- Test: `src/hooks/useIsMobile.test.js`

**Interfaces:**
- Consumes: nothing (entry task).
- Produces:
  - `isMobileWidth(width: number, breakpoint = 640): boolean` — pure, `width <= breakpoint`.
  - `useIsMobile(breakpoint = 640): boolean` — React hook; true when `window.innerWidth <= breakpoint`, updates on `resize`.

- [ ] **Step 1: Write the failing test**

Create `src/hooks/useIsMobile.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { isMobileWidth } from './useIsMobile'

describe('isMobileWidth', () => {
  it('is true at or below the default 640px breakpoint', () => {
    expect(isMobileWidth(390)).toBe(true)
    expect(isMobileWidth(640)).toBe(true)
  })

  it('is false above the breakpoint', () => {
    expect(isMobileWidth(641)).toBe(false)
    expect(isMobileWidth(1140)).toBe(false)
  })

  it('respects a custom breakpoint', () => {
    expect(isMobileWidth(700, 768)).toBe(true)
    expect(isMobileWidth(800, 768)).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- useIsMobile`
Expected: FAIL — `Failed to resolve import "./useIsMobile"` (file does not exist yet).

- [ ] **Step 3: Write the hook + helper**

Create `src/hooks/useIsMobile.js`:

```js
import { useState, useEffect } from 'react'

// Pure, unit-testable breakpoint decision.
export function isMobileWidth(width, breakpoint = 640) {
  return width <= breakpoint
}

// True when the viewport is phone-width. Updates on resize/orientation change.
export function useIsMobile(breakpoint = 640) {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && isMobileWidth(window.innerWidth, breakpoint)
  )

  useEffect(() => {
    const onResize = () => setMobile(isMobileWidth(window.innerWidth, breakpoint))
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoint])

  return mobile
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- useIsMobile`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useIsMobile.js src/hooks/useIsMobile.test.js
git commit -m "feat: useIsMobile hook with pure isMobileWidth helper"
```

---

### Task 2: Narrower, swipeable grid on mobile

**Files:**
- Modify: `src/components/TimelineGrid.jsx`

**Interfaces:**
- Consumes: `useIsMobile` from `../hooks/useIsMobile`.
- Produces: at ≤ 640px the grid renders `44px` gutter + `150px` columns with `x proximity` scroll-snap and `scroll-padding-left` equal to the gutter; > 640px unchanged.

- [ ] **Step 1: Add the import**

In `src/components/TimelineGrid.jsx`, after the existing imports (the last import is line 10, `import { reignShade, reignIndexAt } from '../reignShades'`), add:

```js
import { useIsMobile } from '../hooks/useIsMobile'
```

- [ ] **Step 2: Compute mobile-aware widths in the component**

In the default export `TimelineGrid(...)`, immediately after the line `const scrollRef = useRef(null)`, add:

```js
  const isMobile = useIsMobile()
  const yearCol = isMobile ? '44px' : YEAR_COL_WIDTH
  const countryCol = isMobile ? '150px' : COUNTRY_COL_WIDTH
```

- [ ] **Step 3: Apply scroll-snap to the scroll container**

Replace the scroll container opening tag (currently):

```jsx
    <div ref={scrollRef} style={{ overflow: 'auto', height: '100%', width: '100%', background: '#f8f3e7' }}>
```

with:

```jsx
    <div ref={scrollRef} style={{
      overflow: 'auto',
      height: '100%',
      width: '100%',
      background: '#f8f3e7',
      scrollSnapType: isMobile ? 'x proximity' : undefined,
      scrollPaddingLeft: isMobile ? yearCol : undefined,
    }}>
```

- [ ] **Step 4: Use the mobile-aware widths in the grid template**

Replace (currently at the grid `<div>`):

```jsx
        gridTemplateColumns: `${YEAR_COL_WIDTH} repeat(${selectedCountries.length}, ${COUNTRY_COL_WIDTH})`,
```

with:

```jsx
        gridTemplateColumns: `${yearCol} repeat(${selectedCountries.length}, ${countryCol})`,
```

- [ ] **Step 5: Make each country header a horizontal snap point**

In the country header cells `.map`, replace the style object (currently):

```jsx
          <div key={country.id} style={{
            position: 'sticky',
            top: 0,
            zIndex: 4,
            height: HEADER_HEIGHT,
            background: '#f8f3e7',
            borderBottom: '1px solid #d8c9a8',
          }}>
```

with:

```jsx
          <div key={country.id} style={{
            position: 'sticky',
            top: 0,
            zIndex: 4,
            height: HEADER_HEIGHT,
            background: '#f8f3e7',
            borderBottom: '1px solid #d8c9a8',
            scrollSnapAlign: isMobile ? 'start' : undefined,
          }}>
```

- [ ] **Step 6: Verify lint, tests, and build pass**

Run: `npm run lint && npm test && npm run build`
Expected: lint clean; all tests pass (including Task 1's); build succeeds. Desktop grid template still resolves to `60px` + `180px` columns (isMobile is false at desktop width during build's static output — the values are runtime, so this mainly confirms no syntax/compile errors).

- [ ] **Step 7: Commit**

```bash
git add src/components/TimelineGrid.jsx
git commit -m "feat: narrower swipeable grid with scroll-snap on mobile"
```

---

### Task 3: Hide floating map + fit header on mobile (App.jsx)

**Files:**
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `useIsMobile` from `./hooks/useIsMobile`.
- Produces: on mobile the floating mini-map is not rendered (full-screen map via header "Map" still works); the header subtitle is hidden and header padding is tightened.

- [ ] **Step 1: Add the import**

In `src/App.jsx`, after `import WorldMap from './components/WorldMap'` (line 7), add:

```js
import { useIsMobile } from './hooks/useIsMobile'
```

- [ ] **Step 2: Read the hook**

Inside `function App()`, after `const highlightElRef = useRef(null)` (line 69), add:

```js
  const isMobile = useIsMobile()
```

- [ ] **Step 3: Tighten header padding**

In the `<header>` style object, replace:

```js
        padding: '0 24px',
```

with:

```js
        padding: isMobile ? '0 12px' : '0 24px',
```

- [ ] **Step 4: Hide the subtitle on mobile**

Replace the subtitle span (currently):

```jsx
        <span style={{ fontSize: '13px', color: '#9999bb', letterSpacing: '0.5px' }}>
          {START_YEAR} – {END_YEAR} · Five Centuries of History
        </span>
```

with:

```jsx
        {!isMobile && (
          <span style={{ fontSize: '13px', color: '#9999bb', letterSpacing: '0.5px' }}>
            {START_YEAR} – {END_YEAR} · Five Centuries of History
          </span>
        )}
```

- [ ] **Step 5: Skip the floating map on mobile**

Wrap the map panel so it renders only when not on a phone OR when the full-screen map view is active. Replace (currently):

```jsx
          <div
            className="map-panel"
            style={isMini ? MINI_PANEL_STYLE : FULL_PANEL_STYLE}
            {...expandProps}
          >
            <WorldMap
              mode={isMini ? 'mini' : 'full'}
              currentYear={currentYear}
              onPinClick={handlePinClick}
              selectedIds={selectedIdSet}
            />
          </div>
```

with:

```jsx
          {(!isMobile || view === 'map') && (
            <div
              className="map-panel"
              style={isMini ? MINI_PANEL_STYLE : FULL_PANEL_STYLE}
              {...expandProps}
            >
              <WorldMap
                mode={isMini ? 'mini' : 'full'}
                currentYear={currentYear}
                onPinClick={handlePinClick}
                selectedIds={selectedIdSet}
              />
            </div>
          )}
```

Note: on mobile `view === 'timeline'` → panel skipped; `view === 'map'` → `isMini` is false → `FULL_PANEL_STYLE` full-screen map renders. Desktop always renders (mini or full as before).

- [ ] **Step 6: Verify lint, tests, and build pass**

Run: `npm run lint && npm test && npm run build`
Expected: all clean/passing.

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx
git commit -m "feat: hide floating map and fit header on mobile"
```

---

### Task 4: Overlay Countries sidebar on mobile

**Files:**
- Modify: `src/components/CountrySidebar.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `isMobile` in `App.jsx` (Task 3); `CountrySidebar` gains `overlay?: boolean`.
- Produces: on mobile the sidebar is a fixed overlay (`top: 52`, right-anchored, ~82% width, max 320px) above the grid; desktop keeps the push-flex behavior.

- [ ] **Step 1: Accept and apply the `overlay` prop in CountrySidebar**

In `src/components/CountrySidebar.jsx`, change the signature (currently):

```jsx
export default function CountrySidebar({ countries, selectedIds, onChange, open }) {
```

to:

```jsx
export default function CountrySidebar({ countries, selectedIds, onChange, open, overlay = false }) {
```

- [ ] **Step 2: Branch the outer container style on `overlay`**

Replace the outer container `<div className="sidebar-panel" ...>` opening (currently):

```jsx
    <div className="sidebar-panel" style={{
      width: open ? 230 : 0,
      flexShrink: 0,
      overflow: 'hidden',
      background: '#f8f3e7',
      borderLeft: open ? '1px solid #d8c9a8' : 'none',
    }}>
```

with:

```jsx
    <div className="sidebar-panel" style={overlay ? {
      position: 'fixed',
      top: 52,
      right: 0,
      bottom: 0,
      width: open ? '82%' : 0,
      maxWidth: 320,
      zIndex: 30,
      overflow: 'hidden',
      background: '#f8f3e7',
      borderLeft: open ? '1px solid #d8c9a8' : 'none',
      boxShadow: open ? '-6px 0 20px rgba(74, 58, 34, 0.25)' : 'none',
    } : {
      width: open ? 230 : 0,
      flexShrink: 0,
      overflow: 'hidden',
      background: '#f8f3e7',
      borderLeft: open ? '1px solid #d8c9a8' : 'none',
    }}>
```

- [ ] **Step 3: Make the inner content fill the overlay width**

Replace the inner content `<div>` opening (currently):

```jsx
      <div style={{
        width: 230,
        height: '100%',
        overflowY: 'auto',
        padding: '14px 16px',
        boxSizing: 'border-box',
      }}>
```

with:

```jsx
      <div style={{
        width: overlay ? '100%' : 230,
        height: '100%',
        overflowY: 'auto',
        padding: '14px 16px',
        boxSizing: 'border-box',
      }}>
```

- [ ] **Step 4: Pass `overlay` from App**

In `src/App.jsx`, update the `<CountrySidebar .../>` usage (currently):

```jsx
        <CountrySidebar
          countries={countries}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
          open={sidebarOpen}
        />
```

to add the prop:

```jsx
        <CountrySidebar
          countries={countries}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
          open={sidebarOpen}
          overlay={isMobile}
        />
```

- [ ] **Step 5: Verify lint, tests, and build pass**

Run: `npm run lint && npm test && npm run build`
Expected: all clean/passing.

- [ ] **Step 6: Commit**

```bash
git add src/components/CountrySidebar.jsx src/App.jsx
git commit -m "feat: overlay Countries sidebar on mobile instead of pushing grid"
```

---

### Task 5: Verify, merge, deploy, and confirm on device

**Files:**
- None (verification + integration).

**Interfaces:**
- Consumes: Tasks 1–4.
- Produces: mobile changes live on `https://hyrumallen.github.io/history-in-context/`, verified.

- [ ] **Step 1: Best-effort local narrow-viewport check**

Start the dev server (`npm run dev`), open it in a browser tab, resize the window narrow, then confirm the *actual* viewport width via the browser's JS console: evaluate `window.innerWidth`.
- If `innerWidth <= 640`: screenshot and confirm ~2 columns show with a sliver of the third, the floating map is gone, and the header subtitle is hidden.
- If the OS/Chrome clamps the window so `innerWidth` stays > 640 (desktop can't always go that narrow): note it and rely on Step 5's on-device check instead. Do not spend more than two attempts fighting the window size.

- [ ] **Step 2: Confirm desktop is unchanged**

At normal desktop width, load the app: 6 columns at 180px, the floating mini-map bottom-right, the header subtitle visible, and the Countries sidebar pushing (not overlaying). Confirm nothing regressed.

- [ ] **Step 3: Merge to master (no fast-forward)**

```bash
git checkout master
git merge --no-ff feature/mobile-adaptation -m "Merge feature/mobile-adaptation: usable on phones"
git push origin master
```

- [ ] **Step 4: Watch the deploy run to green**

Run: `gh run watch --exit-status $(gh run list --workflow=deploy.yml --branch=master --limit=1 --json databaseId --jq '.[0].databaseId')`
Expected: conclusion `success` (lint + test + build + deploy all pass). On failure, `gh run view --log-failed` and fix before continuing.

- [ ] **Step 5: Confirm on a real phone (acceptance)**

Ask Allen to open `https://hyrumallen.github.io/history-in-context/` on his phone and confirm: two columns are readable, swiping sideways reveals the other countries and snaps cleanly, tapping "Map" opens the full-screen map, "Countries" slides in over the timeline, and the header isn't crowded. This on-device check is the real acceptance gate (a resized desktop window is only an approximation).

- [ ] **Step 6: Tag, push tag, delete branch**

```bash
git tag v26.11
git push origin v26.11
git branch -d feature/mobile-adaptation
```

(Confirm the exact tag with Allen — `v26.11` continues the incremental line after `v26.10`.)

- [ ] **Step 7: Update docs**

Add a "Mobile" note to `docs/BACKLOG.md` (shipped in v26.11: phone layout — swipe columns, hidden floating map, overlay sidebar) and a one-line mention in `README.md` Features. Commit to `master` and push (harmless redeploy).

---

## Self-Review Notes

- **Spec coverage:** Req 1 (mobile trigger) → Task 1; Req 2 (narrower swipeable grid) → Task 2; Req 3 (floating map hidden) → Task 3 Step 5; Req 4 (header fits) → Task 3 Steps 3–4; Req 5 (sidebar overlays) → Task 4. DoD items → Task 5 Steps 1–5. All covered.
- **Placeholder scan:** No TBD/TODO; every code step shows exact before/after content.
- **Type/name consistency:** `useIsMobile` / `isMobileWidth` names, breakpoint `640`, widths `44px`/`150px`, and the `overlay` prop are used identically across Tasks 1–4. Header `top: 52` matches the header's `height: '52px'` in App.jsx.
- **Known approximation:** local desktop verification may not reach ≤ 640px innerWidth; Task 5 Step 5 (on-device) is the true acceptance gate, consistent with the spec's rollout note.
