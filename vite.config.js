import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Served from a GitHub Pages project site: https://fatmali.github.io/what-to-eat/
  // Override with `VITE_BASE=/` (e.g. for a custom domain or user/org page).
  base: process.env.VITE_BASE ?? '/what-to-eat/',
  // Build into docs/ so GitHub Pages can serve it directly ("Deploy from a
  // branch" → /docs) without any CI.
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'What To Eat',
        short_name: 'WhatToEat',
        description: "Track what's in your fridge and decide what to eat.",
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        scope: process.env.VITE_BASE ?? '/what-to-eat/',
        start_url: process.env.VITE_BASE ?? '/what-to-eat/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json,woff2}'],
        // The OCR engine is large and only needed on demand — keep it out of the
        // precache and cache it at runtime on first use so scanning still works
        // offline afterwards.
        globIgnores: ['**/tesseract/**'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/tesseract/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'ocr-engine',
              expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
