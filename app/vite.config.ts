import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      // RNF-02: service worker se atualiza sozinho quando há nova versão.
      registerType: 'autoUpdate',
      // Já temos um manifest.webmanifest em static/, não deixamos o plugin gerar outro.
      manifest: false,
      injectRegister: 'auto',
      // Roda build sem reiniciar o SW durante `pnpm dev`; preview usa SW real.
      devOptions: {
        enabled: false,
        type: 'module'
      },
      workbox: {
        // RNF-01: precache do app inteiro para rodar offline.
        globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,webmanifest,html,woff2}'],
        // Navegações caem para o fallback do adapter-static — garante rota funcionar offline.
        navigateFallback: '/',
        navigateFallbackDenylist: [/^\/_app\//],
        // Fonts do Google Fonts: caches diferentes para CSS e os .woff2.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    strictPort: false
  }
});
