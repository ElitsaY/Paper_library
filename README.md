# Paper Library

Research papers explained with interactive visualizations. Each paper gets its own page. Plain HTML, CSS & JS, no build step.

## Structure

```
index.html     home page: search, topic filter, paper cards
papers.js      the catalogue (one entry per paper); the home page is rendered from it
library.js     home-page logic (cards, search, filters, stats)
style.css      shared styles for the home page and every paper page
papers/        one deep-dive page per paper: papers/<id>.html (+ optional <id>.js)
```

## Adding a paper

1. Create `papers/<id>.html` (link `../style.css`).
2. Add an entry to `window.PAPERS` in `papers.js`. The card, topic chips, and counts update automatically.
   Use `status: "soon"` to show a greyed-out placeholder while you work on it.

## Run locally

```bash
python3 -m http.server 8765
```
then open http://localhost:8765.
