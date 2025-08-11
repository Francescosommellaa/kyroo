import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  envDir: resolve(__dirname, '../..'), // Punta alla root del progetto per i file .env
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      // Disabilita service worker
      external: ['workbox-*']
    }
  },
  server: {
    // Disabilita service worker in sviluppo
    headers: {
      'Service-Worker-Allowed': '/'
    }
  }
})