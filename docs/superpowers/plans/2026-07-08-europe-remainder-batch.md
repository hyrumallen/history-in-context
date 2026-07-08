# Europe Remainder Data Batch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate Portugal, Dutch Republic (→ Netherlands), Sweden, and Poland-Lithuania (→ Poland) from 1700–2000: eras, rulers, events, and inclusion in the ten 1730–2000 territory snapshots.

**Architecture:** Data-only batch — four JSON files change, no `src/` code. The data-validation suite (`src/data/data-validation.test.js`) guards ids, reign overlaps, era ordering, and coordinate bounds. Territory work uses a one-shot node script (pattern from v26.3) that splices the four countries into the existing 1730–2000 snapshots.

**Tech Stack:** JSON data files, vitest validation suite, node script for territory generation.

**Spec:** `docs/superpowers/specs/2026-07-08-europe-remainder-batch-design.md`

## Global Constraints

- Branch `feature/europe-remainder-batch`; commit per task; `npm test` (38 tests + validation) passes at every commit.
- CountryIds (do NOT rename): `portugal`, `dutch-republic`, `sweden`, `poland-lithuania`.
- New ruler ids from `m279`; new event ids from `e520`. Never renumber existing entries.
- Event schema: `{ id, year, countryId, type, title, description, link, lat, lng }`; `type` ∈ monarch/other/war/death/birth/exploration; description 1–2 neutral sentences; link = English Wikipedia; lat/lng on every event; ≥1 event per country per decade 1700–2000, target 25–30 per country.
- Poland partition rule: era "Partitioned Poland" 1795–1918 exists, events continue, but NO ruler entries 1795–1918 and NO map polygon 1820–1940.
- Era chains must start at 1500 and end at 2000 (validation enforces).
- Existing 1500–1700 data for these countries is untouched.

---

### Task 1: Eras for the four countries

**Files:**
- Modify: `src/data/countries.json` (add `eras` to the four entries; six existing era'd countries untouched)

- [ ] **Step 1: Add these exact eras arrays** (same formatting as the existing six):

- `portugal`: Kingdom of Portugal 1500–1580 · Iberian Union 1580–1640 · Kingdom of Portugal 1640–1910 · Portuguese Republic 1910–2000
- `dutch-republic`: Habsburg Netherlands 1500–1581 · Dutch Republic 1581–1795 · Batavian Republic 1795–1806 · Kingdom of Holland 1806–1813 · Kingdom of the Netherlands 1815–2000
- `sweden`: Kalmar Union 1500–1523 · Kingdom of Sweden 1523–2000
- `poland-lithuania`: Kingdom of Poland 1500–1569 · Polish-Lithuanian Commonwealth 1569–1795 · Partitioned Poland 1795–1918 · Second Republic 1918–1939 · Occupied Poland 1939–1945 · People's Republic 1945–1989 · Republic of Poland 1989–2000

- [ ] **Step 2: Verify** — `npm test` passes (era validation: sorted, non-overlapping, 1500→2000). Dev server: Sweden's header reads "Kalmar Union" at 1510; Poland's reads "Partitioned Poland" at 1850.

- [ ] **Step 3: Commit** — `git add src/data/countries.json && git commit -m "feat: eras for Portugal, Netherlands, Sweden, Poland"`

---

### Task 2: Rulers 1700–2000 (ids m279+)

**Files:**
- Modify: `src/data/rulers.json` (append only)

Existing data ends: portugal → Peter II (1706), dutch-republic → William III (1702), sweden → Charles XII (1718), poland-lithuania → Augustus II (1706). Bare-ribbon gaps are intentional: Netherlands 1702–1747 (Second Stadtholderless Period), 1795–1806, 1810–1815; Poland 1795–1918 and 1939–1944.

- [ ] **Step 1: Append these rulers (name, title, years)**

**portugal** (King/Queen unless noted): John V 1706–1750 · Joseph I 1750–1777 · Maria I 1777–1816 · John VI 1816–1826 · Peter IV 1826–1828 · Miguel I 1828–1834 · Maria II 1834–1853 · Peter V 1853–1861 · Luís I 1861–1889 · Carlos I 1889–1908 · Manuel II 1908–1910 · Manuel de Arriaga (President) 1911–1915 · Bernardino Machado (President) 1915–1917 · Sidónio Pais (President) 1917–1918 · António José de Almeida (President) 1919–1923 · Manuel Teixeira Gomes (President) 1923–1925 · Óscar Carmona (President) 1926–1932 · António de Oliveira Salazar (Prime Minister) 1932–1968 · Marcelo Caetano (Prime Minister) 1968–1974 · Francisco da Costa Gomes (President) 1974–1976 · António Ramalho Eanes (President) 1976–1986 · Mário Soares (President) 1986–1996 · Jorge Sampaio (President) 1996–2000.
(Estado Novo rule per spec: the ribbon follows the de facto heads — Salazar then Caetano, titled Prime Minister — so the figurehead presidents 1932–1974 are omitted; reigns must not overlap. Carmona's entry is trimmed to 1926–1932 accordingly.)

**dutch-republic**: William IV (Stadtholder) 1747–1751 · William V (Stadtholder) 1751–1795 · Louis Bonaparte (King) 1806–1810 · William I (King) 1815–1840 · William II (King) 1840–1849 · William III (King) 1849–1890 · Wilhelmina (Queen) 1890–1948 · Juliana (Queen) 1948–1980 · Beatrix (Queen) 1980–2000

**sweden** (King/Queen): Ulrika Eleonora 1718–1720 · Frederick I 1720–1751 · Adolf Frederick 1751–1771 · Gustav III 1771–1792 · Gustav IV Adolf 1792–1809 · Charles XIII 1809–1818 · Charles XIV John 1818–1844 · Oscar I 1844–1859 · Charles XV 1859–1872 · Oscar II 1872–1907 · Gustaf V 1907–1950 · Gustaf VI Adolf 1950–1973 · Carl XVI Gustaf 1973–2000

**poland-lithuania**: Stanisław I Leszczyński (King) 1704–1709 · Augustus II (King, restored) 1709–1733 · Augustus III (King) 1733–1763 · Stanisław II Augustus (King) 1764–1795 · [gap 1795–1918] · Józef Piłsudski (Chief of State) 1918–1922 · Stanisław Wojciechowski (President) 1922–1926 · Ignacy Mościcki (President) 1926–1939 · [gap 1939–1944] · Bolesław Bierut (President) 1944–1956 · Władysław Gomułka (First Secretary) 1956–1970 · Edward Gierek (First Secretary) 1970–1980 · Wojciech Jaruzelski (First Secretary) 1981–1989 · Lech Wałęsa (President) 1990–1995 · Aleksander Kwaśniewski (President) 1995–2000

(Poland note: Augustus II's existing entry ends 1706 — the restored reign is a NEW entry 1709–1733, allowed since reigns don't overlap; name it "Augustus II (restored)". Stanisław Leszczyński 1704–1709 overlaps the existing Augustus II 1697–1706 entry — rival kings during the Great Northern War. The validation suite forbids overlap, so shorten Leszczyński to 1706–1709.)

- [ ] **Step 2: Verify** — `npm test` (overlap check per country will catch mistakes). Dev server: Sweden's ribbon labeled continuously to 2000; Poland's ribbon bare 1795–1918 with "Partitioned Poland" header.

- [ ] **Step 3: Commit** — `git add src/data/rulers.json && git commit -m "feat: rulers 1700-2000 for the Europe remainder four"`

---

### Task 3: Events 1700–1850 (ids e520+)

**Files:**
- Modify: `src/data/events.json` (append only)

Rules per Global Constraints. Required anchors (fill remaining decades freely):

- **portugal**: 1703 Methuen Treaty · 1750 Pombal rises to power · 1755 Lisbon earthquake · 1759 Jesuits expelled · 1777 Maria I crowned; Pombal falls · 1807 court flees to Brazil · 1811 French driven from Portugal · 1822 Brazil declares independence · 1828 Miguelite War begins · 1834 monarchy restored, Miguel exiled
- **dutch-republic**: 1713 Treaty of Utrecht signed at home · 1747 Orangist revolution restores the stadtholderate · 1751 William V's long minority begins · 1780 Fourth Anglo-Dutch War · 1787 Prussian intervention crushes the Patriots · 1795 Batavian Revolution · 1806 Louis Bonaparte made king · 1810 annexed by France · 1815 Kingdom of the Netherlands proclaimed · 1830 Belgium secedes · 1839 Belgian independence recognized
- **sweden**: 1709 disaster at Poltava · 1718 Charles XII shot at Fredriksten · 1721 Great Northern War ends; empire lost · 1741 Celsius devises his scale · 1772 Gustav III's coup restores royal power · 1786 Swedish Academy founded · 1792 Gustav III assassinated at the opera · 1809 Finland lost to Russia · 1814 union with Norway · 1842 compulsory schooling
- **poland-lithuania**: 1709 Augustus II restored after Poltava · 1733 War of the Polish Succession · 1764 Stanisław II Augustus elected · 1772 First Partition · 1791 May 3rd Constitution · 1793 Second Partition · 1794 Kościuszko Uprising · 1795 Third Partition erases the Commonwealth · 1810 Chopin born · 1830 November Uprising · 1846 Kraków Uprising · 1849 Chopin dies in Paris

- [ ] **Step 2: Verify** — `npm test`; decade-coverage spot check with node (pattern from v26.3):
```bash
node -e "const e=require('./src/data/events.json');for(const c of ['portugal','dutch-republic','sweden','poland-lithuania']){const m=[];for(let d=1700;d<1850;d+=10){if(!e.some(x=>x.countryId===c&&x.year>=d&&x.year<d+10))m.push(d)}console.log(c,m.length?'MISSING '+m:'ok')}"
```
- [ ] **Step 3: Commit** — `git add src/data/events.json && git commit -m "feat: events 1700-1850 for the Europe remainder four"`

---

### Task 4: Events 1850–2000 (ids continue)

**Files:**
- Modify: `src/data/events.json` (append only)

Required anchors:

- **portugal**: 1861 cholera and royal deaths shake the monarchy · 1890 British Ultimatum humiliates Portugal · 1908 Lisbon Regicide (Carlos I assassinated) · 1910 Republic proclaimed · 1916 enters WWI · 1926 military coup ends the First Republic · 1932 Salazar becomes prime minister (Estado Novo) · 1961 colonial wars begin in Angola · 1974 Carnation Revolution · 1975 African colonies independent · 1986 joins the European Community · 1998 Lisbon Expo
- **dutch-republic**: 1853 first modern Dutch cabinet under Thorbecke's constitution · 1876 North Sea Canal opens · 1890 Van Gogh dies · 1901 first Nobel laureate (van 't Hoff) · 1914 neutral in WWI · 1932 Afsluitdijk closes the Zuiderzee · 1940 German invasion; Rotterdam bombed · 1944 Hunger Winter begins · 1949 Indonesian independence recognized · 1953 North Sea flood kills 1,800 · 1957 Treaty of Rome founding member · 1980 Beatrix crowned amid riots · 1995 Srebrenica falls under Dutch UN watch
- **sweden**: 1867 Nobel patents dynamite · 1876 Ericsson founded · 1901 first Nobel Prizes awarded · 1905 Norway leaves the union peacefully · 1914 neutral in WWI · 1921 universal suffrage · 1940 neutrality under pressure in WWII · 1943 rescue of Danish Jews across the Sound · 1955 Volvo, Saab, and the welfare state boom · 1974 ABBA win Eurovision · 1986 Palme assassinated · 1995 joins the EU
- **poland-lithuania**: 1863 January Uprising · 1867 Maria Skłodowska (Curie) born in Warsaw · 1905 revolution in Congress Poland · 1918 independence regained · 1920 Battle of Warsaw repels the Red Army · 1939 Germany and the USSR invade · 1940 Katyn massacre · 1943 Warsaw Ghetto Uprising · 1944 Warsaw Uprising · 1945 borders shift west (Oder-Neisse) · 1978 Karol Wojtyła elected Pope John Paul II · 1980 Solidarity founded at Gdańsk · 1981 martial law · 1989 first (partly) free elections · 1999 joins NATO

- [ ] **Step 2: Verify** — `npm test`; decade check 1850–2000 (same node one-liner with the range changed).
- [ ] **Step 3: Commit** — `git add src/data/events.json && git commit -m "feat: events 1850-2000 for the Europe remainder four"`

---

### Task 5: Territory snapshots — splice the four into 1730–2000

**Files:**
- Create (scratchpad, not committed): `splice-territories.mjs`
- Modify: `src/data/territories.json`

Write a node script (pattern: v26.3's generator, but this time it inserts country entries into the EXISTING ten snapshots, preserving the one-line-per-polygon formatting; parse → splice → re-render only the touched snapshots is error-prone, so simplest robust approach: parse the whole file, append the new country objects to each snapshot's `territories` array, and re-serialize with the same custom renderer used in v26.3, applied to ALL snapshots — verify the 1500–1700 snapshots round-trip identically by comparing parsed JSON deep-equality before/after).

Shapes (coarse, existing style; reuse exact coords from the 1700 snapshot where borders are stable):

- **portugal**: the existing 1700-snapshot Portugal polygon (Iberian west strip), all ten snapshots 1730–2000.
- **dutch-republic**: existing 1700 Low Countries polygon for 1730–1820; from 1850 on, a northern-Netherlands-only polygon (cut below the Rhine/Meuse, ~[3.4,51.4] to [7.2,53.5]).
- **sweden**: existing 1700 polygon (Sweden+Finland) for 1730–1790; from 1820 on, Sweden-only (eastern border at the Torne, ~[24,65.8] down the Gulf of Bothnia).
- **poland-lithuania**: existing 1700 Commonwealth polygon for 1730–1790; ABSENT 1820–1940; post-war shape for 1970 and 2000 (Oder to Bug: ~[14.1,53.9],[18.8,54.4],[23.5,54.2],[23.6,52],[24,50.4],[22.6,49.1],[19,49.4],[14.8,50.9],[14.1,52.8],[14.1,53.9]).

- [ ] **Step 2: Verify** — `npm test` (coord bounds); node deep-equality check that pre-1730 snapshots are unchanged; dev server map at 1760 (Commonwealth present), 1880 (Poland absent, Netherlands small, Sweden without Finland), 2000 (all four modern).
- [ ] **Step 3: Commit** — `git add src/data/territories.json && git commit -m "feat: territory snapshots 1730-2000 for the Europe remainder four"`

---

### Task 6: Final verification + backlog

- [ ] **Step 1:** `npm run lint`, `npm test`, `npm run build` all pass.
- [ ] **Step 2:** Browser pass per spec: select the four countries; 1750 (all four ribboned and evented), 1850 (Poland: "Partitioned Poland" header, bare ribbon, events present), 1950 (all four modern rulers); map checks from Task 5.
- [ ] **Step 3:** Update `docs/BACKLOG.md`: mark F1 done in v26.6; update B2 to note only Asia/Africa/Americas remain.
- [ ] **Step 4:** `git add -A && git commit -m "chore: verification pass and backlog update for Europe remainder batch"`
