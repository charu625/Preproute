import dns from 'node:dns'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Prefer IPv4 — avoids ENOTFOUND / failed proxy on networks with broken IPv6 DNS
dns.setDefaultResultOrder('ipv4first')

const API_TARGET = 'https://admin-moderator-backend-staging.up.railway.app'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
