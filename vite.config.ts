import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { version } from './package.json';

export default defineConfig({
  base: '/',
  server: {
    port: 5173,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // Changed from autoUpdate
      includeAssets: ['favicon.svg', 'pwa-192x192.png', 'splash.png'],
      manifest: {
        name: 'ElLin Goals',
        short_name: 'ElLin Goals',
        theme_color: '#FF4B4B',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: false, // Changed to false to enable update prompt
        clientsClaim: true
      },
      // Add version to filename for cache busting
      filename: `sw-v${version}.js`,
      // Add periodic update checks
      injectRegister: 'script',
      strategies: 'generateSW',
      minify: true
    })
  ]
});
