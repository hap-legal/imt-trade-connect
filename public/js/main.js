/* IMT — lightweight vanilla JS: sticky header, mobile nav, reveal on scroll,
   contact form validation and query-param prefill. No dependencies. */
(function () {
  "use strict";

  /* ---- Footer year ---- */
  var y = String(new Date().getFullYear());
  var yearEls = document.querySelectorAll("#year, .js-year");
  for (var yi = 0; yi < yearEls.length; yi++) yearEls[yi].textContent = y;

  /* ---- Sticky header shadow ---- */
  var header = document.getElementById("siteHeader");
  var onScroll = function () {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile nav ---- */
  var burger = document.getElementById("navBurger");
  var nav = document.getElementById("primaryNav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      burger.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      nav.classList.toggle("is-open", !open);
    });
  }

  /* ---- Products dropdown (click on touch / mobile, hover handled by CSS) ---- */
  Array.prototype.forEach.call(document.querySelectorAll(".nav__toggle"), function (btn) {
    var menu = document.getElementById(btn.getAttribute("aria-controls"));
    if (!menu) return;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("is-open", !open);
    });
    document.addEventListener("click", function (e) {
      if (!btn.parentNode.contains(e.target)) {
        btn.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        btn.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
      }
    });
  });

  /* ---- Reveal on scroll ---- */
  var revealables = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(revealables, function (el) { io.observe(el); });
  }

  /* ---- Contact form ---- */
  var form = document.getElementById("enquiryForm");
  if (!form) return;

  /* Prefill from query params, e.g. contact.html?type=catalogue&focus=medical */
  var params = new URLSearchParams(window.location.search);
  var setSelect = function (id, value) {
    var el = document.getElementById(id);
    if (!el || !value) return;
    var match = Array.prototype.some.call(el.options, function (o) { return o.value === value; });
    if (match) el.value = value;
  };
  setSelect("inquiryType", params.get("type"));
  setSelect("productFocus", params.get("focus"));
  setSelect("urgency", params.get("urgency"));

  var status = document.getElementById("formStatus");
  var required = ["fullName", "company", "email", "country", "inquiryType", "message"];
  var labels = {
    fullName: "full name", company: "company name", email: "email address",
    country: "country", inquiryType: "inquiry type", message: "message"
  };

  var showError = function (id, msg) {
    var input = document.getElementById(id);
    var err = document.getElementById("err-" + id);
    if (input) input.parentNode.classList.add("has-error");
    if (input) input.setAttribute("aria-invalid", "true");
    if (err) { err.textContent = msg; err.hidden = false; }
  };
  var clearError = function (id) {
    var input = document.getElementById(id);
    var err = document.getElementById("err-" + id);
    if (input) input.parentNode.classList.remove("has-error");
    if (input) input.removeAttribute("aria-invalid");
    if (err) { err.textContent = ""; err.hidden = true; }
  };

  required.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("input", function () { clearError(id); });
    if (el) el.addEventListener("change", function () { clearError(id); });
  });

  form.addEventListener("submit", function (e) {
    var firstInvalid = null;
    required.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var value = (el.value || "").trim();
      clearError(id);
      if (!value) {
        showError(id, "Please provide your " + labels[id] + ".");
        firstInvalid = firstInvalid || el;
      } else if (id === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        showError(id, "Please enter a valid email address.");
        firstInvalid = firstInvalid || el;
      } else if (id === "message" && value.length < 20) {
        showError(id, "Please add a little more detail (at least 20 characters).");
        firstInvalid = firstInvalid || el;
      }
    });

    if (firstInvalid) {
      e.preventDefault();
      if (status) {
        status.hidden = false;
        status.className = "form__status is-error";
        status.textContent = "Please correct the highlighted fields and try again.";
      }
      firstInvalid.focus();
      return;
    }

    /* No delivery endpoint configured yet (form action="#"). Do NOT show a
       success message that implies the enquiry was sent. Set a real endpoint
       (e.g. action="https://formspree.io/f/xxxx" method="post") and this
       branch stops running so the browser submits normally. See README. */
    var action = (form.getAttribute("action") || "").trim();
    if (!action || action === "#") {
      e.preventDefault();
      if (status) {
        status.hidden = false;
        status.className = "form__status is-error";
        status.textContent = "This enquiry could not be sent right now. Please try again shortly.";
        status.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    if (status) {
      status.hidden = false;
      status.className = "form__status is-success";
      status.textContent = "Thank you — your enquiry has been sent. We reply to qualified B2B enquiries by email.";
    }
  });
})();

/* ---- Cookie consent (GDPR/ePrivacy-style: opt-in, equal prominence,
   granular categories, withdrawable at any time) ---- */
(function () {
  "use strict";

  var KEY = "imt-cookie-consent";
  var VERSION = 1;

  function read() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      var val = JSON.parse(raw);
      if (!val || val.version !== VERSION) return null;
      return val;
    } catch (e) { return null; }
  }

  function save(prefs) {
    var record = {
      version: VERSION,
      date: new Date().toISOString(),
      necessary: true,
      functional: !!prefs.functional,
      analytics: !!prefs.analytics
    };
    try { window.localStorage.setItem(KEY, JSON.stringify(record)); } catch (e) {}
    document.dispatchEvent(new CustomEvent("imt:cookie-consent", { detail: record }));
    return record;
  }

  var backdrop = document.createElement("div");
  backdrop.className = "cc__backdrop";

  var banner = document.createElement("section");
  banner.className = "cc";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-modal", "false");
  banner.setAttribute("aria-labelledby", "ccTitle");
  banner.setAttribute("aria-describedby", "ccText");
  banner.innerHTML =
    '<div class="cc__panel">' +
      '<h2 class="cc__title" id="ccTitle">Cookies and similar technologies</h2>' +
      '<p class="cc__text" id="ccText">This website uses only storage that is strictly necessary for the pages to work. ' +
      'Optional categories &mdash; such as remembering display preferences or measuring how the site is used &mdash; ' +
      'are switched off until you allow them. No advertising or profiling technologies are used. ' +
      'You can change or withdraw your choice at any time. Details are in our ' +
      '<a href="./cookies.html">Cookie notice</a> and <a href="./privacidad.html">Privacy policy</a>.</p>' +
      '<div class="cc__options" id="ccOptions">' +
        '<label class="cc__opt"><input type="checkbox" checked disabled aria-label="Strictly necessary (always active)">' +
          '<strong>Strictly necessary (always active)</strong>' +
          '<span>Required for page display, security and to remember this cookie choice. Cannot be switched off.</span></label>' +
        '<label class="cc__opt"><input type="checkbox" id="ccFunctional">' +
          '<strong>Functional</strong>' +
          '<span>Remembers optional preferences, such as language or display settings, to improve your visit.</span></label>' +
        '<label class="cc__opt"><input type="checkbox" id="ccAnalytics">' +
          '<strong>Analytics</strong>' +
          '<span>Aggregated, non-advertising measurement of page usage. Not currently active on this site; enabling it applies only if such measurement is introduced.</span></label>' +
      '</div>' +
      '<div class="cc__actions">' +
        '<button type="button" class="btn btn--primary btn--sm" id="ccAccept">Accept all</button>' +
        '<button type="button" class="btn btn--outline btn--sm" id="ccReject">Reject optional</button>' +
        '<button type="button" class="btn btn--outline btn--sm" id="ccSave" hidden>Save my choices</button>' +
        '<button type="button" class="cc__link" id="ccToggle" aria-expanded="false" aria-controls="ccOptions">Manage preferences</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(backdrop);
  document.body.appendChild(banner);

  var elFunctional = banner.querySelector("#ccFunctional");
  var elAnalytics = banner.querySelector("#ccAnalytics");
  var btnSave = banner.querySelector("#ccSave");
  var btnToggle = banner.querySelector("#ccToggle");

  function open(expanded) {
    var current = read();
    if (current) {
      elFunctional.checked = !!current.functional;
      elAnalytics.checked = !!current.analytics;
    }
    banner.classList.add("is-open");
    backdrop.classList.toggle("is-open", !!expanded);
    setExpanded(!!expanded);
    banner.querySelector("#ccAccept").focus();
  }

  function close() {
    banner.classList.remove("is-open", "is-expanded");
    backdrop.classList.remove("is-open");
  }

  function setExpanded(state) {
    banner.classList.toggle("is-expanded", state);
    btnToggle.setAttribute("aria-expanded", String(state));
    btnToggle.textContent = state ? "Hide preferences" : "Manage preferences";
    btnSave.hidden = !state;
  }

  btnToggle.addEventListener("click", function () {
    setExpanded(!banner.classList.contains("is-expanded"));
  });
  banner.querySelector("#ccAccept").addEventListener("click", function () {
    save({ functional: true, analytics: true });
    close();
  });
  banner.querySelector("#ccReject").addEventListener("click", function () {
    save({ functional: false, analytics: false });
    close();
  });
  btnSave.addEventListener("click", function () {
    save({ functional: elFunctional.checked, analytics: elAnalytics.checked });
    close();
  });

  /* Reopen from footer links / any [data-cookie-settings] control */
  document.addEventListener("click", function (e) {
    var trigger = e.target.closest ? e.target.closest("[data-cookie-settings]") : null;
    if (!trigger) return;
    e.preventDefault();
    open(true);
  });

  /* Add a "Cookie settings" entry to the footer legal bar on every page */
  var legal = document.querySelector(".footer__legal");
  if (legal && !legal.querySelector("[data-cookie-settings]")) {
    var li = document.createElement("li");
    li.innerHTML = '<a href="#" data-cookie-settings>Cookie settings</a>';
    legal.appendChild(li);
  }

  if (!read()) open(false);
})();
