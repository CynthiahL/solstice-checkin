import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss() // Injects both core layout plugins directly inside the structural array properties
  ],
  server: {
    port: 5173,
    strictPort: true
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false
  }
});
