import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // 1. Import the compiler tool plugin

export default defineConfig({
  plugins: [
    react(),
    tailwindcss() // 2. Inject Tailwind straight into your Vite compilation bundle
  ],
  server: {
    port: 5173,
    strictPort: true
  }
});
