/* ============================================================
   Progressive enhancement only — the page is fully readable
   and navigable with this file absent or blocked.
   ============================================================ */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---- Theme ------------------------------------------------
     Default follows the OS. A click sets an explicit override
     that persists; the toggle always flips the *current* look. */

  var STORAGE_KEY = "kv-theme";
  var toggle = document.getElementById("theme-toggle");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  function currentTheme() {
    return root.dataset.theme || (prefersDark.matches ? "dark" : "light");
  }

  function syncToggle() {
    if (!toggle) return;
    var dark = currentTheme() === "dark";
    toggle.setAttribute("aria-pressed", String(dark));
    toggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  }

  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") root.dataset.theme = stored;
  } catch (e) {
    /* storage unavailable (private mode / blocked cookies) — OS preference still applies */
  }

  syncToggle();

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (e) {
        /* not fatal — the theme still applies for this page view */
      }
      syncToggle();
    });
  }

  // Track the OS while the user has not chosen an explicit override.
  prefersDark.addEventListener("change", function () {
    if (!root.dataset.theme) syncToggle();
  });

  /* ---- Scrollspy --------------------------------------------
     Marks the nav link for whichever section owns the reading
     line (~40% down the viewport). rootMargin collapses the
     observer to that band so exactly one section is active. */

  var links = Array.prototype.slice.call(document.querySelectorAll(".rail-nav a[href^='#']"));
  var byId = {};
  var sections = [];

  links.forEach(function (link) {
    var id = link.getAttribute("href").slice(1);
    var section = document.getElementById(id);
    if (!section) return;
    byId[id] = link;
    sections.push(section);
  });

  function setActive(id) {
    links.forEach(function (link) {
      link.classList.toggle("is-active", link === byId[id]);
    });
  }

  if (sections.length && "IntersectionObserver" in window) {
    var visible = new Set();

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });

        // Several sections can straddle the band; pick the topmost.
        var winner = sections.filter(function (s) {
          return visible.has(s.id);
        })[0];

        if (winner) setActive(winner.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      spy.observe(section);
    });

    // Bottom of the page: the last section is the intent even if
    // it is too short to reach the band.
    window.addEventListener(
      "scroll",
      function () {
        var atEnd = window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;
        if (atEnd) setActive(sections[sections.length - 1].id);
      },
      { passive: true }
    );
  }

  /* ---- Reveal on scroll -------------------------------------
     Class is added by JS, never in the HTML, so content is
     never left invisible if this script fails to run. */

  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    var targets = document.querySelectorAll(".section, .entry, .project, .footer");

    var revealer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry, i) {
          if (!entry.isIntersecting) return;
          entry.target.style.transitionDelay = Math.min(i, 4) * 60 + "ms";
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );

    Array.prototype.forEach.call(targets, function (el) {
      el.classList.add("reveal");
      revealer.observe(el);
    });
  }

  /* ---- Footer year ------------------------------------------ */

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
