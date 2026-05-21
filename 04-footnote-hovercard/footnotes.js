/* 04-footnote-hovercard/footnotes.js
 *
 * Three footnote variants:
 *   A — Floating card beside anchor (hover to preview, click to pin)
 *   B — Margin rail with scroll-synced notes
 *   C — Bottom drawer collecting encountered footnotes
 */

(function () {
  "use strict";

  const isTouchDevice = matchMedia("(hover: none) and (pointer: coarse)").matches;
  const isNarrow = () => window.innerWidth <= 640;

  let abortController = null;

  function getFootnotes() {
    const items = document.querySelectorAll(".footnotes-source li");
    const map = {};
    items.forEach((li) => {
      const id = li.id.replace("fn-", "");
      map[id] = li.innerHTML.trim();
    });
    return map;
  }

  // ── Variant A: Floating card ──

  const CardManager = {
    cards: new Map(),
    hideTimer: null,

    create(fnId, content, anchorEl) {
      if (this.cards.has(fnId)) return this.cards.get(fnId).el;

      const card = document.createElement("div");
      card.className = "fn-card";
      card.dataset.fn = fnId;
      card.innerHTML = `
        <p class="fn-card-num">Footnote ${fnId}</p>
        <p class="fn-card-body">${content}</p>
        <button class="fn-card-close" aria-label="Close footnote">&times;</button>
      `;

      card.querySelector(".fn-card-close").addEventListener("click", () => this.remove(fnId));

      card.addEventListener("mouseenter", () => clearTimeout(this.hideTimer));
      card.addEventListener("mouseleave", () => {
        const entry = this.cards.get(fnId);
        if (entry && !entry.pinned) this.scheduleHide(fnId);
      });

      card.addEventListener("click", (e) => {
        if (e.target.closest(".fn-card-close")) return;
        this.pin(fnId);
      });

      document.body.appendChild(card);
      this.position(card, anchorEl);

      requestAnimationFrame(() => {
        gsap.to(card, { opacity: 1, y: 0, duration: 0.2, ease: "power3.out" });
        card.classList.add("is-visible");
      });

      this.cards.set(fnId, { el: card, pinned: false, anchor: anchorEl });
      return card;
    },

    position(card, anchor) {
      const r = anchor.getBoundingClientRect();
      const cw = card.offsetWidth || 300;
      const ch = card.offsetHeight || 200;
      const pad = 12;

      let left = r.right + pad;
      let top = r.top - 8;

      if (left + cw > window.innerWidth - pad) {
        left = r.left - cw - pad;
      }
      if (left < pad) {
        left = r.left;
        top = r.bottom + pad;
      }
      if (top + ch > window.innerHeight - pad) {
        top = window.innerHeight - ch - pad;
      }
      if (top < pad) top = pad;

      card.style.left = left + "px";
      card.style.top = top + "px";
    },

    pin(fnId) {
      const entry = this.cards.get(fnId);
      if (!entry || entry.pinned) return;
      entry.pinned = true;
      entry.el.classList.add("is-pinned");
    },

    scheduleHide(fnId) {
      clearTimeout(this.hideTimer);
      this.hideTimer = setTimeout(() => this.remove(fnId), 250);
    },

    remove(fnId) {
      const entry = this.cards.get(fnId);
      if (!entry) return;
      gsap.to(entry.el, {
        opacity: 0, y: 4, duration: 0.15, ease: "power2.in",
        onComplete: () => {
          entry.el.remove();
          this.cards.delete(fnId);
        },
      });
    },

    removeAll() {
      this.cards.forEach((entry) => entry.el.remove());
      this.cards.clear();
    },
  };

  function initVariantA(footnotes, signal) {
    const anchors = document.querySelectorAll(".fn-anchor");

    anchors.forEach((anchor) => {
      const fnId = anchor.dataset.fn;
      if (!footnotes[fnId]) return;

      if (isTouchDevice || isNarrow()) {
        anchor.addEventListener("click", (e) => {
          e.preventDefault();
          toggleInlineExpand(anchor, fnId, footnotes[fnId]);
        }, { signal });
        return;
      }

      anchor.addEventListener("mouseenter", () => {
        clearTimeout(CardManager.hideTimer);
        CardManager.create(fnId, footnotes[fnId], anchor);
      }, { signal });

      anchor.addEventListener("mouseleave", () => {
        if (CardManager.cards.has(fnId) && !CardManager.cards.get(fnId).pinned) {
          CardManager.scheduleHide(fnId);
        }
      }, { signal });

      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        if (!CardManager.cards.has(fnId)) {
          CardManager.create(fnId, footnotes[fnId], anchor);
        }
        CardManager.pin(fnId);
      }, { signal });

      anchor.addEventListener("focus", () => {
        CardManager.create(fnId, footnotes[fnId], anchor);
      }, { signal });

      anchor.addEventListener("blur", () => {
        if (CardManager.cards.has(fnId) && !CardManager.cards.get(fnId).pinned) {
          CardManager.scheduleHide(fnId);
        }
      }, { signal });
    });
  }

  // ── Mobile: inline expand ──

  function toggleInlineExpand(anchor, fnId, content) {
    const existing = anchor.parentElement.querySelector(`.fn-inline-expand[data-fn="${fnId}"]`);
    if (existing) {
      existing.classList.toggle("is-open");
      return;
    }

    const el = document.createElement("div");
    el.className = "fn-inline-expand is-open";
    el.dataset.fn = fnId;
    el.innerHTML = `<span class="fn-inline-num">Footnote ${fnId}</span>${content}`;

    const parent = anchor.closest("p") || anchor.parentElement;
    parent.after(el);
  }

  // ── Variant B: Margin rail ──

  function initVariantB(footnotes, signal) {
    const rail = document.querySelector("[data-margin-rail]");
    if (!rail) return;

    rail.removeAttribute("hidden");
    rail.innerHTML = "";

    const anchors = document.querySelectorAll(".fn-anchor");
    const railNotes = [];

    anchors.forEach((anchor) => {
      const fnId = anchor.dataset.fn;
      if (!footnotes[fnId]) return;

      const note = document.createElement("div");
      note.className = "rail-note";
      note.dataset.fn = fnId;
      note.innerHTML = `
        <p class="rail-note-num">Footnote ${fnId}</p>
        <p class="rail-note-body">${footnotes[fnId]}</p>
      `;
      rail.appendChild(note);
      railNotes.push({ anchor, note, fnId });
    });

    function highlightNearest() {
      const viewCenter = window.innerHeight / 2;
      let closest = null;
      let closestDist = Infinity;

      railNotes.forEach(({ anchor, note }) => {
        const r = anchor.getBoundingClientRect();
        const dist = Math.abs(r.top - viewCenter);
        note.classList.remove("is-active");
        if (dist < closestDist) {
          closestDist = dist;
          closest = note;
        }
      });

      if (closest) closest.classList.add("is-active");
    }

    highlightNearest();
    window.addEventListener("scroll", highlightNearest, { passive: true, signal });

    anchors.forEach((anchor) => {
      const fnId = anchor.dataset.fn;
      anchor.addEventListener("mouseenter", () => {
        const note = rail.querySelector(`.rail-note[data-fn="${fnId}"]`);
        if (note) note.classList.add("is-active");
      }, { signal });
      anchor.addEventListener("mouseleave", highlightNearest, { signal });
    });
  }

  function teardownVariantB() {
    const rail = document.querySelector("[data-margin-rail]");
    if (rail) {
      rail.setAttribute("hidden", "");
      rail.innerHTML = "";
    }
  }

  // ── Variant C: Bottom drawer ──

  function initVariantC(footnotes, signal) {
    const drawer = document.querySelector("[data-drawer]");
    const drawerBody = document.querySelector("[data-drawer-body]");
    if (!drawer || !drawerBody) return;

    drawer.removeAttribute("hidden");
    drawerBody.innerHTML = "";

    const encountered = new Set();

    drawer.querySelector(".drawer-close").addEventListener("click", () => {
      drawer.classList.remove("is-open");
    }, { signal });

    const anchors = document.querySelectorAll(".fn-anchor");
    anchors.forEach((anchor) => {
      const fnId = anchor.dataset.fn;
      if (!footnotes[fnId]) return;

      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        addToDrawer(fnId, footnotes[fnId]);
        drawer.classList.add("is-open");

        drawerBody.querySelectorAll(".drawer-note").forEach((n) => n.classList.remove("is-highlight"));
        const target = drawerBody.querySelector(`.drawer-note[data-fn="${fnId}"]`);
        if (target) {
          target.classList.add("is-highlight");
          target.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, { signal });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const fnId = entry.target.dataset.fn;
            if (fnId && footnotes[fnId]) addToDrawer(fnId, footnotes[fnId]);
          }
        });
      },
      { threshold: 0.5 }
    );

    anchors.forEach((a) => observer.observe(a));
    signal.addEventListener("abort", () => observer.disconnect());

    function addToDrawer(fnId, content) {
      if (encountered.has(fnId)) return;
      encountered.add(fnId);

      const note = document.createElement("div");
      note.className = "drawer-note";
      note.dataset.fn = fnId;
      note.innerHTML = `
        <span class="drawer-note-num">${fnId}</span>
        <p class="drawer-note-body">${content}</p>
      `;
      drawerBody.appendChild(note);
    }
  }

  function teardownVariantC() {
    const drawer = document.querySelector("[data-drawer]");
    if (drawer) {
      drawer.setAttribute("hidden", "");
      drawer.classList.remove("is-open");
    }
    const drawerBody = document.querySelector("[data-drawer-body]");
    if (drawerBody) drawerBody.innerHTML = "";
  }

  // ── Variant switching ──

  let currentVariant = null;

  function activateVariant(key) {
    if (currentVariant === key) return;

    if (abortController) abortController.abort();
    abortController = new AbortController();
    const signal = abortController.signal;

    CardManager.removeAll();
    teardownVariantB();
    teardownVariantC();
    document.querySelectorAll(".fn-inline-expand").forEach((el) => el.remove());

    document.documentElement.dataset.variant = key;
    currentVariant = key;

    const footnotes = getFootnotes();

    switch (key) {
      case "A":
        initVariantA(footnotes, signal);
        break;
      case "B":
        initVariantB(footnotes, signal);
        initVariantA(footnotes, signal);
        break;
      case "C":
        initVariantC(footnotes, signal);
        break;
    }
  }

  // ── Init ──

  function init() {
    ProtoNav.mountVariants(["A", "B", "C"], activateVariant);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
