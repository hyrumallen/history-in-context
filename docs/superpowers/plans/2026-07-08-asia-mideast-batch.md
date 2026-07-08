# Asia & Middle East Data Batch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate China, Japan, Mughal India (→ India), and Safavid Persia (→ Iran) from 1700–2000: eras, rulers, events, territory snapshots.

**Architecture:** Data-only batch, identical structure to v26.6 (`docs/superpowers/plans/2026-07-08-europe-remainder-batch.md` executed earlier today): eras → rulers → events ×2 → territory splice script → verification. The validation suite guards every step.

**Tech Stack:** JSON data files, vitest validation suite, node splice script.

**Spec:** `docs/superpowers/specs/2026-07-08-asia-mideast-batch-design.md`

## Global Constraints

- Branch `feature/asia-mideast-batch`; commit per task; `npm test` (38 tests) passes at every commit.
- CountryIds: `china`, `japan`, `mughal-india`, `safavid-persia` (do NOT rename).
- New ruler ids from `m337`; new event ids from `e659`.
- Event schema and density rules as v26.6: full schema with lat/lng + Wikipedia link, ≥1 event per country per decade 1700–2000, ~25–30 per country.
- India Raj rule (Allen-approved): era "British Raj" 1858–1947, NO rulers 1858–1946, NO map polygon 1820–1940, events continue.
- Bare-ribbon gaps: China 1916–1928 (warlords), India 1979–1980 and 1996–1998 (caretakers/coalitions), Persia 1747–1751 and 1779–1789.
- Era chains start 1500, end 2000 (validation enforces).

---

### Task 1: Eras for the four countries

**Files:**
- Modify: `src/data/countries.json`

- [ ] **Step 1: Add these exact eras arrays:**

- `china`: Ming Dynasty 1500–1644 · Qing Dynasty 1644–1912 · Republic of China 1912–1949 · People's Republic of China 1949–2000
- `japan`: Sengoku Era 1500–1573 · Azuchi-Momoyama 1573–1603 · Edo (Tokugawa) 1603–1868 · Empire of Japan 1868–1947 · Japan 1947–2000
- `mughal-india`: Delhi Sultanate 1500–1526 · Mughal Empire 1526–1858 · British Raj 1858–1947 · Republic of India 1947–2000
- `safavid-persia`: Safavid Persia 1500–1736 · Afsharid & Zand Persia 1736–1796 · Qajar Persia 1796–1925 · Pahlavi Iran 1925–1979 · Islamic Republic of Iran 1979–2000

- [ ] **Step 2: Verify** — `npm test`; dev server headers: "Qing Dynasty" at 1700, "British Raj" at 1900, "Islamic Republic of Iran" at 1990.
- [ ] **Step 3: Commit** — `git add src/data/countries.json && git commit -m "feat: eras for China, Japan, India, Iran"`

---

### Task 2: Rulers 1700–2000 (ids m337+)

**Files:**
- Modify: `src/data/rulers.json` (append only)

Existing ends: china → Kangxi 1722, japan → Tsunayoshi 1709, mughal-india → Aurangzeb 1707, safavid-persia → Sultan Husayn 1722.

- [ ] **Step 1: Append (name, title, years):**

**china**: Yongzheng (Emperor) 1722–1735 · Qianlong (Emperor) 1735–1796 · Jiaqing (Emperor) 1796–1820 · Daoguang (Emperor) 1820–1850 · Xianfeng (Emperor) 1850–1861 · Tongzhi (Emperor) 1861–1875 · Guangxu (Emperor) 1875–1908 · Puyi (Emperor) 1908–1912 · Yuan Shikai (President) 1912–1916 · Chiang Kai-shek (Generalissimo) 1928–1949 · Mao Zedong (Chairman) 1949–1976 · Hua Guofeng (Chairman) 1976–1978 · Deng Xiaoping (Paramount Leader) 1978–1997 · Jiang Zemin (General Secretary) 1997–2000

**japan** (Shogun): Ienobu 1709–1712 · Ietsugu 1713–1716 · Yoshimune 1716–1745 · Ieshige 1745–1760 · Ieharu 1760–1786 · Ienari 1787–1837 · Ieyoshi 1837–1853 · Iesada 1853–1858 · Iemochi 1858–1866 · Yoshinobu 1866–1867 — then (Emperor): Meiji 1868–1912 · Taishō 1912–1926 · Shōwa (Hirohito) 1926–1989 · Akihito 1989–2000

**mughal-india** (Emperor): Bahadur Shah I 1707–1712 · Farrukhsiyar 1713–1719 · Muhammad Shah 1719–1748 · Ahmad Shah 1748–1754 · Alamgir II 1754–1759 · Shah Alam II 1759–1806 · Akbar II 1806–1837 · Bahadur Shah II 1837–1857 — then (Prime Minister): Jawaharlal Nehru 1947–1964 · Lal Bahadur Shastri 1964–1966 · Indira Gandhi 1966–1977 · Morarji Desai 1977–1979 · Indira Gandhi (second term) 1980–1984 · Rajiv Gandhi 1984–1989 · V.P. Singh 1989–1990 · P.V. Narasimha Rao 1991–1996 · Atal Bihari Vajpayee 1998–2000

**safavid-persia**: Tahmasp II (Shah) 1722–1732 · Abbas III (Shah) 1732–1736 · Nader Shah (Shah) 1736–1747 · Karim Khan Zand (Vakil) 1751–1779 · Agha Mohammad Khan (Shah) 1789–1797 · Fath-Ali Shah (Shah) 1797–1834 · Mohammad Shah (Shah) 1834–1848 · Naser al-Din Shah (Shah) 1848–1896 · Mozaffar ad-Din Shah (Shah) 1896–1907 · Mohammad Ali Shah (Shah) 1907–1909 · Ahmad Shah (Shah) 1909–1925 · Reza Shah (Shah) 1925–1941 · Mohammad Reza Shah (Shah) 1941–1979 · Ruhollah Khomeini (Supreme Leader) 1979–1989 · Ali Khamenei (Supreme Leader) 1989–2000

- [ ] **Step 2: Verify** — `npm test` (no-overlap per country). Dev server: China's ribbon bare 1916–1928; India's bare 1858–1946; shogun→emperor handoff at 1868.
- [ ] **Step 3: Commit** — `git add src/data/rulers.json && git commit -m "feat: rulers 1700-2000 for the Asia & Middle East four"`

---

### Task 3: Events 1700–1850 (ids e659+)

**Files:**
- Modify: `src/data/events.json` (append only)

Required anchors (fill remaining decades with well-known events; verify decade coverage with the node one-liner from v26.6, range 1700–1850):

- **china**: 1723 Yongzheng bans Christian missions · 1735 Qianlong's long reign begins · 1751 Tibet under Qing protectorate · 1759 Xinjiang conquered · 1782 Complete Library of the Four Treasuries finished · 1793 Macartney embassy rebuffed · 1796 White Lotus Rebellion · 1813 Eight Trigrams revolt reaches the Forbidden City · 1839 First Opium War begins · 1842 Treaty of Nanjing; Hong Kong ceded
- **japan**: 1703 the 47 rōnin avenge their lord · 1716 Yoshimune begins the Kyōhō reforms · 1732 Kyōhō famine · 1774 Sugita Genpaku's anatomy translation opens Dutch learning · 1783 Mount Asama erupts; Tenmei famine · 1792 Laxman's Russian embassy tests the closed country · 1804 Rezanov rebuffed at Nagasaki · 1825 edict to repel foreign ships · 1833 Tenpō famine begins · 1841 Tenpō reforms
- **mughal-india**: 1707 death of Aurangzeb; the empire begins to fragment · 1717 Company wins Mughal trade privileges · 1739 Nader Shah sacks Delhi · 1757 Battle of Plassey · 1761 Third Battle of Panipat · 1765 Company granted Bengal's revenues · 1784 Pitt's India Act · 1799 Tipu Sultan falls at Seringapatam · 1818 Maratha power broken · 1829 sati banned · 1835 English made the language of instruction · 1849 Punjab annexed
- **safavid-persia**: 1722 Afghans take Isfahan; Safavid collapse · 1736 Nader crowned shah · 1739 sack of Delhi; the Peacock Throne carried off · 1747 Nader assassinated; empire dissolves · 1751 Karim Khan rules from Shiraz · 1765 the Vakil's peace; Shiraz flourishes · 1779 Karim Khan dies; succession wars · 1789 Agha Mohammad unifies Persia · 1796 Qajar coronation · 1813 Treaty of Gulistan cedes the Caucasus · 1828 Treaty of Turkmenchay · 1848 Amir Kabir begins reforms

- [ ] **Step 2: Verify** — `npm test`; decade check 1700–1850 all four ok.
- [ ] **Step 3: Commit** — `git add src/data/events.json && git commit -m "feat: events 1700-1850 for the Asia & Middle East four"`

---

### Task 4: Events 1850–2000 (ids continue)

**Files:**
- Modify: `src/data/events.json` (append only)

Required anchors:

- **china**: 1850 Taiping Rebellion begins · 1860 Summer Palace burned · 1861 Cixi's regency begins · 1894 defeat by Japan · 1900 Boxer Rebellion · 1911 Xinhai Revolution · 1919 May Fourth Movement · 1934 Long March · 1937 Japan invades; Nanjing Massacre · 1949 People's Republic proclaimed · 1958 Great Leap Forward · 1966 Cultural Revolution · 1972 Nixon in China · 1976 death of Mao · 1978 Deng's reforms open the economy · 1989 Tiananmen Square · 1997 Hong Kong returns
- **japan**: 1853 Perry's black ships · 1868 Meiji Restoration · 1877 Satsuma Rebellion · 1889 Meiji Constitution · 1895 victory over China · 1905 victory over Russia · 1910 Korea annexed · 1923 Great Kantō earthquake · 1931 Manchuria seized · 1941 Pearl Harbor · 1945 Hiroshima, Nagasaki, surrender · 1947 postwar constitution · 1955 the economic miracle era opens · 1964 Tokyo Olympics and the Shinkansen · 1989 Shōwa ends · 1995 Kobe earthquake and the Aum attack
- **mughal-india**: 1853 first railway, Bombay to Thane · 1857 the Rebellion · 1858 Crown rule replaces the Company · 1876 Victoria proclaimed Empress · 1885 Indian National Congress founded · 1905 Bengal partitioned · 1919 Amritsar massacre · 1930 Salt March · 1943 Bengal famine · 1947 independence and Partition · 1948 Gandhi assassinated · 1962 war with China · 1966 Green Revolution begins · 1971 Bangladesh war · 1975 the Emergency · 1984 Indira Gandhi assassinated · 1991 economic liberalization · 1998 Pokhran nuclear tests
- **safavid-persia**: 1856 Anglo-Persian War over Herat · 1872 Reuter concession scandal · 1891 tobacco protest · 1906 Constitutional Revolution · 1908 oil struck at Masjed Soleyman · 1921 Reza Khan's coup · 1925 Reza Shah crowned · 1935 'Iran' adopted internationally · 1941 Anglo-Soviet invasion · 1951 oil nationalized · 1953 Mossadegh overthrown · 1963 White Revolution · 1978 revolution gathers · 1979 Islamic Revolution; hostage crisis · 1980 Iran-Iraq War begins · 1988 war ends · 1997 Khatami elected

- [ ] **Step 2: Verify** — `npm test`; decade check 1850–2000 all four ok.
- [ ] **Step 3: Commit** — `git add src/data/events.json && git commit -m "feat: events 1850-2000 for the Asia & Middle East four"`

---

### Task 5: Territory splice 1730–2000

**Files:**
- Create (scratchpad): `splice-asia.mjs` — copy `splice-territories.mjs` from the v26.6 scratchpad pattern: parse file, append additions per snapshot year, re-render all snapshots with the shared renderer, verify pre-1730 deep-equality, write.
- Modify: `src/data/territories.json`

Shapes: read `china`, `japan`, `safavid-persia`, `mughal-india` polygons from the parsed 1700 snapshot at runtime (do not hand-copy). New shapes:

```js
const MUGHAL_SHRUNK = [[73,32],[77,30],[80,28],[83,26],[80,24],[75,22],[71,24],[70,28],[73,32]]           // post-Plassey north India
const INDIA_MODERN = [[68.5,23.5],[70,20],[72.8,15],[77,8],[80.3,13],[84,19],[88,21.5],[89,26],[92,25],[95,27],[92,27.5],[88,27],[80,29.5],[75,34],[73.5,32.5],[68.5,23.5]]
const IRAN_MODERN  = [[44.5,39.5],[48,38],[53,37],[56,38],[61,36.5],[61.5,31],[63,29],[61,25],[57,26],[54,26.5],[50,30],[48.5,30],[46,32],[44.5,37],[44.5,39.5]]
```

Rules (`additionsFor(year)`):
- `china`: 1700 shape, all ten snapshots.
- `japan`: 1700 shape, all ten.
- `safavid-persia`: 1700 shape for 1730–1790; `IRAN_MODERN` (name "Iran") from 1820 on.
- `mughal-india`: 1700 shape in 1730; `MUGHAL_SHRUNK` (name "Mughal remnant") in 1760 and 1790; ABSENT 1820–1940; `INDIA_MODERN` (name "India") in 1970 and 2000.

- [ ] **Step 2: Verify** — `npm test`; node check: 1760 has all four (india = Mughal remnant), 1880 has three (india absent), 2000 has all four; pre-1730 round-trip passed.
- [ ] **Step 3: Commit** — `git add src/data/territories.json && git commit -m "feat: territory snapshots 1730-2000 for the Asia & Middle East four"`

---

### Task 6: Final verification + backlog

- [ ] **Step 1:** `npm run lint`, `npm test`, `npm run build` all pass.
- [ ] **Step 2:** Browser (select the four): 1750 ribbons QIANLONG / YOSHIMUNE / MUHAMMAD SHAH / NADER SHAH; 1880 "British Raj" era + bare India ribbon + events, MEIJI, GUANGXU, NASER AL-DIN SHAH; 1960 MAO ZEDONG / postwar Japan (SHŌWA) / NEHRU-era / MOHAMMAD REZA SHAH. Map: 1760 (shrunken Mughal), 1880 (India absent), 2000 (all four modern). Restore Allen's country selection afterward.
- [ ] **Step 3:** Update `docs/BACKLOG.md`: F2 done in v26.7; B2 now Africa/Americas only.
- [ ] **Step 4:** `git add -A && git commit -m "chore: verification pass and backlog update for Asia & Middle East batch"`
