import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/site-tour-tools/tour-player/' : '/',
  server: {
    port: 5175,
    host: true,
  },
});