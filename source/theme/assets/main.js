/* Love Story Atelier — Shopify Theme JS */

/* ---- Scroll reveal ---- */
(function () {
  const els = document.querySelectorAll("[data-reveal]");
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("revealed"); io.unobserve(e.target); }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
  );
  els.forEach((el) => io.observe(el));
})();

/* ---- Sticky nav shadow ---- */
(function () {
  const nav = document.querySelector(".site-nav");
  if (!nav) return;
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  window.addEventListener("scroll", onScroll, { passive: true });
})();

/* ---- Mobile nav ---- */
(function () {
  const toggle = document.querySelector(".nav-mobile-toggle");
  const overlay = document.querySelector(".mobile-nav");
  if (!toggle || !overlay) return;
  const openIcon  = toggle.querySelector(".icon-menu");
  const closeIcon = toggle.querySelector(".icon-close");
  toggle.addEventListener("click", () => {
    const open = overlay.classList.toggle("open");
    if (openIcon)  openIcon.style.display  = open ? "none"  : "";
    if (closeIcon) closeIcon.style.display = open ? ""      : "none";
    toggle.setAttribute("aria-expanded", open);
  });
  overlay.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      overlay.classList.remove("open");
      if (openIcon)  openIcon.style.display  = "";
      if (closeIcon) closeIcon.style.display = "none";
    });
  });
})();

/* ---- Announcement bar rotation ---- */
(function () {
  const bar = document.querySelector(".announce-bar");
  if (!bar) return;
  const msgs = bar.querySelectorAll(".announce-bar__msg");
  if (!msgs.length) return;
  let i = 0;
  const show = (n) => {
    msgs.forEach((m, idx) => m.classList.toggle("active", idx === n));
  };
  show(0);
  const interval = setInterval(() => { i = (i + 1) % msgs.length; show(i); }, 5200);
  bar.querySelector(".announce-bar__prev")?.addEventListener("click", () => {
    clearInterval(interval);
    i = (i - 1 + msgs.length) % msgs.length;
    show(i);
  });
  bar.querySelector(".announce-bar__next")?.addEventListener("click", () => {
    clearInterval(interval);
    i = (i + 1) % msgs.length;
    show(i);
  });
})();

/* ---- Smooth scroll anchors ---- */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.offsetTop - 88, behavior: "smooth" });
  });
});

/* ---- Gallery filter chips (smooth transitions) ---- */
(function () {
  const wrap = document.querySelector("[data-gallery-filter]");
  if (!wrap) return;
  const chips = wrap.querySelectorAll(".filter-chip");
  const cards = document.querySelectorAll("[data-gallery-card]");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const val = chip.dataset.filter;
      chips.forEach((c) => { c.classList.remove("active"); c.setAttribute("aria-pressed", "false"); });
      chip.classList.add("active");
      chip.setAttribute("aria-pressed", "true");
      cards.forEach((card) => {
        const tags = (card.dataset.tags || "").split(",");
        const show = val === "All" || tags.includes(val);
        if (!show) {
          card.classList.add("ls-hiding");
          setTimeout(() => { if (card.classList.contains("ls-hiding")) { card.style.display = "none"; } card.classList.remove("ls-hiding"); }, 310);
        } else {
          card.style.display = "";
          requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove("ls-hiding")));
        }
      });
    });
  });
})();

/* ---- Veils collection filter chips ---- */
(function () {
  const wrap = document.querySelector("[data-veils-filter]");
  if (!wrap) return;
  const chips = wrap.querySelectorAll(".filter-chip");
  const cards = document.querySelectorAll("[data-veil-card]");
  const counter = document.querySelector("[data-veil-count]");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const val = chip.dataset.filter;
      chips.forEach((c) => { c.classList.remove("active"); c.setAttribute("aria-pressed", "false"); });
      chip.classList.add("active");
      chip.setAttribute("aria-pressed", "true");
      let visible = 0;
      cards.forEach((card) => {
        const tags = (card.dataset.tags || "").split(",");
        const show = val === "All silhouettes" || tags.includes(val);
        card.style.display = show ? "" : "none";
        if (show) visible++;
      });
      if (counter) counter.textContent = `${visible} ${visible === 1 ? "piece" : "pieces"}`;
    });
  });
})();

/* ---- Enquiry form chip toggles ---- */
document.querySelectorAll("[data-chip-group]").forEach((group) => {
  const multi = group.dataset.chipGroup === "multi";
  group.querySelectorAll(".form-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      if (multi) {
        chip.classList.toggle("active");
      } else {
        group.querySelectorAll(".form-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
      }
    });
  });
});

/* ---- Enquiry / contact form submission ---- */
(function () {
  const form = document.querySelector("[data-enquiry-form]");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    /* Shopify handles the actual POST to /contact — we just show a success state
       if using Shopify's native contact form. The form has action="/contact" method="post"
       which Shopify processes server-side. This JS is only for enhanced UX. */
    const submitBtn = form.querySelector("[data-submit-btn]");
    if (submitBtn) {
      submitBtn.textContent = "Sending…";
      submitBtn.disabled = true;
    }
  });
})();
