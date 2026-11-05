/* ==========================================================
   RAVELLA ULTRA — GA4 + META PIXEL
   Turns on automatically when you add your IDs in config.js.
   Add ?debug_tracking=1 to the page URL to see every event in
   the browser console (and in GA4 DebugView).
   ========================================================== */
(function () {
  "use strict";
  var C = window.RAVELLA || {};
  var GA = (C.ga4Id || "").trim();
  var PX = (C.metaPixelId || "").trim();
  // If the Meta Pixel base code is already in <head>, use it and don't load it a second time
  var PX_IN_HEAD = typeof window.fbq === "function";
  if (PX_IN_HEAD && !PX) PX = "head";
  var DEBUG = /[?&]debug_tracking=1/.test(location.search);
  var log = function () { if (DEBUG) console.log.apply(console, ["%c[track]", "color:#3E8A55;font-weight:bold"].concat([].slice.call(arguments))); };

  window.dataLayer = window.dataLayer || [];

  /* ---------- Load GA4 ---------- */
  if (GA) {
    var g = document.createElement("script");
    g.async = true; g.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA);
    document.head.appendChild(g);
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA, DEBUG ? { debug_mode: true } : {});
  }

  /* ---------- Load Meta Pixel ---------- */
  if (PX && !PX_IN_HEAD) {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq("init", PX);
    window.fbq("track", "PageView");
  }

  var ga = function (name, params) { if (GA && window.gtag) window.gtag("event", name, params || {}); log("GA4", name, params || {}); };
  var px = function (name, params, opts) { if (PX && window.fbq) window.fbq("track", name, params || {}, opts || {}); log("Pixel", name, params || {}); };
  var pxc = function (name, params) { if (PX && window.fbq) window.fbq("trackCustom", name, params || {}); log("Pixel custom", name, params || {}); };

  var CUR = "NGN";
  function item(d) {
    return {
      item_id: d.track === "distributor" ? "dist-" + (d.pack_id || "") : "retail-" + (d.bottles || "undecided"),
      item_name: "Ravella Ultra 750ml - " + (d.package || ""),
      item_brand: "Ravella Ultra",
      item_category: d.track === "distributor" ? "Distributor package" : "Retail package",
      price: d.value || 0,
      quantity: 1
    };
  }
  function money(d) { return typeof d.value === "number" ? d.value : 0; }

  /* ---------- Funnel events (called from main.js) ---------- */
  window.RUTrack = function (event, d) {
    d = d || {};
    try {
      // Raw event for Google Tag Manager users
      window.dataLayer.push(Object.assign({ event: "ru_" + event }, d));

      switch (event) {
        case "view_item":
          ga("view_item", { currency: CUR, value: C.retailPerBottle * 2, items: [{ item_id: "retail-2", item_name: "Ravella Ultra 750ml - 2 bottles (Ruby Package)", item_brand: "Ravella Ultra", price: C.retailPerBottle * 2, quantity: 1 }] });
          px("ViewContent", { content_name: "Ravella Ultra Solution Organic Wine 750ml", content_ids: ["ravella-ultra-750ml"], content_type: "product", value: C.retailPerBottle * 2, currency: CUR });
          break;

        case "package_select":
          ga("select_item", { item_list_name: "Bottle picker", items: [item(d)] });
          px("CustomizeProduct", { content_name: d.package, value: money(d), currency: CUR });
          break;

        case "form_open":
          if (d.track === "distributor") {
            ga("begin_distributor_signup", { currency: CUR, value: money(d), package: d.package });
            pxc("DistributorSignupStart", { content_name: d.package, value: money(d), currency: CUR });
          } else {
            ga("begin_checkout", { currency: CUR, value: money(d), items: [item(d)] });
            px("InitiateCheckout", { content_name: d.package, num_items: d.bottles || 1, value: money(d), currency: CUR });
          }
          break;

        case "form_step":
          ga("form_step", { step_number: d.step, funnel: d.track });
          pxc("FormStep", { step: d.step, funnel: d.track });
          break;

        case "switch_to_distributor":
          ga("switch_to_distributor", {});
          pxc("SwitchToDistributor", {});
          break;

        case "form_submit":
          if (d.track === "distributor") {
            ga("sign_up", { method: "distributor_form", package: d.package, value: money(d), currency: CUR });
            ga("generate_lead", { currency: CUR, value: money(d), lead_type: "distributor", package: d.package, reference: d.reference });
            px("CompleteRegistration", { content_name: d.package, status: "submitted", value: money(d), currency: CUR }, { eventID: d.reference });
            px("Lead", { content_name: d.package, content_category: "distributor", value: money(d), currency: CUR }, { eventID: d.reference + "-lead" });
          } else {
            ga("generate_lead", { currency: CUR, value: money(d), lead_type: "retail", package: d.package, reference: d.reference });
            px("Lead", { content_name: d.package, content_category: "retail", value: money(d), currency: CUR }, { eventID: d.reference });
          }
          break;

        case "payment_view":
          ga("view_payment_details", { currency: CUR, value: money(d), funnel: d.track, package: d.package, reference: d.reference });
          pxc("ViewPaymentDetails", { content_name: d.package, value: money(d), currency: CUR });
          break;

        case "payment_claimed":
          // Customer says they've paid. Not yet verified against the UBA statement.
          ga("add_payment_info", { currency: CUR, value: money(d), payment_type: "bank_transfer", items: [item(d)] });
          ga("payment_claimed", { currency: CUR, value: money(d), funnel: d.track, package: d.package, reference: d.reference });
          px("AddPaymentInfo", { content_name: d.package, content_category: d.track, value: money(d), currency: CUR }, { eventID: d.reference + "-pay" });
          break;

        case "whatsapp_click":
          ga("whatsapp_click", { funnel: d.track, package: d.package, value: money(d), currency: CUR, reference: d.reference });
          px("Contact", { content_name: d.package, content_category: d.track, value: money(d), currency: CUR }, { eventID: d.reference + "-wa" });
          break;

        default:
          ga(event, d);
          pxc(event, d);
      }
    } catch (e) { log("tracking error", e); }
  };

  /* ---------- Page-level events ---------- */
  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () {
    window.RUTrack("view_item");

    // Scroll depth (GA4 only tracks 90% by default)
    var marks = [25, 50, 75, 100], sent = {};
    window.addEventListener("scroll", function () {
      var h = document.documentElement, pct = (h.scrollTop + innerHeight) / h.scrollHeight * 100;
      marks.forEach(function (m) { if (pct >= m && !sent[m]) { sent[m] = 1; ga("scroll_depth", { percent: m }); } });
    }, { passive: true });

    // Which sections people actually reach
    if ("IntersectionObserver" in window) {
      var seen = {};
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          var id = e.target.id;
          if (e.isIntersecting && id && !seen[id]) {
            seen[id] = 1; ga("section_view", { section: id });
            if (id === "distributor") pxc("ViewDistributorSection", {});
          }
        });
      }, { threshold: 0.35 });
      ["benefits", "packages", "inside", "delivery", "reviews", "faq", "distributor"].forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
    }
  });

  if (DEBUG) log("GA4:", GA || "(no ID set)", "| Meta Pixel:", PX || "(no ID set)");
})();
