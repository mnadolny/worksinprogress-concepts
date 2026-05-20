# 02 — Animated drop cap

The opening letter of the lede paragraph sized large enough to span ~3
lines of body, set as an SVG `<text>` floated inside the paragraph so the
body wraps around it naturally. When the lede scrolls into view, the
outline draws itself in, the fill crossfades, and the stroke fades out —
leaving the solid glyph in place.

## What's notable in the build

- **SVG `<text>`, not a custom path.** Using the live font glyph means
  we don't have to ship a hand-traced "S" — change the lede's first
  letter and the cap follows. The outline-draw effect works because SVG
  `<text>` supports `stroke-dasharray` / `stroke-dashoffset` along the
  glyph's natural outline.
- **Single generous dash length.** A 600-unit dash comfortably covers
  any reasonable glyph's outline at this size; we animate `dashoffset`
  from that length to 0 to draw the stroke in.
- **Float-based layout.** The cap floats `left` inside the lede.
  `text-indent: 0` on the lede and a tight `line-height: 0.82` on the
  cap keep body text aligned cleanly along the cap's right edge.
- **Triggered once.** ScrollTrigger's `once: true` fires the timeline
  the first time the lede enters the viewport, then forgets about it —
  the cap doesn't replay if you scroll back up.
- **Letter still reads.** The cap is `aria-hidden` and a visually-hidden
  copy of the letter is reinserted into the paragraph, so screen readers
  read "Spain's cities…" instead of "pain's cities…".

## Files

- `index.html` — markup + script tags
- `styles.css` — drop cap base, header block, mobile
- `dropcap.js` — promotion of the lede's first letter into the cap,
  entry timeline, ScrollTrigger

Body content is fetched from `../assets/article-content.html` (the shared
"Triumph of the Spanish city" essay).
