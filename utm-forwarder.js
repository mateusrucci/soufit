(function () {
  var TRACKING_KEYS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "utm_id",
    "fbclid",
    "gclid",
    "gbraid",
    "wbraid",
    "msclkid",
    "ttclid"
  ];
  var STORAGE_KEY = "soufit_tracking_params";

  function readStoredParams() {
    try {
      return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (error) {
      return {};
    }
  }

  function writeStoredParams(params) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
    } catch (error) {
      // Tracking persistence is optional; link decoration below still works.
    }
  }

  function collectParams() {
    var current = new URLSearchParams(window.location.search);
    var stored = readStoredParams();
    var changed = false;

    TRACKING_KEYS.forEach(function (key) {
      var value = current.get(key);
      if (value) {
        stored[key] = value;
        changed = true;
      }
    });

    if (changed) {
      writeStoredParams(stored);
    }

    return stored;
  }

  function shouldDecorate(link) {
    var href = link.getAttribute("href");
    return href && !href.startsWith("#") && !href.startsWith("mailto:") && !href.startsWith("tel:") && !href.startsWith("javascript:");
  }

  function decorateLink(link, params) {
    if (!shouldDecorate(link)) {
      return;
    }

    try {
      var url = new URL(link.getAttribute("href"), window.location.href);
      Object.keys(params).forEach(function (key) {
        if (params[key] && !url.searchParams.has(key)) {
          url.searchParams.set(key, params[key]);
        }
      });
      link.setAttribute("href", url.toString());
    } catch (error) {
      // Ignore malformed or nonstandard URLs.
    }
  }

  function decorateAllLinks() {
    var params = collectParams();
    if (!Object.keys(params).length) {
      return;
    }

    document.querySelectorAll("a[href]").forEach(function (link) {
      decorateLink(link, params);
    });
  }

  document.addEventListener("DOMContentLoaded", decorateAllLinks);
  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("a[href]");
    if (link) {
      decorateLink(link, collectParams());
    }
  }, true);
})();
