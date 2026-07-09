# New Nations Batch — Design

**Date:** 2026-07-08
**Branch:** `feature/new-nations-batch` (merges as v26.9)
**Status:** Approved
**Closes:** backlog item F4

## Goal

Add four new columns — USA, Brazil, Austria, Italy — spanning the full
1500–2000 range, bringing the roster to 22 countries. Data-only batch: the
existing era/ribbon/map machinery (Poland treatment, de-facto-heads rule,
splice scripts) handles countries "born" mid-timeline with no code changes.

## Decisions (approved by Allen)

1. **Approach A**: new nations join as full 1500–2000 columns whose early
   stretches are predecessor eras (Colonial North America, Portuguese Brazil,
   Italian States) with bare ribbons and events — the Poland treatment run
   from the other direction. No `startYear` model change.
2. **All four candidates included**: USA, Brazil, Austria, Italy.
3. Austria's Habsburgs may duplicate names on the HRE column's ribbon until
   1806 — two lenses on one dynasty, accepted. Mussolini rides Italy's ribbon
   as "Duce" 1922–1943 with Victor Emmanuel III trimmed around him (Salazar
   rule). Italy's republic uses presidents (France Third-Republic precedent —
   postwar PM churn is mostly sub-year).

## New country entries (`countries.json`)

Appended after `inca` (order in file = sidebar order within continent groups):

```json
{ "id": "usa", "name": "United States", "continent": "Americas",
  "color": "#ccd6e8", "mapColor": "#7c8fb5", "mapStroke": "#5d6f94" },
{ "id": "brazil", "name": "Brazil", "continent": "Americas",
  "color": "#d2e4c8", "mapColor": "#86ab7d", "mapStroke": "#65875e" },
{ "id": "austria", "name": "Austria", "continent": "Europe",
  "color": "#ecd2cc", "mapColor": "#bd8578", "mapStroke": "#96655a" },
{ "id": "italy", "name": "Italy", "continent": "Europe",
  "color": "#cce4e0", "mapColor": "#78aba1", "mapStroke": "#5a877e" }
```

(each with its `eras` array below; hues distinct from all existing 18.)

## Eras

- **usa**: Colonial North America 1500–1776 · United States 1776–2000
- **brazil**: Portuguese Brazil 1500–1822 · Empire of Brazil 1822–1889 ·
  Republic of Brazil 1889–2000
- **austria**: Habsburg Monarchy 1500–1804 · Austrian Empire 1804–1867 ·
  Austria-Hungary 1867–1918 · First Republic 1918–1938 · Annexed Austria
  1938–1945 · Second Republic 1945–2000
- **italy**: Italian States 1500–1861 · Kingdom of Italy 1861–1946 ·
  Italian Republic 1946–2000

## Rulers (`rulers.json`, ids from m448)

- **usa** (President): bare 1500–1788, then Washington 1789–1797 · J. Adams
  1797–1801 · Jefferson 1801–1809 · Madison 1809–1817 · Monroe 1817–1825 ·
  J.Q. Adams 1825–1829 · Jackson 1829–1837 · Van Buren 1837–1841 · Tyler
  1841–1845 · Polk 1845–1849 · Taylor 1849–1850 · Fillmore 1850–1853 ·
  Pierce 1853–1857 · Buchanan 1857–1861 · Lincoln 1861–1865 · A. Johnson
  1865–1869 · Grant 1869–1877 · Hayes 1877–1881 · Arthur 1881–1885 ·
  Cleveland 1885–1889 · B. Harrison 1889–1893 · Cleveland (second term)
  1893–1897 · McKinley 1897–1901 · T. Roosevelt 1901–1909 · Taft 1909–1913 ·
  Wilson 1913–1921 · Harding 1921–1923 · Coolidge 1923–1929 · Hoover
  1929–1933 · F.D. Roosevelt 1933–1945 · Truman 1945–1953 · Eisenhower
  1953–1961 · Kennedy 1961–1963 · L.B. Johnson 1963–1969 · Nixon 1969–1974 ·
  Ford 1974–1977 · Carter 1977–1981 · Reagan 1981–1989 · G.H.W. Bush
  1989–1993 · Clinton 1993–2000. (W.H. Harrison 1841 and Garfield 1881
  omitted — sub-year caretaker rule.)
- **brazil**: bare 1500–1821 (colonial governors not shown, Poland rule) ·
  Pedro I (Emperor) 1822–1831 · Pedro II (Emperor) 1831–1889 · then
  (President): Deodoro da Fonseca 1889–1891 · Floriano Peixoto 1891–1894 ·
  Prudente de Morais 1894–1898 · Campos Sales 1898–1902 · Rodrigues Alves
  1902–1906 · Afonso Pena 1906–1909 · Hermes da Fonseca 1910–1914 ·
  Venceslau Brás 1914–1918 · Epitácio Pessoa 1919–1922 · Artur Bernardes
  1922–1926 · Washington Luís 1926–1930 · Getúlio Vargas 1930–1945 · Eurico
  Dutra 1946–1951 · Getúlio Vargas (second term) 1951–1954 · Juscelino
  Kubitschek 1956–1961 · João Goulart 1961–1964 · Castelo Branco 1964–1967 ·
  Costa e Silva 1967–1969 · Emílio Médici 1969–1974 · Ernesto Geisel
  1974–1979 · João Figueiredo 1979–1985 · José Sarney 1985–1990 · Fernando
  Collor 1990–1992 · Itamar Franco 1992–1995 · Fernando Henrique Cardoso
  1995–2000
- **austria** (Emperor unless noted; Archdukes titled "Archduke" pre-1556):
  Maximilian I (Archduke) 1493–1519 · Ferdinand I (Archduke) 1521–1564 ·
  Maximilian II 1564–1576 · Rudolf II 1576–1612 · Matthias 1612–1619 ·
  Ferdinand II 1619–1637 · Ferdinand III 1637–1657 · Leopold I 1657–1705 ·
  Joseph I 1705–1711 · Charles VI 1711–1740 · Maria Theresa (Empress)
  1740–1780 · Joseph II 1780–1790 · Leopold II 1790–1792 · Francis I
  1792–1835 · Ferdinand I of Austria 1835–1848 · Franz Joseph 1848–1916 ·
  Karl I 1916–1918 · Engelbert Dollfuss (Chancellor) 1932–1934 · Kurt
  Schuschnigg (Chancellor) 1934–1938 · [annexation gap 1938–1945] · Leopold
  Figl (Chancellor) 1945–1953 · Julius Raab (Chancellor) 1953–1961 · Alfons
  Gorbach (Chancellor) 1961–1964 · Josef Klaus (Chancellor) 1964–1970 ·
  Bruno Kreisky (Chancellor) 1970–1983 · Fred Sinowatz (Chancellor)
  1983–1986 · Franz Vranitzky (Chancellor) 1986–1997 · Viktor Klima
  (Chancellor) 1997–2000. (1918–1932 First Republic churn left bare.)
- **italy**: bare 1500–1860 (no single ruler of the Italian States) ·
  Victor Emmanuel II (King) 1861–1878 · Umberto I (King) 1878–1900 · Victor
  Emmanuel III (King) 1900–1922 · Benito Mussolini (Duce) 1922–1943 ·
  Victor Emmanuel III (restored) (King) 1943–1946 · then (President):
  Enrico De Nicola 1946–1948 · Luigi Einaudi 1948–1955 · Giovanni Gronchi
  1955–1962 · Antonio Segni 1962–1964 · Giuseppe Saragat 1964–1971 ·
  Giovanni Leone 1971–1978 · Sandro Pertini 1978–1985 · Francesco Cossiga
  1985–1992 · Oscar Luigi Scalfaro 1992–1999 · Carlo Azeglio Ciampi
  1999–2000

## Events (`events.json`, ids from e968; ~40–50 per country)

≥1 per decade 1500–2000 for all four. Anchor lists (plan carries the full
per-era anchors):

- **usa**: 1513 Ponce de León in Florida · 1565 St. Augustine · 1585 Roanoke ·
  1607 Jamestown · 1620 Mayflower · 1636 Harvard · 1675 King Philip's War ·
  1692 Salem · 1754 French and Indian War · 1773 Tea Party · 1776
  Declaration · 1787 Constitution · 1803 Louisiana Purchase · 1848 gold rush ·
  1861 Civil War · 1865 Appomattox and Lincoln's death · 1869 transcontinental
  railroad · 1903 Kitty Hawk · 1929 Crash · 1941 Pearl Harbor · 1945 Trinity ·
  1963 Dallas · 1969 the Moon · 1974 Nixon resigns · 1989 Cold War ends ·
  2000 Bush v. Gore
- **brazil**: 1500 Cabral's landfall · 1549 Salvador founded · 1630 Dutch
  Brazil · 1695 gold in Minas · 1763 capital moves to Rio · 1808 the
  Portuguese court arrives · 1822 the Ipiranga cry · 1888 slavery abolished
  (the Golden Law) · 1889 republic proclaimed · 1930 Vargas revolution ·
  1958 Pelé's first World Cup · 1960 Brasília inaugurated · 1964 the coup ·
  1985 civilian rule · 1994 the Real Plan
- **austria**: 1529 first siege of Vienna · 1556 Charles V splits the
  inheritance · 1618 Defenestration next door · 1683 second siege of Vienna ·
  1740 Maria Theresa's inheritance war · 1781 Joseph II's toleration ·
  1791 Mozart's death · 1815 Congress of Vienna · 1848 revolutions ·
  1867 the Compromise · 1889 Mayerling · 1900 Freud's Interpretation of
  Dreams · 1914 Sarajevo — the war begins here · 1918 empire dissolves ·
  1938 Anschluss · 1955 State Treaty and neutrality · 1986 Waldheim affair ·
  1995 joins the EU
- **italy**: 1503 Leonardo paints the Mona Lisa · 1527 Sack of Rome ·
  1582 Gregorian calendar · 1633 Galileo's trial · 1720 Grand Tour era ·
  1748 Pompeii excavations begin · 1796 Napoleon's Italian campaign ·
  1848 revolutions · 1861 unification · 1871 Rome the capital · 1908 Messina
  earthquake · 1922 March on Rome · 1943 Mussolini falls; Italy switches
  sides · 1946 the republic referendum · 1957 Treaty of Rome (hosting) ·
  1978 Moro murdered · 1992 Clean Hands

## Territory snapshots

Splice-script pattern; the script stays 1730+ (no pre-1730 edits — the four
are absent from every pre-1730 snapshot by these rules):

- **usa**: ABSENT through 1760 (England's "East Coast Colonies" polygon
  covers it and drops out by 1790 — verified); thirteen-states shape 1790;
  post-Louisiana shape 1820; continental shape 1850–2000.
- **brazil**: ABSENT through 1820 (Portugal draws metropolitan only);
  Brazil shape 1850–2000.
- **austria**: ABSENT through 1850 (its land reads as part of the HRE /
  German Confederation polygon — avoids double-drawing); Austria-Hungary
  shape 1880 and 1910; ABSENT 1940 (annexed, Poland rule); small-Austria
  shape 1970 and 2000.
- **italy**: ABSENT through 1850 (fragmented states not drawn); boot shape
  1880–2000 (including 1940 — sovereign, unlike Austria).

## Verification

- `npm test` at every step (22-country roster flows through all validation).
- Browser: select the four; 1600 (Austria's RUDOLF II ribbon labeled, the
  other three bare with colonial/states events), 1800 (WASHINGTON-era USA,
  bare Brazil, FRANCIS I Austria, bare Italy), 1930 (HOOVER/VARGAS/First
  Republic/MUSSOLINI), 2000 (all four modern). Map: 1790 (USA appears),
  1850 (+Brazil), 1880 (+Austria-Hungary, Italy), 1940 (Austria absent,
  Italy present), 2000 (all four).
- README count updates (18 → 22 countries).
