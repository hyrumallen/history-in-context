# Africa & Americas Data Batch — Design

**Date:** 2026-07-08
**Branch:** `feature/africa-americas-batch` (merges as v26.8)
**Status:** Approved
**Closes:** backlog items F3 and B2 (after this, every column and the map reach 2000)

## Goal

Populate Ethiopia, the Songhai column (→ Mali), the Aztec column (→ Mexico),
and the Inca column (→ Peru) from 1700 (or from their existing data's end)
through 2000. Data-only batch following the v26.6/v26.7 pattern.

## Decisions (approved by Allen)

1. **All three ended empires continue through successor eras** — geographic
   continuity, per the columns' existing practice. Colonial eras (New Spain,
   Viceroyalty of Peru, Pashalik of Timbuktu, French Sudan) get the Poland
   treatment: era label + events, bare ribbon, and (for the Americas) no map
   presence while Spain's colonial polygons cover the region.
2. Established rules: de facto heads; sub-year caretakers omitted; power
   vacuums bare (Ethiopia's Zemene Mesafint 1769–1855; Mexico's and Peru's
   chaotic stretches).

## Eras (`countries.json`)

- **ethiopia**: Ethiopian Empire 1500–1974 · Derg Ethiopia 1974–1991 ·
  Federal Democratic Republic 1991–2000
- **songhai**: Songhai Empire 1500–1591 · Pashalik of Timbuktu 1591–1818 ·
  Massina & Toucouleur Empires 1818–1893 · French Sudan 1893–1960 ·
  Republic of Mali 1960–2000
- **aztec**: Aztec Empire 1500–1521 · New Spain 1521–1821 · Mexico 1821–2000
- **inca**: Inca Empire 1500–1572 · Viceroyalty of Peru 1572–1821 ·
  Republic of Peru 1821–2000

## Rulers (`rulers.json`, ids from m397)

Existing ends: ethiopia → Iyasu I (1706), songhai → Askia Ishaq II (1591),
aztec → Cuauhtémoc (1521), inca → Atahualpa (1533).

- **ethiopia**: Tekle Haymanot I (Emperor) 1706–1708 · Dawit III (Emperor)
  1716–1721 · Bakaffa (Emperor) 1721–1730 · Iyasu II (Emperor) 1730–1755 ·
  Iyoas I (Emperor) 1755–1769 · [Zemene Mesafint gap 1769–1855] · Tewodros II
  (Emperor) 1855–1868 · Yohannes IV (Emperor) 1872–1889 · Menelik II
  (Emperor) 1889–1913 · Zewditu (Empress) 1916–1930 · Haile Selassie
  (Emperor) 1930–1974 · Mengistu Haile Mariam (Chairman) 1977–1991 · Meles
  Zenawi (Prime Minister) 1991–2000 (de facto head from 1991 per the standing
  rule). Short reigns 1708–1716, 1868–1872, 1913–1916, and the Derg
  collective 1974–1977 left bare.
- **songhai**: Seku Amadu (Emir of Massina) 1818–1845 · Amadu II (Emir of
  Massina) 1845–1853 · Umar Tall (Toucouleur Emperor) 1853–1864 · Ahmadu
  Tall (Toucouleur Emperor) 1864–1893 · [French Sudan gap 1893–1959] ·
  Modibo Keïta (President) 1960–1968 · Moussa Traoré (President) 1968–1991 ·
  Alpha Oumar Konaré (President) 1992–2000
- **aztec**: [New Spain gap 1521–1823] · Guadalupe Victoria (President)
  1824–1829 · Antonio López de Santa Anna (President) 1833–1855 (coarse — the
  era he dominated on and off) · Benito Juárez (President) 1858–1872 ·
  Porfirio Díaz (President) 1876–1911 · Francisco Madero (President)
  1911–1913 · Venustiano Carranza (President) 1914–1920 · Álvaro Obregón
  (President) 1920–1924 · Plutarco Elías Calles (President) 1924–1928 ·
  Lázaro Cárdenas (President) 1934–1940 · Manuel Ávila Camacho (President)
  1940–1946 · Miguel Alemán (President) 1946–1952 · Adolfo Ruiz Cortines
  (President) 1952–1958 · Adolfo López Mateos (President) 1958–1964 ·
  Gustavo Díaz Ordaz (President) 1964–1970 · Luis Echeverría (President)
  1970–1976 · José López Portillo (President) 1976–1982 · Miguel de la
  Madrid (President) 1982–1988 · Carlos Salinas (President) 1988–1994 ·
  Ernesto Zedillo (President) 1994–2000
- **inca**: Manco Inca Yupanqui (Sapa Inca) 1533–1544 · Sayri Tupac
  (Sapa Inca) 1545–1560 · Titu Cusi Yupanqui (Sapa Inca) 1560–1571 · Túpac
  Amaru (Sapa Inca) 1571–1572 · [Viceroyalty gap 1572–1823] · Simón Bolívar
  (Dictator) 1824–1827 · Ramón Castilla (President) 1845–1862 (coarse, two
  dominant terms) · Augusto Leguía (President) 1919–1930 · Manuel Odría
  (President) 1948–1956 · Fernando Belaúnde (President) 1963–1968 · Juan
  Velasco (President) 1968–1975 · Fernando Belaúnde (second term, President)
  1980–1985 · Alan García (President) 1985–1990 · Alberto Fujimori
  (President) 1990–2000. (Peru's other chaotic stretches left bare.)

## Events (`events.json`, ids from e801)

~20–30 per country. Coverage requirement adapted for late-ending existing
data: ≥1 per decade from 1700 (ethiopia, songhai) or from existing coverage
end (aztec from 1530s, inca from 1580s) through 2000. Required anchors:

- **ethiopia**: 1706 Iyasu I assassinated · 1730s Gondar's castles
  and salons under Iyasu II · 1769 Zemene Mesafint begins (Ras Mikael's
  puppets) · 1855 Tewodros II reunifies the empire · 1868 Napier expedition;
  Tewodros's suicide at Magdala · 1889 Menelik II and the Treaty of Wichale ·
  1896 Battle of Adwa · 1917 railway reaches Addis Ababa · 1930 Haile
  Selassie crowned · 1935 Italian invasion · 1941 liberation · 1963 OAU
  founded at Addis · 1974 revolution deposes the emperor · 1984 famine ·
  1991 Derg falls · 1998 war with Eritrea
- **songhai**: 1591 aftermath — Moroccan garrison rules Timbuktu · 1650s
  Timbuktu's scholarship persists under the pashalik · 1737 Tuareg defeat
  the pashalik · 1818 Seku Amadu's jihad founds Massina · 1853 Umar Tall's
  jihad · 1862 Umar takes Massina · 1893 French take Timbuktu · 1904 French
  Sudan organized · 1946 African deputies in the French assembly · 1960
  independence as Mali · 1968 Traoré's coup · 1973 Sahel drought ·
  1991 democracy revolution · 1992 Konaré elected
- **aztec**: 1531 Our Lady of Guadalupe · 1545 Cocoliztli epidemics ·
  1571 Inquisition established in Mexico City · 1629 great flood of Mexico
  City · 1692 corn riot burns the viceroy's palace · 1737 typhus epidemic ·
  1767 Jesuits expelled from New Spain · 1810 Hidalgo's Grito de Dolores ·
  1821 independence (Plan of Iguala) · 1836 Texas lost · 1847 US army takes
  Mexico City · 1848 Guadalupe Hidalgo — half the country ceded · 1862
  Cinco de Mayo · 1867 Maximilian executed; republic restored · 1910
  Revolution begins · 1917 constitution · 1926 Cristero War · 1938 oil
  nationalized · 1968 Tlatelolco massacre · 1985 Mexico City earthquake ·
  1994 NAFTA and the Zapatista rising · 2000 PRI loses after 71 years
- **inca**: 1545 Potosí silver discovered · 1572 Túpac Amaru executed ·
  1650 Cuzco earthquake · 1687 Lima earthquake · 1746 Lima-Callao earthquake
  and tsunami · 1780 Túpac Amaru II's great revolt · 1821 San Martín
  proclaims independence · 1824 Ayacucho seals it · 1849 guano boom ·
  1879 War of the Pacific begins · 1883 Treaty of Ancón — the south lost ·
  1911 Machu Picchu revealed to the world · 1932 Trujillo uprising · 1948
  Odría's coup · 1968 Velasco's military reforms · 1970 Ancash earthquake ·
  1980 Sendero Luminoso begins · 1992 Guzmán captured; Fujimori's
  self-coup · 2000 Fujimori falls

## Territory snapshots (`territories.json`)

Splice-script pattern (read 1700 shapes at runtime, pre-1730 round-trip
check):

- **ethiopia**: existing 1700 highlands shape 1730–1880; expanded
  Menelik-borders shape (modern Ethiopia incl. Ogaden) 1910–2000.
- **songhai**: ABSENT 1730–1940 (pashalik/jihad states/French Sudan are not
  the column's sovereign); Mali shape 1970 and 2000.
- **aztec**: ABSENT 1730–1820 (Spain's "New Spain" polygon covers it);
  Mexico shape 1850–2000 (post-1848 borders — Spain's colonial polygons
  disappear from its own entry by 1850, so the handoff matches independence
  within snapshot resolution).
- **inca**: ABSENT 1730–1820 (Spain's "Peru" polygon); Peru shape 1850–2000.

## Verification

- `npm test` at every step.
- Browser: select the four; 1780 (all colonial/imperial — bare ribbons for
  aztec/inca/songhai with events flowing, Ethiopia bare too in the Zemene
  Mesafint), 1870 (TEWODROS/JUÁREZ-era/UMAR TALL-era ribbons), 1960 (HAILE
  SELASSIE / Mali independence / PRI Mexico / Peru). Map: 1760 (of the four,
  Ethiopia only), 1880 (+ Mexico and Peru), 2000 (all four).
