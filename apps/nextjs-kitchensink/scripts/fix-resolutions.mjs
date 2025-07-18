import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rootDir = path.resolve(__dirname, '../../../'); // monorepo root
const appDir = path.resolve(rootDir, 'apps/nextjs-kitchensink'); // path to your app
const pkgPath = path.join(appDir, 'package.json');
const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

const deps = pkgJson.dependencies || {};
const rootNodeModules = path.resolve(rootDir, 'node_modules');

for (const [key, version] of Object.entries(deps)) {
  if (version?.startsWith('workspace:')) {
    const realPkgPath = path.join(rootNodeModules, key, 'package.json');

    if (!fs.existsSync(realPkgPath)) {
      throw new Error(`Package "${key}" not found in root node_modules`);
    }

    const realVersion = JSON.parse(
      fs.readFileSync(realPkgPath, 'utf-8')
    ).version;
    deps[key] = `^${realVersion}`;
  }
}

fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2));
console.log('✅ Rewrote workspace versions in', pkgPath);
