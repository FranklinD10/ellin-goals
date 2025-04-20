import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { version } from './package.json';
import fs from 'fs';

// Update app version in .env without overwriting other variables
try {
  const envContent = fs.readFileSync('.env', 'utf-8');
  const updatedContent = envContent.replace(
    /^VITE_APP_VERSION=.*$/m,
    `VITE_APP_VERSION=${version}`
  );
  fs.writeFileSync('.env', updatedContent);
} catch (error) {
  // If .env doesn't exist, create it with just the version
  fs.writeFileSync('.env', `VITE_APP_VERSION=${version}\n`);
}

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
  },  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-mui': ['@mui/material', '@mui/icons-material'],
          'vendor-charts': ['recharts'],
          'vendor-motion': ['framer-motion'],
        }
      }
    },
    commonjsOptions: {
      esmExternals: ['firebase'],
    },
    chunkSizeWarningLimit: 800,
    sourcemap: false,
    target: 'esnext',
  },  plugins: [
    react({
      babel: {
        plugins: [
          ['@emotion/babel-plugin'],
          ['babel-plugin-direct-import', { modules: ['@mui/material', '@mui/icons-material'] }],
        ],
      },
    }),
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
      },      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
            },
          },
        ],
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
