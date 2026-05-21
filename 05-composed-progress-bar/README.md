# Prototype 05 — Composed progress bar

Not a thin line. A film-scrubber for the essay — at a glance you see where you are, what sections are coming, where the footnotes and figures sit, and how much remains.

## What it demonstrates

- On load, JS scans the article for `h2.section-heading`, `.fn-anchor`, and `figure` elements, recording their vertical positions proportionally against total article height.
- A fixed progress indicator shows reading progress with markers placed proportionally for sections (perpendicular bars), footnotes (small dots), and figures (short bars).
- Clicking any marker smooth-scrolls to that position via Lenis.
- Hover expands the indicator and reveals section-title labels.
- Progress is driven by a single GSAP ScrollTrigger, not raw scroll events.

## Variants

- **A — Vertical rail (right):** A narrow 3px rail on the right edge that expands to 28px on hover, revealing labels. Most information density. Falls back to horizontal bar on mobile.
- **B — Horizontal bar (top):** A thin top bar with section ticks and footnote/figure markers. Unobtrusive.
- **C — Floating corner module:** A circular progress ring with current section name and "Section N of M" label. Appears after you begin reading, hides near the end.

## Notable build details

- Offsets are cached on load and resize — no recalculation on every scroll frame.
- The vertical rail (Variant A) switches to a horizontal top bar on mobile to avoid eating screen real estate.
- The floating module (Variant C) uses an SVG `stroke-dashoffset` animation on a circle for the progress ring.
- All click-to-scroll uses `lenis.scrollTo()` for smooth, consistent behavior.
