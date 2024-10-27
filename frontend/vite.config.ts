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
        description: 'LogiSync - Seu sistema de agendamento logístico!',
        theme_color: '#0335b0',
        icons: [
          {
            src: 'public/logo192ComFundo.webp',
            sizes: '192x192',
            type: 'image/webp'
          },
          {
            src: 'public/logo512ComFundo.png',
            sizes: '512x512',
            type: 'image/webp'
          }
        ]
      }
    })
  ],
  define: {
    'import.meta.env.VITE_APP_BACKEND_API_URL_PROD': JSON.stringify(process.env.VITE_APP_BACKEND_API_URL_PROD),
    'import.meta.env.VITE_APP_EXCHANGE_API_KEY': JSON.stringify(process.env.VITE_APP_EXCHANGE_API_KEY),
    'import.meta.env.VITE_APP_NEWS_API_KEY': JSON.stringify(process.env.VITE_APP_NEWS_API_KEY),
    'import.meta.env.VITE_APP_GOOGLE_APIKEY': JSON.stringify(process.env.VITE_APP_GOOGLE_APIKEY)
  },
  build: {
    outDir: 'dist'
  },
  server: {
    port: 3000
  }
});
