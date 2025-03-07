import path from 'path';
import fs from 'fs';

// Get the directory name for the current file using import.meta.url
const __dirname = path.dirname(new URL(import.meta.url).pathname);

import { defineConfig } from 'tsup';

const entries = () => {
  // Define the directory where your source files are located
  const srcDir = path.resolve(__dirname, 'src');
  const entries: Record<string, string> = {};

  // Read all files in the `src` folder
  fs.readdirSync(srcDir).forEach((file) => {
    const filePath = path.join(srcDir, file);
    // Check if the file is a TypeScript file
    if (fs.statSync(filePath).isFile() && file.endsWith('.ts')) {
      const fileName = path.basename(file, '.ts'); // Get file name without extension
      entries[fileName] = filePath; // Add file to the entries object
    }
  });

  // Return the entries
  return entries;
};
export default defineConfig({
  entry: entries(),
  format: ['cjs', 'esm'], // Outputs CommonJS and ES modules
  target: 'node20', // Target Node.js 20
  dts: true,
  splitting: false, // Do not bundle into a single file
  clean: true, // Clean the output folder before building
  sourcemap: true, // Optional: add sourcemaps for debugging
  minify: true,
});
