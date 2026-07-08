# Europe Remainder Data Batch — Design

**Date:** 2026-07-08
**Branch:** `feature/europe-remainder-batch` (merges as v26.6)
**Status:** Approved
**Closes:** backlog item F1 (and the Europe portion of B2 — map gaps after 1700)

## Goal

Populate Portugal, the Dutch Republic (→ Netherlands), Sweden, and
Poland-Lithuania (→ Poland) from 1700 through 2000: eras, rulers, events, and
inclusion in the ten 1730–2000 territory snapshots. Data-only batch following
the v26.3 pattern — no `src/` code changes expected; the existing
data-validation suite guards everything.

## Decisions (approved by Allen)

1. **Poland's partition gap (1795–1918): era + events, no rulers.** An era
   named "Partitioned Poland" keeps the column labeled and events continue
   (uprisings, Chopin, Curie) but the ribbon stays bare — no sovereign, no
   ruler entries. Extends the Occupied Germany precedent.
2. Everything else follows v26.3 rules: heads of state fill republican eras;
   sub-year caretakers omitted; ~1 event per decade minimum with full schema
   (lat/lng, Wikipedia link, 1–2 sentence description); snapshots show
   metropolitan territory only.

## Eras (`countries.json`)

- **portugal**: Kingdom of Portugal 1500–1580 · Iberian Union 1580–1640 ·
  Kingdom of Portugal 1640–1910 · Portuguese Republic 1910–2000.
  (Estado Novo stays within the Republic era; the ruler ribbon tells that
  story.)
- **dutch-republic**: Habsburg Netherlands 1500–1581 · Dutch Republic
  1581–1795 · Batavian Republic 1795–1806 · Kingdom of Holland 1806–1813 ·
  Kingdom of the Netherlands 1815–2000. (1813–1815 gap: header shows the most
  recent begun era, per the existing gap rule.)
- **sweden**: Kalmar Union 1500–1523 · Kingdom of Sweden 1523–2000.
- **poland-lithuania**: Kingdom of Poland 1500–1569 · Polish-Lithuanian
  Commonwealth 1569–1795 · Partitioned Poland 1795–1918 · Second Republic
  1918–1939 · Occupied Poland 1939–1945 · People's Republic 1945–1989 ·
  Republic of Poland 1989–2000.

Eras start at 1500 (validation requires it), which retroactively improves
pre-1700 headers ("Kalmar Union", "Iberian Union").

## Rulers (`rulers.json`, ids from m279)

- **portugal**: kings John V → Manuel II (deposed 1910), then the Republic:
  key presidents, with Salazar titled "Prime Minister" (de facto head of
  state during the Estado Novo), then post-1974 presidents to Jorge Sampaio.
- **dutch-republic**: stadtholders William IV/V to 1795; no rulers during the
  Batavian Republic 1795–1806 (bare ribbon); Louis Bonaparte (King) 1806–1810;
  no rulers 1810–1815 (annexed by France — bare ribbon); then the House of
  Orange-Nassau: William I 1815 → Beatrix (to 2000).
- **sweden**: Charles XII's successors through the Age of Liberty and the
  Bernadottes to Carl XVI Gustaf (1973–2000).
- **poland-lithuania**: elective kings to Stanisław II Augustus (abdicated
  1795); NO entries 1795–1918; then Piłsudski (Chief of State), interwar
  presidents, no rulers 1939–1944 (Occupied Poland, bare ribbon), then
  Bierut → Jaruzelski (First Secretaries / General Secretaries), Wałęsa and
  Kwaśniewski (Presidents).

## Events (`events.json`, ids from e520)

~25–30 per country, 1700–2000, ≥1 per decade, existing schema and tone.
Required anchors:

- **portugal**: 1703 Methuen Treaty · 1755 Lisbon earthquake · 1807 court
  flees to Brazil · 1822 Brazil independent · 1910 Republic proclaimed ·
  1932 Salazar takes power · 1974 Carnation Revolution · 1986 joins the EC ·
  1998 Lisbon Expo.
- **dutch-republic**: 1713 Treaty of Utrecht · 1747 Orangist revolution ·
  1795 Batavian Revolution · 1815 Kingdom of the Netherlands · 1830 Belgium
  secedes · 1890 Van Gogh dies · 1940 German invasion · 1944–45 Hunger
  Winter · 1953 North Sea flood · 1957 Treaty of Rome founding member ·
  1980 Beatrix crowned.
- **sweden**: 1709 Poltava · 1718 death of Charles XII · 1809 Finland lost
  to Russia · 1814 union with Norway · 1901 first Nobel Prizes · 1905 Norway
  leaves peacefully · 1940s WWII neutrality · 1974 ABBA win Eurovision ·
  1986 Palme assassinated · 1995 joins the EU.
- **poland-lithuania**: 1772/1793/1795 partitions · 1791 May 3rd
  Constitution · 1830 November Uprising · 1849 Chopin dies · 1863 January
  Uprising · 1867 Maria Skłodowska (Curie) born · 1918 independence ·
  1920 Battle of Warsaw · 1939 invasion · 1944 Warsaw Uprising · 1978 Karol
  Wojtyła becomes John Paul II · 1980 Solidarity founded · 1989 first free
  elections.

## Territory snapshots (`territories.json`)

Add the four countries to the ten 1730–2000 snapshots, coarse polygons in the
existing style:

- **portugal**: Iberian west strip, all ten snapshots (borders essentially
  stable).
- **dutch-republic**: Low Countries blob including Belgium through 1820;
  from 1850 on, the northern Netherlands only.
- **sweden**: Sweden + Finland through 1790; from 1820 on, Sweden only
  (Finland ceded 1809). Union with Norway NOT drawn (personal union;
  metropolitan-territory rule).
- **poland-lithuania**: large Commonwealth polygon in 1730/1760/1790; ABSENT
  from 1820 through 1940 (partitioned 1795–1918; occupied by mid-1940, so the
  1940 snapshot also omits it, matching the Occupied Poland era — the Second
  Republic falls between snapshot years). Present again in 1970 and 2000 with
  post-war (Oder-Neisse) borders.

## Verification

- `npm test` — data-validation suite (ids, reign overlaps, era ordering,
  coord bounds) plus all existing suites.
- Browser: select the four countries; check headers/ribbons/events at 1750,
  1850 (Poland: era label "Partitioned Poland", bare ribbon, events present),
  and 1950; map at 1760 (Commonwealth visible), 1880 (Poland absent,
  Netherlands without Belgium, Sweden without Finland), 2000 (all four
  modern).
