# Prototype 03 — Pullquote takeover

A pullquote sits inline at reading scale, then as the reader scrolls into its
zone, it scales up to claim the viewport, holds a beat with the body receding
behind it, and releases back into flow.

## What it demonstrates

The treatment layers four small craft moments so the takeover reads as
*editorial*, not "scroll trick":

- **Variable-weight scrub.** The quote starts at weight 380 (Source Serif 4,
  variable) and resolves to 600 at peak takeover. The text *materializes* into
  presence rather than just growing.
- **Oversized ornamental quote-mark.** A massive italic `"` drifts in behind
  the words during takeover — typography as art direction, the way a print
  spread would set it.
- **Attribution as film credit.** `— Harry Law · Triumph of the Spanish city`
  slides up from beneath the quote in mono caps near peak, then slides away
  on release. Gives the moment a satisfying close.
- **Body recedes in depth.** Instead of a flat fade, the body steps back in
  z (opacity + scale + light blur) so the quote feels like it lifts off the
  page.

## How it's built

- One `ScrollTrigger` pins the stage and scrubs a single GSAP timeline across
  the zone's height. Three labelled phases: take-over (0.0–0.3), hold
  (0.3–0.7), release (0.7–1.0).
- The pullquote's transform/weight/letter-spacing are driven by CSS custom
  properties (`--q-scale`, `--q-weight`, `--q-letter`) so the timeline owns
  one source of truth and CSS handles the rendering.
- The body's recession is the same pattern — one `--body-recede` variable;
  opacity, blur, and scale all bind to it in CSS.
- Words are pre-split with Splitting.js so variant B's per-word cadence
  reveal works without re-parsing on toggle.

## Variants

- **A — Layered editorial (default).** The full treatment above.
- **B — Word-by-word cadence.** Words ink in one at a time during the
  take-over (opacity + slight y-offset + blur unblur). The weight scrub is
  dropped — the cadence does the materializing.
- **C — Accent wash.** Mid take-over, the background sweeps to oxblood and
  the quote inverts to paper. The mark dims to a low-opacity tonal accent.
  Boldest variant; closest to a magazine spread.

## Gotchas worth noting

- Pinning + `transform: scale` can blur text. Mitigated by scaling the
  pullquote container while CSS keeps the inner text crisp via the custom
  property pipeline.
- Pin distance is set by the zone height (`240vh`). Adjust there, not in JS.
- Mobile (< 768px) and `prefers-reduced-motion` users get a static enlarged
  inline quote with the mark as a tasteful drop-cap-sized ornament — no
  pinning, no scrub.
