import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Für die Einzeldatei-Vorschau (INLINE_ASSETS=1) werden Grafiken und Ton eingebettet
  build: process.env.INLINE_ASSETS ? { assetsInlineLimit: 100_000_000 } : {},
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
