# Wikipedia Hover Summaries — Design

**Date:** 2026-07-06
**Branch:** `feature/wikipedia-hover-summaries` (merges as v26.4)
**Status:** Approved

## Goal

Hovering an event on the timeline shows a card with the Wikipedia lead summary
and thumbnail; a link inside the card opens the full article. Clicking an event
pins the card (replacing today's direct jump to Wikipedia).

## Decisions (approved by Allen)

1. **Click opens/pins the card** — Wikipedia opens only via the card's
   "Read on Wikipedia →" link. Tap = pin on touch devices.
2. **Live fetch on hover** from Wikipedia's REST summary API, cached per
   session, falling back to the event's stored `description` on any failure.
3. **Thumbnail included** when the article has one.

## Interaction model

- Hover an event ~400ms → card opens anchored to the event cell, clamped to the
  viewport (flips above/below by available space).
- Card opens instantly showing the stored `description`; the Wikipedia
  `extract` replaces it when the fetch resolves. Fetch failure (offline, 404
  after article rename) leaves the stored description in place — no error UI.
- Mouse leaving both cell and card closes an unpinned card; moving into the
  card keeps it open.
- Click event → pin. Pinned card closes on outside-click, Escape, or clicking
  another event (which opens that event's card).
- Card contents: event title + year, thumbnail (if any), summary paragraph,
  "Read on Wikipedia →" link (new tab, `rel="noopener noreferrer"`).

## Architecture

Three units:

### `src/wikipedia.js`
- `titleFromLink(url)` — pure; extracts the article title from an
  `https://en.wikipedia.org/wiki/<title>` URL (all 519 event links match this
  shape). Returns `null` for non-matching URLs.
- `fetchSummary(link)` — GET
  `https://en.wikipedia.org/api/rest_v1/page/summary/<title>`; returns
  `{ extract, thumbnailUrl, pageUrl }` or `null` on any failure. Results
  (including failures) cached in a module-level Map for the session. Rapid
  hover-moves must not display a stale response for the wrong event (track the
  current request; ignore out-of-date resolutions).

### `src/components/EventHoverCard.jsx`
- Single instance for the whole app, rendered above the grid.
- Subscribes to a tiny store (module-level state + subscribe, or equivalent):
  `{ event, anchorRect, pinned } | null`.
- Positions itself from `anchorRect`, clamped to viewport.
- Handles its own mouse-enter/leave (keep-open), outside-click and Escape
  (close when pinned).

### `EventCell.jsx` changes
- Remove the `<a>` wrapper and the native `title` tooltip.
- Cell becomes a button-like element (keyboard focusable; Enter pins the card).
- Hover (400ms delay) → `showCard(event, rect, pinned: false)`;
  click → `showCard(event, rect, pinned: true)`; leave → `hideCard()` (no-op if
  pinned or if the pointer moved into the card).
- **Constraint:** hover state must NOT flow through `GridRows` props — the
  memoized 501-row grid body must not re-render on hover. The store's
  callbacks are stable module functions, so cells never re-render either.
- `TYPE_COLORS` moves out of `EventCell.jsx` into `src/eventTypeColors.js`,
  fixing backlog bug B3 (fast-refresh lint warning).

## Error handling

- Non-Wikipedia or malformed link → card still works with stored description;
  link button uses the raw `event.link`.
- API failure/timeout → stored description remains; failure cached so the same
  article isn't re-fetched every hover within the session.

## Testing

- vitest: `titleFromLink` (plain, percent-encoded like `Küçük_Kaynarca`,
  parenthesized like `Battle_of_Narva_(1700)`, non-wiki URLs → null);
  `fetchSummary` with mocked `fetch` (success shape, failure → null, cache hit
  does not re-fetch).
- Browser verification: hover delay, card pinning, card link click-through,
  fallback rendering with dev-tools network offline, no `GridRows` re-render on
  hover (React DevTools or console instrumentation).
