import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/auth/google': 'http://localhost:3000',
      '/auth/login': 'http://localhost:3000',
      '/auth/register': 'http://localhost:3000',
      '/auth/me': 'http://localhost:3000',
      '/bots': 'http://localhost:3000',
      '/devices': 'http://localhost:3000',
      '/messages': 'http://localhost:3000',
      '/webhooks': 'http://localhost:3000'
    }
  }
})
