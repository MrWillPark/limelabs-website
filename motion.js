/**
 * Lime Labs motion layer
 * Lenis smooth scroll · Motion (motion.dev) reveals · scroll progress · stamp CTAs
 */
import Lenis from "https://cdn.jsdelivr.net/npm/lenis@1.3.8/+esm";
import { animate, inView } from "https://cdn.jsdelivr.net/npm/motion@12.23.12/+esm";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Motion CDN build omits stagger(); delay-as-function is supported. */
const staggerDelay = (step, startDelay = 0) => (i) => startDelay + i * step;

function clearMotionStyles(el) {
  el.style.transform = "";
  el.style.opacity = "";
  el.style.filter = "";
  el.classList.add("is-visible");
  el.classList.remove("will-animate");
}

function initScrollProgress() {
  const bar = document.querySelector("[data-scroll-progress]");
  if (!bar) return () => {};

  const update = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  return update;
}

function initLenis(onScroll) {
  if (reduceMotion) return null;

  const lenis = new Lenis({
    duration: 1.05,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  document.documentElement.classList.add("lenis");

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  lenis.on("scroll", ({ scroll }) => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const p = max > 0 ? scroll / max : 0;
    const bar = document.querySelector("[data-scroll-progress]");
    if (bar) bar.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
    onScroll?.();
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();

      const go = () => lenis.scrollTo(target, { offset: -72, duration: 1.15 });

      if (document.startViewTransition) {
        document.startViewTransition(go);
      } else {
        go();
      }
    });
  });

  return lenis;
}

function stampHero() {
  const mark = document.querySelector(".logo-mark");
  const kicker = document.querySelector(".hero-kicker");
  const brand = document.querySelector(".hero-brand");
  const lead = document.querySelector(".hero-lead");
  const actions = document.querySelector(".hero-actions");

  if (reduceMotion) {
    [kicker, brand, lead, actions].forEach((el) => el && clearMotionStyles(el));
    return;
  }

  if (mark) {
    animate(
      mark,
      { scale: [0.2, 1.12, 1], opacity: [0, 1] },
      { duration: 0.55, easing: [0.22, 1, 0.36, 1] }
    ).finished.then(() => {
      mark.style.transform = "";
      mark.style.opacity = "";
    });
  }

  const sequence = [
    [kicker, 0],
    [brand, 0.08],
    [lead, 0.16],
    [actions, 0.24],
  ];

  sequence.forEach(([el, delay]) => {
    if (!el) return;
    el.classList.add("will-animate");
    animate(
      el,
      { opacity: [0, 1], y: [22, 0] },
      { duration: 0.7, delay, easing: [0.22, 1, 0.36, 1] }
    ).finished.then(() => clearMotionStyles(el));
  });
}

function revealSection(selector, options = {}) {
  const {
    y = 28,
    duration = 0.7,
    staggerChildren = null,
    childSelector = null,
  } = options;

  document.querySelectorAll(selector).forEach((el) => {
    if (reduceMotion) {
      clearMotionStyles(el);
      return;
    }

    el.classList.add("will-animate");

    inView(
      el,
      () => {
        animate(
          el,
          { opacity: [0, 1], y: [y, 0] },
          { duration, easing: [0.22, 1, 0.36, 1] }
        ).finished.then(() => clearMotionStyles(el));

        if (childSelector && staggerChildren != null) {
          const kids = el.querySelectorAll(childSelector);
          if (kids.length) {
            kids.forEach((k) => k.classList.add("will-animate"));
            animate(
              kids,
              { opacity: [0, 1], x: [-10, 0] },
              {
                delay: staggerDelay(staggerChildren, 0.18),
                duration: 0.45,
                easing: [0.22, 1, 0.36, 1],
              }
            ).finished.then(() => {
              kids.forEach((k) => clearMotionStyles(k));
            });
          }
        }
      },
      { margin: "0px 0px -12% 0px", amount: 0.25 }
    );
  });
}

function initMagneticButtons() {
  if (reduceMotion || window.matchMedia("(pointer: coarse)").matches) return;

  document.querySelectorAll(".btn-primary").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.08}px, ${y * 0.1 - 2}px)`;
    });
    btn.addEventListener("pointerleave", () => {
      btn.style.transform = "";
    });
  });
}

function initGridPulse() {
  const grid = document.querySelector(".hero-grid");
  if (!grid || reduceMotion) return;

  animate(
    grid,
    { opacity: [0.35, 0.9, 0.65] },
    { duration: 2.4, easing: "ease-in-out" }
  ).finished.then(() => {
    grid.style.opacity = "";
  });
}

function boot() {
  document.documentElement.classList.add("motion-ready");
  document.documentElement.classList.remove("motion-fallback");

  const updateProgress = initScrollProgress();
  initLenis(updateProgress);
  stampHero();
  initGridPulse();
  initMagneticButtons();

  revealSection(".section-bar", { y: 18, duration: 0.55 });
  revealSection(".product-card", {
    y: 36,
    duration: 0.75,
    childSelector: ".product-feats li",
    staggerChildren: 0.06,
  });
  revealSection(".studio-copy", { y: 24 });
  revealSection(".studio-principles li", { y: 16, duration: 0.5 });
  revealSection(".contact-inner", { y: 30, duration: 0.7 });
  revealSection(".footer-statement", { y: 20, duration: 0.6 });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
