# Floruvi page map

```text
floruvi.vercel.app/
├── /                         Home
├── products/                 All products, search and filters
│   └── [slug]/               Product details — 91 products
├── boxes/                    Single, Dual and Family boxes
├── cart/                     Basket
├── checkout/                 Delivery details and order request
├── recipes/                  Recipe collection
│   └── [slug]/               Recipe details — 88 recipes
├── how-we-grow/              Growing process
├── contact/                  Enquiry form
├── faq/                      Common questions
├── privacy/                  Privacy notice
└── wishlist/                 Saved products
```

`[slug]` is the URL name, for example `/products/butterhead-lettuce` or `/recipes/everyday-green-salad`.

Every page also exists in 31 other country & language versions under a prefix such as `/ar-ae/products/spinach` or `/de-de/boxes`. India English has no prefix. In code, all pages live in `app/[locale]/`; `proxy.ts` maps unprefixed URLs to `en-in`. See [languages, countries & search](21-languages-and-seo.md).

## Suggested review order

1. Home
2. Products and product details
3. Boxes
4. Cart and checkout
5. Recipes and recipe details
6. How we grow
7. Contact, FAQ and privacy

## Current boundaries

- Browsing, basket and enquiry forms do not require an account.
- Checkout currently sends an order request. Payment and OTP provider setup remains outstanding.
- Box schedules are daily, weekly and every two weeks. The selected schedule is included in the request; automatic recurring billing is not active.
- All 91 products have prices, including six live microgreen trays.
- There are no account, login, order-tracking, admin or blog pages yet. Chat is hidden.

## Supporting routes

These are endpoints or metadata files, not customer pages:

```text
api/
├── catalogue
├── checkout-review
└── enquiries
robots.txt
sitemap.xml                  Index of 32 version sitemaps
sitemaps/[version].xml
icon.png
apple-icon.png
```
