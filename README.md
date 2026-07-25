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
- **Recipes** are read (read-only) from `public/recipes.json`. This is mocked for
  now — the intent is that a separate job/cron regularly regenerates that file with
  suggestions based on the fridge, and the app simply renders whatever it finds.
  **Smart recipe matching is intentionally deferred to a later task.**

## Tech stack

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) for the manifest & service worker
- Plain CSS (no UI framework) — a dark, mobile-first theme

## Getting started

```bash
npm install
npm run dev        # start the dev server (PWA enabled in dev)
npm run build      # production build into dist/
npm run preview    # preview the production build
```

Then open the app on your phone (or a mobile viewport) and use **Add to Home
Screen** to install it.

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
