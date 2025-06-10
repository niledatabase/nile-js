import { defineConfig } from 'tsup';

export default defineConfig({
  minify: true,
  target: 'es2022',
  sourcemap: true,
  dts: true,
  format: ['esm', 'cjs'],
  external: ['next', 'next/headers', 'next/navigation', 'next/server'],
});
