#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';

import yaml from 'js-yaml';

const apiFilePath = path.join(process.cwd(), 'spec/api2.yaml');
const apiFile = fs.readFileSync(apiFilePath, 'utf8');
const apiYaml = yaml.load(apiFile, {});

// apiYaml.components.parameters.workspaceSlug.required = false;
Object.keys(apiYaml.paths).forEach((path) => {
  Object.keys(apiYaml.paths[path]).forEach((action) => {
    const { parameters } = apiYaml.paths[path][action];
    if (parameters) {
      apiYaml.paths[path][action].parameters = parameters.map((param) => {
        if (
          ['workspaceSlug', 'databaseName', 'tenantId'].includes(param.name)
        ) {
          param.required = false;
        }
        return param;
      });
    }
  });
});

fs.writeFileSync(apiFilePath, yaml.dump(apiYaml, {}));
