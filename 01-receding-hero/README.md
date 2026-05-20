# 01 — Receding hero

A full-width featured image at the top of the article. As the reader scrolls,
the image scales down and fades out as it leaves the viewport. The article
header and body sit in normal document flow below it and scroll into view
naturally.

## What's notable in the build

- **Image is the whole story.** No scrim, no overlay, no kicker/title layered
  on top. The image gets to be the image.
- **No pin.** ScrollTrigger only scrubs the image's `scale` and `opacity`
  against scroll position — the rest of the page scrolls normally. This is
  what made earlier iterations feel janky and what the final cut removed.
- **No filters.** Earlier drafts used `filter: saturate() brightness()` to
  desaturate the image during recession. Combined with `will-change: filter`
  and a perspective parent, Chrome sometimes rendered the figure as opaque
  black during compositor handoff. Stripping `filter`, `perspective`,
  `transform-style: preserve-3d`, and `will-change: filter` resolved it.
- **Image load is awaited** before the trigger is built, so the initial
  measure uses the final layout.
- **Resize is cheap.** `ScrollTrigger.refresh()` on every resize; rebuild
  only on the mobile-breakpoint flip.

## Files

- `index.html` — markup + script tags
- `styles.css` — hero figure, article header block, mobile fallback
- `receding-hero.js` — ScrollTrigger setup

Body content is fetched from `../assets/article-content.html` (the shared
"Triumph of the Spanish city" essay).
