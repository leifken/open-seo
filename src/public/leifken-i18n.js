// LEIFKEN runtime translation layer. Injected by the Node server (see
// scripts/serve-node.mjs) only when APP_LOCALE=de — the upstream code stays
// English and untouched, so community updates merge cleanly and new strings
// simply show up in English until the dictionary catches up.
//
// Mechanism: translate visible text nodes and a small set of attributes on
// initial load and on every React re-render via MutationObserver. Only exact
// matches on trimmed strings are replaced, so partial or unknown text is
// never mangled.
(function () {
  "use strict";

  var DICT_URL = "/leifken-i18n-de.json";
  var ATTRS = ["placeholder", "aria-label", "title", "alt"];
  /** @type {Record<string, string>} */
  var dict = {};
  /** @type {{ re: RegExp, to: string }[]} */
  var patterns = [];

  /** @param {string} value */
  function translateText(value) {
    // JSX collapses runs of whitespace, so match on a normalized key.
    var normalized = value.replace(/\s+/g, " ").trim();
    if (!normalized) return null;
    var hit = dict[normalized];
    if (hit !== undefined) return hit;
    // Texts carrying numbers ("Enter any value from 10 to 10,000.") can't be
    // matched exactly — fall back to regex patterns with $1/$2 placeholders.
    for (var i = 0; i < patterns.length; i++) {
      var m = patterns[i].re.exec(normalized);
      if (m) {
        return patterns[i].to.replace(/\$(\d)/g, function (/** @type {string} */ _, /** @type {string} */ n) {
          return m[Number(n)] ?? "";
        });
      }
    }
    return null;
  }

  /** @param {Node} node */
  function translateNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      var replaced = translateText(node.nodeValue || "");
      if (replaced !== null) node.nodeValue = replaced;
      return;
    }
    if (!(node instanceof Element)) return;
    var el = node;
    if (el.tagName === "SCRIPT" || el.tagName === "STYLE") return;
    for (var i = 0; i < ATTRS.length; i++) {
      var attr = ATTRS[i];
      if (el.hasAttribute(attr)) {
        var out = translateText(el.getAttribute(attr) || "");
        if (out !== null) el.setAttribute(attr, out);
      }
    }
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var text;
    while ((text = walker.nextNode())) {
      var next = translateText(text.nodeValue || "");
      if (next !== null) text.nodeValue = next;
    }
    var withAttrs = el.querySelectorAll(
      "[placeholder],[aria-label],[title],[alt]",
    );
    for (var j = 0; j < withAttrs.length; j++) translateNode(withAttrs[j]);
  }

  function start() {
    document.documentElement.lang = "de";
    translateNode(document.body);
    var observer = new MutationObserver(function (mutations) {
      // Pause observation while we mutate, or our own writes re-trigger it.
      observer.disconnect();
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === "characterData") {
          var replaced = translateText(m.target.nodeValue || "");
          if (replaced !== null) m.target.nodeValue = replaced;
        } else if (m.type === "attributes" && m.target instanceof Element && m.attributeName !== null) {
          var out = translateText(m.target.getAttribute(m.attributeName) || "");
          if (out !== null) m.target.setAttribute(m.attributeName, out);
        } else {
          for (var k = 0; k < m.addedNodes.length; k++) {
            translateNode(m.addedNodes[k]);
          }
        }
      }
      observe(observer);
    });
    observe(observer);
  }

  /** @param {MutationObserver} observer */
  function observe(observer) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS,
    });
  }

  fetch(DICT_URL)
    .then(function (r) {
      return r.json();
    })
    .then(function (/** @type {unknown} */ data) {
      if (typeof data !== "object" || data === null) throw new Error("Invalid dictionary");
      if ("exact" in data && typeof data.exact === "object" && data.exact !== null) {
        for (var [key, value] of Object.entries(data.exact)) {
          if (typeof value === "string") dict[key] = value;
        }
      }
      if ("patterns" in data && Array.isArray(data.patterns)) {
        for (var p of /** @type {unknown[]} */ (data.patterns)) {
          if (typeof p === "object" && p !== null && "from" in p && typeof p.from === "string" && "to" in p && typeof p.to === "string") {
            patterns.push({ re: new RegExp(p.from), to: p.to });
          }
        }
      }
      if (document.body) start();
      else document.addEventListener("DOMContentLoaded", start);
    })
    .catch(function (err) {
      console.warn("[leifken-i18n] dictionary failed to load:", err);
    });
})();
