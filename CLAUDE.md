# Project context for Claude Code

## What this is
A pitch deck of working interaction prototypes for a redesign concept for Works in Progress
magazine (worksinprogress.co). Each prototype demonstrates a signature editorial interaction.
The audience for the deployed site is: (1) my boss, internally, (2) the client (Works in
Progress editorial team), externally. It must feel like a designed artifact, not a code demo.

## Client context
Works in Progress is a quarterly print-first magazine of progress-studies essays. The website
currently feels like a thin digital echo of a beautifully art-directed print object. The
audience reads long-form (4,000–10,000 words) and uses footnotes seriously. The redesign goal
is to elevate reading experience, not drive engagement or subscriptions. Slow cadence — ~6
essays per issue, ~4 issues per year.

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
