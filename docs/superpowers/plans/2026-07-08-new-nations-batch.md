# New Nations Batch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add USA, Brazil, Austria, and Italy as full 1500–2000 columns (roster: 18 → 22), closing backlog item F4 with no code changes.

**Architecture:** Data-only batch on the v26.6–v26.8 pattern, one task larger: countries+eras → rulers → events ×3 (1500–1700, 1700–1850, 1850–2000) → territory splice → verification.

**Tech Stack:** JSON data files, vitest validation suite, node splice script.

**Spec:** `docs/superpowers/specs/2026-07-08-new-nations-batch-design.md` — the spec carries the complete ruler chains and new-country JSON verbatim; Tasks 1–2 copy from it exactly.

## Global Constraints

- Branch `feature/new-nations-batch`; commit per task; `npm test` passes at every commit.
- New countryIds: `usa`, `brazil`, `austria`, `italy`. New ruler ids from `m448`; new event ids from `e968`.
- Event schema as prior batches; ≥1 event per decade 1500–2000 for all four countries.
- Bare-ribbon spans: usa 1500–1788; brazil 1500–1821; austria 1918–1932 and 1938–1945; italy 1500–1860.
- Colors, verbatim from spec: usa `#ccd6e8/#7c8fb5/#5d6f94`, brazil `#d2e4c8/#86ab7d/#65875e`, austria `#ecd2cc/#bd8578/#96655a`, italy `#cce4e0/#78aba1/#5a877e`.

---

### Task 1: Country entries + eras

**Files:**
- Modify: `src/data/countries.json` (append four entries after `inca`, exactly as the spec's "New country entries" and "Eras" sections specify — id/name/continent/colors plus the eras array for each)

- [ ] **Step 1:** Append the four entries with eras: usa (Colonial North America 1500–1776 · United States 1776–2000), brazil (Portuguese Brazil 1500–1822 · Empire of Brazil 1822–1889 · Republic of Brazil 1889–2000), austria (Habsburg Monarchy 1500–1804 · Austrian Empire 1804–1867 · Austria-Hungary 1867–1918 · First Republic 1918–1938 · Annexed Austria 1938–1945 · Second Republic 1945–2000), italy (Italian States 1500–1861 · Kingdom of Italy 1861–1946 · Italian Republic 1946–2000).
- [ ] **Step 2: Verify** — `npm test`; dev server sidebar shows 22 countries (Americas group has 4, Europe 11); selecting `usa` shows header "Colonial North America" at 1600.
- [ ] **Step 3: Commit** — `git commit -m "feat: add USA, Brazil, Austria, Italy country entries and eras"`

---

### Task 2: Rulers (m448+)

**Files:**
- Modify: `src/data/rulers.json` (append the spec's four ruler chains verbatim — usa Washington→Clinton, brazil Pedro I→Cardoso, austria Maximilian I→Klima, italy Victor Emmanuel II→Ciampi — ids sequential from m448)

- [ ] **Step 1:** Append all four chains with exact names/titles/years from the spec's Rulers section.
- [ ] **Step 2: Verify** — `npm test` (overlap check). Dev server: Mussolini's DUCE ribbon 1922–1943 with the king trimmed around it; Austria's ribbon continuous 1500–1918 then bare to 1932.
- [ ] **Step 3: Commit** — `git commit -m "feat: rulers for USA, Brazil, Austria, Italy"`

---

### Task 3: Events 1500–1700 (e968+)

Anchors (fill all decades 1500–1699 for each):

- **usa**: 1513 Ponce de León claims Florida · 1540 Coronado's expedition · 1565 St. Augustine founded · 1585 Roanoke's lost colony · 1607 Jamestown · 1620 Mayflower Compact · 1626 Manhattan purchased · 1636 Harvard founded · 1675 King Philip's War · 1682 Philadelphia founded · 1692 Salem witch trials — plus fillers (1520s Verrazzano 1524, 1550s, 1590s, 1610s Hudson 1609→1600s, 1640s, 1650s, 1660s New York taken 1664)
- **brazil**: 1500 Cabral's landfall · 1532 São Vicente, first settlement · 1549 Salvador founded as capital · 1554 São Paulo founded · 1565 Rio founded · 1580s sugar boom · 1624 Dutch take Salvador · 1630 Dutch Brazil in Pernambuco · 1654 Dutch expelled · 1695 gold found in Minas Gerais — plus fillers (1510s, 1520s, 1540s Jesuits 1549 covered, 1590s bandeirantes, 1600s, 1610s French expelled from Maranhão 1615, 1640s, 1660s, 1670s Palmares quilombo, 1680s)
- **austria**: 1519 Charles V's double inheritance · 1529 first siege of Vienna · 1556 Ferdinand takes the Austrian half · 1571 Maximilian II's quiet tolerance · 1583 Rudolf II moves court to Prague · 1618 the Bohemian revolt · 1620 White Mountain · 1648 Westphalia · 1657 Leopold I's long reign begins · 1683 second siege of Vienna · 1697 Zenta — plus fillers (1500s, 1540s, 1590s Long Turkish War 1593, 1630s Wallenstein murdered 1634, 1660s, 1670s)
- **italy**: 1503 Mona Lisa begun · 1512 Sistine ceiling unveiled · 1527 Sack of Rome · 1545 Council of Trent opens · 1559 Cateau-Cambrésis fixes Spanish dominance · 1582 Gregorian calendar · 1600 Bruno burned · 1610 Galileo's telescope discoveries · 1633 Galileo's trial · 1647 Masaniello's revolt in Naples · 1669 Venice loses Crete · 1693 Sicily earthquake — plus fillers (1530s Florence's last republic falls 1530, 1560s Uffizi 1560, 1590s, 1620s, 1650s plague of Naples 1656, 1680s)

- [ ] **Step 2: Verify** — `npm test`; decade check 1500–1700 all four.
- [ ] **Step 3: Commit** — `git commit -m "feat: events 1500-1700 for the new nations"`

---

### Task 4: Events 1700–1850 (ids continue)

Anchors:

- **usa**: 1706 Franklin born in Boston · 1739 Whitefield and the Great Awakening · 1754 French and Indian War · 1765 Stamp Act · 1773 Boston Tea Party · 1776 Declaration of Independence · 1781 Yorktown · 1787 Constitutional Convention · 1791 Bill of Rights · 1803 Louisiana Purchase · 1812 war with Britain · 1825 Erie Canal · 1830 Indian Removal Act · 1846 Mexican War begins · 1848 gold in California; Seneca Falls
- **brazil**: 1708 War of the Emboabas over the goldfields · 1727 coffee introduced · 1750 Treaty of Madrid redraws the map · 1763 capital moves to Rio · 1789 Inconfidência Mineira (Tiradentes) · 1808 the Portuguese court arrives · 1815 Brazil raised to a kingdom · 1822 the Ipiranga cry — plus fillers per decade (1710s French raid Rio 1711, 1730s diamonds, 1740s, 1770s, 1790s, 1820s–1840s: 1824 constitution, 1835 Malê revolt, 1840 Pedro II comes of age)
- **austria**: 1713 Pragmatic Sanction · 1740 Maria Theresa's inheritance war · 1756 Diplomatic Revolution · 1781 Joseph II's Edict of Toleration · 1791 Mozart dies in Vienna · 1805 Austerlitz · 1809 Wagram; Metternich takes the helm · 1815 Congress of Vienna · 1825 Beethoven's Ninth (1824) · 1848 revolutions; Franz Joseph crowned — plus fillers (1700s Eugene's victories 1704 Blenheim shared? use 1717 Belgrade taken by Eugene, 1720s, 1730s, 1760s, 1770s partition share 1772, 1790s, 1830s Biedermeier)
- **italy**: 1706 Turin siege lifted · 1720 Grand Tour era; Savoy gains Sardinia · 1737 Medici line ends · 1748 Pompeii excavations begin · 1764 Beccaria's On Crimes and Punishments · 1778 La Scala opens · 1796 Napoleon's Italian campaign · 1805 Kingdom of Italy (Napoleonic) · 1815 restoration; Austria dominant · 1820 Carbonari risings · 1831 Mazzini founds Young Italy · 1848 revolutions sweep the peninsula — plus fillers (1710s, 1750s, 1790s covered, 1840s covered)

- [ ] **Step 2: Verify** — `npm test`; decade check 1700–1850.
- [ ] **Step 3: Commit** — `git commit -m "feat: events 1700-1850 for the new nations"`

---

### Task 5: Events 1850–2000 (ids continue)

Anchors:

- **usa**: 1861 Civil War begins · 1863 Gettysburg; Emancipation · 1865 Appomattox; Lincoln assassinated · 1869 transcontinental railroad · 1886 Statue of Liberty · 1898 war with Spain · 1903 Kitty Hawk · 1917 enters WWI · 1929 the Crash · 1933 New Deal · 1941 Pearl Harbor · 1945 Trinity and V-J Day · 1954 Brown v. Board · 1963 Kennedy assassinated; the Dream speech · 1969 Apollo 11 · 1974 Nixon resigns · 1989 Cold War ends · 2000 Bush v. Gore
- **brazil**: 1850 slave trade abolished · 1865 Paraguayan War · 1888 the Golden Law abolishes slavery · 1889 republic proclaimed · 1897 Canudos · 1922 Modern Art Week · 1930 Vargas revolution · 1942 joins the Allies · 1950 Maracanazo · 1958 Pelé's first World Cup · 1960 Brasília inaugurated · 1964 the coup · 1968 AI-5 hardens the dictatorship · 1985 civilian rule returns · 1994 the Real Plan
- **austria**: 1857 Ringstrasse begun · 1866 defeat at Königgrätz · 1867 the Compromise creates Austria-Hungary · 1889 Mayerling · 1897 Klimt's Secession · 1900 Freud's Interpretation of Dreams · 1914 Sarajevo; the ultimatum · 1918 the empire dissolves · 1927 Palace of Justice fire · 1934 civil war and Dollfuss murdered · 1938 Anschluss · 1945 Second Republic · 1955 State Treaty; neutrality · 1964 Innsbruck Olympics · 1986 Waldheim affair · 1995 joins the EU
- **italy**: 1859 Solferino · 1860 Garibaldi's Thousand · 1861 unification proclaimed · 1871 Rome the capital · 1896 Adwa disaster (shared lens with Ethiopia) · 1908 Messina earthquake · 1915 enters WWI · 1922 March on Rome · 1929 Lateran Treaty · 1935 invades Ethiopia · 1943 Mussolini falls; Italy switches sides · 1946 republic referendum · 1957 Treaty of Rome signed at home · 1966 Florence flood · 1978 Moro kidnapped and murdered · 1982 World Cup · 1992 Clean Hands investigations

- [ ] **Step 2: Verify** — `npm test`; decade check 1850–2000; full 1500–2000 check for all four.
- [ ] **Step 3: Commit** — `git commit -m "feat: events 1850-2000 for the new nations"`

---

### Task 6: Territory splice

**Files:**
- Create (scratchpad): `splice-new-nations.mjs` — v26.8 pattern (renderer, pre-1730 round-trip check; script touches only 1730+ snapshots).
- Modify: `src/data/territories.json`

Shapes:

```js
const USA_1790 = [[-80,32],[-75,32],[-70,41],[-67,44.5],[-70,45.5],[-75,43],[-80,42],[-83,38],[-85,33],[-81,30.5],[-80,32]]
const USA_1820 = [[-81,30.5],[-85,30],[-89.5,29.2],[-93.8,29.7],[-97,28],[-94,33.5],[-96.5,40],[-104,45],[-104,49],[-95,49],[-84,46.5],[-82,42],[-70,45.5],[-67,44.5],[-70,41],[-75,32],[-80,32],[-81,30.5]]
const USA_1850 = [[-124.2,42],[-124.4,48.3],[-95,49],[-84,46.5],[-82,42],[-70,45.5],[-67,44.5],[-70,41],[-75,32],[-80,32],[-81,25.5],[-84,30],[-89.5,29.2],[-93.8,29.7],[-97,26],[-99.5,27.5],[-101.4,29.8],[-103,29],[-106.4,31.7],[-108.2,31.3],[-111,31.3],[-114.7,32.7],[-117.1,32.5],[-120,34.5],[-124.2,42]]
const BRAZIL = [[-51.7,4.2],[-49.9,1.7],[-44.5,-2.8],[-39.5,-4.5],[-35,-5.5],[-34.8,-7.5],[-39,-13.5],[-39.7,-18],[-42,-22.9],[-48,-25.5],[-53.4,-33.7],[-57.6,-30.2],[-55.7,-27.4],[-58.1,-24.7],[-57.8,-20.7],[-60,-16.5],[-65.3,-11],[-69.9,-11],[-73.7,-7.3],[-70,-4.4],[-67,-1.5],[-63.3,2.2],[-60,5],[-56,2],[-51.7,4.2]]
const AUSTRIA_HUNGARY = [[9.6,47.1],[12.9,47.6],[13.8,48.7],[16.9,48.6],[18,49.5],[22,49.1],[26.5,48.2],[25.5,47.1],[26.4,44.7],[22.7,44.5],[19.3,44.9],[16.2,44.2],[13.6,45.2],[13.8,46.5],[12.4,46.7],[9.6,46.9],[9.6,47.1]]
const AUSTRIA_SMALL = [[9.6,47.1],[12.9,47.6],[13.8,48.7],[15,49],[16.9,48.6],[17.1,48],[16.1,46.9],[13.7,46.5],[12.4,46.7],[9.6,46.9],[9.6,47.1]]
const ITALY = [[7.5,43.8],[7,45.9],[13.7,46.5],[13.6,45.6],[12.3,45.4],[13.6,43.6],[15.9,41.9],[18.5,40.1],[16.6,38.9],[15.6,37.9],[16.1,36.7],[12.4,37.8],[15.6,38.3],[15.9,40],[12.4,41.9],[10.5,42.9],[8.9,44.4],[7.5,43.8]]
```

Rules (`additionsFor(year)`): usa — `USA_1790` (name "United States") at 1790, `USA_1820` at 1820, `USA_1850` for 1850–2000; brazil — `BRAZIL` for 1850–2000; austria — `AUSTRIA_HUNGARY` (name "Austria-Hungary") at 1880 and 1910, `AUSTRIA_SMALL` (name "Austria") at 1970 and 2000, ABSENT 1940; italy — `ITALY` for 1880–2000 including 1940.

- [ ] **Step 2: Verify** — `npm test`; node check: 1790 (+usa), 1850 (+brazil), 1880 (+austria, italy), 1940 (italy yes, austria no), 2000 (all four); pre-1730 round-trip.
- [ ] **Step 3: Commit** — `git commit -m "feat: territory snapshots for the new nations"`

---

### Task 7: Final verification + backlog + README

- [ ] **Step 1:** `npm run lint`, `npm test`, `npm run build`.
- [ ] **Step 2:** Browser (select the four): 1600 (RUDOLF II labeled on Austria, three bare columns with colonial/states events), 1800 (J. ADAMS/JEFFERSON-era, bare Brazil, FRANCIS I, bare Italy), 1930 (HOOVER, VARGAS, First Republic bare-ish, MUSSOLINI), 2000. Map: 1790/1850/1880/1940/2000 per Task 6. Restore Allen's selection.
- [ ] **Step 3:** `docs/BACKLOG.md`: F4 done in v26.9. `README.md`: 18 → 22 countries (both mentions), sidebar continent counts.
- [ ] **Step 4:** `git add -A && git commit -m "chore: verification pass and backlog update for new nations batch"`
