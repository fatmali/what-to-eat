# 🍴 What To Eat

A mobile-first **Progressive Web App** for tracking what's in your fridge so you
always know what to eat — and never let food quietly expire in the back again.

## Features

- **Fridge tracker** — log food, meal prep, and leftovers with quantity, unit, and
  expiration date. Everything is grouped and sorted so the most urgent items float
  to the top.
- **Add & use items** — add items via a bottom-sheet form, adjust quantities with a
  stepper, and mark things as **used** when they're gone (used items are archived,
  not deleted).
- **Scan a receipt** — snap (or upload) a grocery receipt and it's read **on your
  device** with Tesseract.js OCR; the detected items become an editable list you
  review — tick what to keep, fix names, set categories — before filing them into
  the fridge. The photo never leaves the phone.
- **Expiration awareness** — color-coded badges (fresh → expiring soon → today →
  expired), a summary alert banner, and an "Expiring" filter, plus a live count
  badge on the Fridge tab.
- **Notifications** — opt-in OS-level reminders via the Web Notifications API fire
  when something is near or past its expiry (de-duped to at most once per item per
  day). Turn them on/off from the 🔔 button in the header.
- **Installable & offline** — a real PWA with a manifest, icons, and a service
  worker, so it can be added to your home screen and works offline.
- **Recipes (preview)** — a placeholder tab that reads suggestions from a mock
  `public/recipes.json`. See below.

## Data & persistence

- **Fridge contents** live in the browser's **localStorage** (key
  `whattoeat.fridge.v1`). No backend, no account — it just works offline. On first
  run the app seeds a sample fridge so nothing is empty.
- **Receipt OCR** runs fully client-side via [Tesseract.js](https://tesseract.projectnaptha.com/).
  The engine (worker + WASM core + a compact English model) is self-hosted under
  `<base>/tesseract/` — no third-party CDN — and cached by the service worker on
  first use, so scanning works offline afterwards. Those assets are regenerated
  from `node_modules` by `scripts/setup-tesseract.mjs` (run automatically on
  `predev`/`prebuild`) and are intentionally **not** tracked as source. Receipt
  parsing is heuristic (`src/lib/receipt.js`) and always followed by a review step.
- **Recipes** are read (read-only) from `public/recipes.json`. This is mocked for
  now — the intent is that a separate job/cron regularly regenerates that file with
  suggestions based on the fridge, and the app simply renders whatever it finds.
  **Smart recipe matching is intentionally deferred to a later task.**

## Design — dark, OLED-first

A refined **true-black** interface built for OLED screens:

- Pure `#000` background with near-black surfaces and hairline borders, plus a
  faint atmospheric glow so black still reads with depth.
- **Fraunces** (a characterful high-contrast serif) for the masthead and item
  names, paired with **DM Mono** for quantities, dates, and labels. Both fonts
  are self-hosted (via `@fontsource`) so the app stays offline.
- Items are shown with a **monogram tile** (the initial, tinted by category) —
  no emoji. Expiry is a soft, rounded **status chip** colour-coded green →
  amber → orange → red.
- Generously rounded cards, pill controls, and a bottom-sheet add form. Cards
  reveal in a staggered cascade on load; everything respects
  `prefers-reduced-motion`.

## Tech stack

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) for the manifest & service worker
- [Fraunces](https://fonts.google.com/specimen/Fraunces) + [DM Mono](https://fonts.google.com/specimen/DM+Mono), self-hosted via `@fontsource`
- Plain CSS (no UI framework), mobile-first

## Getting started

```bash
npm install
npm run dev        # start the dev server (PWA enabled in dev)
npm run build      # production build into docs/ (served by GitHub Pages)
npm run preview    # preview the production build
```

Because `base` is set to `/what-to-eat/` (see below), the dev server runs at
`http://localhost:5173/what-to-eat/`.

Then open the app on your phone (or a mobile viewport) and use **Add to Home
Screen** to install it.

## Deploying to GitHub Pages

The app is a fully static site (no backend). `npm run build` outputs into
**`docs/`**, which GitHub Pages can serve directly — no CI required.

One-time setup:

1. In the repo, go to **Settings → Pages**.
2. Under **Source**, choose **Deploy from a branch**.
3. Pick the branch (`claude/what-to-eat-pwa-37rpj7`, or `main` after you merge)
   and folder **`/docs`**, then **Save**.
4. The site goes live at **https://fatmali.github.io/what-to-eat/**.

To update the deployed site after changing the app:

```bash
npm run build          # regenerates docs/
git add docs && git commit -m "Rebuild site" && git push
```

Notes:

- `vite.config.js` sets `base: '/what-to-eat/'` so assets resolve under the
  project-site subpath. For a **custom domain** or a **user/org page** (served at
  the domain root), build with `VITE_BASE=/ npm run build` instead.
- `docs/.nojekyll` is included so GitHub Pages serves all files as-is.
- The service worker is scoped to `/what-to-eat/`, so the PWA installs and works
  offline from the Pages URL.

> The built `docs/` folder is committed on purpose so Pages can serve it without
> a build step. If you'd rather not track build output, switch Pages to a
> GitHub Actions workflow instead (requires Actions to be enabled on the repo).

## Project structure

```
public/
  recipes.json          # mock recipe feed (a future job overwrites this)
  favicon.svg, pwa-*.png, apple-touch-icon.png
src/
  lib/
    constants.js        # categories, units, storage keys, thresholds
    expiry.js           # date math + expiry status helpers
    seed.js             # first-run sample fridge
    storage.js          # localStorage load/save
  hooks/
    useFridge.js        # fridge state + mutations, persisted
    useNotifications.js # permission flow + expiry reminders
  components/           # ItemCard, FridgeView, AddItemSheet, RecipesView, …
  App.jsx               # shell: header, tabs, banner, FAB
```

## Notes on the deferred recipe feed

The `recipes.json` shape the app expects:

```json
{
  "generatedAt": "<ISO timestamp | null>",
  "recipes": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "usesFridgeItems": ["Item name", "…"],
      "timeMinutes": 20,
      "emoji": "🍳"
    }
  ]
}
```

A future task can generate this file from the fridge contents; the app needs no
changes to pick it up.
