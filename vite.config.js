import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'client',
  plugins: [react()],
  build: { outDir: '../dist', emptyOutDir: true },
  server: {
    // npm run dev:server 를 같이 띄우면 /api 요청이 Express로 간다
    proxy: { '/api': 'http://localhost:3000' },
  },
});
