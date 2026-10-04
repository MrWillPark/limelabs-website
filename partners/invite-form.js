/**
 * Partner TestFlight invite forms → FormSubmit → hello@limelabs.dev
 * Free tier; first live submit sends an activation email Will must confirm once.
 */
(function () {
  var ENDPOINT = "https://formsubmit.co/ajax/hello@limelabs.dev";

  function showStatus(form, kind, message) {
    var status = form.querySelector("[data-form-status]");
    if (!status) return;
    status.hidden = false;
    status.className = "form-status form-status--" + kind;
    status.textContent = message;
    status.setAttribute("role", "status");
  }

  function setBusy(form, busy) {
    var btn = form.querySelector('[type="submit"]');
    form.setAttribute("aria-busy", busy ? "true" : "false");
    if (btn) {
      btn.disabled = !!busy;
      if (busy) {
        btn.dataset.label = btn.textContent;
        btn.textContent = "Sending…";
      } else if (btn.dataset.label) {
        btn.textContent = btn.dataset.label;
      }
    }
  }

  function showSuccess(form, vendor) {
    var fields = form.querySelector("[data-form-fields]");
    var success = form.querySelector("[data-form-success]");
    if (fields) fields.hidden = true;
    if (success) {
      success.hidden = false;
      var nameEl = success.querySelector("[data-success-vendor]");
      if (nameEl) nameEl.textContent = vendor;
      success.focus();
    }
    showStatus(form, "ok", "Request received. We’ll email your private TestFlight invite shortly.");
  }

  function collectPayload(form) {
    var vendor = form.getAttribute("data-vendor") || "Partner";
    var subject = form.getAttribute("data-subject") || vendor + " TestFlight invite";
    var email = (form.querySelector('[name="email"]') || {}).value || "";
    var appleId = (form.querySelector('[name="apple_id"]') || {}).value || "";
    var name = (form.querySelector('[name="name"]') || {}).value || "";
    var note = (form.querySelector('[name="note"]') || {}).value || "";
    var shop = (form.querySelector('[name="shop"]') || {}).value || vendor;

    return {
      _subject: subject,
      _template: "table",
      _captcha: "false",
      // Carbon-copy personal inbox — FormSubmit free tier sometimes drops
      // delivery to hello@ after bursts; CC keeps signups visible.
      _cc: "will.park@gmail.com",
      form: "partner-testflight-invite",
      shop: shop,
      name: name || "(not provided)",
      email: email,
      apple_id: appleId || email,
      apple_id_same_as_email: appleId ? "no" : "yes",
      note: note || "(none)",
      page: typeof location !== "undefined" ? location.href : "",
      message:
        "Private TestFlight invite request for " +
        shop +
        ". Contact email: " +
        email +
        ". Apple ID: " +
        (appleId || email) +
        "."
    };
  }

  function onSubmit(event) {
    event.preventDefault();
    var form = event.currentTarget;
    var vendor = form.getAttribute("data-vendor") || "Partner";
    var emailInput = form.querySelector('[name="email"]');
    if (!emailInput || !emailInput.value.trim()) {
      showStatus(form, "error", "Email is required.");
      if (emailInput) emailInput.focus();
      return;
    }

    setBusy(form, true);
    showStatus(form, "pending", "Sending your private TestFlight request…");

    fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(collectPayload(form))
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          throw new Error((result.data && result.data.message) || "Submit failed");
        }
        showSuccess(form, vendor);
      })
      .catch(function () {
        showStatus(
          form,
          "error",
          "Couldn’t send just now. Email hello@limelabs.dev with your Apple ID, or try again in a minute."
        );
      })
      .finally(function () {
        setBusy(form, false);
      });
  }

  document.querySelectorAll("[data-invite-form]").forEach(function (form) {
    form.addEventListener("submit", onSubmit);
  });
})();
