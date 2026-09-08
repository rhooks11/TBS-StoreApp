import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Standalone TBS web store (separate domain, e.g. store.trainersbysport.com).
// Same API + accounts as the platform (port 5056); multi-tenant capable via VITE_STORE_TENANT.
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: { port: 3003 },
})
