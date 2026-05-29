/* shared/articles.js — article switching across the prototype deck
 *
 * The deck can show one of two real Works in Progress essays. Which one a page
 * renders is chosen by a `?article=` query param (default: "spain"). A small
 * pill toggle in the top-right (beside the variant toggle) flips between them
 * by reloading the page with the new param — a reload, not a runtime swap, so
 * each prototype's bespoke GSAP setup boots cleanly against the chosen content.
 *
 * Load this BEFORE a prototype's own script (both `defer`) so `ProtoArticle`
 * is ready when the prototype boots:
 *   <script src="../shared/articles.js" defer></script>
 *   <script src="my-prototype.js" defer></script>
 *
 * A prototype opts in by, early in boot:
 *   ProtoArticle.selectContent();   // prune inline content for the other article
 *   ProtoArticle.applyHeader();     // fill kicker/title/dek/byline/hero from data
 *   ...then fetch ProtoArticle.data.body for the full shared body (01, 02).
 *
 * All paths are relative ("../" resolves from a numbered prototype folder).
 */

(function () {
  const ARTICLES = {
    spain: {
      slug: "spain",
      label: "Spanish city",
      kicker: "Issue 21 · Urbanism",
      title: "Triumph of the Spanish&nbsp;city",
      dek:
        "The traditional European apartment city has declined almost everywhere. " +
        "There is one big exception.",
      bylineName: "Harry Law",
      dateISO: "2026-05-14",
      dateText: "14 May 2026",
      hero: "../assets/images/hero-spain.png",
      heroAlt: "Aerial view of a dense Spanish apartment city",
      body: "../assets/article-content.html",
    },
    molerat: {
      slug: "molerat",
      label: "Mole rat",
      kicker: "Issue 22 · Longevity",
      title: "The perks of being a mole&nbsp;rat",
      dek:
        "The secrets to extending human lifespans might lie in the animals that " +
        "can already live for centuries.",
      bylineName: "Aria Schrecker",
      dateISO: "2026-02-04",
      dateText: "4 February 2026",
      hero: "../assets/images/molerat/hero-tiger.jpg",
      heroAlt:
        "Illustration of a tiger — long-lived animals hold clues to human lifespan",
      body: "../assets/article-content-molerat.html",
    },
  };

  const DEFAULT = "spain";

  function currentSlug() {
    const q = new URLSearchParams(location.search).get("article");
    return ARTICLES[q] ? q : DEFAULT;
  }

  const slug = currentSlug();
  const data = ARTICLES[slug];
  document.documentElement.dataset.article = slug;

  // --- Content selection ---------------------------------------------------
  // Prototypes 03/04/05 hold both articles' bespoke content inline, each block
  // tagged data-article="spain|molerat". Remove the inactive set before the
  // prototype reads [data-body] / figures / footnotes so its selectors resolve
  // to exactly the active article.
  function selectContent(root) {
    const scope = root || document;
    scope.querySelectorAll("[data-article]").forEach((node) => {
      // Skip the <html> element (it carries the active slug, not content) and
      // anything inside the page chrome (the toggle buttons carry a slug too).
      if (node === document.documentElement) return;
      if (node.closest(".proto-chrome")) return;
      if (node.dataset.article !== slug) node.remove();
    });
  }

  // --- Header application ---------------------------------------------------
  function setText(sel, text) {
    const el = document.querySelector(sel);
    if (el) el.textContent = text;
  }
  function setHTML(sel, html) {
    const el = document.querySelector(sel);
    if (el) el.innerHTML = html;
  }

  function applyHeader() {
    setHTML(".article-title", data.title);
    setText(".article-kicker", data.kicker);
    setText(".article-dek", data.dek); // no-op where a prototype omits the dek

    const name = document.querySelector(".byline-name");
    if (name) name.textContent = data.bylineName;
    const time = document.querySelector(".article-byline time");
    if (time) {
      time.setAttribute("datetime", data.dateISO);
      time.textContent = data.dateText;
    }

    const hero = document.querySelector(".hero-img");
    if (hero) {
      hero.setAttribute("src", data.hero);
      hero.setAttribute("alt", data.heroAlt);
    }

    // Reflect the title in the document <title>, keeping any suffix after "—".
    const plain = data.title.replace(/&nbsp;/g, " ");
    if (document.title.includes("—")) {
      document.title = plain + " — " + document.title.split("—").slice(1).join("—").trim();
    }
  }

  // --- Toggle UI ------------------------------------------------------------
  function go(targetSlug) {
    if (targetSlug === slug) return;
    const url = new URL(location.href);
    if (targetSlug === DEFAULT) url.searchParams.delete("article");
    else url.searchParams.set("article", targetSlug);
    location.href = url.toString();
  }

  function controlsHost() {
    const chrome =
      document.querySelector(".proto-chrome") ||
      (window.ProtoNav && ProtoNav.mountChrome && ProtoNav.mountChrome());
    if (!chrome) return null;
    let host = chrome.querySelector(".proto-controls");
    if (!host) {
      host = document.createElement("div");
      host.className = "proto-controls";
      chrome.appendChild(host);
    }
    return host;
  }

  function mountToggle() {
    if (document.body.dataset.protoChrome === "off") return;
    const host = controlsHost();
    if (!host || host.querySelector(".article-toggle")) return;

    const group = document.createElement("div");
    group.className = "variant-toggle article-toggle";
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", "Article");

    Object.values(ARTICLES).forEach((a) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = a.label;
      btn.dataset.target = a.slug;
      btn.setAttribute("aria-pressed", a.slug === slug ? "true" : "false");
      btn.addEventListener("click", () => go(a.slug));
      group.appendChild(btn);
    });

    // Article toggle sits before the variant toggle (left of it) in the host.
    host.insertBefore(group, host.firstChild);
  }

  // Run synchronously at script execution. Because this script is `defer`red
  // and loaded BEFORE each prototype's own script, the document is already
  // parsed here and pruning/header-fill happen before the prototype captures
  // its selectors — critical for 03/04/05, which read DOM at top level.
  selectContent(document);
  applyHeader();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountToggle);
  } else {
    mountToggle();
  }

  window.ProtoArticle = {
    slug,
    data,
    articles: ARTICLES,
    selectContent,
    applyHeader,
  };
})();
