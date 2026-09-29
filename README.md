# VendFlow Pro marketing site

Static site: `index.html`, `styles.css`, `script.js`. Open `index.html` in a browser to preview, or upload the folder to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages).

## Connect the contact form to email
1. Create a free form at https://formspree.io and copy its endpoint (looks like `https://formspree.io/f/abcdwxyz`).
2. In `script.js`, set `FORM_ENDPOINT` to that URL and `FALLBACK_EMAIL` to your address.
3. Submit a test from the live site and confirm the email in Formspree.

Until `FORM_ENDPOINT` is set, submitting opens the visitor's email app with the request pre-filled.

## Machine photo
Save a photo of your machine as `images/machine.jpg`. Until that file exists, a drawn illustration is shown instead.

## Your contact details
The phone number (555) 555-0100 is a placeholder. Search `index.html` and `script.js` for `555` and replace it (including the `tel:+15555550100` links). The email is set to hello@vendflowpro.com in `index.html` and in `FALLBACK_EMAIL` in `script.js`.

## Tailwind for production
The page uses the Tailwind Play CDN, which is fine for demos but prints a console warning. For production, install Tailwind, copy the `tailwind.config` block from `index.html` into `tailwind.config.js`, build a CSS file, and replace the CDN `<script>` tags with a `<link>` to it.
