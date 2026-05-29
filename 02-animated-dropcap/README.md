# 02 — Animated drop cap

The opening letter of the lede paragraph sized large enough to span ~3
lines of body, set as an SVG glyph floated inside the paragraph so the
body wraps around it naturally. When the page settles, the cap reveals
itself — how it reveals depends on the variant chosen in the top-right
toggle.

## Variants

Switch with the **A / B** toggle (top-right). Switching re-plays the
chosen reveal, so the toggle doubles as a way to demo each treatment.

- **A — Book traditional.** The outline draws itself in
  (`stroke-dashoffset` → 0), the fill crossfades, and the stroke fades
  out, leaving a solid deep ink-blue glyph. The quiet, expected default.
- **B — Constructed capital.** A da-Vinci-era "ad quadratum" scaffold
  (square, inscribed circle, centre cross, both diagonals) draws in first
  in sepia, then the glyph strokes over it and fills in walnut ink; the
  scaffold recedes to a faint trace but stays visible — the way a
  Renaissance constructed roman capital shows its geometry. **Hover the
  cap** and the construction lines re-draw, brighter — the "how it was
  built" made interactive.

## What's notable in the build

- **One markup, two treatments.** Both variants share the same SVG —
  a construction `<g>` and the inked `<text>` glyph. A `data-variant`
  attribute on `<html>` (set by the toggle) gates which layers show via
  CSS; GSAP plays the matching reveal.
- **SVG `<text>`, not a custom path.** Using the live font glyph means we
  don't ship a hand-traced "S" — change the lede's first letter and the
  cap follows. The outline-draw works because SVG `<text>` supports
  `stroke-dasharray` / `stroke-dashoffset` along the glyph's outline.
- **Scaffold geometry is generated, not drawn.** The square/circle/cross/
  diagonals are plain SVG primitives; each line's draw length comes from
  `getTotalLength()`, so the stroke-draw is exact per shape. The scaffold
  group is nudged up a few units so it centres on the glyph (the rendered
  cap sits high in its em box).
- **Reliable hover.** A transparent full-box `<rect>` (`pointer-events:
  all`) sits behind the glyph so hover registers anywhere over the cap,
  not just on painted pixels.
- **Letter still reads.** The cap is `aria-hidden` and a visually-hidden
  copy of the letter is reinserted into the paragraph, so screen readers
  read "Spain's cities…" instead of "pain's cities…".
- **Composed entry, once.** The page fades in (header, then body) on load
  before the cap reveal kicks in, so it never paints cold. The page-entry
  fade runs once; only the cap reveal replays on toggle.
- **Reduced motion respected.** Under `prefers-reduced-motion`, every
  layer is set straight to its resting state — no draw-in, no hover anim.

## Files

- `index.html` — markup + script tags
- `styles.css` — drop cap base, variant accents/scaffold, mobile
- `dropcap.js` — promotion of the lede's first letter into the cap, the
  per-variant reveal timelines, the hover interaction, and toggle wiring

Body content is fetched from `../assets/article-content.html` (the shared
"Triumph of the Spanish city" essay).
