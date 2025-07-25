import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Vite does not expose process.env to the client by default.
    // This makes the environment variable set in Netlify available to the client-side code.
    'process.env.API_KEY': JSON.stringify(process.env.GEMINI_API_KEY)
  }
})