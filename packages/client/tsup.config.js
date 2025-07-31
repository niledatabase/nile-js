import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: {
      entry: 'src/index.ts',
    },
    outDir: 'dist',
    splitting: false,
    sourcemap: true,
    clean: true,
    target: 'node20',
  },
]);
