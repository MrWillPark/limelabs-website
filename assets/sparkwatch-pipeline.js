/**
 * Sparkwatch portfolio cover — lightweight port of the landing-pipeline auto-loop.
 * Decorative only (pointer-events none on stages); the parent <a> handles navigation.
 */
(function () {
  var STEPS = [
    {
      step: "01",
      label: "Live Signals",
      tag: "Ingestion Engine",
      html:
        '<div class="sw-pipe__meta"><span class="sw-pipe__tag">Ingestion Engine</span><span class="sw-pipe__cap">Tracking 1,240+ landscape accounts</span></div>' +
        '<div class="sw-pipe__signals">' +
        '<div class="sw-pipe__signal is-hot">' +
        '<div class="sw-pipe__row"><span class="sw-pipe__plat ig">Instagram Reel</span><span class="sw-pipe__ago">1.8h ago</span><span class="sw-pipe__vel">+3.8x Velocity</span></div>' +
        '<p class="sw-pipe__headline">“Why 90% of B2B founders fail their first hiring sprint...”</p>' +
        '<div class="sw-pipe__stats"><span><strong>2,840</strong> views/hr</span><span><strong>Jerk:</strong> +0.38</span><span class="sw-pipe__status">Algorithmic Escape Wave</span></div>' +
        "</div>" +
        '<div class="sw-pipe__signal">' +
        '<div class="sw-pipe__row"><span class="sw-pipe__plat tt">TikTok</span><span class="sw-pipe__ago">3.2h ago</span><span class="sw-pipe__vel">+2.4x Velocity</span></div>' +
        '<p class="sw-pipe__headline">“Stop building features nobody asked for. Use this 3-question audit.”</p>' +
        '<div class="sw-pipe__stats"><span><strong>1,920</strong> views/hr</span><span><strong>Retention:</strong> 68% at 15s</span><span class="sw-pipe__status">Breakout Candidate</span></div>' +
        "</div></div>" +
        '<p class="sw-pipe__foot">Multi-stream ingestion: momentum shifts 18 hours before competitor dashboards.</p>',
    },
    {
      step: "02",
      label: "Brand & Audience Fit",
      tag: "Fit Filter",
      html:
        '<div class="sw-pipe__meta"><span class="sw-pipe__tag">Fit Filter</span><span class="sw-pipe__cap">Evaluated against @YourBrand baseline median</span></div>' +
        '<div class="sw-pipe__metrics">' +
        '<div class="sw-pipe__metric"><span class="sw-pipe__mlabel">Your 30-Day Median</span><span class="sw-pipe__mval">4.2k <small>views</small></span><span class="sw-pipe__msub">Baseline engagement: 3.4%</span></div>' +
        '<div class="sw-pipe__metric is-hot"><span class="sw-pipe__mlabel">Outlier Multiplier</span><span class="sw-pipe__mval accent">3.8x</span><span class="sw-pipe__msub">Statistically anomalous spike</span></div>' +
        '<div class="sw-pipe__metric"><span class="sw-pipe__mlabel">Brand Voice Fit</span><span class="sw-pipe__mval">94%</span><span class="sw-pipe__msub">Category: Founder Education</span></div>' +
        "</div>" +
        '<ul class="sw-pipe__filters"><li class="pass"><strong>Format Match:</strong> 15–20s talking-head + proof overlay</li><li class="pass"><strong>Audience Resonance:</strong> 88% affinity among operators</li><li class="dim"><strong>Discarded Noise:</strong> 42 generic meme formats filtered</li></ul>',
    },
    {
      step: "03",
      label: "Content Gap",
      tag: "Gap Radar",
      html:
        '<div class="sw-pipe__meta"><span class="sw-pipe__tag">Gap Radar</span><span class="sw-pipe__badge">HIGH-CONVICTION GAP</span></div>' +
        '<div class="sw-pipe__gap">' +
        '<span class="sw-pipe__gap-label">UNCOVERED CONTENT GAP</span>' +
        "<h4>The Contrarian Technical Audit Hook</h4>" +
        "<p>Competitors are scaling 14–18s counter-intuitive data reveals (3.8x median). Your channel has <strong>zero coverage</strong> on this angle.</p>" +
        '<div class="sw-pipe__pills"><span>Format: Split-Screen Proof</span><span>Sweet-spot: 16s</span><span class="hot">Est. Reach: 18k–35k</span></div>' +
        "</div>",
    },
    {
      step: "04",
      label: "Production Brief",
      tag: "Execution",
      html:
        '<div class="sw-pipe__meta"><span class="sw-pipe__tag">Execution Pipeline</span><span class="sw-pipe__cap">Brief ready for creator or agent dispatch</span></div>' +
        '<div class="sw-pipe__brief">' +
        '<div class="sw-pipe__hook"><span>THE 3-SECOND HOOK</span><p>“Most founders think hiring speed is a flex. It’s actually why 90% of your engineering budget is burning right now.”</p></div>' +
        '<div class="sw-pipe__beats">' +
        "<div><strong>Beat 1 · 0–3s</strong><p>Hold up visual stat card showing hiring burn rate.</p></div>" +
        "<div><strong>Beat 2 · 4–12s</strong><p>Explain the 3-question audit for contractors vs full-time.</p></div>" +
        "<div><strong>Beat 3 · 13–16s</strong><p>“Drop ‘AUDIT’ for the 1-page template.”</p></div>" +
        "</div>" +
        '<div class="sw-pipe__dispatch">Send to Production Pipeline</div>' +
        "</div>",
    },
  ];

  function mount(root) {
    if (!root || root.dataset.mounted) return;
    root.dataset.mounted = "1";

    var stepsHtml = STEPS.map(function (s, i) {
      return (
        '<span class="sw-pipe__step' +
        (i === 0 ? " is-active" : "") +
        '" data-step="' +
        i +
        '"><span class="num">' +
        s.step +
        '</span><span class="name">' +
        s.label +
        "</span></span>"
      );
    }).join("");

    root.innerHTML =
      '<div class="sw-pipe" aria-hidden="true">' +
      '<div class="sw-pipe__chrome">' +
      '<div class="sw-pipe__dots"><span></span><span></span><span></span></div>' +
      '<div class="sw-pipe__title">Sparkwatch Engine · Live Runtime Pipeline</div>' +
      '<div class="sw-pipe__live"><span class="sw-pipe__radar"></span> LIVE TELEMETRY</div>' +
      '<div class="sw-pipe__loop">Auto-Looping</div>' +
      "</div>" +
      '<div class="sw-pipe__stepper">' +
      stepsHtml +
      "</div>" +
      '<div class="sw-pipe__body"></div>' +
      "</div>";

    var body = root.querySelector(".sw-pipe__body");
    var stepEls = root.querySelectorAll(".sw-pipe__step");
    var index = 0;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function show(i) {
      index = i;
      body.innerHTML = '<div class="sw-pipe__stage">' + STEPS[i].html + "</div>";
      stepEls.forEach(function (el, j) {
        el.classList.toggle("is-active", j === i);
      });
    }

    show(0);
    if (reduce) return;

    var timer = window.setInterval(function () {
      show((index + 1) % STEPS.length);
    }, 2400);

    root.addEventListener(
      "remove",
      function () {
        window.clearInterval(timer);
      },
      { once: true }
    );
  }

  function init() {
    document.querySelectorAll("[data-sw-pipeline]").forEach(mount);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
