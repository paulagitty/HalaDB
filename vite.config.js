import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: rootDir,
  cacheDir: path.join(rootDir, 'node_modules', '.vite'),
  server: {
    host: true,
    port: 5173,
    fs: {
      allow: [rootDir],
    },
  },
});
