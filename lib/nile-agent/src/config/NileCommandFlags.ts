import { Flags } from '@oclif/core';

export const NileCommandFlags = {
  basePath: Flags.string({
    char: 'p',
    description: 'root URL for the Nile API',
    required: true,
    env: 'NILE_BASE_PATH',
    default: 'https://prod.thenile.dev:443',
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
    env: 'NILE_EMAIL',
  }),
  password: Flags.string({
    description: 'your Nile developer password',
    env: 'NILE_PASSWORD',
  }),
  authToken: Flags.string({
    description:
      'Developer access token. If used, this overrides the email/password flags.',
    env: 'NILE_AUTH_TOKEN',
  }),
  dryRun: Flags.boolean({
    description: 'check current status of your control and data planes',
    default: false,
  }),
};
