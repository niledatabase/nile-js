#!/usr/bin/env node
/* eslint-disable no-console */

import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

const apiFilePath = path.join(process.cwd(), 'lib/nile/spec/api.yaml');
const apiFile = fs.readFileSync(apiFilePath, 'utf8');
const apiYaml = yaml.load(apiFile, {});

apiYaml.components.parameters.workspace.required = false;

fs.writeFileSync(apiFilePath, yaml.dump(apiYaml, {}));
