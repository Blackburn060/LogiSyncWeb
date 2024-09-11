import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { VitePWA } from 'vite-plugin-pwa';

dotenv.config();

export default defineConfig({
  plugins: [react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'LogiSync',
        short_name: 'LogiSync',
        description: 'LogiSync Application official WebApp',
        theme_color: '#0335b0',
        icons: [
          {
            src: 'assets/icons/logo192.webp',
            sizes: '192x192',
            type: 'image/webp'
          },
          {
            src: 'assets/icons/logo512.png',
            sizes: '512x512',
            type: 'image/webp'
          }
        ]
      }
    })
  ],
  define: {
    'import.meta.env.VITE_APP_BACKEND_API_URL': JSON.stringify(process.env.VITE_APP_BACKEND_API_URL)
  },
  build: {
    outDir: 'dist'
  },
  server: {
    port: 3000
  }
});
