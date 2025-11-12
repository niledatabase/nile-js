import { defineConfig } from 'tsup';

export default defineConfig({
  minify: true,
  target: 'es2022',
  external: ['react', 'react-qr-code'],
  sourcemap: true,
  dts: true,
  format: ['esm', 'cjs'],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client"',
    };
  },
});
