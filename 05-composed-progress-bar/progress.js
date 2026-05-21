(function () {
  "use strict";
  const body = document.querySelector("[data-body]");
  if (!body) return;

  const CIRCUMFERENCE = 2 * Math.PI * 20; // r=20 on the SVG circle

  // ── Lenis smooth scroll ───────────────────────────
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.defaults({ scroller: window });

  // ── Collect landmarks ─────────────────────────────
  const sections = [];
  const footnotes = [];
  const figures = [];

  body.querySelectorAll("h2.section-heading").forEach((el, i) => {
    sections.push({ el, title: el.textContent.trim(), index: i });
  });

  body.querySelectorAll(".fn-anchor").forEach((el) => {
    footnotes.push({ el, num: el.dataset.fn });
  });

  body.querySelectorAll("figure").forEach((el, i) => {
    figures.push({ el, index: i });
  });

  const allSectionNames = ["Introduction", ...sections.map((s) => s.title)];
  const totalSections = allSectionNames.length;

  // ── Offset cache ──────────────────────────────────
  let articleTop, articleHeight, offsets;

  function cacheOffsets() {
    const scrollY = window.scrollY;
    articleTop = body.getBoundingClientRect().top + scrollY;
    articleHeight = body.offsetHeight;

    offsets = {
      sections: sections.map((s) => ({
        ...s,
        pct: (s.el.getBoundingClientRect().top + scrollY - articleTop) / articleHeight,
      })),
      footnotes: footnotes.map((f) => ({
        ...f,
        pct: (f.el.getBoundingClientRect().top + scrollY - articleTop) / articleHeight,
      })),
      figures: figures.map((f) => ({
        ...f,
        pct: (f.el.getBoundingClientRect().top + scrollY - articleTop) / articleHeight,
      })),
    };
  }

  cacheOffsets();
  window.addEventListener("resize", cacheOffsets);

  // ── Build markers ─────────────────────────────────

  function buildRailMarkers() {
    const container = document.querySelector("[data-rail-markers]");
    if (!container) return;
    container.innerHTML = "";

    offsets.sections.forEach((s) => {
      const m = markerEl("section", s.pct, s.title);
      container.appendChild(m);
    });

    offsets.footnotes.forEach((f) => {
      const m = markerEl("footnote", f.pct, "fn " + f.num);
      container.appendChild(m);
    });

    offsets.figures.forEach((f) => {
      const m = markerEl("figure", f.pct, "fig " + (f.index + 1));
      container.appendChild(m);
    });
  }

  function markerEl(type, pct, label) {
    const wrap = document.createElement("div");
    wrap.className = "rail-marker";
    wrap.dataset.type = type;
    wrap.style.top = (pct * 100) + "%";

    const tick = document.createElement("span");
    tick.className = "rail-marker-tick";
    wrap.appendChild(tick);

    if (label) {
      const lbl = document.createElement("span");
      lbl.className = "rail-marker-label";
      lbl.textContent = label;
      wrap.appendChild(lbl);
    }

    wrap.addEventListener("click", (e) => {
      e.stopPropagation();
      const targetY = articleTop + pct * articleHeight - 80;
      lenis.scrollTo(targetY, { duration: 1.2 });
    });

    return wrap;
  }

  function buildBarMarkers() {
    const container = document.querySelector("[data-bar-markers]");
    if (!container) return;
    container.innerHTML = "";

    offsets.sections.forEach((s) => {
      const m = barMarkerEl("section", s.pct, s.title);
      container.appendChild(m);
    });

    offsets.footnotes.forEach((f) => {
      const m = barMarkerEl("footnote", f.pct, null);
      container.appendChild(m);
    });

    offsets.figures.forEach((f) => {
      const m = barMarkerEl("figure", f.pct, null);
      container.appendChild(m);
    });
  }

  function barMarkerEl(type, pct, label) {
    const wrap = document.createElement("div");
    wrap.className = "bar-marker";
    wrap.dataset.type = type;
    wrap.style.left = (pct * 100) + "%";

    const tick = document.createElement("span");
    tick.className = "bar-marker-tick";
    wrap.appendChild(tick);

    if (label) {
      const lbl = document.createElement("span");
      lbl.className = "bar-marker-label";
      lbl.textContent = label;
      wrap.appendChild(lbl);
    }

    wrap.addEventListener("click", (e) => {
      e.stopPropagation();
      const targetY = articleTop + pct * articleHeight - 80;
      lenis.scrollTo(targetY, { duration: 1.2 });
    });

    return wrap;
  }

  buildRailMarkers();
  buildBarMarkers();

  // ── Rail click-to-scroll ──────────────────────────
  const rail = document.querySelector("[data-progress-rail]");
  if (rail) {
    rail.addEventListener("click", (e) => {
      const rect = rail.getBoundingClientRect();
      const pct = (e.clientY - rect.top) / rect.height;
      const targetY = articleTop + pct * articleHeight - 80;
      lenis.scrollTo(targetY, { duration: 1.2 });
    });
  }

  const barTop = document.querySelector("[data-progress-top]");
  if (barTop) {
    barTop.addEventListener("click", (e) => {
      const rect = barTop.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      const targetY = articleTop + pct * articleHeight - 80;
      lenis.scrollTo(targetY, { duration: 1.2 });
    });
  }

  // ── Scroll progress update ────────────────────────
  const railFill = document.querySelector("[data-rail-fill]");
  const barFill = document.querySelector("[data-bar-fill]");
  const floatRing = document.querySelector("[data-float-ring]");
  const floatSection = document.querySelector("[data-float-section]");
  const floatMeta = document.querySelector("[data-float-meta]");
  const floatEl = document.querySelector("[data-progress-float]");

  let floatShown = false;

  ScrollTrigger.create({
    trigger: body,
    start: "top 80%",
    end: "bottom bottom",
    onUpdate: (self) => {
      const pct = Math.max(0, Math.min(1, self.progress));

      if (railFill) railFill.style.height = (pct * 100) + "%";
      if (barFill) barFill.style.width = (pct * 100) + "%";

      if (floatRing) {
        floatRing.style.strokeDashoffset = CIRCUMFERENCE * (1 - pct);
      }

      // Determine current section
      let currentIdx = 0;
      for (let i = offsets.sections.length - 1; i >= 0; i--) {
        if (pct >= offsets.sections[i].pct - 0.02) {
          currentIdx = i + 1;
          break;
        }
      }

      if (floatSection) floatSection.textContent = allSectionNames[currentIdx];
      if (floatMeta) floatMeta.textContent = "Section " + (currentIdx + 1) + " of " + totalSections;

      // Show/hide float module
      if (floatEl) {
        if (pct > 0.02 && pct < 0.98) {
          if (!floatShown) {
            floatEl.classList.add("is-visible");
            floatShown = true;
          }
        } else {
          if (floatShown) {
            floatEl.classList.remove("is-visible");
            floatShown = false;
          }
        }
      }
    },
  });

  // ── Variant toggle ────────────────────────────────
  function setVariant(key) {
    document.documentElement.dataset.variant = key;

    const railEl = document.querySelector("[data-progress-rail]");
    const topEl = document.querySelector("[data-progress-top]");
    const floatNav = document.querySelector("[data-progress-float]");

    if (railEl) railEl.hidden = key !== "A";
    if (topEl) topEl.hidden = key !== "B";
    if (floatNav) floatNav.hidden = key !== "C";

    // On mobile, variant A falls back to top bar
    if (key === "A" && window.innerWidth <= 768) {
      if (topEl) topEl.hidden = false;
    }

    ScrollTrigger.refresh();
  }

  ProtoNav.mountVariants(["A", "B", "C"], setVariant);
})();
