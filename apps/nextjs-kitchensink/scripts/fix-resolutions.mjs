import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rootDir = path.resolve(__dirname, '../../../'); // monorepo root
const appDir = path.resolve(rootDir, 'apps/nextjs-kitchensink'); // path to your app
const pkgPath = path.join(appDir, 'package.json');
const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

const deps = pkgJson.dependencies || {};

for (const [key] of Object.entries(deps)) {
  if (key?.startsWith('@niledatabase')) {
    deps[key] = 'workspace:*';
  }
}

fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2));
console.log('✅ Rewrote workspace versions in', pkgPath);
