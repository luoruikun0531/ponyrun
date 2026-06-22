import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Pure static SPA. No runtime API calls — all art is pre-generated and bundled.
export default defineConfig({
  base: '/',
  build: {
    target: 'es2020',
    assetsInlineLimit: 0, // keep sprite sheets as real files so PixiJS can stream them
    rollupOptions: {
      input: {
        root: resolve(import.meta.dirname, 'index.html'),
        en: resolve(import.meta.dirname, 'en/index.html'),
        zhCn: resolve(import.meta.dirname, 'zh-cn/index.html'),
        play: resolve(import.meta.dirname, 'play/index.html'),
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});
