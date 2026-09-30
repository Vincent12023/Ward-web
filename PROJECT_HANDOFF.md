# Ward Rain&Sun Website Project Handoff

Last updated: 2026-08-21

## Project Overview

This folder is the current Ward Rain&Sun brand website.

Ward Rain&Sun is a U.S.-market umbrella brand currently selling mainly through Amazon US. The website started as an after-sales and warranty support site, and is being upgraded into a lightweight brand website that Google can crawl and understand.

Confirmed production domain:

```text
https://www.wardrainsun.com/
```

Amazon references used for brand/product research only:

```text
Seller profile: https://www.amazon.com/sp?ie=UTF8&seller=A3KOZBK8XZI2X
Product listing/search: https://www.amazon.com/s?me=A3KOZBK8XZI2X&marketplaceID=ATVPDKIKX0DER
```

Important business decision: the website should not currently link out to Amazon. Product images may be localized into the site, but public Amazon storefront/product links should not appear in visible site navigation or CTAs for now.

## Technical Shape

This is a zero-dependency static HTML/CSS website.

There is no `package.json`, no build step, and no framework. Deployment is expected to work as static hosting, currently configured for Vercel through:

```text
vercel.json
```

Current `vercel.json`:

```json
{
  "cleanUrls": true,
  "trailingSlash": false
}
```

Because `cleanUrls` is enabled, production URLs like `/support`, `/warranty`, and `/warranty-success` should resolve to the matching `.html` files.

Local site links were intentionally changed back to relative `.html` links, such as `index.html`, `support.html`, and `warranty.html`, because root links like `/` could open the local disk root in some local preview/file contexts.

## Current File Structure

```text
/
├── index.html
├── support.html
├── warranty.html
├── warranty-success.html
├── robots.txt
├── sitemap.xml
├── README.md
├── PROJECT_HANDOFF.md
├── vercel.json
├── css/
│   └── style.css
└── assets/
    ├── logo.png
    ├── logo-nav.png
    ├── favicon.png
    ├── apple-touch-icon.png
    ├── og-image.png
    └── products/
        ├── compact-auto-umbrella.jpg
        ├── mini-travel-umbrella.jpg
        ├── reflective-edge-umbrella.jpg
        ├── reverse-fold-umbrella.jpg
        └── windproof-inverted-umbrella.jpg
```

## Current Site Pages

### `index.html`

Role: public brand homepage, intended to be indexed by Google.

Current content:

- Brand positioning for Ward Rain&Sun.
- Premium compact/windproof travel umbrella copy.
- Product showcase using localized product images.
- Warranty CTA.
- SEO metadata, Open Graph/Twitter metadata, favicon links.
- `Organization` JSON-LD.
- `WebSite` JSON-LD.

Canonical:

```text
https://www.wardrainsun.com/
```

### `support.html`

Role: public support and FAQ page, intended to be indexed by Google.

Current content:

- Warranty registration FAQ.
- Missed registration window FAQ.
- Care and maintenance FAQ.
- Replacement/support instructions.
- No Amazon outbound link.
- SEO metadata, Open Graph/Twitter metadata, favicon links.
- `FAQPage` JSON-LD.

Canonical:

```text
https://www.wardrainsun.com/support
```

### `warranty.html`

Role: warranty registration form. This is not intended as a primary Google landing page.

Indexing:

```html
<meta name="robots" content="noindex, follow" />
```

Canonical:

```text
https://www.wardrainsun.com/warranty
```

Current form behavior:

- Submits to the existing n8n webhook.
- Do not change the webhook unless explicitly requested.

Webhook:

```js
const N8N_WEBHOOK_URL = 'https://vincent133.zeabur.app/webhook/warranty-registration';
```

Required fields:

- First Name
- Email Address
- Amazon Order ID
- Product Photo

Optional fields:

- Last Name
- Product Model
- Purchase Date

Recent change: `Product Model` and `Purchase Date` were changed from required to optional. They remain in the submitted payload as empty strings if the customer leaves them blank.

Photo behavior:

- Product photo is required.
- Browser compresses uploaded image to JPEG using canvas.
- Payload includes `photoBase64`, `photoMimeType`, `submittedAt`, `source`, and `userAgent`.

Success redirect:

```js
window.location.href = `warranty-success.html?${params.toString()}`;
```

### `warranty-success.html`

Role: post-submit success page.

Indexing:

```html
<meta name="robots" content="noindex, follow" />
```

Canonical:

```text
https://www.wardrainsun.com/warranty-success
```

Current behavior:

- Reads `name` and `email` from URL params.
- Shows personalized confirmation.
- Amazon review CTA was removed because the site should not currently link out to Amazon.
- Next-step buttons point to Support.

## SEO Strategy Implemented

Implemented SEO basics:

- `robots.txt`
- `sitemap.xml`
- Canonical URLs
- Page-specific meta descriptions
- Open Graph metadata
- Twitter card metadata
- Favicon and Apple touch icon
- `Organization` structured data on homepage
- `WebSite` structured data on homepage
- `FAQPage` structured data on Support

Current sitemap includes only indexable public pages:

```text
https://www.wardrainsun.com/
https://www.wardrainsun.com/support
```

Current sitemap intentionally does not include:

- `/warranty`
- `/warranty-success`

Reason: the warranty form and success page are service flow pages, not primary SEO landing pages.

Future recommended SEO step: create a separate indexable Warranty information page, for example `/warranty-info.html` or `/warranty-policy.html`, then link from that page to the noindex warranty registration form.

## Brand Assets

Original logo provided by user:

```text
assets/logo.png
```

It is a black-text PNG with white background.

Issue found: using CSS invert on the white-background logo caused a black box in the dark navbar.

Fix implemented:

```text
assets/logo-nav.png
```

This is a transparent-background navigation logo generated from the original logo, with light text for dark navbar usage.

Other generated/localized assets:

```text
assets/favicon.png
assets/apple-touch-icon.png
assets/og-image.png
```

Product images localized under:

```text
assets/products/
```

These were extracted from publicly accessible Amazon product image URLs for Ward Rain&Sun products.

## Design Direction

Current visual direction:

- Premium but simple.
- Navy and gold brand palette.
- Cream page background.
- Serif headline style with clean sans-serif body copy.
- Functional static brand site, not a marketing-heavy landing page.
- Product showcase is present but intentionally not connected to Amazon.

Known design notes:

- Homepage hero is now product-forward.
- Navbar uses transparent logo to avoid black background block.
- CTA links are relative `.html` files for safe local preview.
- Product showcase currently uses Amazon-derived product images and general product names.

## Validation Completed

Local static preview was run at:

```text
http://127.0.0.1:5173/
```

Routes validated locally:

```text
/                    200
/support             200
/warranty            200
/warranty-success    200
/robots.txt          200
/sitemap.xml         200
/assets/og-image.png 200
```

Local link/resource validation passed:

```text
All relative links/assets resolved
```

Browser checks completed with system Chromium/Edge through Playwright:

- Desktop and mobile views checked.
- Product images loaded.
- No horizontal overflow found.
- Warranty nav logo link points to `index.html`.
- `Product Model` and `Purchase Date` are not required in the DOM.

Current required warranty form field IDs:

```text
firstName
email
orderId
```

Photo upload is also required by custom JS validation.

## Google Search Console

The user asked what Google Search Console permission means.

Explanation:

Google Search Console is Google's official site owner tool. The user should verify ownership of:

```text
https://www.wardrainsun.com/
```

After verification, they can submit:

```text
https://www.wardrainsun.com/sitemap.xml
```

Recommended verification methods:

- DNS TXT verification if the user controls DNS.
- HTML verification file if Google provides one.
- Meta tag verification if needed.

If Google provides an HTML verification file, place it in the website root.

## Current Git State Warning

The working tree is dirty.

Files intentionally modified/added during this work include:

```text
index.html
support.html
warranty.html
warranty-success.html
css/style.css
robots.txt
sitemap.xml
assets/
PROJECT_HANDOFF.md
```

There are also many existing deleted files from old paths/backups, for example:

```text
wardrainsun/
warranty backup/
warranty1.html
warranty2.html
```

Those deletions appeared before the SEO/homepage work and were not cleaned up or reverted. Be careful before committing: decide whether those old deleted files are intentional.

## Important Constraints and Decisions

- Do not link to Amazon from the current website unless the user changes the requirement.
- Do not change the n8n webhook unless explicitly requested.
- Keep `warranty.html` as `noindex, follow`.
- Keep `warranty-success.html` as `noindex, follow`.
- Product Model is optional.
- Purchase Date is optional.
- Product Photo remains required.
- The site is currently static; avoid adding a framework unless product pages become difficult to maintain manually.

## Recommended Next Steps

1. Review homepage copy and product names with the user.
2. Replace Amazon-derived images with original product assets if available.
3. Add a public, indexable warranty policy/info page.
4. Add product detail pages when the user is ready to showcase catalog items.
5. Submit sitemap in Google Search Console after deployment.
6. Confirm whether old deleted backup folders should be kept deleted or restored before committing.
7. Consider adding a real privacy policy page because the warranty form collects customer data and product photos.
8. Consider adding image dimensions or compressed WebP versions if page performance becomes a concern.

## Quick Local Preview

If a simple local static server is needed, any static server can be used. During this work, a small Node static server was started at:

```text
http://127.0.0.1:5173/
```

If it is no longer running, start any static server from the project root and open `index.html`.

## Handoff Summary

The project is now a static brand-support website with SEO basics, a refreshed homepage, localized brand/product images, a noindex warranty form, and no outbound Amazon links. The next useful improvements are content polish, Google Search Console verification, an indexable warranty information page, and future product detail pages.
