# Works in Progress — Interaction concepts

A pitch deck of working interaction prototypes for a redesign concept for [Works in Progress](https://worksinprogress.co), the quarterly print-first magazine of progress-studies essays. Six signature editorial moments — receding hero, animated drop cap, pullquote takeover, footnote hover-card, composed progress bar, and horizontal inline gallery — each built as a small, focused prototype and then stitched into a single demo article. Static HTML, CSS, and vanilla JavaScript; no build step. Read [`plan.md`](./plan.md) for the full brief and [`CLAUDE.md`](./CLAUDE.md) for working conventions.

**Live site:** https://mnadolny.github.io/worksinprogress-concepts/

## Run locally

```bash
npx serve
```

Opens on `localhost:3000`. All paths are relative so the site also works under a GitHub Pages subpath.

## Switching the demo article

Every interactive prototype (01–05) can render one of two real Works in Progress essays, so an interaction can be evaluated against more than one piece of content:

- **Spanish city** — *"Triumph of the Spanish city"* (Harry Law, Issue 21) — the default.
- **Mole rat** — *"The perks of being a mole rat"* (Aria Schrecker, Issue 22).

A pill toggle in the top-right of each prototype (beside the variant toggle) flips between them. Under the hood it just reloads the page with `?article=molerat` (omit the param for the default), so each prototype's GSAP setup boots cleanly against the chosen content.

How content is wired:

- **Article metadata** (kicker, title, dek, byline, hero) for both essays lives in [`shared/articles.js`](./shared/articles.js), which fills each prototype's header and mounts the toggle.
- **01 & 02** fetch the full shared body — `assets/article-content.html` (Spanish) or `assets/article-content-molerat.html` (mole rat).
- **03, 04 & 05** carry both articles' bespoke content inline, each block tagged `data-article="spain|molerat"`; `ProtoArticle.selectContent()` prunes the inactive set before the prototype reads the DOM.
- Mole-rat images live in [`assets/images/molerat/`](./assets/images/molerat/); the two interactive Datawrapper charts are captured as static images.
