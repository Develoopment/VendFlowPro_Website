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

  /* ---------- Product video ----------
     Shows a thumbnail first; the YouTube player (privacy-enhanced,
     no cookies until played) loads only when the visitor clicks. */
  document.querySelectorAll(".video-facade").forEach((facade) => {
    facade.addEventListener("click", () => {
      const id = facade.dataset.videoId;
      const iframe = document.createElement("iframe");
      // Set the referrer policy BEFORE the src so YouTube always learns which
      // site is embedding it; without that it shows "Error 153".
      iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      iframe.title = facade.dataset.videoTitle || "YouTube video";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      const params = new URLSearchParams({ autoplay: "1", rel: "0", playsinline: "1" });
      if (location.protocol.startsWith("http")) params.set("origin", location.origin);
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?${params}`;
      facade.replaceWith(iframe);
      iframe.focus();
    });
  });

  /* ---------- Contact form ---------- */
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
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

  /* Optimistic sending
     The visitor sees "Request received" right away and the button resets,
     while the email is sent in the background. Three safeguards:
     1. keepalive: the request finishes even if the visitor closes the tab.
     2. Recovery: if the send fails, an error replaces the success message
        and the visitor's details are put back in the form.
     3. No duplicates: an identical request is never sent twice while one
        is in flight or shortly after it succeeded. */
  const SUCCESS_MSG = "Request received. We'll reach out within 24 business hours to schedule your free site assessment.";
  const FAIL_MSG = `Sorry, your request didn't go through. Your details are back in the form, so press the button to try again, or reach us at (469) 465 5915 or ${SUPPORT_EMAIL}.`;
  const DUPLICATE_WINDOW_MS = 2 * 60 * 1000;
  const recentSends = new Map(); // payload fingerprint -> { pending, sentAt }

  const fieldNames = ["name", "business", "email", "phone", "location_type", "traffic", "message"];

  const restoreForm = (data) => {
    // Don't overwrite anything the visitor has started typing since
    const untouched = fieldNames.every((n) => !form.elements[n] || !form.elements[n].value);
    if (!untouched) return false;
    fieldNames.forEach((n) => { if (form.elements[n]) form.elements[n].value = data[n] || ""; });
    return true;
  };

  const buildPayload = (data) => new URLSearchParams({
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
  });

  form.addEventListener("submit", (e) => {
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

    const payload = buildPayload(data);
    const fingerprint = payload.toString();

    // Safeguard 3: same request already sending, or sent moments ago
    const previous = recentSends.get(fingerprint);
    if (previous && (previous.pending || Date.now() - previous.sentAt < DUPLICATE_WINDOW_MS)) {
      form.reset();
      setStatus(SUCCESS_MSG, "success");
      return;
    }
    recentSends.set(fingerprint, { pending: true, sentAt: Date.now() });

    // Show success immediately; the send continues in the background
    form.reset();
    requiredFields.forEach((f) => {
      f.closest(".field")?.classList.remove("has-error");
      f.removeAttribute("aria-invalid");
    });
    setStatus(SUCCESS_MSG, "success");

    // Form-encoded body: no CORS preflight round trip, and works with keepalive
    // in every browser. keepalive caps the body at 64 KB; the message field has
    // a maxlength, but skip keepalive for anything unusually large.
    const body = payload.toString();
    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: payload,
      keepalive: body.length < 60000,           // Safeguard 1
    })
      .then(async (res) => {
        const result = await res.json().catch(() => ({}));
        // FormSubmit returns success as the string "true" or "false"
        if (!res.ok || String(result.success) !== "true") {
          throw new Error(result.message || "Request failed with status " + res.status);
        }
        recentSends.set(fingerprint, { pending: false, sentAt: Date.now() });
      })
      .catch((err) => {
        // Safeguard 2: tell the visitor and give them their details back
        console.error("Contact form:", err);
        recentSends.delete(fingerprint);
        const restored = restoreForm(data);
        setStatus(restored ? FAIL_MSG : FAIL_MSG.replace("Your details are back in the form, so press the button to try again", "Please check your details and press the button again"), "error");
        status.scrollIntoView({ behavior: "smooth", block: "center" });
      });
  });
});
