/* Prototype 03 — Pullquote takeover
 *
 * Architecture: the pullquote lives in flow between paragraphs. As the
 * reader scrolls it through viewport center, ScrollTrigger pins it for a
 * short distance (the takeover), then releases. Pin adds only as much
 * scroll as we need, so there's no leftover empty zone on either side.
 *
 * Timeline phases (proportions of the pin distance):
 *   0.00 → 0.30   Take-over   — scale up, weight scrubs heavier, mark fades in,
 *                                body recedes in depth, attribution rises.
 *   0.30 → 0.70   Hold        — nothing animates. Reader has time to read.
 *   0.70 → 1.00   Release     — everything reverses, body returns.
 *
 * Variants:
 *   A (default) — weight scrub + mark + attribution + body recession
 *   B           — per-word weight cadence (words always visible, weight pulses
 *                  in sequence across the quote during take-over)
 *   C           — accent-color wash sweeps in mid take-over; text inverts
 */

(function () {
  const SMALL_VIEWPORT = window.matchMedia("(max-width: 767px)");
  const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)");
  const DISABLED = () => SMALL_VIEWPORT.matches || REDUCED_MOTION.matches;

  const article = document.querySelector(".article.reading");
  const bodies  = Array.from(document.querySelectorAll("[data-body]"));
  const wrap    = document.querySelector("[data-pullquote-wrap]");
  const quote   = document.querySelector("[data-pullquote]");
  const text    = document.querySelector("[data-pullquote-text]");
  const attr    = document.querySelector("[data-pullquote-attr]");
  const mark    = document.querySelector(".pullquote-mark");
  const wash    = document.querySelector(".pullquote-wash");

  if (!article || !wrap) return;

  document.documentElement.dataset.variant = "A";

  const ready = document.fonts && document.fonts.ready
    ? document.fonts.ready
    : Promise.resolve();

  ready.then(() => {
    gsap.to(article, { opacity: 1, duration: 0.6, ease: "sine.out" });

    if (DISABLED()) return;
    if (!window.gsap || !window.ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    // Pre-split into words for variant B. Words stay visible at all times
    // (variant B varies weight, not opacity) so no blank moment.
    if (window.Splitting) {
      Splitting({ target: text, by: "words" });
      text.querySelectorAll(".word").forEach((w) => {
        w.style.setProperty("--word-weight", "380");
      });
    }
    const words = Array.from(text.querySelectorAll(".word"));

    let currentVariant = "A";
    let st = null;

    function build() {
      if (st) { st.kill(); st = null; }

      // Reset transient state — same starting point for every variant build.
      gsap.set(quote,  { "--q-scale": 1, "--q-weight": 380, "--q-letter": "-0.005em" });
      gsap.set(bodies, { "--body-recede": 0 });
      gsap.set(mark,   { opacity: 0, "--mark-scale": 0.55, color: "" });
      gsap.set(attr,   { opacity: 0, y: "0.6em" });
      gsap.set(wash,   { opacity: 0 });
      gsap.set(text,   { color: "" });
      if (words.length) gsap.set(words, { "--word-weight": 380 });

      const tl = gsap.timeline({ paused: true, defaults: { ease: "sine.inOut" } });

      // --- 0.00 → 0.30  TAKE-OVER --------------------------------------
      tl.to(bodies, { "--body-recede": 1, duration: 0.30, ease: "power2.in" }, 0);

      tl.to(quote, {
        "--q-scale": 2.6,
        "--q-letter": "-0.022em",
        duration: 0.30,
        ease: "power2.out",
      }, 0);

      if (currentVariant === "B" && words.length) {
        // Per-word weight cadence: weight pulses 380 → 620 → 380 across the
        // quote in sequence. Words stay fully visible the whole time.
        words.forEach((w, i) => {
          const at = 0.02 + (i / Math.max(1, words.length - 1)) * 0.18;
          tl.to(w, { "--word-weight": 620, duration: 0.05, ease: "sine.out" }, at);
          tl.to(w, { "--word-weight": 460, duration: 0.10, ease: "sine.inOut" }, at + 0.06);
        });
      } else {
        // A & C — whole-quote weight scrub.
        tl.to(quote, { "--q-weight": 600, duration: 0.30, ease: "sine.inOut" }, 0);
      }

      tl.to(mark, {
        opacity: currentVariant === "C" ? 0.18 : 0.92,
        "--mark-scale": 1,
        duration: 0.28,
        ease: "power3.out",
      }, 0.02);

      if (currentVariant === "C") {
        tl.to(wash, { opacity: 0.96, duration: 0.22, ease: "power2.inOut" }, 0.14);
        tl.to(text, { color: "var(--paper)", duration: 0.22, ease: "sine.inOut" }, 0.14);
        tl.to(mark, { color: "var(--paper)", opacity: 0.22, duration: 0.22 }, 0.14);
      }

      tl.to(attr, { opacity: 1, y: "0em", duration: 0.18, ease: "power2.out" }, 0.22);

      // --- 0.30 → 0.70  HOLD -------------------------------------------
      tl.to({}, { duration: 0.40 }, 0.30);

      // --- 0.70 → 1.00  RELEASE ----------------------------------------
      tl.to(attr,   { opacity: 0, y: "0.6em", duration: 0.16, ease: "power2.in" },  0.70);
      tl.to(quote,  { "--q-scale": 1, "--q-weight": 380, "--q-letter": "-0.005em", duration: 0.30, ease: "power2.inOut" }, 0.70);
      tl.to(mark,   { opacity: 0, "--mark-scale": 0.55, duration: 0.28, ease: "power2.in" }, 0.72);
      tl.to(bodies, { "--body-recede": 0, duration: 0.30, ease: "power2.out" }, 0.70);

      if (currentVariant === "C") {
        tl.to(wash, { opacity: 0, duration: 0.22, ease: "power2.inOut" }, 0.70);
        tl.to(text, { color: "var(--ink)", duration: 0.22, ease: "sine.inOut" }, 0.70);
        tl.to(mark, { color: "var(--accent)", duration: 0.22 }, 0.70);
      }

      if (currentVariant === "B" && words.length) {
        // Make sure every word is back to rest weight at release.
        tl.to(words, { "--word-weight": 380, duration: 0.20, ease: "sine.inOut" }, 0.78);
      }

      // ---------------------------------------------------------------------
      // Pin the wrap centered in viewport for `+=80%` of viewport scroll.
      // Pin adds its own spacer below, so on either side the pullquote
      // sits naturally between paragraphs — no leftover empty zone.
      // ---------------------------------------------------------------------
      st = ScrollTrigger.create({
        trigger:    wrap,
        start:      "center center",   // pin when wrap's center hits viewport center
        end:        "+=80%",            // 80% of viewport height of scroll = the take-over
        pin:        true,
        pinSpacing: true,
        scrub:      0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        animation:  tl,
      });
    }

    build();

    if (window.ProtoNav && ProtoNav.mountVariants) {
      ProtoNav.mountVariants(["A", "B", "C"], (key) => {
        currentVariant = key;
        document.documentElement.dataset.variant = key;
        requestAnimationFrame(() => {
          build();
          ScrollTrigger.refresh();
        });
      });
    }

    let resizeT;
    window.addEventListener("resize", () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => ScrollTrigger.refresh(), 160);
    });
  });
})();
