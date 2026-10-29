import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Für die Vorschau (INLINE_ASSETS=1) werden Grafiken und kurze Töne eingebettet;
  // die langen Video-Tonspuren bleiben eigene Dateien neben der Seite (sonst wird die Seite zu groß)
  build: process.env.INLINE_ASSETS ? { assetsInlineLimit: (file: string) => !/lektionen\/[^/]+-ton\.mp3$/.test(file) } : {},
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Abakus-Grafiken und Klickton auch offline
      workbox: { globPatterns: ['**/*.{js,css,html,png,jpg,svg,mp3,webmanifest}'], maximumFileSizeToCacheInBytes: 8 * 1024 * 1024 },
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'BrainFit Kids',
        short_name: 'BrainFit Kids',
        description: 'Mental Arithmetik',
        lang: 'de',
        theme_color: '#1B1446',
        background_color: '#1B1446',
        display: 'standalone',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
    }),
  ],
})
