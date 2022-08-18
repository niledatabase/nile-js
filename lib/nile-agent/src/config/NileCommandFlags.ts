import { Flags } from '@oclif/core';

export const NileCommandFlags = {
  basePath: Flags.string({
    char: 'p',
    description: 'root URL for the Nile API',
    required: true,
    env: 'NILE_BASE_PATH',
  }),
  workspace: Flags.string({
    char: 'w',
    description: 'your Nile workspace name',
    required: true,
    env: 'NILE_WORKSPACE',
  }),
  org: Flags.string({
    char: 'o',
    description: 'an organization in your Nile workspace',
    required: true,
    env: 'NILE_ORG',
  }),
  entity: Flags.string({
    char: 'e',
    description: 'an entity type in your Nile workspace',
    required: false,
    env: 'NILE_ENTITY',
  }),
  email: Flags.string({
    description: 'your Nile developer email address',
    required: true,
    env: 'NILE_EMAIL',
  }),
  password: Flags.string({
    description: 'your Nile developer password',
    required: true,
    env: 'NILE_PASSWORD',
  }),
  dryRun: Flags.boolean({
    description: 'check current status of your control and data planes',
    default: false,
  }),
};
