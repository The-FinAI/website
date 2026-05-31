# The Fin AI — Website

A multi-page static site for [thefin.ai](https://thefin.ai). Pure HTML + CSS, no build step.

## Pages

- `index.html` — Home: hero, output stats, events strip, three pillars, community, partners
- `about.html` — About: mission + links to Leadership / Policies / Research / Events
- `leadership.html` — Board, Steering, Executive committees, and regional chapters (NA / EU / Asia-Pacific)
- `policies.html` — the seven governance documents
- `research.html` — Publications & Talks (tabbed; links to Google Scholar, Hugging Face, YouTube)
- `events.html` — Events index linking to each event page
- `symposium-2026.html` — The Fin AI Symposium 2026 (details, speakers, call for posters)
- `finnlp-2026.html` — FinNLP 2026 Workshop @ EMNLP 2026
- `webinar-series.html` — SIG-FinTech × The Fin AI Webinar Series

Shared assets:

- `style.css` — styles for all pages
- `CNAME` — custom domain (`thefin.ai`)
- `.nojekyll` — tells GitHub Pages to serve files as-is

The header nav and footer are duplicated in each HTML file (no build step), so edit them in each page if you change links.

## Still to fill in

- `policies.html`: the seven document links currently point to `#` — connect them to the published policy files.
- `leadership.html`: LinkedIn URLs were not available from the original site; add `mailto:`/LinkedIn links as needed.

## Preview locally

Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 5173
# then visit http://localhost:5173
```

## Deploy on GitHub Pages (static, no build)

1. Push these files to a GitHub repo (root of the `main` branch).
2. Repo Settings → Pages → Build and deployment → Source: **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. `CNAME` sets the custom domain. Point DNS at GitHub Pages:
   - Apex `thefin.ai`: A/AAAA records to GitHub Pages IPs (or `ALIAS`/`ANAME` to `<user>.github.io`).
   - `www`: `CNAME` to `<user>.github.io`.
4. Enable "Enforce HTTPS" once the domain verifies.

## Editing content

All text lives directly in `index.html`. The "Join the Community" links and social links are plain `<a href>` — update in place.
