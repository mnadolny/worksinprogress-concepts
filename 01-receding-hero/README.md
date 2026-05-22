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

On scroll, the hero pins for ~140% of viewport-height and plays a two-act
sequence scrubbed to scroll progress. **The image is never faded** — only
its framing changes. Camera in, camera out, but the artwork holds.

- **Act 1 — Anchor.** Pronounced Ken Burns push-in (scale 1 → 1.18) with a
  clear upward drift (yPercent 0 → −10). Title holds its ground. The
  accent rule extends a hair for editorial tension.
- **Act 2 — Liftoff.** The image keeps pushing in (scale → 1.32) and
  drifting up (yPercent → −32). The title decomposes — each *word*
  (SplitText) ascends out of its line-mask with a `random` stagger, like
  end credits rising. The kicker and rule lift away with it.

When the pin releases, the dek and byline arrive below in clean editorial
flow via the same line-mask reveal as Variant A.

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
