#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';

import yaml from 'js-yaml';

const apiFilePath = path.join(process.cwd(), 'spec/api.yaml');
const apiFile = fs.readFileSync(apiFilePath, 'utf8');
const apiYaml = yaml.load(apiFile, {});

apiYaml.components.parameters.workspace.required = false;

fs.writeFileSync(apiFilePath, yaml.dump(apiYaml, {}));
