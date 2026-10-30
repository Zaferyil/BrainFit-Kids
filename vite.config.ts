import react from '@vitejs/plugin-react'
import { cpSync, existsSync, readFileSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Ein Projekt, eine Adresse: die Website (Ordner site/, statisches HTML) liegt unter „/“,
// die Lernplattform (diese Vite-App) unter „/app/“.
const TYPEN: Record<string, string> = { '.html': 'text/html', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.svg': 'image/svg+xml' }
function website(): Plugin {
  const ordner = resolve(__dirname, 'site')
  return {
    name: 'website',
    // Entwicklung: alles außerhalb von /app/ kommt aus site/
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pfad = decodeURIComponent((req.url ?? '/').split('?')[0])
        if (pfad.startsWith('/app')) return next()
        const datei = join(ordner, pfad === '/' ? 'index.html' : pfad)
        if (!datei.startsWith(ordner) || !existsSync(datei)) return next()
        res.setHeader('Content-Type', TYPEN[extname(datei)] ?? 'application/octet-stream')
        res.end(readFileSync(datei))
      })
    },
    // Build: die App landet in dist/app, die Website daneben in dist
    closeBundle() {
      if (!process.env.INLINE_ASSETS) cpSync(ordner, resolve(__dirname, 'dist'), { recursive: true })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/app/',
  // Für die Vorschau (INLINE_ASSETS=1) werden Grafiken und kurze Töne eingebettet;
  // die langen Video-Tonspuren bleiben eigene Dateien neben der Seite (sonst wird die Seite zu groß)
  build: process.env.INLINE_ASSETS ? { assetsInlineLimit: (file: string) => !/lektionen\/[^/]+-ton\.mp3$/.test(file) } : { outDir: 'dist/app', emptyOutDir: true },
  plugins: [
    react(),
    website(),
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
        start_url: '/app/',
        scope: '/app/',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
    }),
  ],
})
