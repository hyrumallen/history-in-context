# Asia & Middle East Data Batch — Design

**Date:** 2026-07-08
**Branch:** `feature/asia-mideast-batch` (merges as v26.7)
**Status:** Approved
**Closes:** backlog item F2

## Goal

Populate China, Japan, Mughal India (→ India), and Safavid Persia (→ Iran)
from 1700 through 2000: eras, rulers, events, and inclusion in the ten
1730–2000 territory snapshots. Data-only batch following the v26.6 pattern.

## Decisions (approved by Allen)

1. **India's colonial period gets the Poland treatment.** Mughal emperors
   ribbon runs to 1857 (their long fade is real reign data); era "British
   Raj" 1858–1947 has a bare ribbon with events continuing; India is absent
   from map snapshots 1820–1940. No British viceroys on India's column.
2. Established rules apply: de facto heads on the ribbon (Japan's shoguns
   already follow this; Deng Xiaoping and Iran's Supreme Leaders continue
   it); sub-year caretakers omitted; multi-year power vacuums = bare ribbon
   (China's warlord era 1916–1928, Persia 1747–1751).

## Eras (`countries.json`)

- **china**: Ming Dynasty 1500–1644 · Qing Dynasty 1644–1912 · Republic of
  China 1912–1949 · People's Republic of China 1949–2000
- **japan**: Sengoku Era 1500–1573 · Azuchi-Momoyama 1573–1603 ·
  Edo (Tokugawa) 1603–1868 · Empire of Japan 1868–1947 · Japan 1947–2000
- **mughal-india**: Delhi Sultanate 1500–1526 · Mughal Empire 1526–1858 ·
  British Raj 1858–1947 · Republic of India 1947–2000
- **safavid-persia**: Safavid Persia 1500–1736 · Afsharid & Zand Persia
  1736–1796 · Qajar Persia 1796–1925 · Pahlavi Iran 1925–1979 · Islamic
  Republic of Iran 1979–2000

## Rulers (`rulers.json`, ids from m337)

Existing data ends: china → Kangxi (1722), japan → Tokugawa Tsunayoshi
(1709), mughal-india → Aurangzeb (1707), safavid-persia → Sultan Husayn
(1722).

- **china** (Emperor unless noted): Yongzheng 1722–1735 · Qianlong 1735–1796 ·
  Jiaqing 1796–1820 · Daoguang 1820–1850 · Xianfeng 1850–1861 · Tongzhi
  1861–1875 · Guangxu 1875–1908 · Puyi 1908–1912 · Sun Yat-sen (President)
  1912–1912 → sub-year, OMIT · Yuan Shikai (President) 1912–1916 · [warlord
  gap 1916–1928] · Chiang Kai-shek (Generalissimo) 1928–1949 · Mao Zedong
  (Chairman) 1949–1976 · Hua Guofeng (Chairman) 1976–1978 · Deng Xiaoping
  (Paramount Leader) 1978–1997 · Jiang Zemin (General Secretary) 1997–2000
- **japan**: Tokugawa shoguns continue — Ienobu 1709–1712 · Ietsugu
  1713–1716 · Yoshimune 1716–1745 · Ieshige 1745–1760 · Ieharu 1760–1786 ·
  Ienari 1787–1837 · Ieyoshi 1837–1853 · Iesada 1853–1858 · Iemochi
  1858–1866 · Yoshinobu 1866–1867 (all title "Shogun") · then Emperors:
  Meiji 1868–1912 · Taishō 1912–1926 · Shōwa (Hirohito) 1926–1989 ·
  Akihito 1989–2000
- **mughal-india** (Emperor): Bahadur Shah I 1707–1712 · Farrukhsiyar
  1713–1719 · Muhammad Shah 1719–1748 · Ahmad Shah 1748–1754 · Alamgir II
  1754–1759 · Shah Alam II 1759–1806 · Akbar II 1806–1837 · Bahadur Shah II
  1837–1857 · [Raj gap 1858–1946] · Prime Ministers: Jawaharlal Nehru
  1947–1964 · Lal Bahadur Shastri 1964–1966 · Indira Gandhi 1966–1977 ·
  Morarji Desai 1977–1979 · Indira Gandhi (second term) 1980–1984 · Rajiv
  Gandhi 1984–1989 · V.P. Singh 1989–1990 · P.V. Narasimha Rao 1991–1996 ·
  Atal Bihari Vajpayee 1998–2000 (sub-year caretakers omitted; 1996–1998
  coalition churn left bare)
- **safavid-persia** (Shah unless noted): Tahmasp II 1722–1732 · Abbas III
  1732–1736 · Nader Shah 1736–1747 · [chaos gap 1747–1751] · Karim Khan Zand
  (Vakil) 1751–1779 · [succession wars 1779–1789] · Agha Mohammad Khan
  1789–1797 · Fath-Ali Shah 1797–1834 · Mohammad Shah 1834–1848 · Naser
  al-Din Shah 1848–1896 · Mozaffar ad-Din Shah 1896–1907 · Mohammad Ali Shah
  1907–1909 · Ahmad Shah 1909–1925 · Reza Shah 1925–1941 · Mohammad Reza
  Shah 1941–1979 · Ruhollah Khomeini (Supreme Leader) 1979–1989 · Ali
  Khamenei (Supreme Leader) 1989–2000

## Events (`events.json`, ids from e659)

~25–30 per country, 1700–2000, ≥1/decade, existing schema. Required anchors:

- **china**: 1720s Kangxi–Yongzheng transition · 1750s Qianlong conquers
  Xinjiang · 1793 Macartney embassy rebuffed · 1839 First Opium War ·
  1850 Taiping Rebellion begins · 1860 burning of the Summer Palace ·
  1894 defeat by Japan · 1900 Boxer Rebellion · 1911 Xinhai Revolution ·
  1934 Long March · 1937 Japanese invasion; Nanjing · 1949 People's Republic
  proclaimed · 1958 Great Leap Forward · 1966 Cultural Revolution ·
  1976 death of Mao · 1989 Tiananmen Square · 1997 Hong Kong returns
- **japan**: 1703 Genroku earthquake / 47 rōnin · 1720s Yoshimune's Kyōhō
  reforms · 1774 first Western anatomy text translated · 1792 Russian
  envoys probe the closed country · 1853 Perry's black ships · 1868 Meiji
  Restoration · 1877 Satsuma Rebellion · 1895 victory over China ·
  1905 victory over Russia · 1923 Great Kantō earthquake · 1931 Manchuria
  seized · 1941 Pearl Harbor · 1945 Hiroshima and Nagasaki; surrender ·
  1947 postwar constitution · 1964 Tokyo Olympics · 1989 death of Hirohito ·
  1995 Kobe earthquake
- **mughal-india**: 1707 death of Aurangzeb · 1739 Nader Shah sacks Delhi ·
  1757 Battle of Plassey · 1765 Company wins Bengal's revenues · 1799 fall
  of Tipu Sultan · 1818 Marathas defeated · 1853 first railway · 1857 the
  Rebellion · 1885 Indian National Congress founded · 1905 partition of
  Bengal · 1919 Amritsar massacre · 1930 Salt March · 1947 independence and
  Partition · 1948 Gandhi assassinated · 1966 Green Revolution begins ·
  1975 the Emergency · 1984 Indira Gandhi assassinated · 1991 economic
  liberalization · 1998 nuclear tests
- **safavid-persia**: 1722 fall of Isfahan · 1736 Nader Shah crowned ·
  1739 sack of Delhi; Peacock Throne taken · 1747 Nader assassinated ·
  1751 Karim Khan's Shiraz · 1796 Qajar dynasty established · 1828 Treaty
  of Turkmenchay · 1848 Amir Kabir's reforms · 1891 tobacco protest ·
  1906 Constitutional Revolution · 1908 oil struck at Masjed Soleyman ·
  1925 Reza Shah crowned · 1941 Anglo-Soviet invasion · 1953 Mossadegh
  overthrown · 1963 White Revolution · 1979 Islamic Revolution · 1980
  Iran-Iraq War begins · 1997 Khatami's reform victory

## Territory snapshots (`territories.json`)

Add the four to the ten 1730–2000 snapshots (splice-script pattern from
v26.6, with the pre-1730 round-trip check):

- **china**: existing 1700 Qing shape in all ten snapshots (coarse borders
  effectively stable at this resolution through the PRC).
- **japan**: existing 1700 archipelago shape in all ten (stable).
- **mughal-india**: existing 1700 shape in 1730; visibly shrunken
  north-India shape in 1760 and 1790 (post-Plassey); ABSENT 1820–1940
  (Company/Raj rule — the Poland rule); modern-India shape in 1970 and 2000.
- **safavid-persia**: existing 1700 shape 1730–1790; modern-Iran shape from
  1820 on (Qajar losses in the Caucasus). Persia never vanishes — it was
  never extinguished as a state.

## Verification

- `npm test` (validation suite) at every step.
- Browser: select the four; check 1750 (Qianlong/Yoshimune/Muhammad Shah/
  Nader Shah ribbons), 1880 (British Raj era + bare ribbon + events;
  Meiji Japan; Guangxu China; Naser al-Din Persia), 1960 (Mao/postwar
  Japan/Nehru/Mohammad Reza). Map at 1760 (shrunken Mughal shape),
  1880 (India absent, others present), 2000 (all four modern).
