# Works in Progress — Signature Interactions Prototype Plan

A staged build plan for 6 signature editorial interactions to pitch as a redesign concept for [Works in Progress](https://worksinprogress.co). Built as static HTML/CSS/JS, deployed to GitHub Pages, designed to be shared as a single URL with internal stakeholders and then the client.

This plan is designed to be worked through with Claude Code, one prototype per session.

---

## How to use this plan with Claude Code

Each prototype is its own section. To work on one, open Claude Code in the project root and say something like:

> "Read `plan.md` and build Prototype 01 (Receding hero). Place it in `01-receding-hero/`. Use the conventions from `CLAUDE.md`."

Claude Code will read this plan, the project's `CLAUDE.md`, and build the prototype. Work through them in order — each one assumes the shared base styles and library setup from the previous prototypes exist.

**At the end of each session,** ask Claude Code to:
1. Test the prototype runs cleanly on `npx serve`
2. Update the root `index.html` to mark this prototype card as "ready"
3. Commit with a descriptive message

---

## Project setup (Session 0 — do this once)

### Tech stack

- Plain HTML, CSS, vanilla JS — no build step, no framework, no bundler
- GSAP + ScrollTrigger for scroll-driven animation (CDN)
- Lenis for smooth scroll (CDN)
- Splitting.js for per-character text effects (CDN)
- All paths **relative** — required for GitHub Pages

### Folder structure

```
wip-prototypes/
├── README.md                  # Public-facing repo intro (1-paragraph project description)
├── CLAUDE.md                  # Persistent context for Claude Code (conventions, gotchas, taste notes)
├── plan.md                    # This file
├── index.html                 # The pitch landing page — sells the work, then card navigation
├── assets/
│   ├── images/                # Hero illustrations, gallery images
│   ├── fonts/                 # Optional self-hosted fonts
│   └── article-content.html   # Shared sample article body
├── shared/
│   ├── base.css               # Typography, color tokens, baseline grid
│   ├── article-shell.css      # Article layout used across prototypes
│   ├── nav.css                # "Back to index" affordance, prototype-page chrome
│   └── nav.js                 # Variant toggle UI, back-button behavior
├── 01-receding-hero/
│   ├── index.html
│   └── README.md              # Per-prototype notes for Claude Code context
├── 02-animated-dropcap/
├── 03-pullquote-takeover/
├── 04-footnote-hovercard/
├── 05-composed-progress-bar/
├── 06-horizontal-gallery/
└── 07-demo-article/           # All 6 stitched into one full demo article
```

### Files Claude Code should create in Session 0

**`CLAUDE.md`** at the project root, containing:

```markdown
# Project context for Claude Code

## What this is
A pitch deck of working interaction prototypes for a redesign concept for Works in Progress
magazine (worksinprogress.co). Each prototype demonstrates a signature editorial interaction.
The audience for the deployed site is: (1) my boss, internally, (2) the client (Works in
Progress editorial team), externally. It must feel like a designed artifact, not a code demo.

## Tech rules
- Static HTML/CSS/vanilla JS only. No frameworks, no build step, no bundlers.
- All paths must be relative (no leading slash). This deploys to GitHub Pages on a subpath.
- Libraries loaded via CDN, never bundled.
- GSAP, ScrollTrigger, Lenis, Splitting.js are the only libraries permitted unless I approve
  adding another.

## Conventions
- Each prototype lives in its own numbered folder with an index.html.
- Each prototype has its own README.md inside the folder describing what it demonstrates,
  what's notable about the build, and any variants available.
- Shared CSS and JS live in /shared. Prototype-specific code lives in the prototype folder.
- Variant toggles (where prototypes have A/B/C variants) are a small UI element in the top-right
  of the prototype page, styled in shared/nav.css.
- Every prototype page has a "← Back to index" link top-left.

## Taste notes
- Editorial, considered, quiet. Not flashy. Not "tech demo."
- Color palette: warm off-white paper (#F4EFE6), deep ink (#1A1A1A), one accent per prototype.
- Type: serif body, serif display, mono for metadata. Use Source Serif 4 and JetBrains Mono
  from Google Fonts as starting points unless I specify otherwise.
- Animations should feel inevitable, not gratuitous. Default easing is power3.out or sine.inOut.
- Mobile must work, even if some interactions are simplified or replaced with simpler fallbacks.

## What not to do
- Don't add new libraries without asking.
- Don't use absolute paths.
- Don't write CSS-in-JS or use any styling library.
- Don't make the index page a directory listing — it must feel designed.
- Don't ship placeholder lorem ipsum in the demo article (Prototype 07). Use real WiP content.
```

**`README.md`** at the project root — a public-facing 1-paragraph description plus a link to the live GitHub Pages URL once deployed.

**`shared/base.css`** with:
- Color tokens as CSS custom properties: `--paper` (#F4EFE6), `--ink` (#1A1A1A), `--accent` (default warm red, overridden per prototype), `--muted` (mid-gray)
- Type scale using Source Serif 4 (body + display) and JetBrains Mono (metadata) from Google Fonts
- Article shell: max-width measure ~680px, generous outer margins, 1.5rem line-height baseline
- Minimal reset (`box-sizing: border-box`, body margin 0, image max-width 100%)

**`shared/nav.css` and `shared/nav.js`** with:
- A small fixed "← Back to index" link, top-left, mono face, low-contrast
- A variant toggle component (a small pill group, top-right) that prototypes can opt into
- Smooth page transitions when navigating away (optional but nice)

**`assets/article-content.html`** — paste the opening 2,000-3,000 words of one real WiP essay here. Good candidates:
- "Triumph of the Spanish city" (strong illustration, urban/architectural)
- "The Great Downzoning" (long, dense, lots of footnote potential)
- "Why Japan has such good railways" (lots of figure/diagram opportunities)

Pick one and use it across all prototypes for consistency.

### Local server

```bash
npx serve
```

Run from project root. Opens on `localhost:3000`. Claude Code can run this in a background terminal.

### GitHub Pages deployment

1. Create a new GitHub repo, push the project
2. Settings → Pages → Source: deploy from branch `main`, folder `/` (root)
3. Site goes live at `https://<username>.github.io/<repo-name>/`
4. Every push to `main` redeploys automatically

**Critical:** Test locally with `npx serve` running on a subpath (e.g., `localhost:3000/wip-prototypes/`) to catch any absolute-path bugs before pushing. Or test on a feature branch first.

---

## The index page (the most important page)

This is the URL your boss forwards to the client. It needs to do two jobs:

1. **Sell the work** — a short intro that frames what the visitor is about to experience
2. **Navigate to the prototypes** — a clean card grid, one card per prototype

### Structure

```
┌─────────────────────────────────────────────────────────┐
│  Works in Progress — Interaction concepts                │
│  (small mono kicker, top-left)                           │
│                                                          │
│                                                          │
│  Six signature moments for a                             │
│  reading-first redesign.                                 │
│                                                          │
│  (2-3 sentence intro paragraph in body serif:            │
│  what this is, what to look for, suggested order)        │
│                                                          │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │ 01       │  │ 02       │  │ 03       │               │
│  │ Receding │  │ Animated │  │ Pullquote│               │
│  │ hero     │  │ drop cap │  │ takeover │               │
│  │          │  │          │  │          │               │
│  │ One-line │  │ One-line │  │ One-line │               │
│  │ caption  │  │ caption  │  │ caption  │               │
│  └──────────┘  └──────────┘  └──────────┘               │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │ 04       │  │ 05       │  │ 06       │               │
│  │ Footnote │  │ Progress │  │ Horizontal│              │
│  │ card     │  │ bar      │  │ gallery  │               │
│  └──────────┘  └──────────┘  └──────────┘               │
│                                                          │
│  ┌──────────────────────────────────────────┐           │
│  │ 07 — All six, stitched into one article  │           │
│  │ (full-width card, prominent)              │           │
│  └──────────────────────────────────────────┘           │
│                                                          │
│                                                          │
│  Built by [you] for [agency]. (footer, mono, small)     │
└─────────────────────────────────────────────────────────┘
```

### Card design

Each card:
- Number (large, mono, top-left of card)
- Title (display serif)
- One-line caption (body serif, ~10-15 words explaining what the interaction is)
- A small thumbnail or animated preview on hover (optional, nice-to-have — a still frame from the prototype, or a CSS-only mini animation)
- Status indicator if a prototype isn't ready yet (small "in progress" or "coming" pill in mono)
- Entire card is clickable, navigates to the prototype

### Treatment

- Cards laid out on a warm-paper background, generous whitespace
- Hover state: card lifts slightly (transform translateY), accent color appears as a thin underline on the title
- Mobile: cards stack to single column
- Index page should itself feel like one of the prototypes — a small piece of the design system in action

### Intro copy (draft for Claude Code to use)

> Six signature interaction concepts for a Works in Progress redesign. Each prototype demonstrates one editorial moment — a hero treatment, a typographic flourish, a way to handle pullquotes, footnotes, reading progress, or inline galleries. Take them one at a time, or jump to prototype 07 to see all six stitched into a single demo article. Best viewed on desktop; mobile fallbacks included.

Claude Code should rewrite this if needed — that's a starting draft.

---

## Prototype 01 — Receding hero

**The moment:** Full-width hero image at the top of the article. As the user scrolls, the image scales down and pushes back in z-space with a slight tilt and desaturation, like it's receding into the distance inside the browser. The title scrolls up over and past it.

### Goals

- Smooth, butter-feeling scale and translate-Z on scroll
- Article title remains legible the whole time (high contrast, well-positioned)
- Image desaturates by ~30% as it recedes
- Subtle perspective tilt (max 8 degrees) so it doesn't look like a flat shrink
- Mobile-friendly fallback (just a shrink, no 3D tilt)

### Tech approach

- `perspective` on a parent wrapper
- GSAP ScrollTrigger pinning the hero section for ~120% of viewport height
- Animating `scale`, `translateZ`, `rotateX`, and CSS filters together
- Lenis smooth scroll active in the background

### Build steps

1. Article shell: `<header class="hero">` with an `<img>` and `<h1>`, followed by long `<article>` body below.
2. Add `perspective: 1200px` to `.hero-stage` wrapper.
3. Initialize Lenis; hook GSAP's ticker to Lenis's raf so they stay in sync.
4. ScrollTrigger: trigger on `.hero`, start `top top`, end `bottom top`, `scrub: 1`.
5. Animate image: `scale: 0.65`, `z: -400`, `rotateX: 6deg`, `filter: 'saturate(0.7) brightness(0.85)'`.
6. Animate title separately so it moves up and slightly forward (`z: 60`) — increases depth illusion.
7. `pin: true` so hero holds scroll position during animation.
8. Mobile: disable `rotateX` and `perspective` below 768px; simple scale + opacity instead.

### Gotchas

- `translateZ` only works with `perspective` on the parent.
- Use `scrub: 1` not `scrub: true` — slight lag feels more cinematic.
- `will-change: transform, filter` for GPU acceleration; remove after animation ends.
- Test with a horizontal illustration; vertical compositions don't read well in this treatment.

### Variants to demo (variant toggle in top-right)

- **A:** Tilt + desaturate (default)
- **B:** No tilt, just push back + subtle vignette
- **C:** Title splits — author/metadata pin top, headline rises with receding image

---

## Prototype 02 — Animated drop cap

**The moment:** First letter set huge (8-12rem) as a drop cap. When it enters viewport for the first time, it animates in with character — rotating, filling with color, or revealing a small illustration inside it.

### Goals

- Triggered once, first time the letter enters view
- Animation feels intentional, gets out of the way
- Body text wraps correctly around the cap (CSS float, no JS layout)
- 3-4 variants to demo

### Tech approach

- CSS `float: left` for layout
- GSAP timeline fired once via ScrollTrigger with `once: true`
- For advanced variants, inline `<svg>` with animated paths

### Build steps

1. Mark up: `<p><span class="dropcap">T</span>he rest follows...</p>`
2. Style: `font-size: 8rem`, `line-height: 0.85`, `float: left`, `padding-right: 0.5rem`, `margin-top: 0.5rem`, display serif.
3. ScrollTrigger that fires once when `.dropcap` enters view.
4. Timeline: start rotated -90deg, opacity 0, scaled 0.8. Animate to rest with `power3.out`, 0.8s.
5. Variant B: Inline SVG letter, animate `stroke-dashoffset` from full to 0 — letter draws itself in.
6. Variant C: Cap contains small inline SVG illustration that loops once on entry, then stops.
7. Variant D: Two-color cap fills from bottom to top with accent color on entry.

### Gotchas

- Float-based drop caps need `text-indent: 0` and clean `line-height` math.
- Use `transform-origin: bottom left` so cap rotates from baseline — far more natural.
- If using SVG, build the letter as a single optimized path. Don't animate a full font glyph SVG.

### Variants to demo (variant toggle)

All four side by side: A (rotation), B (stroke draw), C (illustration loop), D (vessel fill).

---

## Prototype 03 — Pullquote takeover

**The moment:** As reader scrolls and a pullquote enters a specific zone, it scales up to fill the viewport. Body fades back. Quote holds for a beat as scroll continues, then releases back into flow.

### Goals

- Smooth scale-up that feels like a film cut, not a CSS transition
- Pullquote is hero — beautiful display face at large size during takeover
- Body fades to ~15% opacity (still visible as texture)
- Release equally graceful — no snap-back

### Tech approach

- ScrollTrigger pinning the pullquote section for ~80% of viewport height
- GSAP timeline scrubbing: scale up → hold → scale back down
- Pullquote is sibling of body, positioned absolutely during takeover so it can overlap

### Build steps

1. Mark up: `<aside class="pullquote">"Quote text."</aside>` as standalone block.
2. Resting state: ~1.5rem, display face, indented or differentiated from body.
3. Wrap in `.pullquote-zone` div with ~150vh height — room for takeover to play out.
4. ScrollTrigger: `trigger: .pullquote-zone, start: top top, end: bottom bottom, pin: .pullquote, scrub: 1`.
5. Timeline: scale 1 → 3.5, change `font-size` via CSS variable, move to viewport center absolutely.
6. Simultaneously fade body to `opacity: 0.15`, add subtle blur (`filter: blur(2px)`).
7. Middle ~30% of timeline: hold (no change) — reader has time to read.
8. Final third: reverse scale, restore body opacity.

### Gotchas

- Pinning + scaling jank with `display: inline`. Use `block` or `flex`.
- Hold portion is holding scroll via pin. Pin distance must equal hold duration in timeline.
- Don't blur too aggressively. 2px max.
- Mobile: skip takeover below 768px. Enlarge inline instead.

### Variants to demo (variant toggle)

- **A:** Centered scale-up (default)
- **B:** Quote slides in from side as it scales — more cinematic, more risk
- **C:** Background washes to accent color during takeover

---

## Prototype 04 — Footnote hover-card

**The moment:** Hovering a footnote anchor reveals a beautifully designed card with the footnote content. Click to pin. Mobile: tap-to-expand inline.

### Goals

- Card appears near anchor without overlapping current reading text
- Own typography — smaller body, mono for citation metadata
- Graceful entry (fade + slight rise)
- Multiple pinned cards allowed
- Never cut off by viewport edge — repositions intelligently

### Tech approach

- Anchors as `<sup data-fn="1">` inline; content as `<ol class="footnotes"><li id="fn-1">` at article bottom
- JS reads footnote content on hover, clones into a positioned card
- Position logic: prefer right, fall back to left, fall back to below
- Click-to-pin: card gets `.pinned` class, stays until X-clicked

### Build steps

1. Mark up: anchors as `<sup class="fn-anchor" data-fn="1">1</sup>`; content as `<ol class="footnotes"><li id="fn-1">Content.</li></ol>` at bottom.
2. Card template (hidden) with slots for number, content, citation source.
3. Hover handler: clone content into card, position next to anchor, fade in with 200ms GSAP tween.
4. Position math: `anchor.getBoundingClientRect()`, calculate space, place card with `position: fixed`.
5. Optional: thin connecting line from anchor to card.
6. Click handler: toggle `.pinned`. Pinned cards get X button.
7. Mobile: detect touch, replace hover with tap-to-expand inline below anchor.
8. Style: white-ish background, hairline border, mono citation, body face for note, generous padding.

### Gotchas

- Don't use `:hover` CSS alone — need JS to clone and position.
- Mouseleave finicky if card outside anchor — add bridge area or small hide delay.
- Keyboard accessibility: anchors focusable, hover state also triggers on `:focus`.
- Pinned cards: track anchor on scroll or close on scroll.

### Variants to demo (variant toggle)

- **A:** Floating card next to anchor (default)
- **B:** Margin rail — footnotes live in right margin column, scroll-synced, hover highlights
- **C:** Bottom drawer — clicking opens persistent drawer showing all footnotes encountered

Variant B is the most editorially valuable for WiP.

---

## Prototype 05 — Composed progress bar

**The moment:** Not a thin line. A composed indicator showing overall progress, section markers, footnote density, and figure positions — a film scrubber for the essay.

### Goals

- At a glance: where you are, what's coming
- Clickable markers jump to sections
- Hover reveals section titles, footnote numbers
- Visually quiet by default, more present on hover

### Tech approach

- Sidebar or top-bar with subdivisions per section
- JS scans article for headings, footnotes, figures on load; generates markers proportionally
- Scroll handler updates "you are here" indicator
- Click handlers use Lenis's `scrollTo`

### Build steps

1. On load: query all `h2.section-heading`, all `.fn-anchor`, all `figure`. Record vertical offsets.
2. Calculate article total scroll length.
3. Bar element: `position: fixed`, full viewport height, narrow (~3px rail, expands to ~24px on hover).
4. Place markers proportionally: section markers as perpendicular bars, footnote ticks as dots, figures as small icons.
5. "You are here" indicator: filled portion top to current scroll. GSAP-animated, not raw scroll event.
6. Hover state: rail expands, markers grow, section titles appear, footnote numbers appear.
7. Click: smooth-scroll via `lenis.scrollTo(target)`.

### Gotchas

- Section detection requires structured HTML — semantic `<section>` or at least `<h2>`.
- Scroll math must account for hero section (not part of "reading progress").
- Cache offsets on load and resize, don't recalculate on every scroll.
- Mobile: vertical rail eats real estate. Switch to thin top bar with progress + section ticks only.

### Variants to demo (variant toggle)

- **A:** Vertical rail right (most info, most surface)
- **B:** Horizontal bar top (unobtrusive)
- **C:** Floating corner module — circular progress ring + "Section 3 of 7" + time remaining

---

## Prototype 06 — Horizontal inline gallery

**The moment:** Article hits inline gallery. Vertical scroll converts to horizontal across 3-7 images. Each has its own caption. After the gallery, vertical resumes.

### Goals

- Transition feels inevitable, not jarring
- Reader retains sense of progress within gallery
- Captions move with images, treated as gallery furniture
- Works on touch (swipe horizontally)
- Reader can escape — no scroll trap feeling

### Tech approach

- ScrollTrigger pinning gallery container, horizontally translating inner strip on scroll
- Total scroll distance = strip width minus viewport width
- Small position indicator (dot row) at top or bottom of pinned section

### Build steps

1. Mark up: `<section class="gallery"><div class="gallery-strip"><figure>...</figure>...</div></section>`
2. `.gallery` sized to viewport height; `.gallery-strip` is flex with images at ~80vw each plus gap.
3. ScrollTrigger: `trigger: .gallery, start: top top, end: () => '+=' + (galleryStrip.scrollWidth - window.innerWidth), pin: true, scrub: 1`.
4. Tween: `x: () => -(galleryStrip.scrollWidth - window.innerWidth)` on strip.
5. Position indicator: row of dots at bottom, active dot based on horizontal progress.
6. Captions below each image, matching width, smaller body face.
7. Mobile: replace pinning with native `scroll-snap-type: x mandatory`. Faster, no GSAP overhead.

### Gotchas

- Recalculate `end` on resize or horizontal distance won't match strip width.
- Don't pin if only 2-3 images — feels cheated. Minimum 4.
- Preload gallery images (`loading="eager"`) — no blank space reveal.
- Touch users on mobile must not see pinned version. Pin breaks iOS touch scroll.
- Visual cue you're entering horizontal zone — "→ scroll to explore" label, fades after first image.

### Variants to demo (variant toggle)

- **A:** Standard horizontal scroll (default)
- **B:** Each image fades in/out as it crosses center — "carousel of focus"
- **C:** Images at slight 3D angles (album cover flow) that flatten at center

---

## Prototype 07 — Demo article (stitching it all together)

**The moment:** A single sample article using all six interactions in their natural reading positions. The leave-behind — the URL the client returns to after the meeting.

### Goals

- Reads as one coherent piece, not Frankenstein of demos
- Each interaction appears once, in natural position
- Performance smooth — no interaction blocking another
- Desktop + mobile (with fallbacks)

### Build steps

1. Take sample article from `assets/article-content.html`, build full layout.
2. Insert each interaction naturally:
   - **Receding hero** at top
   - **Animated drop cap** on first paragraph
   - **Footnote hover-card** on 3-5 footnote anchors in text
   - **Composed progress bar** fixed on side throughout
   - **Pullquote takeover** at natural pullquote moment (~40% through)
   - **Horizontal gallery** at moment that benefits from image sequence (~60% through)
3. End-of-article footer with "Read next" card linking back to index.
4. Refresh ScrollTriggers on load and resize — they can conflict.
5. Test full scroll-through. Look for jank, pin/scroll-math conflicts.

### Final polish

- Loading state: body fades in once fonts loaded (`document.fonts.ready`)
- Optional: subtle custom cursor in accent color
- Audit color contrast on hero title against receding image
- Ship with real WiP illustration and real pullquote — placeholders undermine the pitch

---

## Suggested session order

- **Session 0:** Project setup, `CLAUDE.md`, shared base styles, index page scaffold, sample article in place. Push to GitHub, enable Pages.
- **Session 1:** Prototype 01 (receding hero). Update index card to "ready." Push.
- **Session 2:** Prototype 02 (drop cap, four variants). Update index. Push.
- **Session 3:** Prototype 03 (pullquote takeover). Update index. Push.
- **Session 4:** Prototype 04 (footnote hover-card + margin-rail variant). Update index. Push.
- **Session 5:** Prototype 05 (progress bar). Update index. Push.
- **Session 6:** Prototype 06 (horizontal gallery). Update index. Push.
- **Session 7:** Demo article (07), final polish, share URL.

Each session: 2-4 hours of focused build time. Whole project: ~one week solo with Claude Code.

---

## Sharing checklist (before sending to boss / client)

Before forwarding the URL:

- [ ] All six prototype cards on index page are "ready" (not "in progress")
- [ ] Test the live GitHub Pages URL on desktop in Chrome, Safari, Firefox
- [ ] Test on mobile (iOS Safari, Chrome Android) — every prototype gracefully falls back
- [ ] No console errors on any page
- [ ] No 404s on assets (relative paths working under GH Pages subpath)
- [ ] Index page intro copy reads naturally to someone with no context
- [ ] Each prototype has a small caption explaining what to look for
- [ ] "Back to index" works from every prototype
- [ ] Variant toggles work where present
- [ ] Real WiP content in prototype 07, not lorem ipsum
- [ ] Repo is public OR boss has access if you want to keep it private (GH Pages can serve from private repos on paid plans)

---

## Notes on translating to WordPress later

When approved and moving to production, each prototype maps to a Gutenberg custom block:

- **Receding hero** → custom hero block at top of `single.php`, GSAP loaded site-wide
- **Animated drop cap** → paragraph block variation or custom `drop-cap` block
- **Pullquote takeover** → custom block extending core/pullquote
- **Footnote hover-card** → custom inline format + footnote list block, site-wide JS module
- **Progress bar** → template part in `single.php`, scans post content on load
- **Horizontal gallery** → custom block extending core/gallery with `layout: horizontal-scroll` attribute

None fight WordPress meaningfully. Custom blocks are exactly where this work lives in modern WP. Devs will appreciate that block boundaries are already thought through.
