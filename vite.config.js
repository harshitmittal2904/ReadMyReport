import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // For local development with /api routes, use `vercel dev` instead of `npm run dev`.
  // The Vercel CLI runs serverless functions locally and handles /api/* routing.
})
