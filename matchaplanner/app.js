(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ── Rail collapse (mobile) ── */
  const rail = $("#rail");
  const railToggle = $("#rail-toggle");
  const setMenuOpen = (open) => {
    if (!rail || !railToggle) return;
    rail.setAttribute("data-menu-open", open ? "true" : "false");
    railToggle.setAttribute("aria-expanded", open ? "true" : "false");
    railToggle.textContent = open ? "Close" : "Sections";
  };
  if (railToggle && rail) {
    railToggle.addEventListener("click", () => {
      setMenuOpen(rail.getAttribute("data-menu-open") !== "true");
    });
  }

  /* ── Active section spy ── */
  const navLinks = $$(".rail-nav a[href^='#']");
  const sections = navLinks
    .map((a) => document.getElementById(a.getAttribute("href").slice(1)))
    .filter(Boolean);

  const setCurrent = (id) => {
    navLinks.forEach((a) => {
      a.setAttribute(
        "aria-current",
        a.getAttribute("href") === `#${id}` ? "true" : "false"
      );
    });
  };

  if ("IntersectionObserver" in window && sections.length) {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setCurrent(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.2, 0.5, 1] }
    );
    sections.forEach((s) => io.observe(s));
  }

  navLinks.forEach((a) => {
    a.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 959px)").matches) {
        setMenuOpen(false);
      }
    });
  });
  $$(".rail-tools a[href^='#']").forEach((a) => {
    a.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 959px)").matches) {
        setMenuOpen(false);
      }
    });
  });

  /* ── Path A / B switcher ── */
  const pathBtns = $$("[data-path-btn]");
  const pathPanels = $$("[data-path-panel]");
  pathBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const path = btn.getAttribute("data-path-btn");
      pathBtns.forEach((b) =>
        b.setAttribute("aria-pressed", b === btn ? "true" : "false")
      );
      pathPanels.forEach((p) => {
        p.hidden = p.getAttribute("data-path-panel") !== path;
      });
    });
  });

  /* ── Scenario tabs ── */
  const tabGroups = $$("[data-tabs]");
  tabGroups.forEach((group) => {
    const tabs = $$('[role="tab"]', group);
    const panels = $$('[role="tabpanel"]', group);
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const id = tab.getAttribute("aria-controls");
        tabs.forEach((t) => t.setAttribute("aria-selected", t === tab ? "true" : "false"));
        panels.forEach((p) => {
          p.hidden = p.id !== id;
        });
      });
    });
  });

  /* ── Foot traffic calculator ── */
  const visitors = $("#calc-visitors");
  const conversion = $("#calc-conversion");
  const aov = $("#calc-aov");
  const outTx = $("#calc-tx");
  const outRev = $("#calc-rev");
  const outNote = $("#calc-note");

  const fmt = (n) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const runCalc = () => {
    if (!visitors || !conversion || !aov) return;
    const v = Number(visitors.value) || 0;
    const c = Number(conversion.value) || 0;
    const a = Number(aov.value) || 0;
    const tx = Math.round(v * (c / 100));
    const rev = tx * a;
    if (outTx) outTx.textContent = tx.toLocaleString("en-US");
    if (outRev) outRev.textContent = fmt(rev);

    let note = "Within grounded niche-dessert capture band (≈1.2–2.2%).";
    if (c > 5) note = "Capture above 5% is rare for cold dessert in a morning market window — treat as stretch.";
    else if (c > 2.5) note = "Strong-day territory; typically needs heat, viral queue, or evening festival energy.";
    else if (c < 1) note = "Conservative — useful for winter / overcast baseline planning.";
    if (outNote) outNote.textContent = note;
  };

  [visitors, conversion, aov].forEach((el) => {
    if (el) el.addEventListener("input", runCalc);
  });
  $$("[data-calc-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const [v, c, a] = btn.getAttribute("data-calc-preset").split(",").map(Number);
      if (visitors) visitors.value = v;
      if (conversion) conversion.value = c;
      if (aov) aov.value = a;
      runCalc();
    });
  });
  runCalc();

  /* ── Action checklist persistence ── */
  const checks = $$('[data-check]');
  const storageKey = "matchaplanner-checklist-v1";
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
  } catch {
    saved = {};
  }

  const updateProgress = () => {
    const total = checks.length;
    const done = checks.filter((c) => c.checked).length;
    const el = $("#check-progress");
    if (el) el.textContent = `${done} of ${total} complete`;
  };

  checks.forEach((input) => {
    const id = input.getAttribute("data-check");
    if (saved[id]) input.checked = true;
    const li = input.closest("li");
    if (li) li.classList.toggle("is-done", input.checked);
    input.addEventListener("change", () => {
      saved[id] = input.checked;
      try {
        localStorage.setItem(storageKey, JSON.stringify(saved));
      } catch {
        /* ignore quota */
      }
      if (li) li.classList.toggle("is-done", input.checked);
      updateProgress();
    });
  });
  updateProgress();

  /* ── Expand / collapse all ── */
  const expandAll = $("#expand-all");
  const collapseAll = $("#collapse-all");
  const expanders = $$("details.expander");

  if (expandAll) {
    expandAll.addEventListener("click", () => {
      expanders.forEach((d) => {
        d.open = true;
      });
    });
  }
  if (collapseAll) {
    collapseAll.addEventListener("click", () => {
      expanders.forEach((d) => {
        d.open = false;
      });
    });
  }

  /* ── Jump to sources from cite ── */
  $$("a.cite").forEach((a) => {
    a.addEventListener("click", () => {
      const target = document.getElementById(a.getAttribute("href").slice(1));
      if (target && target.tagName === "DETAILS") target.open = true;
    });
  });
})();
