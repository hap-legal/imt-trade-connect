# Iberia Medical Trade Inc. (IMT) — corporate website

Static corporate website for **Iberia Medical Trade Inc. (IMT)**, a Spanish B2B company
specialising in the import and export of medical devices and beauty products, with a
commercial focus on Asian markets.

Pure static build: semantic HTML5, one shared stylesheet, one small vanilla JS file.
No backend, no build step, no frameworks.

## File structure

The complete deployable site lives in the [`public/`](./public) folder:

```
public/
  index.html            Home
  about.html            About Us
  products.html         Product overview
  medical-devices.html  Medical devices
  beauty-products.html  Beauty products
  asian-markets.html    Asian markets
  services.html         Import & export services
  quality-compliance.html
  partners.html
  contact.html          Contact form (main conversion page)
  css/styles.css
  js/main.js
  assets/logo.svg, assets/favicon.svg
  robots.txt
  sitemap.xml
  CNAME                 www.iberamt.com
```

## Base URL / paths

All internal links and asset references are **relative** (`./about.html`,
`./css/styles.css`), so the site works unchanged on both:

- `https://hap-legal.github.io/IMT/` (GitHub project page, served under `/IMT/`)
- `https://www.iberamt.com/` (primary public domain)

Do **not** switch to root-absolute paths (`/css/styles.css`) — they break under the
`/IMT/` project-page prefix. If a `<base>` tag or absolute URLs are ever needed,
update `sitemap.xml` and the `robots.txt` `Sitemap:` line at the same time.

## Local preview

```bash
cd public
python3 -m http.server 8000
# open http://localhost:8000
```

(Or open `public/index.html` directly in a browser.)

## Deploy to GitHub Pages (hap-legal/IMT)

The site must sit at the repository root of the published branch.

1. Copy the **contents** of `public/` to the repository root (or push `public/` to a
   `gh-pages` branch root).
2. In GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**.
3. Branch: `main`, folder: `/ (root)` → **Save**.
4. Wait for the Pages build, then open `https://hap-legal.github.io/IMT/`.
5. Custom domain: point `iberamt.com` DNS at the host and keep www/apex consistent.
   Keep the `CNAME` file (contents: `www.iberamt.com`) at the published root and enable **Enforce HTTPS**.

## Replace the contact form endpoint

The form is front-end only. To receive submissions:

1. Create a form at [Formspree](https://formspree.io) and copy the endpoint.
2. In `public/contact.html`, change
   `<form id="enquiryForm" ... action="#" method="post">` to
   `action="https://formspree.io/f/xxxx" method="POST"`.
3. In `public/js/main.js`, delete the block marked `DEMO BRANCH` (the
   `e.preventDefault()` and success-message lines) so the browser submits normally.

Client-side validation and the success/error message UI stay in place either way.

## Add the real logo

Replace `public/assets/logo.svg` (or add `logo.png`) with the official artwork.
The header and footer currently render an inline placeholder mark — swap the
`<span class="brand__mark">…</span>` SVG in each HTML file for
`<img src="./assets/logo.svg" alt="Iberia Medical Trade Inc." width="160" height="40">`.
Also replace `public/assets/favicon.svg`.

## Images

Photography uses Unsplash placeholder URLs, each marked with an HTML comment
describing the intended real photograph. Replace them with licensed corporate imagery
before launch.

## Multi-language

Pages declare `lang="en"` and use clearly separated content blocks. To add a language,
duplicate the HTML files into a locale folder (e.g. `es/`, `ko/`), set the `lang`
attribute, translate the content, and add `hreflang` links plus new `sitemap.xml`
entries.

## Domain

Canonical public host: `https://www.iberamt.com`. Point `iberamt.com` DNS to the host and keep
www/apex consistent. `imt.eu` may later be redirected or aliased to it; it is not the primary
public URL and must not appear in site chrome until it serves this site.
