# Ward Rain&Sun — Official Website

Static website. 4 pages. Zero dependencies. Deploys to Vercel for free.

## File Structure

```
/
├── index.html              首页 Home
├── warranty.html           保修激活 Warranty Registration
├── warranty-success.html   提交成功 Success Page
├── support.html            售后支持 Support & FAQ
├── css/
│   └── style.css           共用样式 Shared Styles
└── vercel.json             Vercel config
```

---

## 🚀 Deploy to Vercel (5 minutes)

1. Push this folder to a GitHub repository
2. Go to vercel.com → New Project → Import your GitHub repo
3. Click Deploy (no build settings needed — it's static HTML)
4. Bind your custom domain: wardrainsun.com

---

## ✏️ Things to Update Before Launch

### 1. Product Models (warranty.html)
Find this comment and update the `<option>` list with your real SKUs:
```html
<!-- ✏️ UPDATE: Add your actual product models here -->
```

### 2. Form Submission Endpoint (warranty.html)
The form currently runs in "development mode" (no real submission).
To connect a real backend, pick ONE of these options:

**Option A — Formspree (recommended, free 50/month)**
1. Sign up at formspree.io
2. Create a new form
3. Copy your endpoint (looks like: https://formspree.io/f/abcdefgh)
4. Replace this line in warranty.html:
   ```js
   const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
   ```

**Option B — Tally.so (recommended for 0 code)**
1. Create account at tally.so
2. Build form with fields: First Name, Email, Amazon Order ID, Product, Purchase Date
3. In Tally settings → Redirects: set success URL to https://wardrainsun.com/warranty-success.html
4. In warranty.html: delete the `<form>` block and uncomment the Tally embed block

### 3. Amazon Review Link (warranty-success.html)
Update the "Leave a review" link to point to your specific product listing:
```html
<a href="https://www.amazon.com/review/create-review/?asin=YOUR_ASIN" ...>
```
Replace YOUR_ASIN with your product's ASIN.

### 4. Contact Email
If you change support@wardrainsun.com, search-replace across all files.

### 5. Copyright Year
Update `&copy; 2025` in the footers to the current year.

---

## 🎨 Brand Colors

| Name        | HEX     | Usage                    |
|-------------|---------|--------------------------|
| Navy        | #0C2340 | Backgrounds, text        |
| Gold        | #C9A96E | Accents, CTA buttons     |
| Cream       | #F5F0E8 | Light backgrounds        |
| Slate       | #4A6080 | Secondary text           |

Fonts: Playfair Display (headings) + DM Sans (body) — loaded from Google Fonts.

---

## 📱 Mobile

All pages are mobile-first. The warranty page navigation is intentionally minimal
(no links out) to keep users focused on completing the form.
