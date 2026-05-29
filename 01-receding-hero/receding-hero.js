/* Prototype 01 — Receding hero
 *
 * Variant A — Receding image. Image scales down and fades out on scroll;
 *   article header lines reveal via SplitText line masks. (Original.)
 *
 * Variant B — Title card. The headline is composited over the lower third of
 *   the hero. Scroll plays a pinned two-act sequence:
 *     Act 1 — anchor: image breathes / Ken-Burns drifts up, title holds,
 *             accent rule + kicker slide into place.
 *     Act 2 — liftoff: title decomposes into word-shards that rise like end
 *             credits with random stagger; image continues parallax up + fades.
 *   Below the pin: dek + byline arrive cleanly with line masks.
 *
 * Variant C — placeholder, currently mirrors A (TBD).
 *
 * Variants are switched via shared/nav.js ProtoNav.mountVariants(). Each switch
 * tears down all triggers + splits and rebuilds from scratch.
 */

(() => {
  const mqMobile = window.matchMedia("(max-width: 767px)");
  const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  // --- Teardown registry ---------------------------------------------------
  // Anything we build (ScrollTriggers, SplitTexts, cloned DOM, inline styles)
  // gets registered here so a variant switch is a clean reset.

  const teardownStack = [];
  function register(fn) { teardownStack.push(fn); }
  function teardown() {
    while (teardownStack.length) {
      try { teardownStack.pop()(); } catch (_) {}
    }
    // Belt-and-braces: kill any orphan ScrollTriggers we might have missed.
    ScrollTrigger.getAll().forEach((t) => t.kill());
    // Reset elements we always touch.
    document.querySelectorAll(
      ".hero-img, .article-title, .article-kicker, .article-dek, .article-byline"
    ).forEach((el) => gsap.set(el, { clearProps: "all" }));
    document.querySelectorAll(".hero-overlay").forEach((el) => el.remove());
    document.documentElement.classList.remove("v-b-active");
  }

  // --- Smooth scroll (Lenis) ------------------------------------------------
  // Wires Lenis to GSAP's ticker so its RAF loop is the single source of truth
  // for animation timing. Lenis's `scroll` event drives ScrollTrigger.update()
  // so pinned sections stay perfectly in step with the eased scroll position
  // — no double-RAF jitter, no missed updates during fast flings.

  let lenis = null;
  const expoOut = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

  function initSmoothScroll() {
    if (typeof Lenis === "undefined") return null;
    if (mqReduced.matches) return null; // honor user preference

    lenis = new Lenis({
      duration: 1.05,            // glide length — long enough to feel inertial
      easing: expoOut,
      smoothWheel: true,
      smoothTouch: false,        // touch already has native momentum — leave it
    });

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0); // let Lenis own pacing

    return lenis;
  }

  // --- Load shared article body --------------------------------------------

  async function loadArticleBody() {
    const mount = document.getElementById("article-mount");
    if (!mount) return;
    try {
      const src =
        (window.ProtoArticle && ProtoArticle.data.body) ||
        "../assets/article-content.html";
      const res = await fetch(src);
      mount.innerHTML = await res.text();
    } catch (err) {
      console.warn("article-content.html not loaded:", err);
    }
  }

  // ========================================================================
  // VARIANT A — Receding image (original)
  // ========================================================================

  function buildVariantA() {
    const hero = document.querySelector(".hero");
    const img = document.querySelector(".hero-img");
    if (!hero || !img) return;

    if (!mqReduced.matches) {
      const trigger = ScrollTrigger.create({
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: 0.4,              // tight scrub — Lenis handles the easing
        invalidateOnRefresh: true,
        animation: gsap.to(img, { scale: 0.78, autoAlpha: 0, ease: "none" }),
      });
      register(() => trigger.kill());
    }

    buildLineRevealHeader([
      ".article-kicker",
      ".article-title",
      ".article-dek",
      ".article-byline",
    ]);

    buildBodyReveal();
  }

  // ========================================================================
  // VARIANT B — Title card (cinematic)
  // ========================================================================

  function buildVariantB() {
    const hero = document.querySelector(".hero");
    const img = document.querySelector(".hero-img");
    const sourceTitle = document.querySelector(".article-title");
    const sourceKicker = document.querySelector(".article-kicker");
    if (!hero || !img || !sourceTitle) return;

    document.documentElement.classList.add("v-b-active");

    // Compose the overlay block inside .hero:
    //   <div class="hero-overlay">
    //     <span class="hero-overlay-rule"></span>
    //     <p class="hero-overlay-kicker">…</p>
    //     <h1 class="hero-overlay-title">…</h1>
    //   </div>

    const overlay = document.createElement("div");
    overlay.className = "hero-overlay";

    const rule = document.createElement("span");
    rule.className = "hero-overlay-rule";
    overlay.appendChild(rule);

    if (sourceKicker) {
      const kickerClone = document.createElement("p");
      kickerClone.className = "hero-overlay-kicker";
      kickerClone.textContent = sourceKicker.textContent;
      overlay.appendChild(kickerClone);
    }

    const titleClone = document.createElement("h1");
    titleClone.className = "hero-overlay-title display";
    titleClone.innerHTML = sourceTitle.innerHTML;
    overlay.appendChild(titleClone);

    hero.appendChild(overlay);
    register(() => overlay.remove());

    // Wrap the hero in a tall "stage" so we can use CSS position:sticky on
    // the hero itself. The stage's height defines the scroll runway; the
    // sticky hero stays glued to the top of the viewport for that whole
    // runway, then releases. Native sticky is buttery-smooth (no DOM
    // mutation like GSAP's pin) and lets Lenis own the easing end-to-end.
    const stage = document.createElement("div");
    stage.className = "hero-stage";
    hero.parentNode.insertBefore(stage, hero);
    stage.appendChild(hero);
    register(() => {
      // Unwrap on teardown so variant A's layout is untouched.
      if (stage.parentNode) {
        stage.parentNode.insertBefore(hero, stage);
        stage.remove();
      }
    });

    if (mqReduced.matches) {
      // Just reveal everything statically.
      buildLineRevealHeader([".article-dek", ".article-byline"]);
      return;
    }

    // -- Split the overlay title into words wrapped in line-masks. -----------
    // Words = animation unit (cinematic shard), lines = mask container so
    // descenders don't ghost outside their row during the ascent.
    const titleSplit = SplitText.create(titleClone, {
      type: "words,lines",
      mask: "lines",
      wordsClass: "hero-overlay-word",
      linesClass: "hero-overlay-line",
      autoSplit: false,
    });
    register(() => titleSplit.revert());

    const words = titleSplit.words;
    gsap.set(words, { willChange: "transform, opacity" });
    gsap.set(rule, { scaleX: 0, transformOrigin: "0% 50%" });
    gsap.set([".hero-overlay-kicker"], { autoAlpha: 0, y: 8 });

    // -- Intro: kicker + rule + title-words settle in on load ----------------
    // Title words are already at rest (no initial offset) — we let the image
    // be the stage curtain rising. Kicker + rule are the typographic "slate."
    const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
    intro
      .from(words, { yPercent: 110, duration: 1.4, stagger: 0.035 }, 0)
      .to(rule, { scaleX: 1, duration: 1.1, ease: "power3.out" }, 0.15)
      .to(".hero-overlay-kicker", { autoAlpha: 1, y: 0, duration: 0.9 }, 0.35);
    register(() => intro.kill());

    // -- Sticky-driven cinematic sequence ----------------------------------
    // The hero is CSS position:sticky inside .hero-stage (180vh tall, hero
    // is 100vh). For 80vh of scroll, hero stays glued to the top of the
    // viewport — visible and fully in frame. Across THAT range the image
    // scales gently from 1.0 → 1.2 and the words ascend. The instant sticky
    // releases, the hero scrolls out naturally over the next 80vh, and the
    // article header (which sits right below .hero-stage in the document)
    // arrives — no gap, no snap, no pin wrapper, no dead zone where the
    // scrollbar moves but the screen doesn't. The user's scroll
    // continuously drives visible motion: the zoom (during sticky), then
    // the page itself scrolling the zoomed image out (after release).
    const heroTl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: "+=80%",            // 80vh — matches the sticky range exactly
        scrub: 0.4,              // tight scrub, Lenis handles the smoothing
        invalidateOnRefresh: true,
      },
    });
    register(() => {
      if (heroTl.scrollTrigger) heroTl.scrollTrigger.kill();
      heroTl.kill();
    });

    // Image: a restrained, continuous push-in across the WHOLE sticky range.
    // No parallax drift — sticky already keeps the hero visually anchored,
    // so we let scale do all the work. transform-origin: 50% 50% gives a
    // true "camera dolly forward" feeling. duration: 1 makes the tween span
    // the entire timeline so the zoom keeps advancing through the very last
    // moment before sticky releases. The image is never faded. Scale tops
    // out at 1.2 — a quiet drift forward, more breath than dolly.
    heroTl.to(img, { scale: 1.2, duration: 1 }, 0);

    // Words decompose across the first ~65% of the sticky range. By the
    // time scroll progress is 0.65, the words are gone and the user sees
    // only the dramatically zoomed image — a moment of pure visual climax
    // before sticky releases at progress 1.0.
    heroTl.to(
      words,
      {
        yPercent: -180,
        autoAlpha: 0,
        stagger: { each: 0.04, from: "random" },
        duration: 0.55,
      },
      0.05
    );

    // Kicker + accent rule lift away with the same gentle hand.
    heroTl.to(
      [".hero-overlay-kicker", rule],
      { autoAlpha: 0, y: -24, duration: 0.35 },
      0.1
    );

    // Below-the-fold header reveal: dek + byline only (title + kicker live
    // in the hero now). Triggered when the article block enters viewport
    // *after* the pin releases — so it feels like a second movement.
    buildLineRevealHeader([".article-dek", ".article-byline"]);

    buildBodyReveal();
  }

  // ========================================================================
  // VARIANT C — placeholder
  // ========================================================================

  function buildVariantC() {
    // TBD — for now, mirror A so the toggle has three working positions.
    buildVariantA();
  }

  // ========================================================================
  // Shared: SplitText line-mask reveal for header rows
  // ========================================================================

  function buildLineRevealHeader(selectors) {
    if (typeof SplitText === "undefined" || mqReduced.matches) return;

    const splits = selectors
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

    splits.forEach((s) => register(() => s.revert()));

    const allLines = splits.flatMap((s) => s.lines);
    if (!allLines.length) return;

    gsap.set(allLines, { yPercent: 100, willChange: "transform" });

    const target = document.querySelector(selectors[0])?.closest(
      ".article-header-block"
    ) || document.querySelector(".article-header-block");

    const trigger = ScrollTrigger.create({
      trigger: target,
      start: "top 82%",
      once: true,
      onEnter: () => {
        gsap.to(allLines, {
          yPercent: 0,
          duration: 1.6,
          ease: "expo.out",
          stagger: 0.08,
          onComplete: () => gsap.set(allLines, { willChange: "auto" }),
        });
      },
    });
    register(() => trigger.kill());
  }

  // ========================================================================
  // Shared: Article body reveal
  // ========================================================================
  //
  // Gentle scroll-in for each block of the article body (paragraphs, headings,
  // figures, footnote list items). Each element starts a hair below its
  // resting position with 0 opacity, then settles in as it enters the
  // viewport. Subtle — editorial, not flashy. Uses ScrollTrigger.batch so
  // adjacent blocks reveal in small groups instead of one-at-a-time, which
  // would feel pedantic for long-form reading.

  function buildBodyReveal() {
    if (mqReduced.matches) return;

    const mount = document.getElementById("article-mount");
    if (!mount) return;

    const targets = mount.querySelectorAll(
      ".article > p, .article > h2, .article > h3, .article > figure, .article > blockquote, .footnotes > li"
    );
    if (!targets.length) return;

    gsap.set(targets, { y: 14, autoAlpha: 0, willChange: "transform, opacity" });

    const batched = ScrollTrigger.batch(targets, {
      start: "top 88%",
      once: true,
      batchMax: 4,        // up to 4 elements reveal together as a small group
      interval: 0.08,     // group together anything that enters within 80ms
      onEnter: (els) => {
        gsap.to(els, {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.07,
          onComplete: () => gsap.set(els, { willChange: "auto" }),
        });
      },
    });

    register(() => batched.forEach((t) => t.kill()));
  }

  // ========================================================================
  // Variant routing
  // ========================================================================

  const VARIANTS = { A: buildVariantA, B: buildVariantB, C: buildVariantC };
  let activeVariant = "A";

  function switchVariant(key) {
    if (!VARIANTS[key]) return;
    teardown();
    activeVariant = key;
    document.documentElement.dataset.variant = key;
    VARIANTS[key]();
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  // --- Resize --------------------------------------------------------------

  let wasMobile = mqMobile.matches;
  function onBreakpointChange() {
    const nowMobile = mqMobile.matches;
    if (nowMobile === wasMobile) return;
    wasMobile = nowMobile;
    switchVariant(activeVariant); // full rebuild — pin math depends on vh
  }
  function onResize() {
    if (onResize._t) cancelAnimationFrame(onResize._t);
    onResize._t = requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  // --- Boot ----------------------------------------------------------------

  async function boot() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      console.error("GSAP / ScrollTrigger failed to load");
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    if (typeof SplitText !== "undefined") gsap.registerPlugin(SplitText);

    // Fill header + hero from the active article (spain | molerat) before any
    // SplitText/measurement runs against them.
    if (window.ProtoArticle) ProtoArticle.applyHeader();

    // Smooth scroll first — ScrollTrigger needs to know about Lenis before
    // any triggers are created so its scroll listener uses Lenis's position.
    initSmoothScroll();

    await loadArticleBody();

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

    // Mount the variant toggle. Default = B (the new one we want to show).
    const initial = "B";
    if (window.ProtoNav && typeof ProtoNav.mountVariants === "function") {
      ProtoNav.mountVariants(["A", "B", "C"], switchVariant, initial);
    } else {
      switchVariant(initial);
    }

    window.addEventListener("resize", onResize, { passive: true });
    if (mqMobile.addEventListener) {
      mqMobile.addEventListener("change", onBreakpointChange);
    } else if (mqMobile.addListener) {
      mqMobile.addListener(onBreakpointChange);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
