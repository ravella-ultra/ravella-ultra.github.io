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
  var MAXQ = Math.max.apply(null, C.retail.filter(function (r) { return r.price; }).map(function (r) { return r.qty; }));
  var MINQ = Math.min.apply(null, C.retail.filter(function (r) { return r.price; }).map(function (r) { return r.qty; }));
  [2, 4, 6, 9, 10, 12].filter(function (n) { return n >= MINQ && n <= MAXQ; }).forEach(function (n) {
    var b = document.createElement("button");
    b.type = "button"; b.textContent = bottles(n); b.dataset.q = n;
    b.addEventListener("click", function () { setQty(n); track("package_select", pickInfo(n)); });
    chipsWrap.appendChild(b);
  });
  function imgFor(n) { return "assets/img/ravella-ultra-" + n + "-bottle" + (n > 1 ? "s" : "") + ".jpg"; }
  // preload
  for (var i = MINQ; i <= MAXQ; i++) { var p = new Image(); p.src = imgFor(i); }

  function setQty(n) {
    qty = Math.max(MINQ, Math.min(MAXQ, n));
    var r = retail(qty);
    out.textContent = qty;
    $("#qtyMinus").disabled = qty === MINQ;
    $("#qtyPlus").disabled = qty === MAXQ;
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
  C.retail.filter(function (r) { return r.price; }).forEach(function (r) {
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

  setQty(MINQ);

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
  C.retail.filter(function (r) { return r.price; }).forEach(function (r) { fQty.add(new Option(retailLabel(r.qty) + " · " + retailPrice(r.qty), r.qty)); });
  C.distributor.forEach(function (p) { fPack.add(new Option(p.name + " · " + bottles(p.bottles) + " · " + fmt(p.price), p.id)); });
  STATES.forEach(function (s) { fState.add(new Option(s, s)); });

  var step = 1, ref = "", order = null;   // order = saved details once the form is submitted
  var B = C.bank;
  function mode() { return form.track.value; }
  function stepsFor() { return (mode() === "distributor" ? [1, 2, 3] : [1, 2]).concat(["pay"]); }

  function summary() {
    if (mode() === "distributor") {
      var p = pack(fPack.value);
      return "<b>" + p.name + " package</b>: " + bottles(p.bottles) + " for <b>" + fmt(p.price) + "</b>, no delivery fee.";
    }
    var q = +fQty.value;
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

  var TITLES = { 1: "Your order", 2: "4 quick questions", 3: "Distributor registration", pay: "Make your payment" };
  function renderStep() {
    var list = stepsFor();
    $$(".step", form).forEach(function (s) { s.hidden = s.dataset.step !== String(step); });
    var foot = $("#mFoot"), next = $("#mNext");
    $("#formErr").hidden = true;
    if (step === "done") {
      $("#mStep").textContent = "Done";
      $("#mTitle").textContent = "Send proof of payment";
      $("#mBar").style.width = "100%";
      foot.hidden = true;
      return;
    }
    foot.hidden = false;
    var idx = list.indexOf(step);
    $("#mStep").textContent = "Step " + (idx + 1) + " of " + list.length;
    $("#mTitle").textContent = TITLES[step];
    $("#mBar").style.width = ((idx + 1) / (list.length + 0.5) * 100) + "%";
    $("#mBack").hidden = idx === 0 || step === "pay";
    if (step === "pay") { next.textContent = "Yes, I have made the payment"; checkPay(); return; }
    next.disabled = false;
    var lastData = idx === list.length - 2;
    next.textContent = lastData ? "Submit and pay" : "Next";
  }

  function openModal(opts) {
    step = 1; order = null;
    form.reset();
    $$(".is-bad", form).forEach(function (e) { e.classList.remove("is-bad"); });
    fQty.value = opts.qty && +opts.qty >= MINQ ? opts.qty : String(MINQ);
    fPack.value = opts.pack || C.distributor[0].id;
    setTrack(opts.track === "distributor" ? "distributor" : "retail");
    showModal();
    setTimeout(function () { var n = $("#fName"); if (n) n.focus(); }, 60);
    track("form_open", info());
  }
  function showModal() { if (typeof modal.showModal === "function") { if (!modal.open) modal.showModal(); } else modal.setAttribute("open", ""); }
  function closeModal() { if (modal.close) modal.close(); else modal.removeAttribute("open"); showResume(); }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-order]");
    if (!b) return;
    e.preventDefault();
    openModal({ track: b.dataset.track, qty: b.dataset.qty, pack: b.dataset.pack });
  });
  $$("[data-close]", form).forEach(function (b) { b.addEventListener("click", closeModal); });
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  modal.addEventListener("cancel", function () { setTimeout(showResume, 0); });
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
      if (el.name === "payer_amount" && order && amountOf(v) < order.price) return bad(el);
    });
    $$(".q", fs).forEach(function (q) {
      var r = $("input[type=radio]", q);
      if (r && !form[r.name].value) bad(q, r);
    });
    $$("input[type=checkbox][required]", fs).forEach(function (c) { if (!c.checked) bad(c.closest(".check"), c); });

    var err = $("#formErr");
    if (!ok) {
      err.textContent = n === 2 ? "Answer all 4 questions and tick the box to continue."
        : n === "pay" ? "Enter the name and bank you paid from, and the amount you sent (at least " + fmt(order.price) + "). Then tick the box."
        : "Fill in the highlighted fields to continue.";
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
    if (step === "pay") checkPay();
  });
  form.addEventListener("change", function () { if (step === "pay") checkPay(); });

  $("#mBack").addEventListener("click", function () {
    var list = stepsFor(); step = list[Math.max(0, list.indexOf(step) - 1)]; renderStep();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (step === "done") return;
    if (!validate(step)) return;
    if (step === "pay") return confirmPayment();
    var list = stepsFor(), idx = list.indexOf(step);
    if (list[idx + 1] !== "pay") {
      step = list[idx + 1]; renderStep();
      track("form_step", { step: step, track: mode() });
      var f = $(".step[data-step='" + step + "'] input", form); f && f.focus();
      return;
    }
    submitOrder();
  });

  /* ---------- Data ---------- */
  function val(n) { var el = form.elements[n]; return el ? String(el.value || "").trim() : ""; }
  function amountOf(v) { return +String(v).replace(/[^\d.]/g, "") || 0; }

  function payload() {
    var dist = mode() === "distributor";
    var d = {
      form_type: dist ? "Distributor registration" : "Retail order",
      status: "Awaiting payment",
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
        track: "distributor", pack_id: p.id,
        package: p.name + " (" + bottles(p.bottles) + ")", bottles: p.bottles, price: p.price,
        username: val("username"), email: val("email"), address: val("address"),
        bank_name: val("bank_name"), account_number: val("account_number"), account_name: val("account_name"),
        data_consent: form.data_consent.checked ? "yes" : "no"
      });
    } else {
      var q = +fQty.value, r = retail(q);
      Object.assign(d, { track: "retail", package: retailLabel(q), bottles: q, price: r && r.price ? r.price : 0 });
    }
    return Object.assign(d, utm);
  }
  function orderInfo() { return order ? { track: order.track, package: order.package, pack_id: order.pack_id, bottles: order.bottles, value: order.price, reference: order.reference } : info(); }

  /* ---------- Web3Forms ---------- */
  function send(d, subject) {
    if (form.botcheck.checked) return Promise.resolve("spam");
    if (!C.web3formsKey) { console.warn("[Ravella] web3formsKey is empty in config.js, so this submission was not emailed.", d); return Promise.resolve("no-key"); }
    var body = Object.assign({ access_key: C.web3formsKey, subject: subject, from_name: "Ravella Ultra website", botcheck: false }, d);
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

  /* ---------- Saved order (so a customer can leave for their bank app and come back) ---------- */
  var KEY = "ru_pending_order";
  function save() { try { if (order) localStorage.setItem(KEY, JSON.stringify(order)); } catch (e) {} }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
  function clearSaved() { try { localStorage.removeItem(KEY); } catch (e) {} var r = $("#resume"); if (r) r.remove(); }

  function showResume() {
    var o = order || load();
    if (!o || step === "done" || $("#resume")) return;
    var bar = document.createElement("div");
    bar.className = "resume"; bar.id = "resume"; bar.setAttribute("role", "status");
    bar.innerHTML = "<span>Order " + o.reference + " is waiting for payment</span>";
    var b = document.createElement("button");
    b.type = "button"; b.className = "btn btn--gold"; b.textContent = "Finish payment";
    b.addEventListener("click", function () { resume(o); });
    bar.appendChild(b); document.body.appendChild(bar);
  }
  function resume(o) {
    var r = $("#resume"); if (r) r.remove();
    order = o; ref = o.reference;
    form.reset();
    if (o.track === "distributor") fPack.value = o.pack_id; else fQty.value = o.bottles;
    form.track.value = o.track;
    $$("input[name=track]", form).forEach(function (x) { x.checked = x.value === o.track; });
    $$("[data-show]", form).forEach(function (el) { el.hidden = el.dataset.show !== o.track; });
    fillPay(); step = "pay"; renderStep(); showModal();
  }

  /* ---------- Step: submit order, then show account ---------- */
  function submitOrder() {
    ref = (mode() === "distributor" ? "RD-" : "RU-") + Date.now().toString(36).toUpperCase().slice(-6);
    // Nothing is emailed yet. All details are kept and sent once, together with the payment confirmation.
    var d = payload();
    order = { reference: ref, track: d.track, pack_id: d.pack_id, package: d.package, bottles: d.bottles, price: d.price,
      full_name: d.full_name, phone: d.phone, city: d.city, state: d.state, username: d.username || "", email: d.email || "",
      details: d };
    save();
    track("form_submit", orderInfo());
    fillPay();
    step = "pay"; renderStep();
    track("payment_view", orderInfo());
    modal.scrollTop = 0;
  }

  function fillPay() {
    var dist = order.track === "distributor";
    $("#payKind").textContent = dist ? "distributor registration" : "order";
    $("#payRefTop").textContent = order.reference;
    $("#payAmtTop").textContent = $("#payAmt").textContent = fmt(order.price);
    $("#payNum").textContent = B.accountNumber;
    $("#payName").textContent = B.accountName;
    $("#payBank").textContent = B.bankName;
    $("#payRef").textContent = order.reference;
    $("#payNote").textContent = dist
      ? "This is your full " + order.package + " package. There's no delivery fee on distributor packages."
      : "This pays for your bottles: " + order.package + ". We'll confirm your delivery fee on WhatsApp after we confirm your payment.";
    $("#paidText").textContent = "I have transferred " + fmt(order.price) + " to " + B.accountName + ", " + B.bankName + " " + B.accountNumber + ".";
  }

  // The "Yes, I have made the payment" button stays locked until the transfer details are filled in
  function checkPay() {
    var ok = order && val("payer_name").length > 2 && val("payer_bank").length > 1 &&
      amountOf(val("payer_amount")) >= order.price && form.paid_confirm.checked;
    $("#mNext").disabled = !ok;
    return ok;
  }

  // Copy buttons
  $$(".acct__copy").forEach(function (b) {
    b.addEventListener("click", function () {
      var t = b.dataset.copy === "amount" ? String(order.price) : b.dataset.copy === "number" ? B.accountNumber : order.reference;
      var done = function () { b.textContent = "Copied"; b.classList.add("is-done"); setTimeout(function () { b.textContent = "Copy"; b.classList.remove("is-done"); }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, done);
      else { var ta = document.createElement("textarea"); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) {} ta.remove(); done(); }
      track("copy_account_detail", { field: b.dataset.copy });
    });
  });

  /* ---------- Step: payment claimed, then WhatsApp ---------- */
  function waMessage(o, p) {
    var dist = o.track === "distributor";
    var lines = [
      dist ? "Hello, I've paid for my Ravella Ultra distributor registration." : "Hello, I've paid for my Ravella Ultra order.",
      "",
      "Ref: " + o.reference,
      "Package: " + o.package,
      "Amount paid: " + fmt(p.amount),
      "Paid from: " + p.name + " (" + p.bank + ")",
      "Paid to: " + B.accountName + ", " + B.bankName + " " + B.accountNumber,
      "Name: " + o.full_name + (dist && o.username ? " (username: " + o.username + ")" : ""),
      (dist ? "Location: " : "Delivery to: ") + o.city + ", " + o.state,
      "",
      "I've attached my proof of payment. " + (dist
        ? "Please confirm my payment and complete my distributor registration. Please also send me the distributor terms."
        : "Please confirm my payment and let me know my delivery fee.")
    ];
    return lines.join("\n");
  }

  function confirmPayment() {
    if (!checkPay()) return;
    var p = { name: val("payer_name"), bank: val("payer_bank"), amount: amountOf(val("payer_amount")) };
    var btn = $("#mNext"); btn.disabled = true; btn.textContent = "Saving…";
    var dist = order.track === "distributor";
    var d = Object.assign({}, order.details || order, {
      form_type: dist ? "Distributor registration (paid)" : "Retail order (paid)",
      status: "Customer says paid, check UBA statement",
      payer_name: p.name, payer_bank: p.bank, amount_paid: p.amount, amount_due: order.price,
      paid_to: B.accountName + ", " + B.bankName + " " + B.accountNumber,
      claimed_at: new Date().toISOString()
    }, utm);
    delete d.details;
    send(d, (dist ? "PAID distributor registration: " : "PAID order: ") + order.package + " | " + fmt(p.amount) + " from " + p.name + " (" + p.bank + ") | " +
      order.full_name + ", " + order.city + " [" + order.reference + "]")
      .then(function () {
        track("payment_claimed", Object.assign(orderInfo(), { amount_paid: p.amount }));
        $("#doneTitle").textContent = "Thanks, " + order.full_name.split(" ")[0] + ". One last step.";
        $("#doneText").textContent = dist
          ? "Send your proof of payment on WhatsApp. Once we confirm the payment, we'll complete your distributor registration."
          : "Send your proof of payment on WhatsApp. Once we confirm the payment, we'll confirm your delivery fee and send your order.";
        $("#doneRef").textContent = order.reference;
        $("#doneWa").href = waLink(waMessage(order, p));
        step = "done"; renderStep();
        clearSaved();
        $("#doneWa").focus();
      });
  }
  $("#doneWa").addEventListener("click", function () { track("whatsapp_click", orderInfo()); });

  // Returning visitor with an unpaid order
  if (load()) showResume();
})();
