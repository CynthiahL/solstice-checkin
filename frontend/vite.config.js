import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173,
    strictPort: true
  },
  // Injects an override to prevent syntax warnings from crashing the cloud production build pipeline
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    // Ensures small warnings do not raise fatal termination exit codes
    reportCompressedSize: false
  }
});
