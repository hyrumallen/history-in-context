# Africa & Americas Data Batch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate Ethiopia and the Songhai (→ Mali), Aztec (→ Mexico), and Inca (→ Peru) columns through 2000, closing backlog items F3 and B2.

**Architecture:** Data-only batch, same structure as v26.6/v26.7: eras → rulers → events ×2 → territory splice → verification. Colonial eras follow the Poland treatment (bare ribbon, events continue, no map presence where a colonizer's polygon already covers the region).

**Tech Stack:** JSON data files, vitest validation suite, node splice script.

**Spec:** `docs/superpowers/specs/2026-07-08-africa-americas-batch-design.md`

## Global Constraints

- Branch `feature/africa-americas-batch`; commit per task; `npm test` passes at every commit.
- CountryIds: `ethiopia`, `songhai`, `aztec`, `inca` (do NOT rename).
- New ruler ids from `m397`; new event ids from `e801`.
- Event schema as prior batches. Coverage: ≥1 per decade through 2000 starting from 1700 (ethiopia, songhai), from 1530 (aztec), from 1580 (inca) — earlier decades already covered by existing data.
- Bare-ribbon spans (no ruler entries): songhai 1591–1817 and 1893–1959; aztec 1521–1823 plus Mexico's chaos gaps; inca 1572–1823 plus Peru's chaos gaps; ethiopia 1769–1855 (Zemene Mesafint) and other short gaps per spec.
- Era chains start 1500, end 2000.

---

### Task 1: Eras for the four countries

**Files:**
- Modify: `src/data/countries.json`

- [ ] **Step 1: Add these exact eras arrays:**

- `ethiopia`: Ethiopian Empire 1500–1974 · Derg Ethiopia 1974–1991 · Federal Democratic Republic 1991–2000
- `songhai`: Songhai Empire 1500–1591 · Pashalik of Timbuktu 1591–1818 · Massina & Toucouleur Empires 1818–1893 · French Sudan 1893–1960 · Republic of Mali 1960–2000
- `aztec`: Aztec Empire 1500–1521 · New Spain 1521–1821 · Mexico 1821–2000
- `inca`: Inca Empire 1500–1572 · Viceroyalty of Peru 1572–1821 · Republic of Peru 1821–2000

- [ ] **Step 2: Verify** — `npm test`; dev server headers: "New Spain" at 1600, "Pashalik of Timbuktu" at 1700, "Republic of Peru" at 1900.
- [ ] **Step 3: Commit** — `git add src/data/countries.json && git commit -m "feat: eras for Ethiopia, Mali, Mexico, Peru columns"`

---

### Task 2: Rulers (ids m397+)

**Files:**
- Modify: `src/data/rulers.json` (append only)

- [ ] **Step 1: Append (name, title, years):**

**ethiopia** (Emperor unless noted): Tekle Haymanot I 1706–1708 · Dawit III 1716–1721 · Bakaffa 1721–1730 · Iyasu II 1730–1755 · Iyoas I 1755–1769 · Tewodros II 1855–1868 · Yohannes IV 1872–1889 · Menelik II 1889–1913 · Zewditu (Empress) 1916–1930 · Haile Selassie 1930–1974 · Mengistu Haile Mariam (Chairman) 1977–1991 · Meles Zenawi (Prime Minister) 1991–2000

**songhai**: Seku Amadu (Emir of Massina) 1818–1845 · Amadu II (Emir of Massina) 1845–1853 · Umar Tall (Toucouleur Emperor) 1853–1864 · Ahmadu Tall (Toucouleur Emperor) 1864–1893 · Modibo Keïta (President) 1960–1968 · Moussa Traoré (President) 1968–1991 · Alpha Oumar Konaré (President) 1992–2000

**aztec** (President): Guadalupe Victoria 1824–1829 · Antonio López de Santa Anna 1833–1855 · Benito Juárez 1858–1872 · Porfirio Díaz 1876–1911 · Francisco Madero 1911–1913 · Venustiano Carranza 1914–1920 · Álvaro Obregón 1920–1924 · Plutarco Elías Calles 1924–1928 · Lázaro Cárdenas 1934–1940 · Manuel Ávila Camacho 1940–1946 · Miguel Alemán 1946–1952 · Adolfo Ruiz Cortines 1952–1958 · Adolfo López Mateos 1958–1964 · Gustavo Díaz Ordaz 1964–1970 · Luis Echeverría 1970–1976 · José López Portillo 1976–1982 · Miguel de la Madrid 1982–1988 · Carlos Salinas 1988–1994 · Ernesto Zedillo 1994–2000

**inca**: Manco Inca Yupanqui (Sapa Inca) 1533–1544 · Sayri Tupac (Sapa Inca) 1545–1560 · Titu Cusi Yupanqui (Sapa Inca) 1560–1571 · Túpac Amaru (Sapa Inca) 1571–1572 · Simón Bolívar (Dictator) 1824–1827 · Ramón Castilla (President) 1845–1862 · Augusto Leguía (President) 1919–1930 · Manuel Odría (President) 1948–1956 · Fernando Belaúnde (President) 1963–1968 · Juan Velasco (President) 1968–1975 · Fernando Belaúnde (second term) (President) 1980–1985 · Alan García (President) 1985–1990 · Alberto Fujimori (President) 1990–2000

- [ ] **Step 2: Verify** — `npm test`. Dev server: neo-Inca ribbon 1533–1572 then bare to 1824; Ethiopia bare 1769–1855; UMAR TALL label on the songhai column ~1860.
- [ ] **Step 3: Commit** — `git add src/data/rulers.json && git commit -m "feat: rulers for the Africa & Americas columns"`

---

### Task 3: Events, colonial era to 1850 (ids e801+)

**Files:**
- Modify: `src/data/events.json` (append only)

Required anchors (fill remaining decades; decade check ranges per Global Constraints):

- **ethiopia** (from 1700): 1706 Iyasu I assassinated · 1721 Bakaffa's reign of intrigue · 1755 Iyasu II dies; Oromo influence rises · 1769 Zemene Mesafint begins · 1770 James Bruce reaches Gondar · 1788? — fill 1780s/90s/1800s/10s/20s/30s/40s with Zemene Mesafint decade events (regional Ras wars, e.g. 1803 Ras Gugsa's dominance, 1831 Battle of Debre Abbay) · 1841 Kassa (future Tewodros) rises
- **songhai** (from 1700): 1737 Tuareg defeat the pashalik at Toya · 1770s Tuareg dominance of the river · 1818 Seku Amadu's jihad founds Massina · 1826 Laing reaches Timbuktu · 1828 Caillié's journey · 1844? fill · 1853 Umar Tall's jihad begins — plus pashalik-era decade fillers (Timbuktu chronicles: 1700s Tarikh scholarship; 1710s–1760s trade/famine/Tuareg pressure entries)
- **aztec** (from 1530): 1531 Our Lady of Guadalupe · 1545 cocoliztli epidemic · 1553 university founded in Mexico City · 1571 Inquisition established · 1629 great flood · 1692 corn riot · 1737 typhus epidemic · 1767 Jesuits expelled · 1778 free-trade decree · 1810 Hidalgo's Grito · 1821 Plan of Iguala; independence · 1836 Texas lost · 1847 US army takes Mexico City · 1848 Treaty of Guadalupe Hidalgo — plus decade fillers 1530s–1840s (silver at Zacatecas 1546, Manila galleon 1565, desagüe drainage works 1607, cathedral consecrated 1656, Poinsett era 1820s, etc.)
- **inca** (from 1580): 1545 Potosí silver (already needed? existing data covers to 1572 — include Potosí if absent) · 1613 Guaman Poma's letter to the king · 1650 Cuzco earthquake · 1687 Lima earthquake · 1746 Lima-Callao earthquake and tsunami · 1780 Túpac Amaru II's revolt · 1821 San Martín proclaims independence · 1824 Ayacucho · 1849 guano boom — plus decade fillers 1580s–1840s (Lima's Saint Rose canonized 1671, Bourbon reforms, 1812? etc.)

- [ ] **Step 2: Verify** — `npm test`; decade check per country from its start decade to 1850.
- [ ] **Step 3: Commit** — `git add src/data/events.json && git commit -m "feat: colonial-era events for the Africa & Americas columns"`

---

### Task 4: Events 1850–2000 (ids continue)

**Files:**
- Modify: `src/data/events.json` (append only)

Required anchors:

- **ethiopia**: 1855 Tewodros II reunifies the empire · 1868 Magdala; Tewodros's suicide · 1889 Menelik II and the Treaty of Wichale · 1896 Battle of Adwa · 1917 railway reaches Addis Ababa · 1930 Haile Selassie crowned · 1935 Italian invasion · 1941 liberation · 1963 OAU founded at Addis · 1974 revolution deposes the emperor · 1984 famine · 1991 Derg falls · 1998 war with Eritrea
- **songhai**: 1862 Umar takes Massina · 1893 French take Timbuktu · 1904 French Sudan organized · 1946 African deputies in the French assembly · 1960 independence as Mali · 1968 Traoré's coup · 1973 Sahel drought · 1991 democracy revolution · 1992 Konaré elected — plus fillers (1880s French advance, 1898 Samory captured, 1910s–1930s colonial economy, 1950s federation politics)
- **aztec**: 1862 Cinco de Mayo · 1867 Maximilian executed · 1876 Díaz takes power · 1910 Revolution begins · 1917 constitution · 1926 Cristero War · 1938 oil nationalized · 1968 Tlatelolco massacre · 1985 Mexico City earthquake · 1994 NAFTA and the Zapatista rising · 2000 PRI loses after 71 years — plus fillers (1857 constitution, 1888 Díaz-era railways, 1942 WWII entry, 1950s golden age cinema, 1970s oil boom)
- **inca**: 1879 War of the Pacific begins · 1883 Treaty of Ancón · 1911 Machu Picchu revealed · 1932 Trujillo uprising · 1948 Odría's coup · 1968 Velasco's military reforms · 1970 Ancash earthquake · 1980 Sendero Luminoso begins · 1992 Guzmán captured; the self-coup · 2000 Fujimori falls — plus fillers (1851 first railway, 1860s guano wealth, 1895 Piérola's rebuilding, 1924 APRA founded, 1940s migration to Lima)

- [ ] **Step 2: Verify** — `npm test`; decade check 1850–2000 all four.
- [ ] **Step 3: Commit** — `git add src/data/events.json && git commit -m "feat: events 1850-2000 for the Africa & Americas columns"`

---

### Task 5: Territory splice

**Files:**
- Create (scratchpad): `splice-africa-americas.mjs` — v26.7 pattern (read 1700 shapes at runtime, pre-1730 deep-equality check, shared renderer).
- Modify: `src/data/territories.json`

New shapes:

```js
const ETHIOPIA_MODERN = [[36.5,14.5],[38,14.8],[40,14.5],[42.5,12.8],[43,11],[46,8],[47,8],[45,5],[41,4],[38,4.5],[35,5.5],[34.5,8],[33,10.5],[34.5,12.5],[36.5,14.5]]
const MALI = [[-12.2,14.8],[-11.5,12.5],[-8,12.2],[-6,10.2],[-4.8,12],[-2,13.6],[0,15],[1.3,15.3],[4.2,16.3],[4.2,19],[1.2,21.5],[-2,22],[-4.8,25],[-6.6,25],[-6,20],[-12,14.9],[-12.2,14.8]]
const MEXICO = [[-117.1,32.5],[-114.7,32.7],[-111,31.3],[-108.2,31.3],[-106.4,31.7],[-103,29],[-101.4,29.8],[-99.5,27.5],[-97.1,25.9],[-97.7,22],[-94.5,18.2],[-91,18.7],[-87.1,21.5],[-86.8,18],[-91,17],[-92.2,14.5],[-96.5,15.7],[-105.7,20.4],[-109.5,23.5],[-112,26],[-114.8,29.8],[-117.1,32.5]]
const PERU = [[-81.3,-4.2],[-80.5,-3.4],[-77,-3],[-75.2,-0.1],[-73.7,-1.3],[-70,-4.4],[-69.9,-10.9],[-68.7,-12.5],[-69.4,-15.6],[-68.8,-16.3],[-70.4,-18.3],[-71.5,-17.3],[-75.1,-15.4],[-79.7,-6.8],[-81.3,-4.2]]
```

Rules (`additionsFor(year)`):
- `ethiopia`: 1700 shape for 1730–1880; `ETHIOPIA_MODERN` (name "Ethiopia") for 1910–2000.
- `songhai`: ABSENT 1730–1940; `MALI` (name "Mali") for 1970 and 2000.
- `aztec`: ABSENT 1730–1820; `MEXICO` (name "Mexico") for 1850–2000.
- `inca`: ABSENT 1730–1820; `PERU` (name "Peru") for 1850–2000.

- [ ] **Step 2: Verify** — `npm test`; node check 1760 (ethiopia only of the four), 1880 (ethiopia+mexico+peru), 2000 (all four); pre-1730 round-trip.
- [ ] **Step 3: Commit** — `git add src/data/territories.json && git commit -m "feat: territory snapshots for the Africa & Americas columns"`

---

### Task 6: Final verification + backlog + README

- [ ] **Step 1:** `npm run lint`, `npm test`, `npm run build`.
- [ ] **Step 2:** Browser (select the four): 1780 (all bare-ribbon colonial/interregnum, Túpac Amaru II event visible), 1870 (TEWODROS II-era, JUÁREZ, UMAR TALL-era ribbons), 1960 (HAILE SELASSIE / Mali / PRI Mexico / Peru). Map: 1760, 1880, 2000 per Task 5 check. Restore Allen's selection.
- [ ] **Step 3:** `docs/BACKLOG.md`: F3 done in v26.8; B2 fully resolved (delete or mark resolved). `README.md`: update the "six default European countries are populated through 2000" paragraph — all 18 countries now run 1500–2000.
- [ ] **Step 4:** `git add -A && git commit -m "chore: verification pass and backlog update for Africa & Americas batch"`
