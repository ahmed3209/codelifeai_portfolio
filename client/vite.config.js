import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three')) return 'vendor-three'
            if (id.includes('framer-motion')) return 'vendor-framer'
            if (id.includes('lucide-react')) return 'vendor-icons'
            if (id.includes('@tanstack') || id.includes('axios')) return 'vendor-data'
            if (id.includes('react')) return 'vendor-react'
          }
        }
      }
    }
  }
})
