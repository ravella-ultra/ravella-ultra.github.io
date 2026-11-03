# Ravella Ultra landing page

A static landing page for Ravella Ultra Solution Organic Wine, ready for GitHub Pages.

- `index.html`: the page
- `assets/js/config.js`: **prices, the WhatsApp number and your Web3Forms key. Edit this file, not the others.**
- `assets/js/main.js`: bottle picker, order/registration form, Web3Forms submission and WhatsApp handoff
- `assets/css/style.css`: styles
- `assets/img/`: product photos, logo, favicon and share image

## How the order flow works

Every order goes through the form. There are no direct WhatsApp links on the page.

1. A visitor taps any order button: a retail package, a distributor package, the top bar, the sticky bar or "Ask us for help".
   Buttons with no package attached open the form on **"Not sure yet, help me choose"**.
2. The form has these steps:
   - **Step 1:** package (or not sure yet), name, WhatsApp number, city and state
   - **Step 2:** 4 questions (who it's for, used before, when needed, where they heard about us), plus an adult/suitability tick box
   - **Step 3 (distributors only):** username, email, address, bank name, account number and account name
3. On submit, every answer is sent to your Gmail through Web3Forms.
4. The visitor gets a **Send my order on WhatsApp** button with a prefilled message and reference number. Bank details are never put in the WhatsApp message.

Customers pay before dispatch. The page tells them you'll confirm the total and send payment details on WhatsApp.

## 1. Connect Web3Forms (2 minutes)

1. Go to <https://web3forms.com>, enter the Gmail address that should receive orders, and click **Create Access Key**.
2. Copy the access key from the email Web3Forms sends you.
3. Open `assets/js/config.js` and paste it into `web3formsKey: ""`.
4. Submit a test order on the live site and check your Gmail. Look in Spam the first time, then mark the email as "Not spam".

Notes:
- The access key is designed to sit in public code. It can only send to your email.
- The free plan has a monthly submission limit. Check web3forms.com for the current limit, and upgrade if you outgrow it.
- Web3Forms emails you each submission. If you also want a spreadsheet, Web3Forms paid plans and Zapier/Make can forward submissions to Google Sheets.
- Distributor bank details pass through Web3Forms to your inbox. Turn on 2-step verification on that Gmail account.

## 2. Put the site on GitHub Pages

1. Create a new public repository on GitHub, for example `ravella-ultra`.
2. Upload everything in this folder to the root of the repository, including the hidden `.nojekyll` file.
3. Go to **Settings → Pages**. Under **Source**, choose **Deploy from a branch**, then `main` and `/ (root)`. Save.
4. After a minute or two the site is live at `https://YOUR-USERNAME.github.io/ravella-ultra/`.

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
| Taps the WhatsApp button | `whatsapp_click` | `Contact` |
| Scrolls 25/50/75/100% | `scroll_depth` | — |
| Reaches a section | `section_view` (section name) | `ViewDistributorSection` (custom, distributor only) |

Every event carries the package name, number of bottles, value in **NGN** and, after submission, the order reference (RU-… or RD-…). The reference also goes to the Pixel as the `eventID`, so you can add the Conversions API later without double counting.

### After adding the IDs

1. **GA4 key events:** in GA4, go to **Admin → Events** and mark `generate_lead`, `sign_up` and `whatsapp_click` as key events. Events only appear there after they've fired once.
2. **GA4 custom dimensions:** under **Admin → Custom definitions**, add event-scoped dimensions for `package`, `lead_type` and `funnel`, so you can break results down by package.
3. **Meta ads:** optimise retail campaigns for **Lead**, and distributor campaigns for **CompleteRegistration**.
4. **Meta domain:** in Business Settings, verify your domain under **Brand safety → Domains**. If you use a GitHub Pages address, verify the github.io subdomain or add a custom domain.
5. **Test:** open your site with `?debug_tracking=1` at the end of the address, for example `https://YOUR-USERNAME.github.io/ravella-ultra/?debug_tracking=1`. Every event is printed in the browser console and shows in **GA4 → Admin → DebugView**. For the Pixel, use **Test events** in Events Manager or the Meta Pixel Helper Chrome extension.

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

1. In `robots.txt` and `sitemap.xml`, replace `YOUR-USERNAME.github.io/ravella-ultra` with your real site address.
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
