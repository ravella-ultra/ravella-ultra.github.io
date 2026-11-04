/* ==========================================================
   RAVELLA ULTRA — SITE SETTINGS
   Edit this file to change prices, the WhatsApp number or the
   form backend. You don't need to touch index.html or main.js.
   ========================================================== */
window.RAVELLA = {
  // WhatsApp number in international format, digits only (no +, no spaces)
  whatsapp: "2349075792074",
  whatsappDisplay: "+234 907 579 2074",

  // Paste your Web3Forms access key here (see README.md).
  // While this is empty the forms still work and hand off to WhatsApp,
  // but nothing is emailed to Gmail.
  web3formsKey: "1f79f6e0-06c9-4e81-ac59-6ff71c1fe288",

  // Tracking: paste your IDs between the quotes. Leave empty to switch off.
  ga4Id: "",         // GA4 Measurement ID, looks like "G-XXXXXXXXXX"
  metaPixelId: "1670272394670316",   // Meta Pixel ID, a number like "1234567890123456"

  // Company account. All payments go here, before WhatsApp.
  bank: {
    accountName: "RAVELLA ULTRA SOLUTION",
    accountNumber: "1028701744",
    bankName: "UBA"
  },

  currency: "₦",
  retailPerBottle: 20000,
  distributorPerBottle: 15000,

  // Retail ladder. price: null => "Ask for price on WhatsApp"
  retail: [
    { qty: 1,  price: 20000 },
    { qty: 2,  price: 40000,  name: "Ruby Package" },
    { qty: 3,  price: 60000 },
    { qty: 4,  price: 80000,  name: "Heritage Package" },
    { qty: 5,  price: 95000 },
    { qty: 6,  price: 115000 },
    { qty: 7,  price: 135000 },
    { qty: 8,  price: 155000 },
    { qty: 9,  price: 175000, name: "Prestige Package" },
    { qty: 10, price: 190000 },
    { qty: 11, price: null },   // confirm price before showing
    { qty: 12, price: null }    // confirm price before showing
  ],

  // Distributor packages (no PV / income figures shown on purpose)
  distributor: [
    { id: "heritage", name: "Heritage",    bottles: 4,   price: 60000 },
    { id: "prestige", name: "Prestige",    bottles: 9,   price: 135000 },
    { id: "royal",    name: "Royal",       bottles: 19,  price: 285000 },
    { id: "imperial", name: "Imperial",    bottles: 35,  price: 525000 },
    { id: "crown",    name: "Crown Jewel", bottles: 51,  price: 765000 },
    { id: "supreme",  name: "Supreme",     bottles: 115, price: 1725000 }
  ]
};
