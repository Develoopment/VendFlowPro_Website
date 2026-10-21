/* ==========================================================
   VendFlow Pro - site scripts
   ----------------------------------------------------------
   CONTACT FORM -> EMAIL
   Submissions are emailed to SUPPORT_EMAIL through FormSubmit
   (https://formsubmit.co), which needs no account or API key.

   One-time activation: the first submission from the live site
   sends an "Activate form" email to SUPPORT_EMAIL. Click the
   link in it once; every submission after that is delivered.

   Optional: FormSubmit's activation email also gives you a
   random alias (e.g. "a1b2c3d4e5..."). Put it in FORM_ALIAS to
   keep the real address out of the page source.
   ========================================================== */
const SUPPORT_EMAIL = "support@vendflowpro.com";
const FORM_ALIAS    = "";  // <- optional FormSubmit alias
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${FORM_ALIAS || SUPPORT_EMAIL}`;

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("mobile-menu");

  const setMenu = (open) => {
    menu.classList.toggle("hidden", !open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    toggle.querySelector(".icon-open").classList.toggle("hidden", open);
    toggle.querySelector(".icon-close").classList.toggle("hidden", !open);
  };

  toggle.addEventListener("click", () => setMenu(menu.classList.contains("hidden")));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", () => { if (window.innerWidth >= 768) setMenu(false); });

  /* ---------- Active section in the nav ---------- */
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const sections = navLinks
    .map((l) => document.querySelector(l.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((l) =>
            l.classList.toggle("is-active", l.getAttribute("href") === "#" + entry.target.id)
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    // Contact isn't a .nav-link (it's the button) - clear highlights when it's in view
    const contact = document.getElementById("contact");
    new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) navLinks.forEach((l) => l.classList.remove("is-active"));
      }),
      { rootMargin: "-45% 0px -50% 0px" }
    ).observe(contact);
  }

  /* ---------- Contact form ---------- */
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const button = form.querySelector('button[type="submit"]');
  const label = button.querySelector(".btn-label");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (field) => {
    const wrapper = field.closest(".field");
    if (!wrapper) return true;
    let valid = field.checkValidity();
    if (field.type === "email" && field.value) valid = emailPattern.test(field.value.trim());
    if (field.required && !field.value.trim()) valid = false;
    wrapper.classList.toggle("has-error", !valid);
    field.setAttribute("aria-invalid", String(!valid));
    return valid;
  };

  const requiredFields = [...form.querySelectorAll("[required]")];
  requiredFields.forEach((f) => {
    f.addEventListener("blur", () => validateField(f));
    f.addEventListener("input", () => {
      if (f.closest(".field").classList.contains("has-error")) validateField(f);
    });
  });

  const setStatus = (msg, type) => {
    status.textContent = msg;
    status.className = "form-status" + (type ? " is-" + type : "");
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("", "");

    const results = requiredFields.map(validateField);
    if (results.includes(false)) {
      const firstBad = requiredFields[results.indexOf(false)];
      firstBad.focus();
      setStatus("Check the highlighted fields and try again.", "error");
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    if (data._gotcha) return; // bot filled the honeypot

    button.disabled = true;
    label.textContent = "Sending…";

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          Name: data.name,
          Business: data.business,
          Email: data.email,
          Phone: data.phone,
          "Facility type": data.location_type,
          "Daily foot traffic": data.traffic,
          Message: data.message || "(none)",
          _replyto: data.email,                       // "Reply" goes to the visitor
          _subject: `Machine request: ${data.business}`,
          _template: "table",
          _captcha: "false",
        }),
      });
      const result = await res.json().catch(() => ({}));
      // FormSubmit returns success as the string "true" or "false"
      if (!res.ok || String(result.success) !== "true") {
        throw new Error(result.message || "Request failed with status " + res.status);
      }

      form.reset();
      setStatus("Request received. We'll reach out within 24 business hours to schedule your free site assessment.", "success");
    } catch (err) {
      console.error("Contact form:", err);
      setStatus(`That didn't send. Try again, or reach us at (469) 465 5915 or ${SUPPORT_EMAIL}.`, "error");
    } finally {
      button.disabled = false;
      label.textContent = "Request my free machine";
    }
  });
});
