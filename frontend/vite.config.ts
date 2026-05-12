import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/frontend'),
      '@components': path.resolve(__dirname, './src/frontend/components'),
      '@pages': path.resolve(__dirname, './src/frontend/pages'),
      '@hooks': path.resolve(__dirname, './src/frontend/hooks'),
      '@services': path.resolve(__dirname, './src/frontend/services'),
      '@store': path.resolve(__dirname, './src/frontend/store'),
      '@types': path.resolve(__dirname, './src/frontend/types'),
      '@utils': path.resolve(__dirname, './src/frontend/utils'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
})
