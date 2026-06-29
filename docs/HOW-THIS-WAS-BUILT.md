# How We Built "History in Context" — A Learning Guide

This document explains everything that was built, every decision that was made, and the reason behind each choice — written so that anyone can understand it, even if they have never written a single line of code before.

---

## Table of Contents

1. The Big Idea
2. The Tools We Chose (and Why)
3. Step 1 — Setting Up the Workshop
4. Step 2 — Building the Grid Shell
5. Step 3 — Storing Information with JSON Files
6. Step 4 — Coloring the Reign Bands
7. Step 5 — All 147 Historical Events
8. Step 6 — The Polish Pass
9. Saving Everything to GitHub
10. What Comes Next

---

## 1. The Big Idea

The goal was to build a website that shows world history as a **side-by-side chart**.

Most history books tell stories one country at a time. You read about England for a chapter, then France for a chapter. But the people in those countries were alive *at the same time*. While Henry VIII was breaking from the Pope in England, Suleiman the Magnificent was besieging Vienna. While Shakespeare was writing plays in London, Cervantes was writing Don Quixote in Spain. Those things happened in the same decade!

The idea was to make that visible. Put all the countries next to each other, with years running down the left side, so you can look across a single row and see: "In the year 1519, Cortés was invading Mexico, Magellan started sailing around the world, Leonardo da Vinci died in France, and Charles V became Holy Roman Emperor." All of that in one glance.

We focused on the years **1500 to 1700** — a period historians call the Early Modern era. It is when the modern world was being born: religious reformations, global exploration, the Scientific Revolution, the rise of powerful nation-states.

We chose **six countries** as columns:
- England
- France
- Spain
- Holy Roman Empire
- Russia
- Ottoman Empire

**Why these six?** They were the major powers whose decisions shaped that 200-year period. They fought each other, traded with each other, copied each other's ideas, and competed for dominance. Putting them side by side makes those relationships visible.

---

## 2. The Tools We Chose (and Why)

Before we could build anything, we had to pick our tools. Think of this like choosing what kind of art supplies to use before you start a painting.

### What is a Website Made Of?

Every website you visit is made of three ingredients:

1. **HTML** — This is the *skeleton*. It describes what things are on the page: "here is a heading," "here is a paragraph," "here is a list." It tells the browser *what* to put on the screen, not how it looks.

2. **CSS** — This is the *clothing*. It describes how things look: colors, sizes, spacing, fonts. Without CSS, every website would look like a plain black-and-white document.

3. **JavaScript** — This is the *brain*. It makes things work and react. Clicking a button, loading new information, changing what you see — all of that is JavaScript.

### Why React?

Writing a website by typing raw HTML, CSS, and JavaScript is like building a house by making each individual brick yourself. It works, but it is slow and you have to repeat a lot of work.

**React** is a tool that lets you build a website out of reusable pieces called **components**. Think of components like LEGO bricks. You build one brick once, and then you can use it as many times as you want, anywhere you want.

For our grid, this was perfect. We needed to draw 201 rows (one per year from 1500 to 1700). We also needed to draw 6 country columns, and each cell in the grid needed to look the same. Instead of writing the same code 1,200 times (201 rows × 6 columns), we wrote one `EventCell` component once — and React placed it everywhere it was needed automatically.

React was created by Facebook and is one of the most popular tools for building websites in the world today. It is free and widely used.

### Why Vite?

**Vite** (pronounced "veet") is a helper tool that sits alongside React. Its job is to be a fast builder and a development server.

Here is the problem it solves: when you write JavaScript for a website, browsers do not always understand the exact way you wrote it. Vite takes your code and converts it into something every browser can read. It also runs a little web server on your computer so you can see your website while you build it — every time you save a file, the website refreshes instantly.

**Why Vite and not something else?** Vite is very fast and very simple to set up. For a project like this — no database, no login system, just a visual display of data — it was the perfect fit.

### Why JSON for Data?

We needed a place to store our 147 historical events, 59 monarchs, and 6 countries. We could have put this information directly inside the code, but that would have made the code very messy and very hard to update.

Instead, we used **JSON files**. JSON stands for "JavaScript Object Notation" but you do not need to remember that. Think of a JSON file like a very organized list — almost like a spreadsheet saved as a text file.

Here is what a single event looks like in JSON:

```json
{
  "id": "e001",
  "year": 1509,
  "countryId": "england",
  "type": "monarch",
  "title": "Henry VIII becomes king",
  "description": "Henry VIII ascended the throne at 17...",
  "link": "https://en.wikipedia.org/wiki/Henry_VIII"
}
```

Each piece of information has a **label** (like `year` or `title`) and a **value** (like `1509` or `"Henry VIII becomes king"`). The code can read this file and use every piece of information automatically.

**Why separate files for data?** Keeping the data separate from the code is a very important practice in programming. It means:
- You can update your list of events without touching the code
- The code stays clean and readable
- If you ever wanted to add more events later, you just edit the JSON file

We ended up with three data files:
- `countries.json` — the 6 countries and their colors
- `monarchs.json` — 59 monarchs with their start and end years
- `events.json` — 147 historical events

### Why No Backend?

Some websites have two parts: a **frontend** (what you see in the browser) and a **backend** (a server running somewhere that stores and sends data). Our app has only a frontend. All the data lives in JSON files that are loaded directly by the browser.

**Why?** Because we did not need a backend. Our data does not change. Nobody logs in. Nobody submits forms. We just want to show history. A frontend-only app is simpler, faster, cheaper to host, and easier to build. When you do not need something, do not build it.

---

## 3. Step 1 — Setting Up the Workshop

Before writing a single line of our own code, we had to set up all the tools.

### Installing Node.js

React and Vite run on something called **Node.js**. Think of Node.js as the engine that powers all these JavaScript tools. It is free software that lets your computer run JavaScript outside of a browser.

We installed Node.js first. Without it, nothing else would work.

### Scaffolding the Project with Vite

Once Node.js was installed, we ran one command in the terminal (the terminal is a text-based window where you type commands to your computer):

```
npm create vite@latest history-in-context -- --template react
```

Let us break this down:
- `npm` — this is the "Node Package Manager," a tool that installs software
- `create vite@latest` — tells npm to use Vite to create a new project
- `history-in-context` — the name of our project folder
- `--template react` — tells Vite to set it up for React

This one command created a whole folder of files that gave us a starting point. It is like buying a house that already has walls and a roof — you just need to decorate it.

### What Vite Gave Us

After running that command, we had a folder with:
- `index.html` — the one HTML file (the front door of the website)
- `src/` — a folder for all our code
- `src/main.jsx` — the file that starts everything up
- `src/App.jsx` — the main component
- `package.json` — a list of all the tools our project needs

### Installing Dependencies

We ran `npm install` to download all the tools our project needs. This filled a folder called `node_modules` with thousands of small files that make React and Vite work. We never touch those files ourselves — they are handled automatically.

We also made sure `node_modules` was listed in a file called `.gitignore`. This tells GitHub "do not save this folder" — because it is enormous and can be re-downloaded by anyone who wants to run the project. You only need to store it on GitHub if it is something you wrote yourself.

---

## 4. Step 2 — Building the Grid Shell

The very first visual goal was to get a grid on the screen — even if it was empty. Headers across the top, years down the left side, and cells in the middle. No events yet, no colors, just the structure.

### How the Grid Works

We used a CSS feature called **CSS Grid**. Think of CSS Grid like a spreadsheet: you tell the browser how many columns to make and how wide they should be, and it arranges everything in rows and columns automatically.

Here is the key line that sets up the grid:

```jsx
gridTemplateColumns: `60px repeat(6, 180px)`
```

This says: "Make one narrow column (60 pixels wide) for the year labels, then repeat 6 times a column that is 180 pixels wide for the countries."

The result is a table-like layout with 7 columns total.

### Sticky Headers

One of the first decisions was: what happens when you scroll down? The year labels on the left and the country names on top should stay visible, otherwise you get lost.

We solved this with **sticky positioning**. When you mark something as "sticky," it stays locked in place on the screen while everything else scrolls past it.

We made:
- The country header row **sticky to the top** — it stays at the top of the screen as you scroll down through years
- The year labels **sticky to the left** — they stay on the left side as you scroll right (if the grid is wider than your screen)

This is a very common trick in websites that show tables of information. Spreadsheet apps like Excel and Google Sheets do the same thing.

### The Year Labels

We created an array (a list) of all years from 1500 to 1700:

```jsx
const YEARS = Array.from({ length: 201 }, (_, i) => 1500 + i)
```

This is a fancy way of saying "give me a list: [1500, 1501, 1502, ..., 1700]."

Then we looped through this list and drew one row for each year.

**Decision: not every year gets a label.** If we printed every year number (1500, 1501, 1502...) it would be a wall of numbers, hard to read. So we made a rule:
- Every 10th year (1500, 1510, 1520...) gets its year number printed in a dark, bold font
- Every 5th year (1505, 1515, 1525...) gets a small dot `·` instead
- All other years get nothing at all

This makes the year axis readable at a glance without being overwhelming.

### The Components We Built

We broke the grid into several reusable LEGO bricks:

| Component | What It Does |
|-----------|-------------|
| `App.jsx` | The outer shell — holds the header and the grid |
| `TimelineGrid.jsx` | The main grid — draws all rows and columns |
| `CountryHeader.jsx` | One country name at the top of a column |
| `EventCell.jsx` | One historical event inside a cell |
| `Legend.jsx` | The color key in the top-right corner |

**Why split into separate components?** Each component has one clear job. If something goes wrong with how country headers look, you know to look in `CountryHeader.jsx`. If events look wrong, you look in `EventCell.jsx`. It is much easier to find and fix problems when each file has a single responsibility.

---

## 5. Step 3 — Storing Information with JSON Files

Once the grid shell existed, we needed to fill it with real information.

### countries.json

This was the simplest file. Six countries, each with:
- An `id` (like `"england"`) — used to connect events to the right column
- A `name` (like `"England"`) — displayed on screen
- A `color` (like `"#c8d8e8"`) — the background color for that country's column

Here is the full file:

```json
[
  { "id": "england",           "name": "England",            "color": "#c8d8e8" },
  { "id": "france",            "name": "France",             "color": "#c8e8d0" },
  { "id": "spain",             "name": "Spain",              "color": "#e8d8c8" },
  { "id": "holy-roman-empire", "name": "Holy Roman Empire",  "color": "#e8e8c8" },
  { "id": "russia",            "name": "Russia",             "color": "#e8c8c8" },
  { "id": "ottoman-empire",    "name": "Ottoman Empire",     "color": "#e0c8e8" }
]
```

**How the colors were chosen:** Each color is a soft, muted pastel. The colors are light enough that dark text is easy to read on top of them. England is a muted blue, France a muted green, Spain a muted orange, the Holy Roman Empire a muted yellow, Russia a muted red, and the Ottoman Empire a muted purple. The colors are different enough to tell apart at a glance but gentle enough not to hurt your eyes when you stare at the whole grid.

The `#c8d8e8` format is called **hex color code** — it is a way of describing a color by specifying how much red, green, and blue it contains, using letters and numbers. Every color on a computer screen can be described this way.

### monarchs.json

This file lists 59 monarchs (kings, queens, tsars, sultans, and emperors) across all six countries. Each one has:
- `countryId` — which country they ruled
- `name` — their name
- `startYear` — the year they took power
- `endYear` — the year they left (by dying, abdicating, or being removed)

```json
{ "id": "m002", "countryId": "england", "name": "Henry VIII", "startYear": 1509, "endYear": 1547 }
```

**Why store monarchs separately?** Because they are used in a special way — to draw colored bands on the grid. (More on that in the next section.)

**An important detail:** Some monarchs started before 1500 or ended after 1700. We kept their full reign dates anyway. The code is smart enough to only color the rows that actually appear in our 1500–1700 window.

### events.json

The biggest file — 147 historical events. Each event has:
- `id` — a unique label (e001, e002, etc.)
- `year` — when it happened
- `countryId` — which country's column it belongs in
- `type` — what kind of event (more on this below)
- `title` — the short name shown on screen
- `description` — one or two sentences of context (added in the polish pass)
- `link` — a Wikipedia URL (optional)

**Why only 147?** We focused on events that were genuinely important at the level of whole nations — major battles, ruler changes, landmark publications, critical moments of exploration. We did not try to list every single thing that happened. Too many events would make the grid impossible to read. 147 is a manageable number that still paints a rich picture.

**The event types** are used to color-code the dots next to each event:

| Type | Color | What It Covers |
|------|-------|---------------|
| `monarch` | Gold | A ruler taking or leaving power |
| `war` | Red | A battle, siege, invasion, or conflict |
| `birth` | Blue | A significant person being born |
| `death` | Gray | A significant person dying |
| `other` | Light gray | Religion, science, exploration, art, treaties |

**Why color-code by type?** So you can look at a column and immediately see patterns. A solid stretch of gold events means a lot of leadership changes. A cluster of red means conflict. At a glance, you can see that the Ottoman column in the early 1600s has many gold events — that was the period of unstable, rapidly-changing sultans.

---

## 6. Step 4 — Coloring the Reign Bands

This was one of the most interesting technical challenges. We wanted each monarch's reign to show as a colored band — so you can see at a glance that Elizabeth I ruled England from 1558 to 1603.

### The Problem

We have 201 rows (one per year) and 6 columns. For each cell in the grid, we needed to answer: "Who was the monarch in this country in this year, and what color should this cell be?"

### The Solution

For every cell, we run a function called `getMonarchBg` (short for "get monarch background color"). It takes a year and a country, looks through the monarchs list, and finds the monarch who was ruling that year.

Then it does something clever: it colors alternating reigns darker and lighter. Even reigns (the 1st, 3rd, 5th monarch in the list) get a lighter tint, and odd reigns (2nd, 4th, 6th) get a darker tint. This creates a "striped" effect — you can see exactly where one reign ends and another begins, even if the events don't tell you directly.

Here is the code that calculates the color:

```jsx
return hexToRgba(country.color, i % 2 === 0 ? 0.3 : 0.65)
```

`hexToRgba` converts the country's color into a format that includes **transparency** (how see-through it is). `0.3` means very faint (30% color, 70% white). `0.65` means stronger (65% color). The `%` symbol here is the **modulo operator** — it gives you the remainder after division. `i % 2 === 0` means "is i an even number?" — so every even-numbered monarch gets the light shade, every odd-numbered monarch gets the dark shade.

### The Tricky Edge Case

What happens when a monarch dies and the next one takes over in the same year? For example, in England in 1547, Henry VIII died and Edward VI became king — both technically "reigned" in 1547.

We needed a rule: whose color does 1547 get? We decided the *incoming* monarch wins. If you died and someone took over, that year belongs to your successor. The code handles this by scanning the monarch list from the *end backwards* — the last matching reign (which is the most recent one) wins.

---

## 7. Step 5 — All 147 Historical Events

After the grid structure worked and the reign bands were showing, we filled in the events. This was more history research than programming.

### How Events Are Placed

The code builds a lookup table — a fast way to find information. It reads all 147 events and organizes them by a "key" that combines year and country:

```
"1572-france" → [St. Bartholomew's Day Massacre]
"1588-england" → [Spanish Armada defeated]
"1616-england" → [Shakespeare dies]
"1616-spain"   → [Cervantes dies]
```

Then when drawing any cell in the grid, the code just asks: "Is there anything in this lookup table for the year 1616 and England?" If yes, it draws the event. If no, the cell is empty.

This approach — building a lookup table first — is much faster than searching through all 147 events every single time a cell is drawn. With 1,206 cells in the grid, searching 147 events each time would mean over 176,000 comparisons just to draw the page. With the lookup table, each cell does one instant lookup.

### Wikipedia Links

Many events include a Wikipedia link. When an event has a link, its entire row becomes a clickable link that opens Wikipedia in a new tab. When it does not have a link, it is just plain text.

```jsx
if (event.link) {
  return <a href={event.link} target="_blank" rel="noopener noreferrer">...</a>
}
return <div>...</div>
```

`target="_blank"` means "open in a new tab." `rel="noopener noreferrer"` is a security practice — it prevents the Wikipedia page from being able to access our page in the background. Even when you open links on simple websites, it is good habit to include this.

### The Hover Tooltip on Cells

Each cell of the grid shows the monarch who was ruling that year. When you hover over a cell (place your mouse over it without clicking), a small box pops up that says something like "Elizabeth I (1558–1603)". This uses the `title` attribute — a built-in browser feature that shows a tooltip on any HTML element when you hover over it.

```jsx
title={monarch ? `${monarch.name} (${monarch.startYear}–${monarch.endYear})` : ''}
```

---

## 8. Step 6 — The Polish Pass

After the grid was complete and working, we did a "polish pass" — a round of improvements to make the app look and feel more finished. This is a common step in software development. You build the thing first, then you go back and make it nice.

### Change 1: Loading the Inter Font

The app was already set up to use a font called **Inter** — a clean, modern typeface made by designer Rasmus Andersson and specifically designed to be easy to read on screens. The problem was, we had told the CSS to *use* Inter, but we had never actually *loaded* it. So the browser was falling back to whatever font came with the operating system.

We fixed this by adding three lines to `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
```

**What these lines do:**
- The first two `preconnect` lines tell the browser: "Hey, we are about to need files from fonts.googleapis.com and fonts.gstatic.com — start connecting to those servers now, before we even ask for the font." This makes the font load faster.
- The third line actually requests the Inter font at weights 400 (regular), 600 (semi-bold), and 700 (bold).
- `display=swap` means: "While the font is loading, show the text in whatever font you have. Then swap to Inter when it arrives." This prevents text from being invisible while the font loads.

**Why Google Fonts?** Google hosts fonts for free and very fast. You do not need to store font files in your project — just link to Google's servers. The font is also likely already cached in the visitor's browser from another site that uses Google Fonts, making it load even faster.

### Change 2: Removing Dead CSS

When Vite creates a new project, it includes some example CSS in a file called `App.css` — things like `.hero`, `#center`, `#next-steps`. These are styles for the example "Hello World" page that Vite shows you when you first create a project.

We deleted all of this. It was never used by our actual app, and having unused code sitting around is bad practice — it confuses anyone reading the code later, and it means the browser downloads styles that do nothing.

We also checked `main.jsx` to remove the import statement for `App.css`. An import statement is how JavaScript says "load this file." Importing a file you never use is like packing extra luggage you will never open.

(As it turned out, the import had already been removed earlier, so this was a no-op — a step that turned out to need no action. That happens in programming sometimes. You plan to do something, go to do it, and find it is already done.)

### Change 3: Event Descriptions and Tooltips

Every event in our `events.json` file now has a `description` field — one or two sentences of historical context. Here are a few examples:

- **Luther's 95 Theses (1517):** "Martin Luther's list of objections to Church abuses — particularly the sale of indulgences — sparked the Protestant Reformation and split Western Christianity permanently."
- **Battle of Lepanto (1571):** "A Holy League fleet decisively defeated the Ottoman navy off the coast of Greece — the first major Ottoman military defeat and a psychological shock to the Islamic world."
- **Great Fire of London (1666):** "A bakery fire in Pudding Lane spread to destroy 13,200 houses, 87 churches, and most of the medieval City of London over four days."

All 147 events were given descriptions. This was the largest single task — writing over 10,000 words of historical summaries, one event at a time.

We then wired these descriptions up as **tooltips**. When you hover your mouse over an event, the description pops up in a small box. We used the simplest possible approach: the HTML `title` attribute. We just added `title={event.description}` to each event element, and the browser handles showing the tooltip automatically — no extra code needed.

**Why the simple approach?** It was tempting to build a fancy custom popup with styling and animation. But the native browser tooltip works everywhere, requires zero extra code, and does the job perfectly. The goal was to show information on hover — the native tooltip does exactly that. We did not need more.

### Change 4: The ↗ Link Indicator

Before this change, events that had Wikipedia links looked exactly the same as events without links. There was no way to know at a glance that clicking an event would take you somewhere.

We added a small `↗` character (the "north-east arrow") after the title of any event that has a Wikipedia link. It looks like this:

> · 1572 St. Bartholomew's Day Massacre **↗**

The arrow is small and gray so it does not distract from the text — but it signals clearly that this event is a link. It is a convention used on many websites to indicate "this will open something external."

The code for it is just six lines:

```jsx
{event.link && (
  <span style={{ color: '#aaa', fontSize: '10px', marginLeft: '3px' }}>↗</span>
)}
```

`event.link &&` means "only do this if event.link exists." In JavaScript, `&&` in this context is a shorthand for "if this is true, then show this." If there is no link, the arrow simply does not appear.

---

## 9. Saving Everything to GitHub

### What Is Git?

Imagine you are writing a book. Every day, you save a copy of the book. But what if you could save a copy, write more, and then *go back to any previous version* whenever you wanted? And what if you could see every change you ever made, with a note explaining what you did and why?

That is what **Git** does for code. It is a "version control system." Every time you reach a good stopping point, you do a **commit** — which is like a save point in a video game. Each commit has a message describing what changed.

Our project has commits like:
- `feat: load Inter from Google Fonts`
- `chore: remove unused Vite boilerplate CSS`
- `feat: add event descriptions, native tooltips, and link indicator`

### What Is GitHub?

**GitHub** is a website that stores your Git history in the cloud. Think of Git as the journal you keep in your desk drawer, and GitHub as a copy of that journal stored safely in a bank vault — accessible from anywhere, backed up, and shareable with others.

GitHub also lets anyone look at your project if you make it public. Our project is at:

**https://github.com/hyrumallen/history-in-context**

### Why Use Git and GitHub?

1. **Safety** — If your computer breaks, your code is safe on GitHub
2. **History** — You can always go back to how things were before a change
3. **Collaboration** — Other people could contribute to the project
4. **Portfolio** — It shows others what you have built

For a personal project like this, GitHub is like having a permanent, organized record of all your work.

---

## 10. What Comes Next

Phase 1 of the project — the timeline grid — is complete. The next major feature idea is **Phase 2: a world map with shifting borders.**

The idea: imagine a map of Europe in 1500. Now slide a year slider and watch the borders change as the years advance. The Ottoman Empire expands into Hungary. The Spanish Empire grows. Russia pushes east. Seeing how borders changed over two centuries, synchronized with the events in the timeline, would make the history even more vivid.

This is a bigger technical challenge. Drawing borders on a map requires a different kind of data (called geographic data) and a mapping library. But the foundation is already there: the data, the architecture, and the skills to build it.

---

## Summary of Every File in the Project

Here is a quick guide to every important file and what it does:

| File | What It Does |
|------|-------------|
| `index.html` | The front door — loads the fonts and starts the app |
| `src/main.jsx` | Starts React and attaches it to the HTML page |
| `src/App.jsx` | The outer wrapper — header bar and the grid |
| `src/index.css` | Global styles: font family, body margins |
| `src/App.css` | Now empty — held Vite boilerplate we deleted |
| `src/components/TimelineGrid.jsx` | The main grid: all rows, columns, and cells |
| `src/components/CountryHeader.jsx` | One country name at the top of a column |
| `src/components/EventCell.jsx` | One historical event: dot, year, title, ↗ glyph |
| `src/components/Legend.jsx` | The color key in the top-right corner |
| `src/data/countries.json` | The 6 countries and their colors |
| `src/data/monarchs.json` | 59 monarchs with their reign years |
| `src/data/events.json` | 147 historical events with descriptions and links |
| `docs/HOW-THIS-WAS-BUILT.md` | This document |
| `docs/superpowers/specs/` | Design decisions written before building |
| `docs/superpowers/plans/` | Step-by-step implementation plans |
| `.gitignore` | Tells GitHub which files NOT to save |
| `package.json` | Lists all the tools the project needs |
| `vite.config.js` | Configuration for the Vite build tool |

---

## Key Vocabulary

| Word | Simple Definition |
|------|------------------|
| **HTML** | The skeleton of a webpage — describes what is there |
| **CSS** | The clothing — describes how things look |
| **JavaScript** | The brain — makes things work and respond |
| **React** | A tool for building websites out of reusable pieces |
| **Component** | One reusable piece of a React website (like a LEGO brick) |
| **Vite** | A fast helper that builds and previews your website |
| **JSON** | A way to store organized information in a text file |
| **Git** | A system that saves your code history, like save points in a game |
| **GitHub** | A website that stores your Git history in the cloud |
| **Commit** | A saved snapshot of your code at a specific moment |
| **npm** | A tool that installs other tools and libraries |
| **Node.js** | The engine that lets JavaScript run on your computer |
| **Hex color** | A way to describe any color using letters and numbers (e.g. `#c8d8e8`) |
| **Sticky** | A CSS trick that keeps an element visible while you scroll |
| **Tooltip** | A small popup that appears when you hover your mouse over something |
| **Import** | How JavaScript loads a file or a tool it needs |
| **Array** | A list of things in programming (e.g. `[1500, 1501, 1502, ...]`) |
| **Function** | A reusable set of instructions that does one specific job |
| **Component** | A reusable building block in React |
| **Lookup table** | A fast way to find information by a key, like a dictionary |
| **No-op** | A step that turns out to need no action because things are already correct |
