/* ==========================================================
   RAVELLA ULTRA — SITE SETTINGS
   Edit this file to change prices, the WhatsApp number or the
   form backend. You don't need to touch index.html or main.js.
   ========================================================== */
window.RAVELLA = {
  // WhatsApp number in international format, digits only (no +, no spaces)
  whatsapp: "2348057025964",
  whatsappDisplay: "+234 805 702 5964",

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
    { qty: 2,  price: 50000,  name: "Ruby Package" },
    { qty: 3,  price: 75000 },
    { qty: 4,  price: 100000,  name: "Heritage Package" },
    { qty: 5,  price: 125000 },
    { qty: 6,  price: 150000 },
    { qty: 7,  price: 168000 },
    { qty: 8,  price: 192000 },
    { qty: 9,  price: 216000, name: "Prestige Package" },
    { qty: 10, price: 240000 },
    { qty: 11, price: 264000 },   // confirm price before showing
    { qty: 12, price: 288000 }    // confirm price before showing
  ],

  // Distributor packages (no PV / income figures shown on purpose)
  distributor: [
    { id: "heritage", name: "Heritage",    bottles: 4,   price: 80000 },
    { id: "prestige", name: "Prestige",    bottles: 9,   price: 180000 },
    { id: "royal",    name: "Royal",       bottles: 19,  price: 380000 },
    { id: "imperial", name: "Imperial",    bottles: 35,  price: 700000 },
    { id: "crown",    name: "Crown Jewel", bottles: 51,  price: 1020000 },
    { id: "supreme",  name: "Supreme",     bottles: 115, price: 2300000 }
  ]
};
