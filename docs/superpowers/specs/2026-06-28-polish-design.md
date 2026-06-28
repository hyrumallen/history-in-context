# Polish Pass Design — History in Context

**Date:** 2026-06-28

## Overview

A focused polish pass on the timeline grid app. Four discrete, low-risk changes that improve typography, code hygiene, event discoverability, and tooltip UX.

## Changes

### 1. Load Inter from Google Fonts

Add `<link>` preconnect and stylesheet tags to `index.html`. The existing `font-family: 'Inter'` in `index.css` already references the name — this just ensures it loads properly instead of falling back to system-ui.

**Files:** `index.html`

### 2. Remove App.css boilerplate

Delete the entire contents of `App.css` (Vite scaffold: `.hero`, `#center`, `#next-steps`, `.ticks`, etc.). None of it is referenced by the app. The import in `main.jsx` can be removed too.

**Files:** `src/App.css`, `src/main.jsx`

### 3. Event descriptions + native tooltip

Add a `"description"` string field to every entry in `events.json` (147 events total). Descriptions are concise 1–2 sentences of historical context, generated as part of this task.

In `EventCell.jsx`, set `title={event.description}` on the outermost element (the `<a>` if the event has a link, the `<div>` if not). This surfaces as a native browser tooltip on hover — no new dependencies.

**Files:** `src/data/events.json`, `src/components/EventCell.jsx`

### 4. Link indicator on linked events

In `EventCell.jsx`, when `event.link` exists, render a small `↗` character after the title text. Style: `color: #aaa`, `font-size: 10px`. Makes it visually clear that a row is clickable without changing the click target (the whole row is already a link).

**Files:** `src/components/EventCell.jsx`

## Out of Scope

- Custom hover cards (deferred — native tooltip is sufficient)
- Serif accent font for year labels (deferred)
- Additional events or data changes beyond descriptions
- Row height / column width changes
