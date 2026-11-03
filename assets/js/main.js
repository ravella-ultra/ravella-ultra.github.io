(function () {
  "use strict";
  var C = window.RAVELLA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt = function (n) { return C.currency + Number(n).toLocaleString("en-NG"); };
  var waLink = function (text) { return "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(text); };
  // All tracking goes through analytics.js (GA4 + Meta Pixel)
  var track = function (event, data) {
    try { if (typeof window.RUTrack === "function") window.RUTrack(event, data || {}); } catch (e) {}
  };
  function pickInfo(q) { var r = retail(q); return { track: "retail", package: retailLabel(q), bottles: q, value: r && r.price ? r.price : 0 }; }
  function info() {
    if (form.track.value === "distributor") {
      var p = pack(fPack.value);
      return { track: "distributor", package: p.name + " (" + bottles(p.bottles) + ")", pack_id: p.id, bottles: p.bottles, value: p.price };
    }
    var q = +fQty.value, r = retail(q);
    return { track: "retail", package: retailLabel(q), bottles: q || 0, value: r && r.price ? r.price : 0 };
  }

  var STATES = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT Abuja","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara","Outside Nigeria"];

  function retail(q) { return C.retail.filter(function (r) { return r.qty === q; })[0]; }
  function bottles(q) { return q + (q === 1 ? " bottle" : " bottles"); }
  var UNDECIDED = "Not sure yet, help me choose";
  function retailLabel(q) { if (!q) return UNDECIDED; var r = retail(q); return bottles(q) + (r && r.name ? " (" + r.name + ")" : ""); }
  function retailPrice(q) { var r = retail(q); return r && r.price ? fmt(r.price) : "Price on WhatsApp"; }
  function pack(id) { return C.distributor.filter(function (p) { return p.id === id; })[0]; }

  /* ---------- UTM capture ---------- */
  var utm = {};
  try {
    var sp = new URLSearchParams(location.search);
    ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","gclid","fbclid"].forEach(function (k) { if (sp.get(k)) utm[k] = sp.get(k); });
    if (Object.keys(utm).length) sessionStorage.setItem("ru_utm", JSON.stringify(utm));
    else utm = JSON.parse(sessionStorage.getItem("ru_utm") || "{}");
  } catch (e) {}

  var yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Bottle picker ---------- */
  var qty = 1;
  var img = $("#pickImg"), out = $("#qtyOut"), orderBtn = $("#pickOrder");
  var chipsWrap = $("#qtyChips");
  [1, 2, 4, 6, 9, 12].forEach(function (n) {
    var b = document.createElement("button");
    b.type = "button"; b.textContent = bottles(n); b.dataset.q = n;
    b.addEventListener("click", function () { setQty(n); track("package_select", pickInfo(n)); });
    chipsWrap.appendChild(b);
  });
  function imgFor(n) { return "assets/img/ravella-ultra-" + n + "-bottle" + (n > 1 ? "s" : "") + ".jpg"; }
  // preload
  for (var i = 1; i <= 12; i++) { var p = new Image(); p.src = imgFor(i); }

  function setQty(n) {
    qty = Math.max(1, Math.min(12, n));
    var r = retail(qty);
    out.textContent = qty;
    $("#qtyMinus").disabled = qty === 1;
    $("#qtyPlus").disabled = qty === 12;
    img.classList.add("swap");
    setTimeout(function () { img.src = imgFor(qty); img.alt = bottles(qty) + " of Ravella Ultra"; img.classList.remove("swap"); }, 120);
    $("#pickName").textContent = retailLabel(qty);
    $("#pickPrice").textContent = retailPrice(qty);
    if (r && r.price) {
      var per = Math.round(r.price / qty), save = C.retailPerBottle * qty - r.price;
      $("#pickUnit").innerHTML = fmt(per) + " per bottle" + (save > 0 ? " · <b>you save " + fmt(save) + "</b>" : "");
    } else {
      $("#pickUnit").textContent = "We'll confirm the price for this package on WhatsApp.";
    }
    orderBtn.dataset.qty = qty;
    orderBtn.textContent = "Order " + bottles(qty);
    $$("button", chipsWrap).forEach(function (b) { b.setAttribute("aria-pressed", String(+b.dataset.q === qty)); });
    $$("#priceRows tr").forEach(function (tr) { tr.classList.toggle("is-sel", +tr.dataset.q === qty); });
  }
  $("#qtyMinus").addEventListener("click", function () { setQty(qty - 1); track("package_select", pickInfo(qty)); });
  $("#qtyPlus").addEventListener("click", function () { setQty(qty + 1); track("package_select", pickInfo(qty)); });

  /* ---------- Price table ---------- */
  var rows = $("#priceRows");
  C.retail.forEach(function (r) {
    var tr = document.createElement("tr"); tr.dataset.q = r.qty;
    tr.innerHTML = "<td>" + bottles(r.qty) + "</td><td>" + (r.name || "") + "</td><td>" + (r.price ? fmt(r.price) : "Ask us") +
      "</td><td>" + (r.price ? fmt(Math.round(r.price / r.qty)) : "") + "</td><td><button type='button' class='linkbtn' data-order data-qty='" + r.qty + "'>Order</button></td>";
    rows.appendChild(tr);
  });

  /* ---------- Distributor packages ---------- */
  var dp = $("#dpacks");
  C.distributor.forEach(function (p) {
    var save = C.retailPerBottle * p.bottles - p.price;
    var d = document.createElement("div"); d.className = "dpack";
    d.innerHTML = (p === C.distributor[0] ? "<span class='dpack__tag'>Starting package</span>" : "") + "<span class='dpack__name'>" + p.name + "</span><span class='dpack__qty'>" + bottles(p.bottles) + "</span>" +
      "<span class='dpack__price'>" + fmt(p.price) + "</span>" +
      (save > 0 ? "<span class='dpack__save'>" + fmt(save) + " less than regular price</span>" : "") +
      "<button type='button' data-order data-track='distributor' data-pack='" + p.id + "'>Choose " + p.name + "</button>";
    dp.appendChild(d);
  });

  setQty(1);

  /* ---------- Sticky mobile bar ---------- */
  var sticky = $("#stickybar"), hero = $(".hero"), dist = $("#distributor");
  if ("IntersectionObserver" in window) {
    var heroGone = false, distIn = false;
    var upd = function () { sticky.classList.toggle("show", heroGone && !distIn); };
    new IntersectionObserver(function (e) { heroGone = !e[0].isIntersecting; upd(); }).observe(hero);
    new IntersectionObserver(function (e) { distIn = e[0].isIntersecting; upd(); }, { threshold: 0.05 }).observe(dist);
  }

  /* =========================================================
     ORDER / REGISTRATION DIALOG
     ========================================================= */
  var modal = $("#orderModal"), form = $("#orderForm");
  var fQty = $("#fQty"), fPack = $("#fPack"), fState = $("#fState");
  fQty.add(new Option(UNDECIDED, 0));
  C.retail.forEach(function (r) { fQty.add(new Option(retailLabel(r.qty) + " · " + retailPrice(r.qty), r.qty)); });
  C.distributor.forEach(function (p) { fPack.add(new Option(p.name + " · " + bottles(p.bottles) + " · " + fmt(p.price), p.id)); });
  STATES.forEach(function (s) { fState.add(new Option(s, s)); });

  var step = 1, ref = "";
  function mode() { return form.track.value; }
  function stepsFor() { return mode() === "distributor" ? [1, 2, 3] : [1, 2]; }

  function summary() {
    if (mode() === "distributor") {
      var p = pack(fPack.value);
      return "<b>" + p.name + " package</b>: " + bottles(p.bottles) + " for <b>" + fmt(p.price) + "</b>, no delivery fee.";
    }
    var q = +fQty.value;
    if (!q) return "No problem. Tell us a little about you and we'll recommend a package on WhatsApp. <a href='#' id='switchDist'>Or sign up as a distributor</a>";
    return "<b>" + retailLabel(q) + "</b>: " + retailPrice(q) + ", plus delivery. <a href='#' id='switchDist'>Pay " + fmt(C.distributorPerBottle) + " a bottle instead</a>";
  }
  function refresh() {
    var m = mode();
    $$("[data-show]", form).forEach(function (el) { el.hidden = el.dataset.show !== m; });
    $("#fSummary").innerHTML = summary();
    var sw = $("#switchDist");
    if (sw) sw.addEventListener("click", function (e) { e.preventDefault(); setTrack("distributor"); track("switch_to_distributor"); });
    renderStep();
  }
  function setTrack(t) {
    form.track.value = t;
    $$("input[name=track]", form).forEach(function (r) { r.checked = r.value === t; });
    if (t === "distributor" && !fPack.value) fPack.value = C.distributor[0].id;
    refresh();
  }

  var TITLES = { 1: "Your order", 2: "4 quick questions", 3: "Distributor registration" };
  function renderStep() {
    var list = stepsFor();
    $$(".step", form).forEach(function (s) { s.hidden = s.dataset.step !== String(step); });
    var foot = $("#mFoot");
    if (step === "done") {
      $("#mStep").textContent = "Done";
      $("#mTitle").textContent = mode() === "distributor" ? "Registration received" : "Order received";
      $("#mBar").style.width = "100%";
      foot.hidden = true;
      return;
    }
    foot.hidden = false;
    var idx = list.indexOf(step);
    $("#mStep").textContent = "Step " + (idx + 1) + " of " + list.length;
    $("#mTitle").textContent = TITLES[step];
    $("#mBar").style.width = ((idx + 1) / (list.length + 0.5) * 100) + "%";
    $("#mBack").hidden = idx === 0;
    var last = idx === list.length - 1;
    $("#mNext").textContent = last ? (mode() === "distributor" ? "Submit registration" : "Submit order") : "Next";
    $("#formErr").hidden = true;
  }

  function openModal(opts) {
    step = 1;
    form.reset();
    $$(".is-bad", form).forEach(function (e) { e.classList.remove("is-bad"); });
    fQty.value = opts.qty ? opts.qty : "0";
    fPack.value = opts.pack || C.distributor[0].id;
    setTrack(opts.track === "distributor" ? "distributor" : "retail");
    if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", "");
    setTimeout(function () { var n = $("#fName"); if (n) n.focus(); }, 60);
    track("form_open", info());
  }
  function closeModal() { if (modal.close) modal.close(); else modal.removeAttribute("open"); }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-order]");
    if (!b) return;
    e.preventDefault();
    openModal({ track: b.dataset.track, qty: b.dataset.qty, pack: b.dataset.pack });
  });
  $$("[data-close]", form).forEach(function (b) { b.addEventListener("click", closeModal); });
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  $$("input[name=track]", form).forEach(function (r) { r.addEventListener("change", function () { setTrack(r.value); }); });
  fQty.addEventListener("change", refresh);
  fPack.addEventListener("change", refresh);

  /* ---------- Validation ---------- */
  function validate(n) {
    var fs = $(".step[data-step='" + n + "']", form), ok = true, first = null;
    $$(".is-bad", fs).forEach(function (e) { e.classList.remove("is-bad"); });
    var bad = function (el, focusEl) { ok = false; el.classList.add("is-bad"); if (!first) first = focusEl || el; };

    $$("input:not([type=radio]):not([type=checkbox]), select", fs).forEach(function (el) {
      if (el.closest("[hidden]") || !el.required) return;
      var v = el.value.trim();
      if (!v) return bad(el);
      if (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return bad(el);
      if (el.name === "phone" && v.replace(/\D/g, "").length < 10) return bad(el);
      if (el.name === "account_number" && !/^\d{10}$/.test(v)) return bad(el);
    });
    $$(".q", fs).forEach(function (q) {
      var r = $("input[type=radio]", q);
      if (r && !form[r.name].value) bad(q, r);
    });
    $$("input[type=checkbox][required]", fs).forEach(function (c) { if (!c.checked) bad(c.closest(".check"), c); });

    var err = $("#formErr");
    if (!ok) {
      err.textContent = n === 2 ? "Answer all 4 questions and tick the box to continue." : "Fill in the highlighted fields to continue.";
      err.hidden = false;
      first && first.focus();
    } else err.hidden = true;
    return ok;
  }
  form.addEventListener("input", function (e) {
    var t = e.target.closest(".is-bad") || (e.target.classList.contains("is-bad") ? e.target : null);
    if (t) t.classList.remove("is-bad");
    var q = e.target.closest(".q"); if (q) q.classList.remove("is-bad");
    var c = e.target.closest(".check"); if (c) c.classList.remove("is-bad");
  });

  $("#mBack").addEventListener("click", function () {
    var list = stepsFor(); step = list[Math.max(0, list.indexOf(step) - 1)]; renderStep();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (step === "done") return;
    if (!validate(step)) return;
    var list = stepsFor(), idx = list.indexOf(step);
    if (idx < list.length - 1) {
      step = list[idx + 1]; renderStep();
      track("form_step", { step: step, track: mode() });
      var f = $(".step[data-step='" + step + "'] input", form); f && f.focus();
      return;
    }
    submitAll();
  });

  /* ---------- Submit + WhatsApp handoff ---------- */
  function val(n) { var el = form.elements[n]; return el ? String(el.value || "").trim() : ""; }

  function payload() {
    var dist = mode() === "distributor";
    var d = {
      form_type: dist ? "Distributor registration" : "Retail order",
      reference: ref,
      submitted_at: new Date().toISOString(),
      full_name: val("full_name"), phone: val("phone"), city: val("city"), state: val("state"),
      q_for: val("q_for"), q_used_before: val("q_used"), q_when: val("q_when"), q_source: val("q_source"),
      adult_confirm: form.adult_confirm.checked ? "yes" : "no",
      page_url: location.href.split("#")[0]
    };
    if (dist) {
      var p = pack(fPack.value);
      Object.assign(d, {
        package: p.name + " (" + bottles(p.bottles) + ")", bottles: p.bottles, price: p.price,
        username: val("username"), email: val("email"), address: val("address"),
        bank_name: val("bank_name"), account_number: val("account_number"), account_name: val("account_name"),
        data_consent: form.data_consent.checked ? "yes" : "no"
      });
    } else {
      var q = +fQty.value, r = retail(q);
      Object.assign(d, { package: retailLabel(q), bottles: q || "undecided", price: r && r.price ? r.price : "ask" });
    }
    return Object.assign(d, utm);
  }

  function waMessage(d) {
    var price = typeof d.price === "number" ? fmt(d.price) : "please confirm the price";
    if (d.form_type === "Distributor registration") {
      return "Hello, I've just registered as a Ravella Ultra distributor.\n\n" +
        "Ref: " + d.reference + "\nPackage: " + d.package + ", " + price + "\nName: " + d.full_name +
        "\nUsername: " + d.username + "\nLocation: " + d.city + ", " + d.state +
        "\n\nPlease send me the company account details so I can pay and complete my registration. Please also send the distributor terms.";
    }
    if (d.bottles === "undecided") {
      return "Hello, I'd like to order Ravella Ultra but I'm not sure which package to choose.\n\n" +
        "Ref: " + d.reference + "\nName: " + d.full_name + "\nDelivery to: " + d.city + ", " + d.state +
        "\nFor: " + d.q_for + "\nNeeded: " + d.q_when + "\n\nPlease help me choose a package, then send me the account details so I can complete my order.";
    }
    return "Hello, I'd like to order Ravella Ultra.\n\n" +
      "Ref: " + d.reference + "\nPackage: " + d.package + ", " + price + "\nName: " + d.full_name +
      "\nDelivery to: " + d.city + ", " + d.state + "\nNeeded: " + d.q_when +
      "\n\nPlease confirm my total with delivery and send me the account details so I can pay and complete my order.";
  }

  function send(d) {
    if (form.botcheck.checked) return Promise.resolve("spam");
    if (!C.web3formsKey) { console.warn("[Ravella] web3formsKey is empty in config.js, so this submission was not emailed.", d); return Promise.resolve("no-key"); }
    var dist = d.form_type === "Distributor registration";
    var body = Object.assign({
      access_key: C.web3formsKey,
      subject: (dist ? "New distributor registration: " : "New order: ") + d.package + " | " + d.full_name + " | " + d.city + ", " + d.state + " [" + d.reference + "]",
      from_name: "Ravella Ultra website",
      botcheck: false
    }, d);
    if (d.email) body.replyto = d.email;
    var req = fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body)
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j.success) console.warn("[Ravella] Web3Forms error", j);
      return j.success ? "ok" : "error";
    });
    var timeout = new Promise(function (res) { setTimeout(function () { res("timeout"); }, 8000); });
    return Promise.race([req, timeout]).catch(function (err) { console.warn("[Ravella] submit failed", err); return "error"; });
  }

  function submitAll() {
    ref = (mode() === "distributor" ? "RD-" : "RU-") + Date.now().toString(36).toUpperCase().slice(-6);
    var btn = $("#mNext"); btn.disabled = true; btn.textContent = "Sending…";
    var d = payload();
    send(d).then(function () {
      btn.disabled = false;
      track("form_submit", Object.assign(info(), { reference: ref }));
      var dist = mode() === "distributor";
      $("#doneTitle").textContent = dist ? "Thanks, " + d.full_name.split(" ")[0] + ". Your registration is in." : "Thanks, " + d.full_name.split(" ")[0] + ". Your order details are in.";
      $("#doneText").textContent = dist
        ? "One last step. Request the company account details on WhatsApp to complete your registration. Payment is made only to the Ravella Ultra company account."
        : "One last step. Request the account details on WhatsApp to complete your order. We'll confirm your total with delivery, and payment is made only to the company account.";
      $("#doneRef").textContent = ref;
      var wa = $("#doneWa");
      wa.href = waLink(waMessage(d));
      wa.textContent = dist ? "Request company account details on WhatsApp" : "Request account details on WhatsApp";
      step = "done"; renderStep();
      wa.focus();
    });
  }
  $("#doneWa").addEventListener("click", function () { track("whatsapp_click", Object.assign(info(), { reference: ref })); });
})();
