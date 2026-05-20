/* Prototype 01 — Receding hero
 *
 * Two pieces of scroll choreography:
 *  1. The featured image at the top scales down and fades out as you scroll
 *     past it (ScrollTrigger scrubbed against scroll position).
 *  2. The article header lines slide up from behind their own baselines when
 *     the header enters the viewport — staggered, played once. Lines are
 *     split + masked by GSAP's SplitText (free as of GSAP 3.13).
 *
 * Native scroll throughout. No pinning, no Lenis.
 */

(() => {
  const mqMobile = window.matchMedia("(max-width: 767px)");
  const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  let heroTrigger = null;
  let splits = [];
  let wasMobile = mqMobile.matches;

  // ---- Load shared article body --------------------------------------------

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

  // ---- Hero animation ------------------------------------------------------

  function buildHeroAnimation() {
    if (heroTrigger) {
      heroTrigger.kill();
      heroTrigger = null;
    }

    const hero = document.querySelector(".hero");
    const img = document.querySelector(".hero-img");
    if (!hero || !img) return;

    gsap.set(img, { clearProps: "transform,opacity" });

    if (mqReduced.matches) return;

    heroTrigger = ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "bottom top",
      scrub: 1,
      invalidateOnRefresh: true,
      animation: gsap.to(img, {
        scale: 0.78,
        autoAlpha: 0,
        ease: "none",
      }),
    });
  }

  // ---- Article-header reveal -----------------------------------------------

  function buildHeaderReveal() {
    if (typeof SplitText === "undefined") {
      console.warn("SplitText not available — header reveal disabled");
      return;
    }
    if (mqReduced.matches) return;

    const selectors = [
      ".article-kicker",
      ".article-title",
      ".article-dek",
      ".article-byline",
    ];

    // Split each element into line-masked rows. `mask: "lines"` wraps each
    // line in an overflow-hidden div (class .split-mask) so the line below
    // can slide up from behind it. `autoSplit: true` re-runs the split on
    // resize / font load — no manual re-measure needed.
    splits = selectors
      .map((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        return SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
        });
      })
      .filter(Boolean);

    const allLines = splits.flatMap((s) => s.lines);
    if (!allLines.length) return;

    // Initial state: every line tucked below its mask. No fade — just hidden
    // by the mask's overflow until they slide up.
    gsap.set(allLines, { yPercent: 100, willChange: "transform" });

    ScrollTrigger.create({
      trigger: ".article-header-block",
      start: "top 82%",
      once: true,
      onEnter: () => {
        gsap.to(allLines, {
          yPercent: 0,
          duration: 1.6,        // longer = smoother
          ease: "expo.out",     // strong out-ease = "settles into place"
          stagger: 0.08,
          onComplete: () => {
            gsap.set(allLines, { willChange: "auto" });
          },
        });
      },
    });
  }

  // ---- Resize --------------------------------------------------------------

  function onBreakpointChange() {
    const nowMobile = mqMobile.matches;
    if (nowMobile === wasMobile) return;
    wasMobile = nowMobile;
    buildHeroAnimation();
    ScrollTrigger.refresh();
  }
  function onResize() {
    if (onResize._t) cancelAnimationFrame(onResize._t);
    onResize._t = requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  // ---- Boot ----------------------------------------------------------------

  async function boot() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      console.error("GSAP / ScrollTrigger failed to load");
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    if (typeof SplitText !== "undefined") {
      gsap.registerPlugin(SplitText);
    }

    await loadArticleBody();

    // Fonts must be ready before SplitText measures lines — otherwise the
    // line wraps are computed against a fallback face and re-flow on swap.
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch (_) {}
    }

    const img = document.querySelector(".hero-img");
    if (img && !img.complete) {
      await new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });
    }

    buildHeroAnimation();
    buildHeaderReveal();

    window.addEventListener("resize", onResize, { passive: true });
    if (mqMobile.addEventListener) {
      mqMobile.addEventListener("change", onBreakpointChange);
    } else if (mqMobile.addListener) {
      mqMobile.addListener(onBreakpointChange);
    }

    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
