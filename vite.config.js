import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serves under /history-in-context/. Apply the base only for
  // production builds so `npm run dev` stays at the clean localhost root.
  base: command === 'build' ? '/history-in-context/' : '/',
}))
