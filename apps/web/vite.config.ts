import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const base = process.env.VITE_BASE ?? '/'

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    port: 5176,
    proxy: {
      '/v1': 'http://127.0.0.1:8001',
      '/healthz': 'http://127.0.0.1:8001',
    },
  },
})
