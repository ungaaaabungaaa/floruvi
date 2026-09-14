# Product search and filters

Search runs locally over the public 85-crop catalogue. No new service or customer data is needed.

- Exact names rank first, then prefixes, culinary descriptions, and close spellings.
- Typos allow one edit for 4–6 letters and two edits for longer words, including adjacent swaps. Short words do not use fuzzy matching.
- Common names include palak, dhaniya, pudina, capsicum, brinjal, tulsi, and pak choi.
- Multiple terms must all match. Category and price filters stay strict.
- Category counts reflect the current search and price filter.
- Sort by best match, name, or pack price. Unknown prices stay last in both price directions. Pack sizes remain visible.
- Search, category, sort, and the price filter persist in URL parameters. Native history updates avoid fetching the whole page on each keystroke.
- Escape clears search. Clear and reset buttons return focus to the search field. Empty states offer an escape from restrictive filters.

Tests cover spelling mistakes, common names, exact-name ranking, combined terms, category boundaries, no matches, price sorting, and relevance preservation. Broad translated-language search and automatic synonym learning are not included.

Verification: 17 tests passed, with lint, type checking and a local production build. Browser checks covered typo search, category recovery, product-to-search Back navigation, URL reload persistence, price order, unpriced-crop recovery, and a 390 px layout without horizontal overflow.
