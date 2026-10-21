# VendFlow Pro marketing site

Static site: `index.html`, `styles.css`, `script.js`. Open `index.html` in a browser to preview, or upload the folder to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages).

## Contact form email
Form submissions are emailed to support@vendflowpro.com through FormSubmit (no account needed).

1. Deploy the site, then submit one test request from the live page.
2. FormSubmit sends an "Activate form" email to support@vendflowpro.com. Click the link once.
3. Submit another test and confirm it arrives. The visitor's address is set as reply-to, so you can answer with Reply.

To send to a different address, change `SUPPORT_EMAIL` in `script.js`. To hide the address from the page source, paste the alias from FormSubmit's activation email into `FORM_ALIAS`.

## Machine photo
Save a photo of your machine as `images/machine.jpg`. Until that file exists, a drawn illustration is shown instead.

## Your contact details
The phone number is (469) 465 5915. To change it, search `index.html` and `script.js` for `465 5915` and `tel:+14694655915`. The email is set to support@vendflowpro.com in `index.html` and in `SUPPORT_EMAIL` in `script.js`.

## Tailwind for production
The page uses the Tailwind Play CDN, which is fine for demos but prints a console warning. For production, install Tailwind, copy the `tailwind.config` block from `index.html` into `tailwind.config.js`, build a CSS file, and replace the CDN `<script>` tags with a `<link>` to it.
