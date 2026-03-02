import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the React 18 frontend
// Proxies API requests to the Spring Boot backend during development
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
