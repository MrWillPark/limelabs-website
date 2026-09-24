/**
 * Lime Labs motion layer
 * Lenis smooth scroll · Motion (motion.dev) reveals · scroll progress · substrate spotlight · magnetic CTAs · mono decoder
 */
import Lenis from "https://cdn.jsdelivr.net/npm/lenis@1.3.8/+esm";
import { animate, inView } from "https://cdn.jsdelivr.net/npm/motion@12.23.12/+esm";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

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

/** Monospace index scramble on viewport intersection */
function scrambleMonoText(el, targetText, duration = 150) {
  if (reduceMotion) {
    el.textContent = targetText;
    return;
  }
  const glyphs = "0123456789#/_*";
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(1, elapsed / duration);

    if (progress >= 1) {
      el.textContent = targetText;
      return;
    }

    let out = "";
    for (let i = 0; i < targetText.length; i++) {
      if (Math.random() < progress) {
        out += targetText[i];
      } else {
        out += glyphs[Math.floor(Math.random() * glyphs.length)];
      }
    }
    el.textContent = out;
    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function revealSection(selector, options = {}) {
  const {
    y = 28,
    duration = 0.7,
    staggerChildren = null,
    childSelector = null,
    onVisible = null,
  } = options;

  document.querySelectorAll(selector).forEach((el) => {
    if (reduceMotion) {
      clearMotionStyles(el);
      if (onVisible) onVisible(el);
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
        ).finished.then(() => {
          clearMotionStyles(el);
          el.classList.add("has-entered");
          if (onVisible) onVisible(el);
        });

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
      { margin: "0px 0px -10% 0px", amount: 0.2 }
    );
  });
}

/**
 * Substrate proximity spotlight tracking
 * Renders ambient lime substrate luminescence tracking pointer coordinates
 */
function initSpotlightCards() {
  if (reduceMotion || !finePointer) return;

  const targets = document.querySelectorAll(
    ".product-card, .studio-methods, .contact-inner"
  );

  targets.forEach((card) => {
    card.classList.add("has-spotlight");

    const onMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--spot-x", `${x}px`);
      card.style.setProperty("--spot-y", `${y}px`);
      card.style.setProperty("--spot-opacity", "1");
    };

    const onLeave = () => {
      card.style.setProperty("--spot-opacity", "0");
    };

    card.addEventListener("pointerenter", onMove);
    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);
  });
}

/**
 * High-craft magnetic button attraction with RAF lerp
 * Clamped strictly to ±4px travel to maintain sharp 2px hard shadow alignment
 */
function initRefinedMagneticButtons() {
  if (reduceMotion || !finePointer) return;

  const targets = document.querySelectorAll(
    ".hero-actions .btn-primary, .contact-inner .btn-primary"
  );

  targets.forEach((btn) => {
    let bounds = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isHovered = false;
    let rafId = null;

    function render() {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;

      btn.style.transform = `translate(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px)`;

      const deltaX = Math.abs(targetX - currentX);
      const deltaY = Math.abs(targetY - currentY);

      if (isHovered || deltaX > 0.02 || deltaY > 0.02) {
        rafId = requestAnimationFrame(render);
      } else {
        btn.style.transform = "";
        btn.style.transition = "";
        rafId = null;
      }
    }

    btn.addEventListener("pointerenter", () => {
      bounds = btn.getBoundingClientRect();
      isHovered = true;
      btn.style.transition = "none";
      if (!rafId) rafId = requestAnimationFrame(render);
    });

    btn.addEventListener("pointermove", (e) => {
      if (!bounds) bounds = btn.getBoundingClientRect();
      const relX = e.clientX - (bounds.left + bounds.width / 2);
      const relY = e.clientY - (bounds.top + bounds.height / 2);

      targetX = Math.max(-4, Math.min(4, relX * 0.14));
      targetY = Math.max(-4, Math.min(4, relY * 0.14 - 2));
    });

    btn.addEventListener("pointerleave", () => {
      bounds = null;
      isHovered = false;
      targetX = 0;
      targetY = 0;
      btn.style.transition = "transform var(--dur-fast) var(--ease-out)";
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
  initSpotlightCards();
  initRefinedMagneticButtons();

  revealSection(".section-bar", { y: 18, duration: 0.55 });
  revealSection(".product-card", {
    y: 36,
    duration: 0.75,
    childSelector: ".product-feats li",
    staggerChildren: 0.06,
  });
  revealSection(".studio-copy", { y: 24 });
  revealSection(".studio-principles li", {
    y: 16,
    duration: 0.5,
    onVisible: (li) => {
      const key = li.querySelector(".principle-key");
      if (key) {
        scrambleMonoText(key, key.textContent.trim(), 160);
      }
    },
  });
  revealSection(".studio-methods", { y: 22, duration: 0.6 });
  revealSection(".contact-inner", { y: 30, duration: 0.7 });
  revealSection(".footer-statement", { y: 20, duration: 0.6 });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
