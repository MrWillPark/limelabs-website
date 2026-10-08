/**
 * Dayplay portfolio cover — port of dayplay.io engine-console chip → stage loop.
 * Decorative only (pointer-events none); parent <a> handles navigation.
 */
(function () {
  var STAGES = [
    { n: "01", label: "Parsing intent" },
    { n: "02", label: "Resolving centroid" },
    { n: "03", label: "Evaluating live nodes" },
    { n: "04", label: "Synthesizing route" },
    { n: "05", label: "MCP payload" },
  ];

  var CHIPS = [
    {
      label: "🎪 Street Festivals & Fairs",
      prompt: "Street festivals and fairs in SF",
      result: {
        title: "Sunday Streets — Mission",
        desc: "Car-free blocks with food stalls, live music, and neighborhood vendors.",
        hood: "Mission",
        tags: ["Festival", "Outdoor"],
      },
    },
    {
      label: "🎨 Art Walks & Openings",
      prompt: "Art walks and gallery exhibits tonight in San Francisco",
      result: {
        title: "First Thursday — Geary Corridor",
        desc: "Gallery hop with new openings across Union Square and Nob Hill.",
        hood: "Union Square",
        tags: ["Art", "Walkable"],
      },
    },
    {
      label: "🎷 Live Jazz & Concerts",
      prompt: "Live music and concerts tonight in San Francisco",
      result: {
        title: "Black Cat — Jazz Set",
        desc: "Intimate North Beach stage with late sets and verified walkable stops nearby.",
        hood: "North Beach",
        tags: ["Jazz", "Nightlife"],
      },
    },
    {
      label: "🎲 Game Night",
      prompt: "game night in san francisco this month",
      result: {
        title: "16th Avenue Tiled Steps",
        desc: "Community-driven mosaic of sea-to-stars imagery across 163 steps.",
        hood: "Inner Sunset",
        tags: ["Landmark", "Outdoor"],
      },
    },
  ];

  var STAGE_MS = 700;
  var HOLD_MS = 2600;
  var IDLE_MS = 900;

  function mount(root) {
    if (!root || root.dataset.mounted) return;
    root.dataset.mounted = "1";

    var stagesHtml = STAGES.map(function (s, i) {
      return (
        '<span class="dp-stage-wrap">' +
        '<span class="dp-stage" data-stage="' +
        i +
        '"><span class="dp-stage__num">' +
        s.n +
        "</span> " +
        s.label +
        "</span>" +
        (i < STAGES.length - 1 ? '<span class="dp-stage__arrow" aria-hidden="true">→</span>' : "") +
        "</span>"
      );
    }).join("");

    var chipsHtml = CHIPS.map(function (c, i) {
      return (
        '<span class="dp-chip" data-chip="' +
        i +
        '">' +
        c.label +
        "</span>"
      );
    }).join("");

    root.innerHTML =
      '<div class="dp-console" aria-hidden="true">' +
      '<div class="dp-console__head">' +
      '<span class="dp-console__title">Engine console</span>' +
      '<span class="dp-console__tag">api.dayplay.io/mcp</span>' +
      "</div>" +
      '<div class="dp-console__body">' +
      '<div class="dp-rail">' +
      stagesHtml +
      "</div>" +
      '<div class="dp-chips">' +
      chipsHtml +
      "</div>" +
      '<div class="dp-form">' +
      '<div class="dp-input">Ask the engine what’s happening tonight…</div>' +
      '<div class="dp-ask">Ask</div>' +
      "</div>" +
      '<div class="dp-result is-hidden"></div>' +
      "</div></div>";

    var stageEls = root.querySelectorAll(".dp-stage");
    var chipEls = root.querySelectorAll(".dp-chip");
    var inputEl = root.querySelector(".dp-input");
    var askEl = root.querySelector(".dp-ask");
    var resultEl = root.querySelector(".dp-result");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var chipIndex = 0;
    var stageIndex = -1;
    var loading = false;
    var timers = [];

    function clearTimers() {
      timers.forEach(function (t) {
        window.clearTimeout(t);
        window.clearInterval(t);
      });
      timers = [];
    }

    function paintStages() {
      stageEls.forEach(function (el, n) {
        el.classList.remove("is-active", "is-done");
        if (loading) {
          if (n < stageIndex) el.classList.add("is-done");
          else if (n === stageIndex) el.classList.add("is-active");
        } else if (stageIndex >= STAGES.length) {
          el.classList.add("is-done");
        }
      });
    }

    function paintChips() {
      chipEls.forEach(function (el, n) {
        el.classList.toggle("is-active", loading && n === chipIndex);
      });
    }

    function showResult(chip) {
      var r = chip.result;
      resultEl.innerHTML =
        '<div class="dp-result__top">' +
        '<h4 class="dp-result__title">' +
        r.title +
        "</h4>" +
        '<span class="dp-result__tag">Sample</span>' +
        "</div>" +
        '<div class="dp-result__pills">' +
        '<span class="dp-pill is-hood">📍 ' +
        r.hood +
        "</span>" +
        r.tags
          .map(function (t) {
            return '<span class="dp-pill">' + t + "</span>";
          })
          .join("") +
        "</div>" +
        '<p class="dp-result__desc">' +
        r.desc +
        "</p>" +
        '<div class="dp-result__mcp"><span>MCP call</span><code>get_happening_today</code><span>· San Francisco</span></div>';
      resultEl.classList.remove("is-hidden");
    }

    function hideResult() {
      resultEl.classList.add("is-hidden");
      resultEl.innerHTML = "";
    }

    function runChip(i) {
      chipIndex = i;
      var chip = CHIPS[i];
      loading = true;
      stageIndex = 0;
      hideResult();
      inputEl.textContent = chip.prompt;
      askEl.classList.add("is-busy");
      paintChips();
      paintStages();

      var tick = window.setInterval(function () {
        stageIndex = Math.min(stageIndex + 1, STAGES.length - 1);
        paintStages();
        if (stageIndex >= STAGES.length - 1) {
          window.clearInterval(tick);
        }
      }, STAGE_MS);
      timers.push(tick);

      var doneAt = STAGE_MS * STAGES.length + 200;
      var doneTimer = window.setTimeout(function () {
        loading = false;
        stageIndex = STAGES.length;
        askEl.classList.remove("is-busy");
        paintChips();
        paintStages();
        showResult(chip);

        var next = window.setTimeout(function () {
          hideResult();
          stageIndex = -1;
          paintStages();
          inputEl.textContent = "Ask the engine what’s happening tonight…";
          var idle = window.setTimeout(function () {
            runChip((chipIndex + 1) % CHIPS.length);
          }, IDLE_MS);
          timers.push(idle);
        }, HOLD_MS);
        timers.push(next);
      }, doneAt);
      timers.push(doneTimer);
    }

    paintStages();
    if (reduce) {
      stageIndex = STAGES.length;
      paintStages();
      showResult(CHIPS[0]);
      chipEls[0].classList.add("is-active");
      inputEl.textContent = CHIPS[0].prompt;
      return;
    }

    var start = window.setTimeout(function () {
      runChip(0);
    }, 600);
    timers.push(start);

    root.addEventListener(
      "remove",
      function () {
        clearTimers();
      },
      { once: true }
    );
  }

  function init() {
    document.querySelectorAll("[data-dp-console]").forEach(mount);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
