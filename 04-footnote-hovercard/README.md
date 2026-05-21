# Prototype 04 — Footnote hover-card

Footnotes are central to long-form essays in Works in Progress. This prototype treats them
as first-class reading furniture rather than relegating them to the bottom of the page.

## What it demonstrates

Three distinct approaches to surfacing footnote content:

### Variant A — Floating card (default)
Hover a superscript anchor and a typeset card appears beside it. The card repositions
intelligently to avoid viewport edges. Click to pin; pinned cards stay until dismissed.
On mobile (touch devices), tapping an anchor expands the footnote inline below the
paragraph.

### Variant B — Margin rail
Footnotes live in a right-margin column, always visible as you read. The note closest
to the viewport center highlights. Hovering an anchor highlights its corresponding
rail note. On narrow screens, falls back to Variant A behavior.

### Variant C — Bottom drawer
Clicking a footnote anchor opens a persistent drawer at the bottom of the viewport.
Footnotes accumulate as you encounter them — a running bibliography of what you've
read so far. The most recently clicked note highlights.

## What's notable

- **Viewport-aware positioning**: cards reposition to stay fully visible regardless of
  anchor location (right → left → below fallback chain).
- **Keyboard accessible**: anchors are focusable; focus triggers the card just like hover.
- **No new libraries**: plain JS with GSAP for card entrance/exit animation only.
- **Touch detection**: `(hover: none) and (pointer: coarse)` media query routes touch
  devices to inline expand instead of hover cards.

## Accent color

Violet (`#6b5ce7`) — chosen to feel scholarly without competing with the warm red used
elsewhere.
