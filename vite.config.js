import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: 'all',
    proxy: {
      '/api/datajud': {
        target: 'https://api-publica.datajud.cnj.jus.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/datajud/, ''),
        headers: {
          'Authorization': 'APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw=='
        }
      }
    }
  }
})
