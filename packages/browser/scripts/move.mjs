import fs from 'node:fs';
import path from 'node:path';

const specFilePath = path.join(process.cwd(), '../server/openapi/spec.json');
const outputFilePath = path.join(process.cwd(), 'src/spec.json');
const specFile = fs.readFileSync(specFilePath, 'utf-8');

fs.writeFileSync(outputFilePath, specFile);
