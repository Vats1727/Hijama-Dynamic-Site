import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      '/server': {
        target: 'http://127.0.0.1:8080/club_projects/Hijama/server/public',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/server/, ''),
      },
      '/dev': {
        target: 'http://127.0.0.1:8080/club_projects/Hijama/dev/public',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dev/, ''),
      },
    },
  },
})
