import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => ({
  // Only load .env files in development mode to prevent secrets in production builds
  envDir: mode === 'development' ? resolve(__dirname, '../..') : undefined,
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@shared': resolve(__dirname, '../shared'),
      '@kyroo/shared': resolve(__dirname, '../shared'),
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
}))
