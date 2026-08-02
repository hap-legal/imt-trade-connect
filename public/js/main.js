/* IMT — lightweight vanilla JS: sticky header, mobile nav, reveal on scroll,
   contact form validation and query-param prefill. No dependencies. */
(function () {
  "use strict";

  /* ---- Footer year ---- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

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

    /* DEMO BRANCH — remove these lines once a real endpoint (e.g. Formspree)
       is set in the form's action attribute so the browser submits normally. */
    e.preventDefault();
    if (status) {
      status.hidden = false;
      status.className = "form__status is-success";
      status.textContent = "Thank you — your enquiry has been prepared. This form is not yet connected to a mail service; add your Formspree endpoint to start receiving submissions.";
      status.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    form.reset();
  });
})();
