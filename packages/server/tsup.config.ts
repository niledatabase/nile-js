import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  external: ['fetch', 'pg', 'dotenv', 'async_hooks'],
  format: ['esm', 'cjs'],
  outDir: 'dist',
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: true,
});
