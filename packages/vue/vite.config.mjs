import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/index.ts',
      fileName: () => 'index.mjs',
      formats: ['esm'],
    },
    sourcemap: true,
    rollupOptions: {
      external: ['vue'], // Ensure Vue is external
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});
