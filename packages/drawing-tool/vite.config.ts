import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/site-tour-tools/' : '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@site-tour-tools/shared': resolve(__dirname, '../shared/src'),
    },
  },
  server: {
    port: 5174,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});