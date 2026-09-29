# Growth channels research

Status: research for outreach planning. Nothing was built. No account was created, no form was submitted and nobody was contacted.

Research dates: 27–28 September 2026. Each section says “Checked 27 September 2026” as requested. Some pages were read after midnight, on 28 September.

How to read this document:

- `[S12]` links to the source list at the end.
- **Assessment** is our judgement from the sources. **Proposal** is an action for the owner to decide.
- **Not verified** means that no official or reliable page confirmed the point.
- Prices and rules change often. Check the source again before you pay or apply.

## Summary

_Checked 27 September 2026._

### Top recommendations

1. **Social media:** connect Instagram, Facebook and LinkedIn to Buffer Free (3 channels) [S2]. Answer messages and comments in Meta Business Suite, which is free [S1].
2. **Skip Facebook Marketplace.** Meta can restrict business sellers in India [S25].
3. **One product feed from Convex** for a Meta catalogue and Google Merchant Center [S27], [S63]. First choose a working checkout path and replace generated images [S54], [S57].
4. **B2B first:** apply to Hyperpure (restaurant supply) [S51] and list free on IndiaMART, TradeIndia and ExportersIndia [S71], [S74], [S76].
5. **Quick commerce in month 2–3,** after GSTIN, trademark and FSSAI are ready [S33], [S35], [S48].
6. **Export:** get an IEC, an APEDA RCMC, an FSSAI Central licence and a phytosanitary certificate per shipment [S86], [S92], [S93], [S94]. Pilot the UAE with cut herbs. Keep live trays in India [S97], [S100].
7. **Ask a chartered accountant (CA) and a food-law adviser** about FSSAI, GST and trademark (Section 6).

### Channel decisions

| Channel | Decision | Blocker | Cost to start |
| --- | --- | --- | --- |
| Buffer Free + Meta Business Suite | Start now | None | ₹0 [S1], [S2] |
| WhatsApp Business app | Start now | Business number | ₹0 [S30] |
| Meta catalogue, then Shop | After domain and checkout | Custom domain, checkout | ₹0 [S27] |
| Google free listings | After photos and checkout | Photos, checkout | ₹0 [S55] |
| Google Business Profile | Only if eligible | In-person contact | ₹0 [S67] |
| Hyperpure, free B2B directories | Apply now | Hyperpure terms not public | Directories ₹0 [S71], [S74]; Hyperpure not public [S51] |
| Blinkit, Zepto, Instamart, JioMart | Month 2–3 | GSTIN, trademark, FSSAI, barcodes | Rates not public [S34], [S48] |
| Alibaba.com, paid directories | Defer | Export readiness | From ₹1,19,000 a year + tax [S78] |
| Export pilot (UAE) | Days 22–30 | IEC, RCMC, FSSAI, phytosanitary | About ₹13,900 in fees (estimate; RCMC fee confirmed on 29 September 2026 in [doc 31](31-growth-tools-plan.md#8-export-and-trading)) [S86], [S91] |

## 1. Social media management

_Checked 27 September 2026._

The owner wants to post to Instagram, Facebook and LinkedIn, answer comments and messages, and see results, if possible from one place.

### Tool comparison

| Tool | Price | Instagram / Facebook / LinkedIn | Inbox (comments, messages) | Analytics | API or automation | Self-host |
| --- | --- | --- | --- | --- | --- | --- |
| Meta Business Suite | Free [S1] | Yes / Yes / No; also Threads and WhatsApp [S1] | Facebook Page, Messenger, Instagram and WhatsApp Business messages and comments [S1] | Insights [S1] | Separate Graph API | No |
| Buffer | Free: 3 channels, 10 scheduled posts per channel, 1 user. Essentials $5 and Team $10 per channel per month, billed yearly [S2] | Yes / Yes / Yes; also Google Business Profile [S2] | Community inbox with comment replies on all plans [S2] | Free: 30-day history [S2] | Free: 1 key, 3,000 requests a month [S2] | No |
| Hootsuite | Standard $99, Professional $199, Advanced $399 per month, billed yearly; 14-day trial [S3] | Yes / Yes / Yes [S4] | One inbox; automation from Professional [S3] | Yes [S3] | Not stated [S3] | No |
| Later | Starter $18.75, Growth $37.50, Scale $82.50 per month, billed yearly; 14-day trial [S5] | Yes / Yes / Yes [S5] | From the Growth plan [S5] | 3 months to 2 years [S5] | Not listed [S5] | No |
| Metricool | Free: 1 brand, 20 posts a month. Starter from $20, Advanced from $53 per month [S6] | Yes / Yes / Paid plans only [S7] | Instagram, Facebook, Google Business Profile [S6] | Free: 30 days [S6] | Advanced and Custom plans only [S6] | No |
| Postiz | Open source, AGPL-3.0 [S9]. Hosted: $29 to $99 a month, 5 to 100 channels [S8] | Yes / Yes / Yes [S8] | Not verified | Yes [S9] | REST API and webhooks [S8] | Docker with Postgres, Redis and Temporal. Not serverless, so not Vercel [S9], [S10] |
| Mixpost | Lite free. Pro $299 once. Enterprise $1,199 once [S13] | Lite: Facebook Pages only. Pro adds Instagram and LinkedIn [S13] | Not verified | Advanced analytics on Pro [S13] | API and webhooks on Pro [S13] | PHP 8.3, MySQL, Redis, Supervisor and cron. A long-running server, not Vercel [S14] |
| LinkedIn Page (native tools) | Free [S16] | – / – / Yes | Not researched | Not researched | – | No |

All tools schedule posts. The limits are: Buffer Free, 10 queued posts per channel [S2]; Later Starter, 30 posts per profile a month [S5]; Metricool Free, 20 posts a month [S6]. LinkedIn Pages can schedule posts from 1 hour to 3 months ahead [S15].

**Self-hosting.** Postiz and Mixpost need a server that runs all the time, with a database and Redis [S10], [S14]. Postiz names Railway as one possible host [S8]. Self-hosting also moves the network approvals to you. The Postiz guide needs your own Meta app, with business verification for public apps [S12]. For LinkedIn, it needs an Advertising API access request, or tokens cannot refresh [S11].

**Assessment.** Hosted tools already hold the network approvals. For one brand, a hosted tool saves time and removes server work.

### Posting from the Floruvi website (official APIs)

| Network | What you need | Access and review | Limits |
| --- | --- | --- | --- |
| Instagram | Professional account. Permission `instagram_business_content_publish` (Instagram Login) or `instagram_content_publish` (Facebook Login) [S17] | Standard Access covers only people with a role on the app. Advanced Access needs Business Verification and sometimes App Review [S18] | 100 API posts in 24 hours. JPEG images only. No shopping tags [S17] |
| Facebook Page | Page access token, `pages_manage_posts` and `pages_read_engagement`. The user needs the CREATE_CONTENT task [S19] | Same access levels as Instagram [S18] | Scheduled posts: 10 minutes to 30 days ahead [S19] |
| LinkedIn Page | Community Management API. “Share on LinkedIn” posts only as a person, not as a Page [S20], [S22] | Registered legal organisations only. Verified business email, privacy policy, and a Page super admin must verify the app. Standard tier needs a screen recording [S21] | Development tier: 500 requests per app [S20] |

**Assessment.** Floruvi can post to its own Instagram and Facebook accounts with Standard Access, because the owner has a role on the app [S18]. LinkedIn Page posting needs approval as a registered legal organisation [S21]. Three integrations, token refresh and reviews add ongoing work. Do not build posting into the website now.

### Recommendation

**Proposal.**

1. Connect Instagram, the Facebook Page and the LinkedIn Page to Buffer Free [S2].
2. Answer Instagram, Facebook and WhatsApp messages and comments in the Meta Business Suite app [S1].
3. Upgrade to Buffer Essentials when the 10-post queue is too small. For 3 channels, this is about $15 a month, billed yearly (estimate from the per-channel price) [S2].
4. Choose Metricool Starter instead if a Google Business Profile inbox and longer analytics history become important [S6].

## 2. Facebook Marketplace, Shops and WhatsApp

_Checked 27 September 2026._

### Facebook Marketplace

Meta says that Marketplace “is intended for consumer-to-consumer sales” [S25]. Businesses in India “may be subject to restrictions”, including suspension and removal of listings [S25].

**Assessment.** Do not list Floruvi products on Marketplace.

### Instagram and Facebook Shops in India

- India is in an “open beta” for the full Shops and Shops ads experience. Some sellers may not get all features [S23].
- Since September 2025, Shops use website checkout. Buyers find products on Facebook or Instagram and pay on your website [S24].
- Instagram product tags need a Shop in a supported country [S23].
- To sell, the account must follow Meta policies, represent the business and its domain, be in a supported country, show trustworthiness and give accurate information [S26].
- For Shops, product links must be on a domain that the business owns [S27].
- Meta's prohibited list includes alcohol, animals, ingestible supplements and digital subscriptions. We found no ban on fresh produce [S25].

**Assessment.** Connect a custom domain first. `floruvi.vercel.app` is not a domain that Floruvi owns.

### Feeding the Meta catalogue from the website

Commerce Manager accepts CSV, TSV, XLSX, Google Sheets or XML (RSS/ATOM). A scheduled feed reads a file URL at set times. A scheduled file can be up to 4 GB [S27].

| Field group | Meta fields | Floruvi source (repository) |
| --- | --- | --- |
| Required | id, title, description, availability, condition, price, link, image_link, brand [S27] | Convex `products`: slug, name, description, `inStock`, price, image |
| India | `origin_country`; importer fields for imported goods; `manufacturer_info` for Shops [S27] | `IN`; farm name and address from the owner |
| Rules | One currency per file. Use a country feed for other currencies. Images JPEG or PNG, at least 500 × 500 px [S27] | Start with INR only |

### Checkout options in India

- **Website checkout.** Shops need it [S24]. Floruvi's checkout sends an availability enquiry today, so it is not ready.
- **WhatsApp Business app.** Free to download [S30]. Its catalogue needs a unique title, at least one image and the country of origin for each product [S108]. Click-to-chat links use `https://wa.me/<number>?text=<message>` [S31].
- **Payments inside WhatsApp (India only).** These run on the WhatsApp Cloud API through BillDesk, Razorpay, PayU or Zaakpay. Buyers pay by UPI, card, netbanking or wallet [S28]. Razorpay sells this as “Payments on WhatsApp” [S29].

**Assessment.** WhatsApp payments need an active Razorpay account and a WhatsApp Business Platform setup. Do this after website payments work.

**Proposal.** Create the Meta catalogue from a website feed (build task B2). Use it first for the WhatsApp catalogue and for ads. Apply for a Shop after the domain and the checkout are live.

## 3. Quick commerce and grocery marketplaces

_Checked 27 September 2026._

**Assessment.** A farm can enter these platforms through two doors:

1. **Seller or brand onboarding** for packed, barcoded goods that go to platform warehouses. Most public portals serve this door.
2. **Supply to the platform's own fresh sourcing.** Platforms buy produce from farmers and FPOs through their own teams. We found no public self-serve form for this door, except where noted.

| Platform | How a farm gets in | Documents asked | Fees or margin | Onboarding time | Seller API |
| --- | --- | --- | --- | --- | --- |
| Blinkit ([seller.blinkit.com](https://seller.blinkit.com/)) | Self-serve Seller Hub. You send stock to Blinkit warehouses [S33]. Its category list does not mention fresh produce [S33] | Brand and manufacturer details, trademark or application, GST, bank, shipping location, FSSAI where applicable, IRN credentials, digital signature, UPC or an approved exception [S33] | No registration fee. Product ID activation fee (credited to the ads wallet), inwarding, storage and fulfilment fees, and category commission. Rates only after login [S34] | Documents in 12–48 hours; first sale “in as little as 7 days” [S32], [S33] | None found |
| Zepto ([brands.zepto.co.in](https://brands.zepto.co.in/)) | Brand portal. Categories include Fruits & Vegetables [S35] | PAN, GSTIN, cancelled cheque, signatory signature, trademark certificate or brand NOC [S35] | Not public | Up to 15 business days if selected; up to 45 days in sale events [S35] | None found |
| Swiggy Instamart ([partner page](https://www.swiggy.com/instamart-partner)) | Application form for brands and sellers [S36] | Not public | Not public | “Tailored to each product and brand” [S37] | None found |
| BigBasket ([partner.bigbasket.com](https://partner.bigbasket.com/)) | Vendor login portal, BB Sambandh [S38]. Buys from 50,000+ farmers through 120+ collection centres and pays within 48 hours of goods receipt (press release) [S39] | Not public | Not public | Not public | None found |
| Flipkart Minutes ([seller.flipkart.com](https://seller.flipkart.com/)) | Fresh produce through the Samarth Krishi programme with FPOs [S40], [S41]. Brand route: not verified | Not verified | Not verified | Not verified | Flipkart Marketplace Seller APIs exist [S42] |
| Amazon Fresh and Amazon Now ([sell.amazon.in](https://sell.amazon.in/)) | Fresh is sold by sellers who work with 13,000 farmers [S44]. Amazon Now sellers offer fruit and vegetables [S45]. No public farm route found. The self-serve grocery page covers only ambient foods with 3+ months shelf life [S43]. Physical stores can join Local Shops on Amazon [S46] | GST number, PAN, bank; FSSAI licence and a compliance declaration; NPOP or PGS-India for organic claims [S43] | Grocery referral fee 4% (≤ ₹500), 5.5% (₹500–1,000), 9.5% (> ₹1,000), plus closing and delivery fees [S43] | Not stated | Not checked |
| JioMart ([seller portal](https://identity.seller.jiomart.com/jiomartseller)) | Marketplace with JioMart or seller fulfilment [S47]. Sales within India only [S48] | PAN, GSTIN (only books are exempt), bank and KYC, trademark certificate, FSSAI for food [S48] | Commission %, fixed fee, shipping fee and GST. Rates not public [S48] | After verification [S48] | None found |
| FirstClub ([partner page](https://www.firstclub.co.in/partner-with-us)) | Quality-first grocery in Bengaluru and Hyderabad, about 4,000 products, quality checks on fresh produce [S49]. No public supplier form [S50] | Not public | Not public | Not public | None |
| Hyperpure ([seller.hyperpure.com](https://seller.hyperpure.com/)) | Vendor form. Sells to restaurants in 130+ cities [S51] | Not public | Not public | Not public | None |
| ONDC ([how to join](https://www.ondc.org/ondc-how-to-join/)) | Sellers join through a seller app. About 5,000 FPOs had registered by March 2024 [S52]. The joining page did not load [S53] | Varies by seller app (not verified) | Varies (not verified) | – | Open network |

**Common prerequisites** on official pages: PAN, GSTIN, bank proof, FSSAI, a trademark certificate or application, barcodes and brand authorisation [S33], [S35], [S48]. Blinkit also asks for IRN (e-invoice) credentials and a digital signature [S33]. JioMart asks sellers to add its fulfilment centres to their GST registration as additional places of business [S48].

**Proposal.**

1. Apply to Hyperpure now for herbs, microgreens and edible flowers for restaurants [S51].
2. Prepare for quick commerce first: trademark filing, GSTIN, FSSAI, barcoded retail packs and cold-chain supply to warehouses.
3. Then approach Zepto or Blinkit with 5 to 10 packed products. FirstClub's premium model suits microgreens, but it has no public supplier form [S49], [S50].

## 4. Google

_Checked 27 September 2026._

### Merchant Center free listings and Shopping ads in India

- Merchant Center supports India, with INR and languages that include English and Hindi [S56].
- New accounts are in free listings by default. India needs shipping settings or shipping attributes [S55].
- Products must be available to buy on your store. Users must be able to add to cart and complete checkout [S54].
- At least one conventional payment method must be available, for example card, invoice or payment on delivery [S54].
- Collect personal data only on SSL pages. Show contact information. Publish a return policy [S54].
- Images must show the product. Placeholders are not allowed and illustrations are restricted. AI images must keep AI metadata, for example IPTC `TrainedAlgorithmicMedia` [S57].
- In September 2026, Google merges the Shopping ads and free listings policies into one “Shopping policies” set [S58].
- Ads with some AI-generated assets need labels in India. Google added label settings in July 2026 [S68]. India's rules on synthetically generated information apply from 20 February 2026 [S69].

**Assessment.** Today the checkout sends an enquiry and the images are generated. Google will probably reject the products. Fix both first.

### How a product feed from the website works

| Method | How it works | Notes |
| --- | --- | --- |
| Scheduled file | Google fetches an XML (RSS 2.0 or Atom) or TSV file from a URL, every 24 hours by default [S64], [S65] | Do not block Googlebot or AdsBot-Google from the file [S64] |
| Merchant API | The server sends products to Google | Content API for Shopping shut down on 18 August 2026, with errors from 1 September 2026 [S59] |
| Website crawl | Google reads Product structured data at least every 24 hours [S60] | Needs a verified and claimed website. Skips products that already exist in another source [S60] |
| Supplemental source | Adds or replaces attributes | Cannot add products [S62] |

- Required attributes: id, title, description, link, image_link, availability, price and brand. Use `identifier_exists` = `no` for products without a GTIN or MPN [S63]. `google_product_category` is optional [S63].
- Merchant listing markup needs `price` and `priceCurrency`. Google recommends `availability`, `shippingDetails` and `hasMerchantReturnPolicy`, and prefers return and shipping policies at Organization level. Only pages where a shopper can buy are eligible [S61].

**Proposal.** Start with a scheduled XML file. It is simple to build and test. Move to the Merchant API only if Google must see changes faster than once a day.

**Export countries.** Merchant Center lists the UAE, Saudi Arabia, Germany, the Netherlands, Japan, the UK and Malaysia. It did not list Bangladesh, Sri Lanka, Nepal, Qatar or Iraq [S56].

**Assessment.** Export baskets say that delivery is quoted after review, so buyers cannot complete a purchase. They fail the purchase rule. Use B2B channels for export.

### Google Business Profile without a shop front

- A business must make in-person contact with customers during its stated hours. Online-only businesses are not eligible [S67].
- A business that travels to its customers can create a profile. Service-area businesses hide their address [S66].
- Delivery-only food services are permitted with conditions [S67].

**Assessment.** Floruvi qualifies if its own staff deliver in a defined area, or if the farm accepts visits or pick-ups at set hours and has permanent signage. Courier-only delivery across India looks online-only.

## 5. B2B and export buyers

_Checked 27 September 2026._

| Platform | Free option | Paid entry | Notes |
| --- | --- | --- | --- |
| IndiaMART | Free registration: profile, product list, replies to enquiries [S71] | Mini Dynamic Catalog: ₹40,000 for 1 year, ₹72,000 for 2 years, ₹90,000 for 3 years, excluding tax [S72] | This plan gets 10 BuyLeads a week plus 1 daily bonus. The top plan gets 70 a week [S73] |
| TradeIndia | Free sign-up and product posting [S74] | TI Premium Seller package: ₹2,93,999 (offer page) [S75] | Other plan prices not published |
| ExportersIndia | Free registration, company profile, website and enquiry dashboard [S76] | Gold, Platinum, Platinum+, Star and Global packages; prices not published [S77] | – |
| Alibaba.com (India prices) | No free seller plan found | Basic ₹1,19,000, Plus ₹1,72,000, Pro ₹2,44,000, Verified Supplier ₹7,50,000 a year, excluding tax [S78] | Basic: business verification, 20 RFQ quotes a month [S78] |
| Tridge | Not public | Prices only through a demo request [S79] | Agri-food trade focus |
| Go4WorldBusiness | Free membership. Free members answer buy leads 2 days after posting [S80] | Silver ₹35,999, Gold ₹39,999, Gold+ ₹49,999 a year [S80] | – |
| APEDA Farmer Connect | FPOs, FPCs and cooperatives post sell offers. Exporters post enquiries [S81] | Fee not verified | Assessment: Floruvi needs FPO status |
| APEDA AgriXchange | Market data and trade leads (not verified; page timed out) [S82] | – | – |
| DGFT Trade Connect | Launched 11 September 2024. Links exporters with Indian missions abroad and export councils [S83] | Cost not stated | Assessment: needs an IEC |
| LinkedIn | Page is free [S16] | Sales Navigator Core: US$119.99 a month or US$1,079.88 a year [S84] | Page posting through the API needs approval (Section 1) |

**Assessment on lead quality.** Directory leads are cheap but vary in quality. IndiaMART limits BuyLeads by plan, from 7 to 70 a week [S73]. Expect many price-only enquiries. Qualify each lead: product, volume, frequency, delivery city or port, and payment terms.

### LinkedIn outreach

**Proposal.**

1. Create the LinkedIn Page [S16] and link it from the website.
2. Post weekly harvest and availability updates through Buffer.
3. Make two short target lists: chefs and buyers at restaurants and hotels in the delivery city, and importers of fresh herbs in the UAE.
4. Send personal messages from the owner's profile. Link to the bulk and export page with UTM tags (build tasks B4 and B6).
5. The owner approves every message. Get legal advice before you send cold email to EU or UK contacts.
6. Try Sales Navigator only after the free approach gives replies [S84].

## 6. Regulatory prerequisites

_Checked 27 September 2026._

**Legal and tax advice is needed.** This section is not legal advice.

### Selling in India

| Item | What the sources say | Floruvi action |
| --- | --- | --- |
| FSSAI | From 1 April 2026: registration up to ₹1.5 crore turnover; State licence ₹1.5–50 crore; Central licence above ₹50 crore [S85]. Retailer fees: ₹100, ₹5,000 or ₹7,500 a year [S86]. “E-Commerce” and “Trader/Merchant – Exporter” need a Central licence at any turnover, ₹7,500 a year [S86]. Businesses in two or more states need a Central head-office licence [S86]. The FSS Act does not apply to a farmer's crops “at farm level” [S87]. | Ask a food-law adviser which kind of business applies to packed, branded online sales. Marketplaces ask for FSSAI anyway [S33], [S43], [S48]. |
| GST | Fresh vegetables (headings 0701–0709) and Chapter 6 goods (live plants, cut flowers) are exempt under Notification 2/2017-Integrated Tax (Rate) [S88]. A person who supplies only exempt goods is not liable to register (CGST section 23(1)(a)) [S89]. | Most marketplaces ask for a GSTIN [S33], [S35], [S43], [S48]. Ask a CA about voluntary registration and about the classification of microgreens, live trays and edible flowers. |
| Trademark | Blinkit, Zepto and JioMart ask for a trademark certificate or application [S33], [S35], [S48]. | The name check is preliminary ([name search](floruvi-name-search-2026-09-26.md)). File before quick commerce. |
| AI images | India's rules on synthetically generated information apply from 20 February 2026 [S69]. Google labels some AI ad assets in India [S68]. | Use real photos. Label AI images in ads. |

### Exporting from India

| Step | What the sources say | Cost |
| --- | --- | --- |
| IEC (DGFT) | Needs PAN, a bank account and an address in the firm's name [S90]. No export without an IEC. Update it every April–June, or DGFT de-activates it [S92]. | ₹500; annual update free [S91] |
| APEDA RCMC | Exporters of APEDA scheduled products apply on the DGFT portal after the IEC. APEDA has used the DGFT portal since 17 July 2023 [S93]. | ₹5,000 + 18% GST for 5 years (confirmed on 29 September 2026 in [doc 31](31-growth-tools-plan.md#8-export-and-trading)) |
| FSSAI Central licence | Kind of business “Trader/Merchant – Exporter” [S86] | ₹7,500 a year [S86] |
| Phytosanitary certificate | Register once on PQMS. Apply before each export. Inspectors check the importing country's rules [S94], [S95]. | Not published on the pages checked |

### Destination notes

| Market | Rules found | Status |
| --- | --- | --- |
| UAE | The importer needs a MOCCAE import permit and the original phytosanitary certificate | Not verified: MOCCAE pages blocked automated reading [S103] |
| Saudi Arabia | Fresh produce from India needs a Certificate of Conformity from an SFDA-approved body (since 2021). Pesticide limits follow SFDA.FD 382 [S102] | Certification-body source |
| Qatar, Kuwait, Oman, Bahrain, Iraq, Uzbekistan | Not researched in depth | Ask the importer |
| Germany and the Netherlands (EU) | Phytosanitary certificate for all fresh fruit and vegetables except pineapple, banana, dates, durian and coconut. Soil and most growing media from outside the EU are banned; clean peat and clean coconut fibre are exceptions [S96], [S97]. The EU list of increased checks changed from 18 February 2026; Indian okra keeps pesticide-residue checks [S98] | Official |
| UK | Medium A risk: IPAFFS registration, a phytosanitary certificate and pre-notification. Medium B risk: a phytosanitary certificate. Marketing-standard checks can apply [S99] | Official |
| Japan | Phytosanitary certificate always. Some fruit and vegetables are banned by origin. Soil and plants with soil are banned. Check the MAFF database [S100]. Food imports need a notification to an MHLW quarantine station [S101] | Official (MHLW point from a search result) |
| Malaysia | MAQIS import permit (RM15 per consignment, about 5 working days) and a phytosanitary certificate [S104] | WTO notification |
| Sri Lanka | NPQS import permit, free of charge, and a phytosanitary certificate [S105] | Official |
| Bangladesh | An import permit is needed for plants and plant products (Plant Quarantine Act 2011) [S106] | Search result only |
| Nepal | PQPMC controls import permits. In June 2026, it stopped permits for Indian bananas [S107] | News source |

**Assessment.**

- Live microgreen trays with growing media are unlikely to meet EU and Japan rules [S97], [S100]. Treat them as India-only for now.
- Start exports with cut herbs and leafy greens by air, through an importer who holds the import permits.
- Get a freight-forwarder or customs-broker quote before you price export orders. Export prices on the website exclude freight, duty and permits ([international prices](20-international-pricing.md)).

## 7. What the website can provide

_Checked 27 September 2026._ This is a review of repository files only. Nothing was built or run.

| Area | Now | Gap |
| --- | --- | --- |
| Product data | Convex `products` has slug, name, description, one INR pack price, `inStock` and an image | No feed file |
| Structured data | Product and Offer (price, currency, condition, brand, SKU) on product pages | No availability, shipping details or return policy |
| Search | 32 sitemaps with hreflang ([languages and search](21-languages-and-seo.md)) | No Merchant Center setup |
| Policies | `/terms` and `/refunds` pages exist | Return policy not in markup or Merchant Center |
| Enquiries | One `/contact` form and an `enquiries` table | No source or UTM fields. `/wholesale` is a temporary redirect to `/contact` |
| Crawlers | Production `robots.txt` blocks `/api/` | Feeds must not live under `/api/` |
| Images | Generated images | Real photos needed |
| Domain | `floruvi.vercel.app` | Custom domain needed for Meta Shops |

## Build tasks for the website

_Checked 27 September 2026._

These are backlog proposals, not approved work. AGENTS.md asks us to record additions in the backlog before we build them.

| ID | Task | Reason | Depends on |
| --- | --- | --- | --- |
| B1 | Google feed at `/feeds/google/in.xml` (RSS 2.0 with `g:` fields). India and INR only. Map slug to `id`, `inStock` to `availability`, brand “Floruvi”, `identifier_exists` `no`, condition `new`. Use the same ID as the page SKU. | Free listings and Shopping ads [S63], [S64] | Checkout decision; real photos |
| B2 | Meta catalogue feed at `/feeds/meta/in.csv` from the same data, plus `origin_country` `IN` and `manufacturer_info`. | Meta catalogue, WhatsApp catalogue, ads [S27] | Farm name and address |
| B3 | Add `availability` to each Offer. Add an Organization-level return policy and shipping details that match Merchant Center (₹99 rule). Add social `sameAs` links. | Merchant listings [S61] | Owner confirms stock wording, returns and delivery terms |
| B4 | Save first-touch `utm_source`, `utm_medium` and `utm_campaign` with each enquiry in Convex. Drop other query values. Follow the privacy rules in [docs/06](06-quality-and-growth.md). | Shows which channel brings leads [S70] | None; no analytics service needed |
| B5 | “Ask on WhatsApp” link on product and contact pages, with the product name and URL pre-filled. No personal data in the link. | Fast contact from social traffic [S31] | Business number; owner decision, because site chat stays hidden |
| B6 | Bulk and export page at `/wholesale`, in all versions. Fields: company, country, products, volume, frequency, packaging, port or city. Save it as a business enquiry. | One link for directories, LinkedIn and importers | Owner's minimum order, lead times and documents |
| B7 | Verification tags for Search Console, Merchant Center and Meta. | Required to claim the site | Custom domain |
| B8 | Feed tests: required fields exist, feed price equals page price, no feeds for export versions. | Prevents disapprovals | B1, B2 |
| B9 | Replace product images with photos. Keep IPTC AI metadata on any generated image that stays. | Google image rules [S57]; AI labels in India [S68] | Photos |
| B10 | Later, only for a funded campaign: a Meta or Google conversion integration. | Ad measurement | Owner budget |
| – | Not now: social posting from the website. | See Section 1 | – |

Notes:

- Keep `/feeds/*` outside locale routing, as the sitemaps are.
- Do not add GA4 or GTM by default (AGENTS.md).

## 30-day plan

_Checked 27 September 2026._

Costs are estimates from the sources above. They exclude professional fees, the domain, photography and ad spend.

| Days | Owner | Engineering | Cash cost |
| --- | --- | --- | --- |
| 1–7 | Confirm the legal entity and a GST and FSSAI plan with a CA. Set up the Meta business portfolio, Instagram professional account, Facebook Page, LinkedIn Page and WhatsApp Business app. Connect Buffer Free. Photograph the top 20 products. Buy a custom domain. | Connect the domain. Set `NEXT_PUBLIC_SITE_URL`. Verify Search Console and submit the sitemap. | ₹0 for tools [S1], [S2], [S16], [S30] |
| 8–14 | Choose the checkout path: Razorpay, payment on delivery, or both. Confirm the return policy, delivery terms, stock wording and WhatsApp number. Post 3 times a week (proposal). | B3, B4, B5, B6, B7. Build B1 and B2 behind a switch. | ₹0 |
| 15–21 | Apply to Hyperpure. List free on IndiaMART, TradeIndia and ExportersIndia. Contact 20 local restaurants and cafés. Apply for the FSSAI type that the adviser confirms. | B8, B9. Turn on the feeds after checkout works. Create Merchant Center and the Commerce Manager catalogue. | FSSAI: ₹100 to ₹7,500 a year by type [S86] |
| 22–30 | Apply for the IEC, then the RCMC. Register on PQMS. Choose UAE pilot products. List free on Go4WorldBusiness and Trade Connect. Message 20 UAE importers on LinkedIn. Review leads by UTM source. | Fix feed diagnostics. | IEC ₹500 [S91]; RCMC ₹5,900 ([doc 31](31-growth-tools-plan.md#8-export-and-trading)) |

**Optional paid tools after day 30:** Buffer Essentials, about $15 a month for 3 channels, billed yearly [S2]; IndiaMART Mini Dynamic Catalog, ₹40,000 a year + tax [S72]; Go4WorldBusiness Gold, ₹39,999 a year [S80]; Alibaba.com Basic, ₹1,19,000 a year + tax [S78].

**Proposal for success checks:** qualified B2B leads per week, reply time under one business day, the first repeat buyer, and leads by channel from UTM data.

## Open questions for the owner

_Checked 27 September 2026._

1. What is Floruvi's legal entity? LinkedIn Page API access needs a registered legal organisation [S21]. Marketplaces ask for business documents such as PAN and GSTIN [S35], [S48].
2. Is Floruvi GST-registered? Do you want voluntary registration so that you can use marketplaces?
3. Which FSSAI registration or licence do you hold? Do you pack and sell under the Floruvi brand?
4. Will you file a trademark for “Floruvi”? The current name search is preliminary.
5. Which checkout path do you accept first: Razorpay, payment on delivery, or both?
6. How do you ship perishables across India? In which areas does your own team deliver?
7. Can customers visit the farm or collect orders? This decides Google Business Profile eligibility.
8. Which WhatsApp Business number and social account names do we use?
9. When can you supply real photos of the top products?
10. What stock rule do the feeds use? Is each published product “in stock” until you mark it out?
11. Which products can you export, in what weekly volume, and from which airport?
12. Do you already know importers, restaurants or distributors?
13. What monthly budget do you set for tools, directories and ads?
14. Who writes posts and answers messages, and in which languages?
15. Do you want GS1 barcodes for retail packs? Blinkit needs a UPC or an approved exception [S33].

## Sources

_Checked 27 September 2026._

Labels: **official** = the platform or government page. **secondary** = a third party. **search result** = read from a search result; the page itself was not opened. **not loaded** = the page failed in our check.

**Social media tools**

- S1 — Meta Business Help Centre, How Meta Business Suite works (official): https://www.facebook.com/business/help/205614130852988
- S2 — Buffer, Pricing (official): https://buffer.com/pricing
- S3 — Hootsuite, Plans (official): https://www.hootsuite.com/plans
- S4 — Hootsuite, FAQ (official): https://www.hootsuite.com/faq
- S5 — Later, Pricing (official): https://later.com/pricing/
- S6 — Metricool, Pricing (official): https://metricool.com/pricing/
- S7 — Metricool Help, Differences between Free and paid plans (official): https://help.metricool.com/main-differences-between-free-and-paid-plans-bl0v9
- S8 — Postiz, Pricing (official): https://postiz.com/pricing
- S9 — Postiz, GitHub repository (official): https://github.com/gitroomhq/postiz-app
- S10 — Postiz Docs, Docker Compose installation (official): https://docs.postiz.com/installation/docker-compose
- S11 — Postiz Docs, LinkedIn provider (official): https://docs.postiz.com/providers/linkedin
- S12 — Postiz Docs, Instagram provider (official): https://docs.postiz.com/providers/instagram
- S13 — Mixpost, Pricing (official): https://mixpost.app/pricing
- S14 — Mixpost Docs, Server configuration (official): https://docs.mixpost.app/server/
- S15 — LinkedIn Help, Scheduled posts for LinkedIn Pages (official; search result): https://www.linkedin.com/help/linkedin/answer/a548192
- S16 — LinkedIn Help, Create a LinkedIn Page (official): https://www.linkedin.com/help/linkedin/answer/a543852

**Platform APIs**

- S17 — Meta for Developers, Instagram content publishing (official): https://developers.facebook.com/docs/instagram-platform/content-publishing/
- S18 — Meta for Developers, Access levels (official): https://developers.facebook.com/docs/graph-api/overview/access-levels/
- S19 — Meta for Developers, Pages API posts (official): https://developers.facebook.com/docs/pages-api/posts
- S20 — Microsoft Learn, LinkedIn Community Management overview (official): https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview
- S21 — Microsoft Learn, Community Management app review (official): https://learn.microsoft.com/en-us/linkedin/marketing/community-management-app-review
- S22 — Microsoft Learn, Share on LinkedIn (official): https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin

**Meta commerce and WhatsApp**

- S23 — Meta, Supported countries for Shops on Facebook and Instagram (official): https://www.facebook.com/business/help/549256849084694
- S24 — Meta, About changes to Shops and checkout (official): https://www.facebook.com/business/help/1314349509894768
- S25 — Meta, Commerce Policies (official): https://www.facebook.com/policies_center/commerce/
- S26 — Meta, Commerce eligibility requirements (official): https://www.facebook.com/business/help/1627591223954487
- S27 — Meta, Product data specifications for catalogues (official): https://www.facebook.com/business/help/120325381656392
- S28 — Meta for Developers, WhatsApp payments through payment gateways, India (official): https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/pg/
- S29 — Razorpay Docs, Payments on WhatsApp (official): https://razorpay.com/docs/payments/whatsapp/
- S30 — WhatsApp Help Center, About WhatsApp Business (official): https://faq.whatsapp.com/641572844337957/
- S31 — WhatsApp Help Center, How to use click to chat (official): https://faq.whatsapp.com/5913398998672934
- S108 — WhatsApp Help Center, About catalog (official): https://faq.whatsapp.com/405903568419894

**Quick commerce and grocery**

- S32 — Blinkit, Sell on Blinkit (official): https://seller.blinkit.com/
- S33 — Blinkit, Seller Hub FAQ (official): https://seller.blinkit.com/faq
- S34 — Blinkit, Fees and commissions (official): https://seller.blinkit.com/fees-commission
- S35 — Zepto, Partners / Vendor Hub (official): https://brands.zepto.co.in/
- S36 — Swiggy, Instamart partner page (official): https://www.swiggy.com/instamart-partner
- S37 — Swiggy, Instamart onboarding FAQ (official): https://www.swiggy.com/support/issues/instamart_onboarding
- S38 — BigBasket, BB Sambandh vendor portal (official; login only): https://partner.bigbasket.com/
- S39 — APN News, BigBasket direct sourcing network reaches 50,000 farmers (press release; search result): https://www.apnnews.com/on-kisan-diwas-bigbasket-reaches-milestone-of-50000-registered-farmers-in-its-direct-sourcing-network/
- S40 — Flipkart Stories, Flipkart Minutes crosses 1,000 micro fulfilment centres, 24 June 2026 (official): https://stories.flipkart.com/announcement/flipkart-minutes-crosses-1-000-micro-fulfilment-centers-in-under-two-years
- S41 — Agriculture Post, Flipkart launches Samarth Krishi for FPOs (secondary; search result): https://agriculturepost.com/agribusiness/agri-marketing/flipkart-india-launches-samarth-krishi-programme-to-create-market-linkage-for-fpos/
- S42 — Flipkart, Marketplace Seller API documentation (official; search result): https://seller.flipkart.com/api-docs/FMSAPI.html
- S43 — Amazon.in, Sell Grocery & Gourmet Food (official): https://sell.amazon.in/sell-online/product-categories/grocery
- S44 — About Amazon India, Amazon Fresh in 270+ cities (official): https://www.aboutamazon.in/news/retail/amazon-fresh-expansion-grocery-delivery-india
- S45 — About Amazon India, Amazon Now (official): https://www.aboutamazon.in/news/retail/amazon-now-india-ultra-fast-delivery
- S46 — Amazon.in, Local Shops on Amazon (official; search result): https://sell.amazon.in/sell-online/local-shops-on-amazon
- S47 — JioMart, Become a seller (official): https://identity.seller.jiomart.com/jiomartseller
- S48 — JioMart, Seller FAQs (official): https://identity.seller.jiomart.com/jiomartseller/faqs
- S49 — TechCrunch, FirstClub doubles valuation, 3 June 2026 (secondary): https://techcrunch.com/2026/06/03/firstclub-doubles-valuation-to-255m-in-nine-months-on-quality-first-grocery-bet/
- S50 — FirstClub, Brand partnership page (official): https://www.firstclub.co.in/partner-with-us
- S51 — Hyperpure, Seller Hub (official): https://seller.hyperpure.com/
- S52 — Press Information Bureau, About 5,000 FPOs registered on ONDC, 1 March 2024 (official): https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2010600
- S53 — ONDC, How to join (official; not loaded): https://www.ondc.org/ondc-how-to-join/

**Google**

- S54 — Google Merchant Center Help, Merchant Center requirements (official): https://support.google.com/merchants/answer/6363310
- S55 — Google Merchant Center Help, Free listings for products (official): https://support.google.com/merchants/answer/13889434
- S56 — Google Merchant Center Help, Supported languages and currencies (official): https://support.google.com/merchants/answer/160637
- S57 — Google Merchant Center Help, Image link attribute (official): https://support.google.com/merchants/answer/6324350
- S58 — Google Merchant Center Help, Announcements change log (official): https://support.google.com/merchants/announcements/6192467
- S59 — Google for Developers, Merchant API latest updates (official): https://developers.google.com/merchant/api/latest-updates
- S60 — Google Merchant Center Help, Add products automatically from your online store (official): https://support.google.com/merchants/answer/12158480
- S61 — Google Search Central, Merchant listing structured data (official): https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
- S62 — Google Merchant Center Help, Supplemental data source (official; search result): https://support.google.com/merchants/answer/15624457
- S63 — Google Merchant Center Help, Product data specification (official): https://support.google.com/merchants/answer/7052112
- S64 — Google Merchant Center Help, Scheduled fetches (official; search result): https://support.google.com/merchants/answer/15625172
- S65 — Google Merchant Center Help, Create a product file (official; search result): https://support.google.com/merchants/answer/160567
- S66 — Google Business Profile Help, Guidelines for representing your business (official): https://support.google.com/business/answer/3038177
- S67 — Google Business Profile Help, Business eligibility and ownership guidelines (official): https://support.google.com/business/answer/13763036
- S68 — Google Advertising Policies Help, Updates to AI labeling requirements, July 2026 (official): https://support.google.com/adspolicy/answer/17257106
- S69 — HLC, India introduces mandatory labelling for AI (secondary, law firm): https://www.hlc.com/en/publications/india-introduces-mandatory-labelling-for-ai-and-3hour-takedown-for-illegal-content
- S70 — Google Analytics Help, URL builders and campaign parameters (official): https://support.google.com/analytics/answer/10917952

**B2B and export platforms**

- S71 — IndiaMART Help, Registration fee (official): https://help.indiamart.com/knowledge-base/registration-fee-for-indiamart/
- S72 — IndiaMART, Mini Dynamic Catalog (official): https://corporate.indiamart.com/mini-dynamic-catalog/
- S73 — IndiaMART Help, BuyLead allocation (official): https://help.indiamart.com/knowledge-base/buy-lead-allocation/
- S74 — TradeIndia, Post and promote your products at no cost (official; search result): https://www.tradeindia.com/join_now/upload_product.html
- S75 — TradeIndia, TI Premium Seller Package (official): https://www.tradeindia.com/special-offers/ti-premium-seller-package.html
- S76 — ExportersIndia, Register your business (official): https://www.exportersindia.com/register-business-online
- S77 — ExportersIndia, Premium memberships (official): https://www.exportersindia.com/help/premium-memberships.htm
- S78 — Alibaba.com, Seller pricing for India (official): https://seller.alibaba.com/in/pricing
- S79 — Tridge, Sourcing Hub pricing (official): https://www.tridge.com/about/tridge-sourcing-hub/pricing
- S80 — Go4WorldBusiness, Pricing (official): https://www.go4worldbusiness.com/pricing
- S81 — APEDA, Farmer Connect Portal (official): https://farmerconnect.apeda.gov.in/Home/FCIndex
- S82 — APEDA, AgriXchange (official; not loaded): https://agriexchange.apeda.gov.in/
- S83 — DD News, Trade Connect ePlatform launch (official broadcaster): https://ddnews.gov.in/en/piyush-goyal-launches-trade-connect-e-platform-to-support-exporters/
- S84 — LinkedIn, Sales Navigator plans (official): https://business.linkedin.com/sell/sales-navigator/compare-plans

**Regulation**

- S85 — FSSAI, Order on revised turnover thresholds, 13 March 2026 (official): https://www.fssai.gov.in/upload/advisories/2026/03/69b4054bb6cd6Order%20dated%2013thMarch2026_Revised%20Turnover%20threshold.pdf
- S86 — FSSAI FoSCoS, Kind of business eligibility, updated 1 April 2026 (official): https://foscos.fssai.gov.in/assets/docs/Revised_2ndApril2026KindofBusinessEligibility.pdf
- S87 — Indian Kanoon, Food Safety and Standards Act 2006, section 18 (secondary; statute text): https://indiankanoon.org/doc/431774/
- S88 — CBIC, Notification 2/2017-Integrated Tax (Rate), original 2017 text; later amendments not checked (official): https://cbic-gst.gov.in/hindi/pdf/integrated-tax-rate/Notification%20for%20IGST%20exemption-2.pdf
- S89 — CBIC, CGST Act section 23 (official; certificate error, text read at TaxGuru https://taxguru.in/goods-and-service-tax/person-liable-registered-section-23-cgst-act-2017.html): https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/acts/2017_CGST_act/active/chapter6/section23_v1.00.html
- S90 — DGFT, IEC profile management (official): https://www.dgft.gov.in/CP/?opt=iec-profile-management
- S91 — DGFT, Appendix 2K scale of fees (official): https://content.dgft.gov.in/Website/dgftprod/62923d1c-9384-4416-abab-7d9cf488c156/2K_Updated.pdf
- S92 — DGFT, Foreign Trade Policy 2023, Chapter 2 (official): https://content.dgft.gov.in/Website/dgftprod/4f665d2f-20cc-4887-ae6a-5ec912bc0d44/FTP2023_Chapter02.pdf
- S93 — APEDA, Registration-cum-Membership Certificate (official): https://apeda.gov.in/RCMC
- S94 — PPQS, Import and export procedure (official): https://ppqs.gov.in/divisions/plant-quarantine/import-export-procedure
- S95 — PPQS, Plant quarantine FAQ (official): https://ppqs.gov.in/faq/plant-quarantine
- S96 — European Commission, Trade in plants and plant products from non-EU countries (official): https://food.ec.europa.eu/plants/plant-health-and-biosecurity/trade-plants-plant-products-non-eu-countries_en
- S97 — Swedish Board of Agriculture, Phytosanitary certificate and trade with countries outside the EU (official, EU member state): https://jordbruksverket.se/languages/english/swedish-board-of-agriculture/plants/trade-in-plants-plant-products-and-wood/phytosanitary-certificate-and-other-measures-against-pests-when-trading-plants-plant-products-and-other-objects-with-countries-outside-the-eu
- S98 — AGRINFO, Increased official controls, January 2026 update (secondary, EU-funded): https://agrinfo.eu/book-of-reports/temporary-increased-official-controls-on-foods-from-certain-countries-january-2026-update/
- S99 — GOV.UK, Importing and exporting fresh fruit and vegetables (official): https://www.gov.uk/guidance/importing-and-exporting-fresh-fruit-and-vegetables
- S100 — MAFF Plant Protection Station, Bringing plants into Japan (official): https://www.maff.go.jp/pps/j/introduction/english.html
- S101 — MHLW, Import procedure under the Food Sanitation Act (official; search result): https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/shokuhin/yunyu_kanshi/kanshi/index_00004.html
- S102 — Intertek, Saudi Arabia fresh produce certification (secondary, certification body): https://www.intertek.com/government/export-import/regulatory-news-updates/news-saudi-arabia/food-saudi-arabia-fresh-produce/
- S103 — UAE MOCCAE, Import an agricultural consignment (official; not loaded): https://www.moccae.gov.ae/en/services/import-permit
- S104 — WTO Import Licensing, Malaysia plants and plant products (official notification): https://importlicensing.wto.org/content/plant-plant-products-and-regulated-articles
- S105 — Sri Lanka Department of Agriculture, NPQS import procedure (official): https://doa.gov.lk/npqs-import-procedure/
- S106 — Bangladesh DAE, Plant Quarantine Act 2011 (official; search result): https://dae.portal.gov.bd/sites/default/files/files/dae.portal.gov.bd/page/634ba167_b3aa_4297_8d44_2cf394d7552c/Plant%20Quarentine%20Act%202011%28English%20Version%29.pdf
- S107 — Ratopati, Nepal tightens quarantine checks, 13 June 2026 (secondary, news): https://english.ratopati.com/story/66558/strict-biosecurity-ban-on-imports-of-bananas-coriander-avocados-etc

[S1]: https://www.facebook.com/business/help/205614130852988
[S2]: https://buffer.com/pricing
[S3]: https://www.hootsuite.com/plans
[S4]: https://www.hootsuite.com/faq
[S5]: https://later.com/pricing/
[S6]: https://metricool.com/pricing/
[S7]: https://help.metricool.com/main-differences-between-free-and-paid-plans-bl0v9
[S8]: https://postiz.com/pricing
[S9]: https://github.com/gitroomhq/postiz-app
[S10]: https://docs.postiz.com/installation/docker-compose
[S11]: https://docs.postiz.com/providers/linkedin
[S12]: https://docs.postiz.com/providers/instagram
[S13]: https://mixpost.app/pricing
[S14]: https://docs.mixpost.app/server/
[S15]: https://www.linkedin.com/help/linkedin/answer/a548192
[S16]: https://www.linkedin.com/help/linkedin/answer/a543852
[S17]: https://developers.facebook.com/docs/instagram-platform/content-publishing/
[S18]: https://developers.facebook.com/docs/graph-api/overview/access-levels/
[S19]: https://developers.facebook.com/docs/pages-api/posts
[S20]: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview
[S21]: https://learn.microsoft.com/en-us/linkedin/marketing/community-management-app-review
[S22]: https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin
[S23]: https://www.facebook.com/business/help/549256849084694
[S24]: https://www.facebook.com/business/help/1314349509894768
[S25]: https://www.facebook.com/policies_center/commerce/
[S26]: https://www.facebook.com/business/help/1627591223954487
[S27]: https://www.facebook.com/business/help/120325381656392
[S28]: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/pg/
[S29]: https://razorpay.com/docs/payments/whatsapp/
[S30]: https://faq.whatsapp.com/641572844337957/
[S31]: https://faq.whatsapp.com/5913398998672934
[S32]: https://seller.blinkit.com/
[S33]: https://seller.blinkit.com/faq
[S34]: https://seller.blinkit.com/fees-commission
[S35]: https://brands.zepto.co.in/
[S36]: https://www.swiggy.com/instamart-partner
[S37]: https://www.swiggy.com/support/issues/instamart_onboarding
[S38]: https://partner.bigbasket.com/
[S39]: https://www.apnnews.com/on-kisan-diwas-bigbasket-reaches-milestone-of-50000-registered-farmers-in-its-direct-sourcing-network/
[S40]: https://stories.flipkart.com/announcement/flipkart-minutes-crosses-1-000-micro-fulfilment-centers-in-under-two-years
[S41]: https://agriculturepost.com/agribusiness/agri-marketing/flipkart-india-launches-samarth-krishi-programme-to-create-market-linkage-for-fpos/
[S42]: https://seller.flipkart.com/api-docs/FMSAPI.html
[S43]: https://sell.amazon.in/sell-online/product-categories/grocery
[S44]: https://www.aboutamazon.in/news/retail/amazon-fresh-expansion-grocery-delivery-india
[S45]: https://www.aboutamazon.in/news/retail/amazon-now-india-ultra-fast-delivery
[S46]: https://sell.amazon.in/sell-online/local-shops-on-amazon
[S47]: https://identity.seller.jiomart.com/jiomartseller
[S48]: https://identity.seller.jiomart.com/jiomartseller/faqs
[S49]: https://techcrunch.com/2026/06/03/firstclub-doubles-valuation-to-255m-in-nine-months-on-quality-first-grocery-bet/
[S50]: https://www.firstclub.co.in/partner-with-us
[S51]: https://seller.hyperpure.com/
[S52]: https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2010600
[S53]: https://www.ondc.org/ondc-how-to-join/
[S54]: https://support.google.com/merchants/answer/6363310
[S55]: https://support.google.com/merchants/answer/13889434
[S56]: https://support.google.com/merchants/answer/160637
[S57]: https://support.google.com/merchants/answer/6324350
[S58]: https://support.google.com/merchants/announcements/6192467
[S59]: https://developers.google.com/merchant/api/latest-updates
[S60]: https://support.google.com/merchants/answer/12158480
[S61]: https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
[S62]: https://support.google.com/merchants/answer/15624457
[S63]: https://support.google.com/merchants/answer/7052112
[S64]: https://support.google.com/merchants/answer/15625172
[S65]: https://support.google.com/merchants/answer/160567
[S66]: https://support.google.com/business/answer/3038177
[S67]: https://support.google.com/business/answer/13763036
[S68]: https://support.google.com/adspolicy/answer/17257106
[S69]: https://www.hlc.com/en/publications/india-introduces-mandatory-labelling-for-ai-and-3hour-takedown-for-illegal-content
[S70]: https://support.google.com/analytics/answer/10917952
[S71]: https://help.indiamart.com/knowledge-base/registration-fee-for-indiamart/
[S72]: https://corporate.indiamart.com/mini-dynamic-catalog/
[S73]: https://help.indiamart.com/knowledge-base/buy-lead-allocation/
[S74]: https://www.tradeindia.com/join_now/upload_product.html
[S75]: https://www.tradeindia.com/special-offers/ti-premium-seller-package.html
[S76]: https://www.exportersindia.com/register-business-online
[S77]: https://www.exportersindia.com/help/premium-memberships.htm
[S78]: https://seller.alibaba.com/in/pricing
[S79]: https://www.tridge.com/about/tridge-sourcing-hub/pricing
[S80]: https://www.go4worldbusiness.com/pricing
[S81]: https://farmerconnect.apeda.gov.in/Home/FCIndex
[S82]: https://agriexchange.apeda.gov.in/
[S83]: https://ddnews.gov.in/en/piyush-goyal-launches-trade-connect-e-platform-to-support-exporters/
[S84]: https://business.linkedin.com/sell/sales-navigator/compare-plans
[S85]: https://www.fssai.gov.in/upload/advisories/2026/03/69b4054bb6cd6Order%20dated%2013thMarch2026_Revised%20Turnover%20threshold.pdf
[S86]: https://foscos.fssai.gov.in/assets/docs/Revised_2ndApril2026KindofBusinessEligibility.pdf
[S87]: https://indiankanoon.org/doc/431774/
[S88]: https://cbic-gst.gov.in/hindi/pdf/integrated-tax-rate/Notification%20for%20IGST%20exemption-2.pdf
[S89]: https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/acts/2017_CGST_act/active/chapter6/section23_v1.00.html
[S90]: https://www.dgft.gov.in/CP/?opt=iec-profile-management
[S91]: https://content.dgft.gov.in/Website/dgftprod/62923d1c-9384-4416-abab-7d9cf488c156/2K_Updated.pdf
[S92]: https://content.dgft.gov.in/Website/dgftprod/4f665d2f-20cc-4887-ae6a-5ec912bc0d44/FTP2023_Chapter02.pdf
[S93]: https://apeda.gov.in/RCMC
[S94]: https://ppqs.gov.in/divisions/plant-quarantine/import-export-procedure
[S95]: https://ppqs.gov.in/faq/plant-quarantine
[S96]: https://food.ec.europa.eu/plants/plant-health-and-biosecurity/trade-plants-plant-products-non-eu-countries_en
[S97]: https://jordbruksverket.se/languages/english/swedish-board-of-agriculture/plants/trade-in-plants-plant-products-and-wood/phytosanitary-certificate-and-other-measures-against-pests-when-trading-plants-plant-products-and-other-objects-with-countries-outside-the-eu
[S98]: https://agrinfo.eu/book-of-reports/temporary-increased-official-controls-on-foods-from-certain-countries-january-2026-update/
[S99]: https://www.gov.uk/guidance/importing-and-exporting-fresh-fruit-and-vegetables
[S100]: https://www.maff.go.jp/pps/j/introduction/english.html
[S101]: https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/shokuhin/yunyu_kanshi/kanshi/index_00004.html
[S102]: https://www.intertek.com/government/export-import/regulatory-news-updates/news-saudi-arabia/food-saudi-arabia-fresh-produce/
[S103]: https://www.moccae.gov.ae/en/services/import-permit
[S104]: https://importlicensing.wto.org/content/plant-plant-products-and-regulated-articles
[S105]: https://doa.gov.lk/npqs-import-procedure/
[S106]: https://dae.portal.gov.bd/sites/default/files/files/dae.portal.gov.bd/page/634ba167_b3aa_4297_8d44_2cf394d7552c/Plant%20Quarentine%20Act%202011%28English%20Version%29.pdf
[S107]: https://english.ratopati.com/story/66558/strict-biosecurity-ban-on-imports-of-bananas-coriander-avocados-etc
[S108]: https://faq.whatsapp.com/405903568419894
