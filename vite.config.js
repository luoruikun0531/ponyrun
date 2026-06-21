import { defineConfig } from 'vite';

// Pure static SPA. No runtime API calls — all art is pre-generated and bundled.
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    assetsInlineLimit: 0, // keep sprite sheets as real files so PixiJS can stream them
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});
