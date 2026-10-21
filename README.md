# VendFlow Pro marketing site

Static site: `index.html`, `styles.css`, `script.js`. Open `index.html` in a browser to preview, or upload the folder to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages).

## Contact form email
Form submissions are emailed to support@vendflowpro.com through FormSubmit (no account needed).

1. Deploy the site, then submit one test request from the live page.
2. FormSubmit sends an "Activate form" email to support@vendflowpro.com. Click the link once.
3. Submit another test and confirm it arrives. The visitor's address is set as reply-to, so you can answer with Reply.

To send to a different address, change `SUPPORT_EMAIL` in `script.js`. To hide the address from the page source, paste the alias from FormSubmit's activation email into `FORM_ALIAS`.

## Logo and colors
The header logo is `images/logo.png`; the browser-tab icon is `images/favicon.png` and the iPhone home-screen icon is `images/apple-touch-icon.png`. All three were cut from the supplied logo files with transparent backgrounds.

The palette is sampled from the logo: navy `#13213C` (text, dark sections), violet `#7B5CFF` (accents) with a slightly deeper `#6A48F5` for buttons so white text stays readable, and coral `#FF5A4E` for the illustration. Colors are defined in two places that must match: the `tailwind.config` block in `index.html` and the `:root` variables at the top of `styles.css`.

## Updating files
`index.html` loads `styles.css?v=6`, `script.js?v=6` and the images with a version number. When you change any of those files, raise the number (to `?v=7`, and so on) so visitors' browsers fetch the new copy instead of a cached one.

## Machine photo
The hero photo is `images/machine.jpg`. The violet glow, floor shadow and moving camera-scan line around it are drawn with CSS ("Hero machine" in `styles.css`). If you replace the photo with a different shot, adjust the `.machine-glass` percentages so the scan line stays inside the glass door, and update the `width`/`height` on the `<img>` tag.

## Your contact details
The phone number is (469) 465 5915. To change it, search `index.html` and `script.js` for `465 5915` and `tel:+14694655915`. The email is set to support@vendflowpro.com in `index.html` and in `SUPPORT_EMAIL` in `script.js`.

## Product video
The video in the Features section is YouTube video `6aUCVLvqPLs`. To swap it, change `data-video-id` and the two thumbnail URLs on the `.video-facade` button in `index.html`. The page shows the thumbnail first and loads YouTube's player only when a visitor clicks play, which keeps the page fast and cookie-free until then.

If YouTube shows "Error 153", the player could not tell which site embedded it. The page already sends this information, so check that you are viewing it over `http://` or `https://` (not by double-clicking `index.html`) and that no browser extension is blocking referrers. A "Watch it on YouTube" link under the video always works as a backup.

## Tailwind for production
The page uses the Tailwind Play CDN, which is fine for demos but prints a console warning. For production, install Tailwind, copy the `tailwind.config` block from `index.html` into `tailwind.config.js`, build a CSS file, and replace the CDN `<script>` tags with a `<link>` to it.
