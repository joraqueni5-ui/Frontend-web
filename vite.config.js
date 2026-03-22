import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [plugin()],
  base: './',
  server: {
    port: 5173,
    open: false,
    proxy: {
      '/api': {
        target: 'https://localhost:7158',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
})
