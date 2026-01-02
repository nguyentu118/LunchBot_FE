import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Resolve aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Dev server configuration
  server: {
    port: 5173,
    host: true, // Listen on all addresses
    proxy: {
      // Proxy API requests to backend during development
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // WebSocket proxy
      '/ws': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
      },
    },
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
  },

  // Preview server (for testing production build locally)
  preview: {
    port: 4173,
    host: true,
  },
})

