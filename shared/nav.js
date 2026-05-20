/* shared/nav.js — prototype chrome behavior
 *
 * Injects "← Back to index" link (top-left) on every prototype page.
 * Provides an optional variant-toggle component that prototypes can opt into.
 *
 * Usage in a prototype:
 *   <script src="../shared/nav.js" defer></script>
 *
 *   // Optional variant toggle:
 *   ProtoNav.mountVariants(['A', 'B', 'C'], (key) => {
 *     document.documentElement.dataset.variant = key;
 *   });
 *
 * Conventions:
 *  - All paths relative ("../" works from a numbered prototype folder).
 *  - Chrome uses mix-blend-mode: difference so it reads on any background.
 */

(function () {
  const ROOT = "../";

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") node.className = v;
      else if (k.startsWith("on") && typeof v === "function") {
        node.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (v !== false && v != null) {
        node.setAttribute(k, v);
      }
    }
    for (const c of children) {
      if (c == null) continue;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return node;
  }

  function mountChrome() {
    if (document.querySelector(".proto-chrome")) return;

    const back = el(
      "a",
      { class: "proto-back", href: ROOT + "index.html" },
      el("span", { class: "arrow" }, "←"),
      "Back to index"
    );

    const chrome = el("div", { class: "proto-chrome" }, back);
    document.body.appendChild(chrome);
    return chrome;
  }

  function mountVariants(keys, onChange, initial) {
    const chrome = document.querySelector(".proto-chrome") || mountChrome();
    let active = initial || keys[0];

    const group = el("div", {
      class: "variant-toggle",
      role: "group",
      "aria-label": "Variant",
    });

    const buttons = keys.map((k) =>
      el(
        "button",
        {
          type: "button",
          "aria-pressed": k === active ? "true" : "false",
          "data-variant": k,
          onClick: () => set(k),
        },
        k
      )
    );
    buttons.forEach((b) => group.appendChild(b));
    chrome.appendChild(group);

    function set(k) {
      active = k;
      buttons.forEach((b) =>
        b.setAttribute("aria-pressed", b.dataset.variant === k ? "true" : "false")
      );
      if (typeof onChange === "function") onChange(k);
    }

    // initial fire
    if (typeof onChange === "function") onChange(active);

    return { set, get: () => active };
  }

  // Auto-mount on prototype pages (anything not the root index)
  function autoMount() {
    if (document.body.dataset.protoChrome === "off") return;
    mountChrome();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoMount);
  } else {
    autoMount();
  }

  window.ProtoNav = { mountChrome, mountVariants };
})();
