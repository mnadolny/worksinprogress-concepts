/* Prototype 02 — Animated drop cap
 *
 * On boot, the whole article fades in (header block first, then body, with
 * a small upward translation). Once that settles, the drop cap's outline
 * draws itself in, the fill crossfades, and the stroke fades out — leaving
 * the solid glyph in place.
 *
 * The page is pre-hidden via CSS (`opacity: 0` on header + mount) so it
 * never paints cold before the entry timeline runs.
 */

(() => {
  const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const DASH_LEN = 600; // long enough to cover any reasonable glyph outline

  // ---- Load shared article body ------------------------------------------

  async function loadArticleBody() {
    const mount = document.getElementById("article-mount");
    if (!mount) return;
    try {
      const res = await fetch("../assets/article-content.html");
      mount.innerHTML = await res.text();
    } catch (err) {
      console.warn("article-content.html not loaded:", err);
    }
  }

  // ---- Promote first letter of lede into a .dropcap ----------------------

  function buildDropcap() {
    const lede = document.querySelector(".article-mount .article p.lede");
    if (!lede) return null;

    let node = lede.firstChild;
    while (node && node.nodeType !== Node.TEXT_NODE) node = node.nextSibling;
    if (!node) return null;
    const m = node.nodeValue.match(/^(\s*)(\S)/);
    if (!m) return null;
    const leading = m[1];
    const letter = m[2];
    node.nodeValue = node.nodeValue.slice(m[0].length);

    const svgNS = "http://www.w3.org/2000/svg";
    const cap = document.createElement("span");
    cap.className = "dropcap";
    cap.setAttribute("aria-hidden", "true");

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "glyph-svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    const txt = document.createElementNS(svgNS, "text");
    txt.setAttribute("x", "50");
    txt.setAttribute("y", "82");
    txt.setAttribute("text-anchor", "middle");
    txt.setAttribute("font-size", "100");
    txt.textContent = letter;
    svg.appendChild(txt);
    cap.appendChild(svg);

    // accessible reading order — visually-hidden copy of the letter
    const sr = document.createElement("span");
    sr.style.cssText =
      "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;";
    sr.textContent = letter;

    lede.insertBefore(cap, lede.firstChild);
    if (leading) lede.insertBefore(document.createTextNode(leading), cap);
    lede.insertBefore(sr, cap);

    return cap;
  }

  // ---- Pre-state for the cap, before the entry timeline runs -------------

  function preHideCap(cap) {
    const txt = cap.querySelector(".glyph-svg text");
    if (!txt) return;
    // SVG text fill is held at 0 by CSS; hide the stroke by parking the
    // full dash offset over the entire outline.
    txt.style.strokeDasharray = `${DASH_LEN} ${DASH_LEN}`;
    txt.style.strokeDashoffset = String(DASH_LEN);
  }

  // ---- The whole-page entry timeline -------------------------------------
  /* Header block fades up first; the article body follows on a short
   * overlap so it doesn't feel like two separate page loads. Once the
   * body fade is done, the cap plays its outline → fill → stroke-out. */

  function playEntry(cap) {
    const header = document.querySelector(".article-header-block");
    const mount = document.querySelector(".article-mount");
    const txt = cap.querySelector(".glyph-svg text");

    if (mqReduced.matches) {
      gsap.set([header, mount], { opacity: 1, y: 0 });
      if (txt) gsap.set(txt, { fillOpacity: 1, strokeOpacity: 0 });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    if (header) {
      gsap.set(header, { y: 10 });
      tl.to(header, { opacity: 1, y: 0, duration: 1.0 }, 0);
    }
    if (mount) {
      gsap.set(mount, { y: 8 });
      tl.to(mount, { opacity: 1, y: 0, duration: 1.1 }, 0.25);
    }

    // Drop cap kicks in just as the body settles. Stroke draws long and
    // slow, fill warms in over the last beat, stroke quietly bows out.
    if (txt) {
      tl.to(txt, {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: "power2.inOut",
      }, ">-0.15")
        .to(txt, {
          fillOpacity: 1,
          duration: 0.5,
          ease: "sine.inOut",
        }, "-=0.15")
        .to(txt, {
          strokeOpacity: 0,
          duration: 0.4,
          ease: "sine.inOut",
        }, "-=0.3");
    }
  }

  // ---- Boot --------------------------------------------------------------

  async function boot() {
    if (typeof gsap === "undefined") {
      console.error("GSAP failed to load");
      return;
    }

    await loadArticleBody();

    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch (_) {}
    }

    const cap = buildDropcap();
    if (cap) preHideCap(cap);

    // one frame so the freshly-mounted body has laid out before we animate
    requestAnimationFrame(() => playEntry(cap));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
