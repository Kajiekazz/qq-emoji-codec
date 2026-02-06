import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  optimizeDeps: {
    exclude: ['@bokuweb/zstd-wasm'],
  },
  build: {
    target: 'esnext',
  },
  server: {
    port: 3000,
  },
});
