# Ravella Ultra landing page

A static landing page for Ravella Ultra Solution Organic Wine, ready for GitHub Pages.

- `index.html`: the page
- `assets/js/config.js`: **prices, the WhatsApp number and your Web3Forms key. Edit this file, not the others.**
- `assets/js/main.js`: bottle picker, order/registration form, Web3Forms submission and WhatsApp handoff
- `assets/css/style.css`: styles
- `assets/img/`: product photos, logo, favicon and share image

## How the order flow works

Customers pay to the company account **before** they reach WhatsApp, for both regular orders and distributor packages.

1. A visitor taps any order button. Buttons with no package attached default to 1 bottle.
2. They fill in the form:
   - **Step 1:** package, name, WhatsApp number, city and state
   - **Step 2:** 4 questions, plus the adult/suitability tick box
   - **Step 3 (distributors only):** the registration details
3. They tap **Submit and pay**. You get an email titled **"New order (awaiting payment)"**, which lets you follow up with people who don't pay.
4. The page shows the **company account** (RAVELLA ULTRA SOLUTION, UBA, 1028701744), the exact amount, and their reference to use as the narration. Each detail has a Copy button.
5. The **"Yes, I have made the payment"** button stays locked until they enter the name and bank they paid from and an amount at least equal to the total, and tick the confirmation box.
6. You get a second email titled **"Payment claimed: ₦… from …"**. Check it against your UBA statement.
7. Only then does the **"Send proof of payment on WhatsApp"** button appear. Their message arrives with the reference, amount, payer name and bank, and asks them to attach the receipt.

Regular orders pay for the bottles only, and you confirm delivery after payment. Distributor packages have no delivery fee, so the amount shown is the full price.

If someone leaves for their bank app and the page reloads, a **"Finish payment"** bar brings them back to the account details for the same order.

Change the account details in `assets/js/config.js` under `bank`.

**Limitation:** a static page can't read your UBA account, so the payment check relies on what customers type plus the receipt they send on WhatsApp. Always match the "Payment claimed" email against your statement before dispatching. For automatic confirmation later, add Paystack or Flutterwave. Settlement can still go to the same UBA account.

## 1. Connect Web3Forms (2 minutes)

1. Go to <https://web3forms.com>, enter the Gmail address that should receive orders, and click **Create Access Key**.
2. Copy the access key from the email Web3Forms sends you.
3. The key is already set in `assets/js/config.js` (`web3formsKey`). Change it there if you ever create a new one.
4. Submit a test order on the live site and check your Gmail. Look in Spam the first time, then mark the email as "Not spam".

Notes:
- The access key is designed to sit in public code. It can only send to your email.
- The free plan has a monthly submission limit. Check web3forms.com for the current limit, and upgrade if you outgrow it.
- Web3Forms emails you each submission. If you also want a spreadsheet, Web3Forms paid plans and Zapier/Make can forward submissions to Google Sheets.
- Distributor bank details pass through Web3Forms to your inbox. Turn on 2-step verification on that Gmail account.

## 2. Put the site on GitHub Pages

1. On the GitHub account or organisation **ravella-ultra**, create a public repository named exactly **`ravella-ultra.github.io`**. That name is what puts the site at https://ravella-ultra.github.io/.
2. Upload everything in this folder to the root of the repository, including the hidden `.nojekyll` file.
3. Go to **Settings → Pages**. Under **Source**, choose **Deploy from a branch**, then `main` and `/ (root)`. Save.
4. After a minute or two the site is live at https://ravella-ultra.github.io/.

## 3. Connect GA4 and Meta Pixel

Open `assets/js/config.js` and paste in your IDs:

```js
ga4Id: "G-XXXXXXXXXX",        // GA4: Admin > Data streams > your web stream > Measurement ID
metaPixelId: "1234567890123456", // Events Manager > Data sources > your Pixel > Pixel ID
```

That's all you need to do. `assets/js/analytics.js` loads both tags and sends the events below. Leave an ID empty to switch that tag off.

### Events sent

| Step on the page | GA4 event | Meta Pixel event |
|---|---|---|
| Page opens | `page_view` (automatic), `view_item` | `PageView`, `ViewContent` |
| Picks a bottle quantity | `select_item` | `CustomizeProduct` |
| Opens the form (retail) | `begin_checkout` | `InitiateCheckout` |
| Opens the form (distributor) | `begin_distributor_signup` | `DistributorSignupStart` (custom) |
| Moves to the next form step | `form_step` | `FormStep` (custom) |
| Switches to the distributor price | `switch_to_distributor` | `SwitchToDistributor` (custom) |
| Submits a retail order | `generate_lead` | `Lead` |
| Submits a distributor registration | `sign_up` + `generate_lead` | `CompleteRegistration` + `Lead` |
| Sees the company account details | `view_payment_details` | `ViewPaymentDetails` (custom) |
| Taps "Yes, I have made the payment" | `add_payment_info` + `payment_claimed` | `AddPaymentInfo` |
| Taps "Send proof of payment on WhatsApp" | `whatsapp_click` | `Contact` |
| Scrolls 25/50/75/100% | `scroll_depth` | — |
| Reaches a section | `section_view` (section name) | `ViewDistributorSection` (custom, distributor only) |

Every event carries the package name, number of bottles, value in **NGN** and, after submission, the order reference (RU-… or RD-…). The reference also goes to the Pixel as the `eventID`, so you can add the Conversions API later without double counting.

### After adding the IDs

1. **GA4 key events:** in GA4, go to **Admin → Events** and mark `generate_lead`, `payment_claimed` and `whatsapp_click` as key events. Events only appear there after they've fired once.
2. **GA4 custom dimensions:** under **Admin → Custom definitions**, add event-scoped dimensions for `package`, `lead_type` and `funnel`, so you can break results down by package.
3. **Meta ads:** optimise for **AddPaymentInfo** (people who say they've paid) once you have about 50 a week. Until then, use **Lead**. Don't use Purchase, because payments aren't verified automatically.
4. **Meta domain:** in Business Settings, verify your domain under **Brand safety → Domains**. If you use a GitHub Pages address, verify the github.io subdomain or add a custom domain.
5. **Test:** open your site with `?debug_tracking=1` at the end of the address, for example `https://ravella-ultra.github.io/?debug_tracking=1`. Every event is printed in the browser console and shows in **GA4 → Admin → DebugView**. For the Pixel, use **Test events** in Events Manager or the Meta Pixel Helper Chrome extension.

### Using Google Tag Manager instead

Every event is also pushed to `dataLayer` as `ru_<event>`, for example `ru_form_submit` and `ru_whatsapp_click`, with the same data. If you set up the tags in GTM, leave `ga4Id` and `metaPixelId` empty so nothing fires twice.

UTM parameters, `gclid` and `fbclid` are still included in every Web3Forms email, so you can match each lead in your inbox to its ad.

Nigeria's Data Protection Act expects visitors to be told about tracking. Add a short cookie notice or privacy page before you run ads at scale.

## 4. AI search and SEO

The page is set up so Google, Bing, ChatGPT, Perplexity, Claude and Gemini can read and quote it accurately:

- **"At a glance" block:** a one-paragraph definition of the product and a facts table near the top. AI answers usually lift this kind of text.
- **15 question-style FAQs** that match how people ask: "What is Ravella Ultra used for?", "How much is Ravella Ultra in Nigeria?" and so on. They're also marked up as `FAQPage` structured data.
- **`Product` structured data** with ingredients, size, NAFDAC number, the price range and the 5 reviews.
- **`llms.txt`:** a plain-text fact sheet for AI assistants.
- **`robots.txt`:** explicitly allows the AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended and others).
- **`sitemap.xml`**.

After publishing:

2. Add the site to **Google Search Console** and **Bing Webmaster Tools**, and submit `sitemap.xml` to both. Bing's index feeds ChatGPT search and Copilot.
3. When prices change, update `config.js`, the "At a glance" table, the price FAQ, `llms.txt` and the "Page last updated" date together, so AI answers stay accurate.
4. List the page on your Google Business Profile, Facebook page and Instagram bio. AI tools trust products that are mentioned consistently in several places.

## Confirm before going live

- **11 and 12 bottle prices:** these currently show "Ask us". Set `price` in `config.js`.
- **Distributor package prices:** these differ from the prices on the package posters in the image pack.
- **"No delivery fee" for distributors:** confirm this applies in every state.
- **Testimonials:** all 5 testimonials from the official site are on the page. Keep written permission from each customer.
- **Health claims:** the page uses traditional-use wording only. Disease claims (cancer, diabetes, stroke, fibroids and so on) are not on the page. NAFDAC's herbal advertising rules ban them, and the 'L' in A7-103154L means the product was assessed for safety, not efficacy.
- **NAFDAC number and ingredient panel:** match these against the physical label.
