import { defineConfig } from 'tsup';

export default defineConfig({
  minify: true,
  target: 'es2022',
  external: ['react'],
  sourcemap: true,
  dts: true,
  format: ['esm', 'cjs'],
});
