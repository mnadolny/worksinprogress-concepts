/* Prototype 02 — Animated drop cap
 *
 * On boot the whole article fades in (header block first, then body). Once
 * that settles the drop cap plays its reveal. Two variants share the same
 * SVG markup, switched by the top-right toggle (data-variant on <html>):
 *
 *   A — Book traditional: outline draws in, fill crossfades, stroke fades out.
 *   B — Constructed capital: a Renaissance "ad quadratum" scaffold (square,
 *       inscribed circle, centre cross, diagonals) draws first; the glyph
 *       strokes over it and fills; the scaffold settles to a faint trace.
 *       Hover re-draws the construction.
 *
 * Switching variants re-plays that variant's reveal, so the toggle doubles
 * as a way to demo each treatment on demand.
 *
 * The page is pre-hidden via CSS (`opacity: 0` on header + mount) so it
 * never paints cold before the entry timeline runs.
 */

(() => {
  const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const svgNS = "http://www.w3.org/2000/svg";
  const DASH_LEN = 600; // long enough to cover any reasonable glyph outline
  const SCAFFOLD_DY = -6; // user units: the rendered cap sits high in the box;
                          //  shift the scaffold up so it centres on the glyph.

  // Module-level refs, filled once the cap is built.
  let capEl = null; // .dropcap
  let ink = null; // text.dc-ink — the drawable glyph
  let construct = null; // g.dc-construct
  let parts = []; // [{ el, len }] construction lines
  let capTl = null; // the running reveal timeline
  let started = false; // page-entry has run

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

  // ---- SVG construction helpers ------------------------------------------

  function mkGlyph(letter, cls) {
    const t = document.createElementNS(svgNS, "text");
    t.setAttribute("x", "50");
    t.setAttribute("y", "82");
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("font-size", "100");
    t.setAttribute("class", cls);
    t.textContent = letter;
    return t;
  }

  function mkConstruct() {
    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("class", "dc-construct");
    g.setAttribute("transform", `translate(0 ${SCAFFOLD_DY})`);
    const add = (tag, attrs) => {
      const e = document.createElementNS(svgNS, tag);
      for (const k in attrs) e.setAttribute(k, String(attrs[k]));
      e.setAttribute("class", "dc-line");
      g.appendChild(e);
      return e;
    };
    // ad quadratum: square, inscribed circle, centre cross, both diagonals.
    add("rect", { x: 9, y: 9, width: 82, height: 82 });
    add("circle", { cx: 50, cy: 50, r: 41 });
    add("line", { x1: 50, y1: 9, x2: 50, y2: 91 }); // vertical
    add("line", { x1: 9, y1: 50, x2: 91, y2: 50 }); // horizontal
    add("line", { x1: 9, y1: 9, x2: 91, y2: 91 }); // diagonal ↘
    add("line", { x1: 91, y1: 9, x2: 9, y2: 91 }); // diagonal ↙
    return g;
  }

  function lenOf(el) {
    try {
      return el.getTotalLength() || DASH_LEN;
    } catch (_) {
      return DASH_LEN;
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

    const cap = document.createElement("span");
    cap.className = "dropcap";
    cap.setAttribute("aria-hidden", "true");

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "glyph-svg");
    svg.setAttribute("viewBox", "0 0 100 100");

    // Transparent full-box hit area, so hover fires anywhere over the cap
    // (SVG only catches pointer events on painted pixels by default).
    const hit = document.createElementNS(svgNS, "rect");
    hit.setAttribute("class", "dc-hit");
    hit.setAttribute("x", "0");
    hit.setAttribute("y", "0");
    hit.setAttribute("width", "100");
    hit.setAttribute("height", "100");
    svg.appendChild(hit);

    construct = mkConstruct();
    ink = mkGlyph(letter, "dc-ink");

    // Scaffold behind, inked glyph on top.
    svg.appendChild(construct);
    svg.appendChild(ink);
    cap.appendChild(svg);

    // accessible reading order — visually-hidden copy of the letter
    const sr = document.createElement("span");
    sr.style.cssText =
      "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;";
    sr.textContent = letter;

    lede.insertBefore(cap, lede.firstChild);
    if (leading) lede.insertBefore(document.createTextNode(leading), cap);
    lede.insertBefore(sr, cap);

    capEl = cap;
    parts = Array.from(construct.children).map((el) => ({ el, len: lenOf(el) }));

    cap.addEventListener("mouseenter", () => onHover(true));
    cap.addEventListener("mouseleave", () => onHover(false));

    return cap;
  }

  // ---- Pre-state: hide every layer before a reveal -----------------------

  function resetCap() {
    if (!ink) return;
    gsap.set(ink, {
      strokeDasharray: `${DASH_LEN} ${DASH_LEN}`,
      strokeDashoffset: DASH_LEN,
      fillOpacity: 0,
      strokeOpacity: 1,
    });
    if (construct) gsap.set(construct, { opacity: 0 });
    parts.forEach(({ el, len }) =>
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len })
    );
  }

  // ---- Resting (final) states, used under reduced motion -----------------

  function settleCap(variant) {
    gsap.set(ink, { strokeDashoffset: 0, fillOpacity: 1, strokeOpacity: 0 });
    if (variant === "B") {
      gsap.set(construct, { opacity: 0.4 });
      parts.forEach(({ el }) => gsap.set(el, { strokeDashoffset: 0 }));
    } else if (construct) {
      gsap.set(construct, { opacity: 0 });
    }
  }

  // ---- The two reveals ----------------------------------------------------

  function revealA(tl) {
    tl.to(ink, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" })
      .to(ink, { fillOpacity: 1, duration: 0.5, ease: "sine.inOut" }, "-=0.15")
      .to(ink, { strokeOpacity: 0, duration: 0.4, ease: "sine.inOut" }, "-=0.3");
  }

  function revealB(tl) {
    // Scaffold draws first, line by line, then the glyph constructs over it.
    tl.set(construct, { opacity: 1 })
      .to(
        parts.map((p) => p.el),
        { strokeDashoffset: 0, duration: 0.9, ease: "power1.inOut", stagger: 0.12 }
      )
      .to(ink, { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }, "-=0.35")
      .to(ink, { fillOpacity: 1, duration: 0.55, ease: "sine.inOut" }, "-=0.2")
      .to(ink, { strokeOpacity: 0, duration: 0.45, ease: "sine.inOut" }, "-=0.25")
      // scaffold recedes to a faint trace, but stays visible
      .to(construct, { opacity: 0.4, duration: 0.7, ease: "sine.inOut" }, "-=0.5");
  }

  function playReveal(variant, delay) {
    if (capTl) capTl.kill();
    if (!ink) return;
    resetCap();
    if (mqReduced.matches) {
      settleCap(variant);
      return;
    }
    capTl = gsap.timeline({ delay: delay || 0, defaults: { ease: "power2.out" } });
    if (variant === "B") revealB(capTl);
    else revealA(capTl);
  }

  // ---- Hover interaction (B re-draws the scaffold) -----------------------

  function onHover(entering) {
    if (mqReduced.matches || !capEl || !construct) return;
    const variant = document.documentElement.dataset.variant || "A";
    if (variant !== "B") return;

    if (entering) {
      // re-draw the scaffold, brighter
      parts.forEach(({ el, len }) => gsap.set(el, { strokeDashoffset: len }));
      gsap.to(construct, { opacity: 0.95, duration: 0.25, ease: "sine.out" });
      gsap.to(
        parts.map((p) => p.el),
        { strokeDashoffset: 0, duration: 0.55, ease: "power1.inOut", stagger: 0.06 }
      );
    } else {
      gsap.to(construct, { opacity: 0.4, duration: 0.5, ease: "sine.inOut" });
    }
  }

  // ---- Page-entry fade (runs once, independent of variant) ---------------

  function playPageEntry() {
    const header = document.querySelector(".article-header-block");
    const mount = document.querySelector(".article-mount");

    if (mqReduced.matches) {
      gsap.set([header, mount], { opacity: 1, y: 0 });
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
  }

  // ---- Variant toggle wiring ---------------------------------------------

  function onVariant(key) {
    document.documentElement.dataset.variant = key;
    // First fire lines the cap up just after the body settles; later toggles
    // replay immediately.
    const delay = started ? 0 : 0.85;
    started = true;
    playReveal(key, delay);
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
    if (cap) resetCap();

    // one frame so the freshly-mounted body has laid out before we animate
    requestAnimationFrame(() => {
      playPageEntry();
      if (window.ProtoNav && typeof ProtoNav.mountVariants === "function") {
        ProtoNav.mountVariants(["A", "B"], onVariant, "A");
      } else {
        // no chrome available — still show variant A
        onVariant("A");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
