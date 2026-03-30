# Social Poster — Claude Instructions

## Project Overview
WhatsApp-triggered + web dashboard Facebook auto-poster.
- User sends `post: [topic]` via WhatsApp OR uses the web dashboard
- Claude generates a caption + image keyword
- Unsplash fetches a relevant image
- Facebook Graph API posts to the "Daniel Enantomhen" page

---

## Stack
- **Runtime:** Node.js (no build tools, no TypeScript, no frameworks)
- **Server:** Express
- **AI:** Anthropic SDK (`claude-haiku-4-5-20251001`)
- **APIs:** Facebook Graph API v21.0, Unsplash, WhatsApp Cloud API
- **Frontend:** Plain HTML/CSS/JS in `public/index.html`

---

## Project Structure
```
server.js              — Express entry point, serves static files
routes/
  webhook.js           — WhatsApp webhook (verification + message handling)
  api.js               — /api/generate and /api/publish endpoints
services/
  claude.js            — generatePost(topic) and generatePostFromContent(text, url)
  unsplash.js          — fetchImage(keyword)
  facebook.js          — postToPage(caption, imageUrl)
  whatsapp.js          — sendText(to, message)
  scraper.js           — scrapeUrl(url) — fetches and strips HTML from any URL
public/
  index.html           — Web dashboard (topic input, URL input, preview, history)
```

---

## Environment Variables (in .env)
```
PORT=5001
WEBHOOK_VERIFY_TOKEN=social-poster-webhook-2025

WA_PHONE_NUMBER_ID=1015106495022655
WA_ACCESS_TOKEN=...

ANTHROPIC_API_KEY=...
UNSPLASH_ACCESS_KEY=...

FB_PAGE_ID=112342958202732
FB_PAGE_ACCESS_TOKEN=...
```

---

## Key Details
- Facebook Page: **Daniel Enantomhen** (ID: `112342958202732`)
- Facebook app: **Dantelarge** (App ID: `915205454741802`)
- WhatsApp test number: `+1 555 151 2659`
- FB token needs permissions: `pages_show_list`, `pages_manage_posts`, `pages_read_engagement`
- FB Page Access Token expires — must be refreshed from Graph API Explorer or converted to a permanent token
- Claude sometimes returns JSON wrapped in markdown fences — `parseJson()` in `claude.js` handles this

---

## Known Issues / Notes
- FB_PAGE_ACCESS_TOKEN from Graph API Explorer is short-lived (~1 hour) — needs to be converted to a long-lived token
- Unsplash account must have confirmed email before API access works
- WhatsApp keys are only needed for the WhatsApp trigger — not required for web dashboard

---

## Code Rules
- `'use strict'` at top of every JS file
- No TypeScript, no React, no build tools
- Never use `alert()` — use the toast system in `public/index.html`
- Always use `escapeHtml()` for dynamic user-facing content in the frontend
- Never hardcode colours — use CSS variables
- Dark mode supported via `[data-theme="dark"]`
