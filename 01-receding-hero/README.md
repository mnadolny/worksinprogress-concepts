# 01 — Receding hero

A full-width featured image at the top of the article. Two finished
variants explore different scroll choreographies for the hero + headline
relationship; a third slot is reserved.

## Variants

Toggle in the top-right of the page. State is reflected on
`html[data-variant]`.

### A — Receding image (original)
Image scales down and fades out as it leaves the viewport. The headline,
kicker, dek and byline live in normal document flow below it and slide up
from beneath their own baselines via SplitText line-masks. No pin.

### B — Title card (cinematic) — default
The headline is composited over the lower third of the hero in a large,
quiet, paper-cream display serif, anchored by a thin accent rule and a
mono kicker. **No scrim, no gradient** — the hero artwork stays pristine.
Title legibility is handled by a soft two-layer text-shadow (a 1px contact
shadow plus a wider diffuse halo) so the cream type reads against any
image without darkening the photograph.

On scroll, the cinematic plays inside a **CSS `position: sticky`** stage.
The hero (100vh) is wrapped in a 180vh-tall `.hero-stage` so the hero
stays glued to the top of the viewport for 80vh of scroll — the
cinematic window. Across that range, the image scales hard from 1.0 →
2.2 (true center zoom, a "camera dolly forward"), and the words
decompose — each *word* ascends out of its line-mask with a `random`
stagger across the first ~65% of the sticky range. The kicker and accent
rule lift away with them. **The image is never faded.**

The instant sticky releases, the hero scrolls out naturally over the
next 80vh and the article header arrives — no gap, no snap, no GSAP
pin, no spacer. The user's scroll continuously drives visible motion:
the zoom (during sticky), then the page scrolling the zoomed image out
(after release). Lenis owns the easing end-to-end.

After the hero exits, the dek + byline arrive via line-mask reveal,
then the article body fades up in batches.

**Why sticky instead of GSAP pin.** Earlier drafts pinned the hero with
ScrollTrigger and felt "frozen" — scrollbar moved, screen sat still,
animation completed mid-pin leaving a dead zone. Native CSS sticky is
zero-cost, browser-rendered, and the animation duration exactly matches
the sticky range so there's no static moment. Every scroll-wheel tick
produces visible change.

On boot, an intro plays once: title words rise into their line-masks
(expo.out), the accent rule draws in left-to-right, and the kicker fades
up. This is the "title card" arriving — separate from the scroll sequence
that takes it away.

### C — TBD
Reserved. Currently mirrors Variant A so the toggle has three working
positions.

## What's notable in the build

- **Variant routing as a clean reset.** Switching variants tears down every
  ScrollTrigger and SplitText we created, removes the cloned overlay DOM,
  clears inline GSAP styles, then rebuilds from scratch. No partial state.
- **No filter on the image.** An earlier draft of A used
  `filter: saturate() brightness()` and hit a Chrome compositor bug
  (figure rendering as opaque black). Variant B avoids filters on the
  image entirely; the gradient lives on `.hero::after`.
- **Gradient on `.hero`, not the overlay.** The overlay's bounding box is
  only as tall as its text content, so the gradient lives on the hero
  itself with `z-index: 1` (below the overlay's `z-index: 2`).
- **Title clone, not move.** Variant B clones the in-flow title + kicker
  into the hero and hides the originals via `html.v-b-active`. This keeps
  variant A's markup untouched and the switch reversible.
- **Words inside line-masks.** SplitText is run with
  `{ type: "words,lines", mask: "lines" }` so words are the animation unit
  (shards) but lines are the mask (overflow container). Descenders stay
  clipped cleanly during ascent.
- **Pin math survives resize.** Mobile-breakpoint flips rebuild the active
  variant; non-breakpoint resizes just call `ScrollTrigger.refresh()`.
- **Fonts ready before SplitText.** Splits are computed against the
  display serif, not a fallback face, so lines don't re-wrap on font swap.

## Files

- `index.html` — markup + script tags
- `styles.css` — hero figure, overlay (B), article header, mobile
- `receding-hero.js` — variant router + build functions for A / B / C

Body content is fetched from `../assets/article-content.html` (the shared
"Triumph of the Spanish city" essay).
